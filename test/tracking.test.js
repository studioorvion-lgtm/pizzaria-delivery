import assert from 'assert';
import {
  trackPurchase,
  isPurchaseAlreadyTracked,
  markPurchaseAsTracked,
  DEFAULT_GOOGLE_ADS_ID,
  DEFAULT_PURCHASE_LABEL,
} from '../src/utils/tracking.js';

// Setup Mock Window, DOM Storage e dataLayer
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

globalThis.window = {
  dataLayer: [],
  sessionStorage: new MockStorage(),
  localStorage: new MockStorage(),
  GOOGLE_ADS_CONVERSION_ID: 'AW-18501489899',
  GOOGLE_ADS_PURCHASE_LABEL: 'pQFRCL-T1ZUdEOupmfZE',
};

async function runTrackingTests() {
  console.log('--- INICIANDO TESTES DO RASTREAMENTO GOOGLE ADS (PURCHASE & CONVERSION) ---');

  // Teste 1: Disparo de compra com dados reais
  console.log('\n[1/4] Testando disparo inicial do evento purchase e conversion...');
  const testOrder = {
    orderId: 'DON-982143-ABC',
    paidAmount: 49.90,
    total: 49.90,
    items: [
      { id: 'combo-2p', name: '02 Pizzas P + 1 Refri 1L', price: 49.90, quantity: 1 }
    ],
    status: 'PAID'
  };

  const result1 = trackPurchase(testOrder);
  assert.strictEqual(result1.success, true, 'trackPurchase deve retornar success: true');
  assert.strictEqual(result1.deduplicated, false, 'Primeiro disparo não pode ser deduplicado');
  assert.strictEqual(result1.orderId, 'DON-982143-ABC');

  // Verifica dataLayer
  const dl = globalThis.window.dataLayer;
  assert.ok(dl.length >= 2, 'dataLayer deve ter recebido no mínimo 2 eventos (purchase e conversion)');

  const purchaseCall = dl.find(entry => entry[0] === 'event' && entry[1] === 'purchase');
  assert.ok(purchaseCall, 'Evento purchase deve estar no dataLayer');
  const purchasePayload = purchaseCall[2];
  assert.strictEqual(purchasePayload.transaction_id, 'DON-982143-ABC', 'transaction_id deve bater com orderId');
  assert.strictEqual(purchasePayload.value, 49.90, 'value deve bater com paidAmount');
  assert.strictEqual(purchasePayload.currency, 'BRL', 'currency deve ser BRL');
  assert.strictEqual(purchasePayload.items.length, 1);
  assert.strictEqual(purchasePayload.items[0].item_name, '02 Pizzas P + 1 Refri 1L');
  console.log('✓ Evento purchase validado com sucesso no dataLayer:', purchasePayload);

  const conversionCall = dl.find(entry => entry[0] === 'event' && entry[1] === 'conversion');
  assert.ok(conversionCall, 'Evento conversion deve estar no dataLayer');
  const conversionPayload = conversionCall[2];
  assert.strictEqual(conversionPayload.send_to, 'AW-18501489899/pQFRCL-T1ZUdEOupmfZE');
  assert.strictEqual(conversionPayload.transaction_id, 'DON-982143-ABC');
  assert.strictEqual(conversionPayload.value, 49.90);
  assert.strictEqual(conversionPayload.currency, 'BRL');
  console.log('✓ Evento conversion do Google Ads validado com sucesso:', conversionPayload);

  // Teste 2: Prevenção de disparo duplicado imediato (re-render / re-call)
  console.log('\n[2/4] Testando prevenção de disparo duplicado imediato (mesma sessão)...');
  const dlLengthBefore = dl.length;
  const result2 = trackPurchase(testOrder);
  assert.strictEqual(result2.success, true);
  assert.strictEqual(result2.deduplicated, true, 'Segundo disparo deve ser marcado como deduplicated: true');
  assert.strictEqual(dl.length, dlLengthBefore, 'dataLayer NÃO deve receber novos eventos no segundo disparo');
  console.log('✓ Disparo duplicado prevenido com sucesso.');

  // Teste 3: Prevenção de disparo duplicado após recarregamento de página (via storage)
  console.log('\n[3/4] Testando prevenção de disparo duplicado após reload com localStorage persistente...');
  assert.strictEqual(isPurchaseAlreadyTracked('DON-982143-ABC'), true);
  assert.ok(globalThis.window.localStorage.getItem('google_ads_purchase_DON-982143-ABC'), 'Deve estar salvo no localStorage');
  assert.ok(globalThis.window.sessionStorage.getItem('google_ads_purchase_DON-982143-ABC'), 'Deve estar salvo no sessionStorage');
  console.log('✓ Persistência de deduplicação confirmada em sessionStorage e localStorage.');

  // Teste 4: Novo pedido distinto dispara normalmente com seu transaction_id único
  console.log('\n[4/4] Testando novo pedido distinto com ID único...');
  const newOrder = {
    orderId: 'DON-112233-XYZ',
    paidAmount: 79.90,
    total: 79.90,
    items: [
      { id: 'combo-2g', name: '02 Pizzas G + 1 Refri 2L', price: 79.90, quantity: 1 }
    ],
    status: 'PAID'
  };
  const result3 = trackPurchase(newOrder);
  assert.strictEqual(result3.success, true);
  assert.strictEqual(result3.deduplicated, false);
  assert.strictEqual(result3.orderId, 'DON-112233-XYZ');

  const newPurchases = dl.filter(entry => entry[0] === 'event' && entry[1] === 'purchase' && entry[2].transaction_id === 'DON-112233-XYZ');
  assert.strictEqual(newPurchases.length, 1);
  assert.strictEqual(newPurchases[0][2].value, 79.90);
  console.log('✓ Pedido independente processado com sucesso:', newPurchases[0][2]);

  console.log('\n=== TODOS OS 4 TESTES DE RASTREAMENTO PASSARAM COM 100% DE SUCESSO! ===\n');
}

runTrackingTests().catch(err => {
  console.error('FALHA NOS TESTES DE RASTREAMENTO:', err);
  process.exit(1);
});
