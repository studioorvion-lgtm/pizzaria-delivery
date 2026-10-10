import assert from 'assert';
import checkoutHandler from '../api/checkout.js';
import statusHandler from '../api/status.js';
import webhookHandler from '../api/webhooks/sigilopay.js';
import adminOrdersHandler from '../api/admin/orders.js';
import { ordersService } from '../lib/orders.js';
import { sigiloPay } from '../lib/sigilopay.js';

// Carrega variáveis de ambiente locais se houver
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
  console.log('--- INICIANDO TESTES DO SISTEMA (SEM CRIAR COBRANÇA REAL NO GATEWAY) ---');

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

  // TESTE 1: Criar pedido Pix via Checkout
  console.log('\n[1/7] Testando /api/checkout com Pix...');
  const reqCheckout = {
    method: 'POST',
    body: {
      items: testItems,
      customer: {
        fullName: 'Roberto Silva Santos',
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

  assert.strictEqual(resCheckout.statusCode, 200, 'Checkout deve responder status 200');
  assert.strictEqual(resCheckout.body.success, true, 'Checkout deve indicar success: true');
  assert.ok(resCheckout.body.orderId, 'Deve retornar orderId');
  assert.strictEqual(resCheckout.body.transactionId, mockTransactionId, 'Deve usar transactionId');
  assert.strictEqual(resCheckout.body.status, 'PENDING', 'Pedido inicial deve ser PENDING');
  assert.ok(resCheckout.body.pix?.code, 'Deve retornar código Pix Copia e Cola');
  console.log('✓ Pedido criado com sucesso (mocked):', {
    orderId: resCheckout.body.orderId,
    transactionId: resCheckout.body.transactionId,
  });

  const orderId = resCheckout.body.orderId;

  // TESTE 2: Anti-duplicação / Idempotência
  console.log('\n[2/7] Testando prevenção de pedido duplicado (idempotência)...');
  const resDup = createMockRes();
  await checkoutHandler(reqCheckout, resDup);
  assert.strictEqual(resDup.statusCode, 200);
  assert.strictEqual(resDup.body.orderId, orderId, 'Idempotência deve retornar o mesmo orderId');
  assert.strictEqual(resDup.body.reused, true, 'Deve marcar como reaproveitado');
  console.log('✓ Proteção de duplicação validada.');

  // TESTE 3: Consulta de status inicial (deve estar PENDING)
  console.log('\n[3/7] Consultando status inicial via /api/status...');
  const reqStatus = { method: 'GET', query: { id: orderId } };
  const resStatus = createMockRes();
  await statusHandler(reqStatus, resStatus);
  assert.strictEqual(resStatus.statusCode, 200);
  assert.strictEqual(resStatus.body.status, 'PENDING', 'Pedido PENDING não conta como pago');
  assert.strictEqual(resStatus.body.isPaid, false, 'isPaid deve ser falso antes da confirmação');
  console.log('✓ Status pendente validado.');

  // TESTE 4: Webhook SigiloPay com confirmação real
  console.log('\n[4/7] Simulando recebimento de Webhook TRANSACTION_PAID...');
  const stockBefore = ordersService.getStock()['combo-2pp'];
  const reqWebhook = {
    method: 'POST',
    body: {
      event: 'TRANSACTION_PAID',
      transaction: {
        id: mockTransactionId,
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
  assert.strictEqual(resWebhook.body.status, 'COMPLETED');
  console.log('✓ Webhook processado com sucesso.');

  // TESTE 5: Atualização para PAGO e baixa no estoque
  console.log('\n[5/7] Verificando atualização para PAGO e baixa no estoque...');
  const orderUpdated = ordersService.getOrder(orderId);
  assert.strictEqual(orderUpdated.status, 'PAID', 'Status do pedido deve ser atualizado para PAID');
  assert.strictEqual(orderUpdated.isPaid, true, 'isPaid deve ser true');
  assert.strictEqual(orderUpdated.paidAmount, 32.90, 'Valor real recebido deve ser registrado');
  assert.strictEqual(orderUpdated.inventoryDeducted, true, 'Estoque deve ter sido deduzido');

  const stockAfter = ordersService.getStock()['combo-2pp'];
  assert.strictEqual(stockAfter, stockBefore - 1, 'Estoque deve ter diminuído em 1 unidade');
  console.log('✓ Pedido confirmado como PAGO e estoque atualizado com sucesso!');

  // TESTE 6: Painel Administrativo - Autenticação
  console.log('\n[6/7] Testando segurança e login da API Administrativa...');
  // 6.1: Acesso não autorizado sem token
  const resAdminUnauth = createMockRes();
  await adminOrdersHandler({ method: 'GET', headers: {}, query: {} }, resAdminUnauth);
  assert.strictEqual(resAdminUnauth.statusCode, 401, 'Deve rejeitar sem autenticação');

  // 6.2: Tentativa de login com senha incorreta
  const resLoginFail = createMockRes();
  await adminOrdersHandler({
    method: 'POST',
    body: { action: 'login', password: 'senha_errada_xyz' },
    headers: {},
  }, resLoginFail);
  assert.strictEqual(resLoginFail.statusCode, 401, 'Login com senha errada deve retornar 401');

  // 6.3: Login com senha correta
  const resLoginSuccess = createMockRes();
  await adminOrdersHandler({
    method: 'POST',
    body: { action: 'login', password: 'donatello2026' },
    headers: {},
  }, resLoginSuccess);
  assert.strictEqual(resLoginSuccess.statusCode, 200, 'Login correto deve retornar 200');
  assert.ok(resLoginSuccess.body.token, 'Deve retornar token de autenticação');
  const adminToken = resLoginSuccess.body.token;
  console.log('✓ Autenticação administrativa validada.');

  // TESTE 7: Painel Administrativo - Listagem de Pedidos e Métricas
  console.log('\n[7/7] Consultando pedidos e métricas pelo Painel Administrativo...');
  const resAdminData = createMockRes();
  await adminOrdersHandler({
    method: 'GET',
    headers: { authorization: `Bearer ${adminToken}` },
    query: { sync: 'false' },
  }, resAdminData);

  assert.strictEqual(resAdminData.statusCode, 200, 'Deve retornar 200 para admin autenticado');
  assert.strictEqual(resAdminData.body.success, true);
  assert.ok(Array.isArray(resAdminData.body.orders), 'Deve retornar array de pedidos');
  assert.ok(resAdminData.body.metrics, 'Deve retornar objeto de métricas');
  assert.ok(typeof resAdminData.body.metrics.ordersToday === 'number', 'Deve calcular ordersToday');
  assert.ok(typeof resAdminData.body.metrics.paidCount === 'number', 'Deve calcular paidCount');
  assert.ok(typeof resAdminData.body.metrics.pendingCount === 'number', 'Deve calcular pendingCount');

  // Verifica que o pedido acabou de entrar e está presente
  const foundOrder = resAdminData.body.orders.find((o) => o.orderId === orderId);
  assert.ok(foundOrder, 'Pedido recém-criado deve estar visível no painel');
  assert.strictEqual(foundOrder.status, 'PAID', 'Status no painel deve refletir PAID');

  console.log('✓ Pedidos e métricas retornados com sucesso:', {
    totalOrders: resAdminData.body.metrics.totalOrders,
    ordersToday: resAdminData.body.metrics.ordersToday,
    paidCount: resAdminData.body.metrics.paidCount,
    pendingCount: resAdminData.body.metrics.pendingCount,
  });

  // Restaura implementação original
  sigiloPay.createPixPayment = originalCreatePix;

  // Limpeza de estado de teste: restaura arquivo de pedidos original
  try {
    if (ordersBackup) {
      fs.writeFileSync(path.join(__dirname, '..', '.data', 'orders.json'), ordersBackup, 'utf8');
    }
    const tmpOrders = path.join(os.tmpdir(), 'pizzaria_donatello_data');
    if (fs.existsSync(tmpOrders)) {
      fs.rmSync(tmpOrders, { recursive: true, force: true });
    }
  } catch {}

  console.log('\n=== TODOS OS 7 TESTES PASSARAM COM 100% DE SUCESSO! ===\n');
}

runTests().catch((err) => {
  console.error('FALHA NOS TESTES:', err);
  process.exit(1);
});
