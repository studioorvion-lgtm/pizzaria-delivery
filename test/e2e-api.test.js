import assert from 'assert';
import checkoutHandler from '../api/checkout.js';
import statusHandler from '../api/status.js';
import webhookHandler from '../api/webhooks/sigilopay.js';
import { ordersService } from '../lib/orders.js';

// Carrega variáveis de ambiente locais
import fs from 'fs';
import path from 'path';
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
  const rnd = n => Math.round(Math.random() * n);
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
  console.log('--- INICIANDO TESTES DO SISTEMA DE PEDIDOS E SIGILOPAY ---');

  const validCpf = generateTestCPF();
  const testItems = [
    { id: 'combo-2pp', name: '02 Pizzas PP + 1 Refri 1L', price: 32.90, quantity: 1 }
  ];

  // TESTE 1: Criar pedido Pix via SigiloPay
  console.log('\n[1/5] Testando /api/checkout com Pix SigiloPay...');
  const reqCheckout = {
    method: 'POST',
    body: {
      items: testItems,
      customer: {
        fullName: 'Roberto Silva Santos',
        phone: '11988887777',
        cpf: validCpf,
        email: 'roberto@exemplo.com'
      },
      address: {
        cep: '01310-100',
        street: 'Av Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP'
      },
      paymentMethod: 'pix',
      idempotencyKey: `test_idem_${Date.now()}`
    }
  };
  const resCheckout = createMockRes();
  await checkoutHandler(reqCheckout, resCheckout);

  console.log('DEBUG RES:', resCheckout.statusCode, resCheckout.body);
  assert.strictEqual(resCheckout.statusCode, 200, 'Checkout deve responder status 200');
  assert.strictEqual(resCheckout.body.success, true, 'Checkout deve indicar success: true');
  assert.ok(resCheckout.body.orderId, 'Deve retornar orderId');
  assert.ok(resCheckout.body.transactionId, 'Deve retornar transactionId');
  assert.strictEqual(resCheckout.body.status, 'PENDING', 'Pedido inicial deve ser PENDING');
  assert.ok(resCheckout.body.pix?.code, 'Deve retornar código Pix Copia e Cola');
  console.log('✓ Pedido criado com sucesso no SigiloPay:', {
    orderId: resCheckout.body.orderId,
    transactionId: resCheckout.body.transactionId,
    pixCodeStart: resCheckout.body.pix.code.slice(0, 30) + '...'
  });

  const orderId = resCheckout.body.orderId;
  const transactionId = resCheckout.body.transactionId;

  // TESTE 2: Anti-duplicação / Idempotência
  console.log('\n[2/5] Testando prevenção de pedido duplicado (idempotência)...');
  const resDup = createMockRes();
  await checkoutHandler(reqCheckout, resDup);
  assert.strictEqual(resDup.statusCode, 200);
  assert.strictEqual(resDup.body.orderId, orderId, 'Idempotência deve retornar o mesmo orderId');
  assert.strictEqual(resDup.body.reused, true, 'Deve marcar como reaproveitado');
  console.log('✓ Proteção de duplicação validada.');

  // TESTE 3: Consulta de status inicial (deve estar PENDING)
  console.log('\n[3/5] Consultando status inicial via /api/status...');
  const reqStatus = { method: 'GET', query: { id: orderId } };
  const resStatus = createMockRes();
  await statusHandler(reqStatus, resStatus);
  assert.strictEqual(resStatus.statusCode, 200);
  assert.strictEqual(resStatus.body.status, 'PENDING', 'Pedido PENDING não conta como pago');
  assert.strictEqual(resStatus.body.isPaid, false, 'isPaid deve ser falso antes da confirmação');
  console.log('✓ Status pendente validado.');

  // TESTE 4: Webhook SigiloPay com confirmação real
  console.log('\n[4/5] Simulando recebimento de Webhook TRANSACTION_PAID da SigiloPay...');
  const stockBefore = ordersService.getStock()['combo-2pp'];
  const reqWebhook = {
    method: 'POST',
    body: {
      event: 'TRANSACTION_PAID',
      transaction: {
        id: transactionId,
        status: 'COMPLETED',
        amount: 32.90,
        paidAt: new Date().toISOString()
      }
    }
  };
  const resWebhook = createMockRes();
  await webhookHandler(reqWebhook, resWebhook);
  assert.strictEqual(resWebhook.statusCode, 200);
  assert.strictEqual(resWebhook.body.ok, true);
  assert.strictEqual(resWebhook.body.status, 'COMPLETED');

  // TESTE 5: Atualização para PAGO e baixa no estoque
  console.log('\n[5/5] Verificando atualização para PAGO e baixa no estoque...');
  const orderUpdated = ordersService.getOrder(orderId);
  assert.strictEqual(orderUpdated.status, 'PAID', 'Status do pedido deve ser atualizado para PAID');
  assert.strictEqual(orderUpdated.isPaid, true, 'isPaid deve ser true');
  assert.strictEqual(orderUpdated.paidAmount, 32.90, 'Valor real recebido deve ser registrado');
  assert.strictEqual(orderUpdated.inventoryDeducted, true, 'Estoque deve ter sido deduzido');

  const stockAfter = ordersService.getStock()['combo-2pp'];
  assert.strictEqual(stockAfter, stockBefore - 1, 'Estoque deve ter diminuído em 1 unidade');
  console.log('✓ Pedido confirmado como PAGO e estoque atualizado com sucesso!');

  console.log('\n=== TODOS OS 5 TESTES PASSARAM COM 100% DE SUCESSO! ===\n');
}

runTests().catch(err => {
  console.error('FALHA NOS TESTES:', err);
  process.exit(1);
});
