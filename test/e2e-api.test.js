import assert from 'assert';
import checkoutHandler from '../api/checkout.js';
import statusHandler from '../api/status.js';
import webhookHandler from '../api/webhooks/sigilopay.js';
import adminOrdersHandler from '../api/admin/orders.js';
import { ordersService } from '../lib/orders.js';
import { sigiloPay } from '../lib/sigilopay.js';
import { getSql } from '../lib/db.js';

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end() {
      return this;
    },
  };
  return res;
}

// Gerador de CPF válido para teste
function generateTestCPF() {
  const rnd = (n) => Math.round(Math.random() * n);
  const mod = (dividend, divider) => Math.round(dividend - Math.floor(dividend / divider) * divider);
  const n = Array(9).fill(0).map(() => rnd(9));
  let d1 = n.reduce((total, number, index) => total + number * (10 - index), 0);
  d1 = 11 - mod(d1, 11);
  if (d1 >= 10) d1 = 0;
  let d2 = d1 * 2 + n.reduce((total, number, index) => total + number * (11 - index), 0);
  d2 = 11 - mod(d2, 11);
  if (d2 >= 10) d2 = 0;
  return '' + n.join('') + d1 + d2;
}

async function runTests() {
  console.log('--- INICIANDO TESTES DO FLUXO COMPLETO DE PEDIDOS E PERSISTÊNCIA REAL ---');

  const ordersFilePath = path.join(__dirname, '..', '.data', 'orders.json');
  let ordersBackup = null;
  if (fs.existsSync(ordersFilePath)) {
    ordersBackup = fs.readFileSync(ordersFilePath, 'utf8');
  }

  // MOCK de segurança: impede criação de cobrança Pix real em SigiloPay durante testes
  const originalCreatePix = sigiloPay.createPixPayment;
  const mockTransactionId = `mock_tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  sigiloPay.createPixPayment = async (_params) => {
    return {
      success: true,
      transactionId: mockTransactionId,
      pixCode: '00020126580014br.gov.bcb.pix0136mock-test-key520400005303986540532.905802BR5925DONATELLO6009SAOPAULO62070503***6304ABCD',
      qrCodeImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      status: 'PENDING',
    };
  };

  const validCpf = generateTestCPF();
  const testItems = [
    { id: 'combo-2pp', name: '02 Pizzas PP + 1 Refri 1L', price: 32.90, quantity: 1 },
  ];

  // 1. FLUXO: Pedido criado e Pix gerado via checkout
  console.log('\n[1/6] Testando Checkout: cria pedido e gera Pix...');
  const reqCheckout = {
    method: 'POST',
    body: {
      items: testItems,
      customer: {
        fullName: 'Roberto Silva Santos Teste',
        phone: '11988887777',
        cpf: validCpf,
        email: 'roberto@exemplo.com',
      },
      address: {
        cep: '01310-100',
        street: 'Av Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
      },
      paymentMethod: 'pix',
      idempotencyKey: `test_idem_${Date.now()}`,
    },
  };
  const resCheckout = createMockRes();
  await checkoutHandler(reqCheckout, resCheckout);

  assert.strictEqual(resCheckout.statusCode, 200, 'Checkout deve responder 200');
  assert.strictEqual(resCheckout.body.success, true, 'Checkout deve indicar success: true');
  assert.ok(resCheckout.body.orderId, 'Deve retornar orderId');
  assert.strictEqual(resCheckout.body.status, 'PENDING', 'Pedido recém-criado deve ser PENDING');
  assert.ok(resCheckout.body.pix?.code, 'Deve retornar código Pix');

  const orderId = resCheckout.body.orderId;
  console.log('✓ Pedido criado com sucesso e salvo com persistência:', {
    orderId,
    transactionId: resCheckout.body.transactionId,
    status: resCheckout.body.status,
  });

  // 2. FLUXO: Pedido aparece IMEDIATAMENTE no painel com status PENDING
  console.log('\n[2/6] Verificando se o pedido aparece IMEDIATAMENTE no Painel Administrativo como PENDING...');
  const resAdminPending = createMockRes();
  await adminOrdersHandler({
    method: 'GET',
    headers: { authorization: 'Bearer donatello_admin_token_2026' },
    query: { sync: 'false' },
  }, resAdminPending);

  assert.strictEqual(resAdminPending.statusCode, 200);
  const foundPending = resAdminPending.body.orders.find((o) => o.orderId === orderId);
  assert.ok(foundPending, 'O pedido recém-criado DEVE aparecer imediatamente no painel!');
  assert.strictEqual(foundPending.status, 'PENDING', 'O status no painel deve ser PENDING!');
  console.log('✓ Pedido visível IMEDIATAMENTE no painel:', {
    orderId: foundPending.orderId,
    status: foundPending.status,
    total: foundPending.total,
    customer: foundPending.customer?.fullName,
  });

  // 3. FLUXO: Prevenção de duplicidade (idempotência)
  console.log('\n[3/6] Testando prevenção de pedido duplicado (idempotência)...');
  const resDup = createMockRes();
  await checkoutHandler(reqCheckout, resDup);
  assert.strictEqual(resDup.statusCode, 200);
  assert.strictEqual(resDup.body.orderId, orderId, 'Idempotência deve retornar o mesmo orderId');
  assert.strictEqual(resDup.body.reused, true, 'Deve marcar como reaproveitado');
  console.log('✓ Prevenção de duplicidade validada com sucesso.');

  // 4. FLUXO: Consulta de status inicial (deve estar PENDING)
  console.log('\n[4/6] Consultando status inicial via /api/status...');
  const reqStatus = { method: 'GET', query: { id: orderId } };
  const resStatus = createMockRes();
  await statusHandler(reqStatus, resStatus);
  assert.strictEqual(resStatus.statusCode, 200);
  assert.strictEqual(resStatus.body.status, 'PENDING', 'Pedido inicial não conta como pago');
  assert.strictEqual(resStatus.body.isPaid, false);
  console.log('✓ Status pendente inicial validado.');

  // 5. FLUXO: Webhook / Pagamento confirmado pelo gateway -> muda para PAID
  console.log('\n[5/6] Simulando Webhook de pagamento confirmado (TRANSACTION_PAID)...');
  const stockBefore = ordersService.getStock()['combo-2pp'];
  const reqWebhook = {
    method: 'POST',
    body: {
      event: 'TRANSACTION_PAID',
      transaction: {
        id: mockTransactionId,
        clientIdentifier: orderId,
        status: 'COMPLETED',
        amount: 32.90,
        paidAt: new Date().toISOString(),
      },
    },
  };
  const resWebhook = createMockRes();
  await webhookHandler(reqWebhook, resWebhook);
  assert.strictEqual(resWebhook.statusCode, 200);
  assert.strictEqual(resWebhook.body.ok, true);

  const orderUpdated = await ordersService.getOrder(orderId);
  assert.strictEqual(orderUpdated.status, 'PAID', 'Status do pedido deve atualizar para PAID');
  assert.strictEqual(orderUpdated.isPaid, true);
  assert.strictEqual(orderUpdated.paidAmount, 32.90);
  assert.strictEqual(orderUpdated.inventoryDeducted, true);

  const stockAfter = ordersService.getStock()['combo-2pp'];
  assert.strictEqual(stockAfter, stockBefore - 1, 'Estoque deve ter sido deduzido');
  console.log('✓ Webhook processado: status atualizado para PAID e estoque deduzido!');

  // 6. FLUXO: Painel reflete PAID e atualiza métricas
  console.log('\n[6/6] Verificando se o Painel Administrativo reflete PAID...');
  const resAdminPaid = createMockRes();
  await adminOrdersHandler({
    method: 'GET',
    headers: { authorization: 'Bearer donatello_admin_token_2026' },
    query: { sync: 'false' },
  }, resAdminPaid);

  assert.strictEqual(resAdminPaid.statusCode, 200);
  const foundPaid = resAdminPaid.body.orders.find((o) => o.orderId === orderId);
  assert.ok(foundPaid, 'Pedido pago deve estar no painel');
  assert.strictEqual(foundPaid.status, 'PAID', 'Status no painel deve refletir PAID');
  assert.strictEqual(foundPaid.isPaid, true);
  console.log('✓ Painel reflete PAID:', {
    orderId: foundPaid.orderId,
    status: foundPaid.status,
    paidAmount: foundPaid.paidAmount,
  });

  // Limpeza de teste no banco PostgreSQL
  try {
    const sql = getSql();
    await sql`DELETE FROM pizzaria_orders WHERE order_id = ${orderId};`;
  } catch {}

  // Restaura implementação original
  sigiloPay.createPixPayment = originalCreatePix;

  // Limpeza de estado local
  try {
    if (ordersBackup) {
      fs.writeFileSync(path.join(__dirname, '..', '.data', 'orders.json'), ordersBackup, 'utf8');
    }
    const tmpOrders = path.join(os.tmpdir(), 'pizzaria_donatello_data');
    if (fs.existsSync(tmpOrders)) {
      fs.rmSync(tmpOrders, { recursive: true, force: true });
    }
  } catch {}

  console.log('\n=== TODOS OS 6 PONTOS DE VALIDAÇÃO PASSARAM COM 100% DE SUCESSO! ===\n');
}

runTests().catch((err) => {
  console.error('FALHA NOS TESTES:', err);
  process.exit(1);
});
