/**
 * Módulo de Rastreamento de Conversões (Google Ads / GA4)
 * Donatello Pizzaria Artesanal
 * 
 * Garante:
 * 1. Disparo do evento purchase e conversion
 * 2. transaction_id único (orderId)
 * 3. Valor real pago
 * 4. Deduplicação rigorosa (memória, sessionStorage e localStorage)
 * 5. Debug e logs detalhados no console
 */

export const DEFAULT_GOOGLE_ADS_ID = 'AW-18501489899';
export const DEFAULT_PURCHASE_LABEL = 'pQFRCL-T1ZUdEOupmfZE';

// Memória local para deduplicação síncrona (ex: React 19 StrictMode / re-renders)
const firedPurchasesInMemory = new Set();

/**
 * Garante inicialização segura de window.dataLayer e window.gtag
 */
export function ensureGtag() {
  if (typeof window === 'undefined') return null;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
  }
  return window.gtag;
}

/**
 * Verifica se a compra já foi rastreada anteriormente
 */
export function isPurchaseAlreadyTracked(orderId) {
  if (!orderId) return true;

  if (firedPurchasesInMemory.has(orderId)) {
    return true;
  }

  if (typeof window !== 'undefined') {
    const key = `google_ads_purchase_${orderId}`;
    try {
      if (window.sessionStorage && window.sessionStorage.getItem(key)) {
        return true;
      }
      if (window.localStorage && window.localStorage.getItem(key)) {
        return true;
      }
    } catch {
      // Ignora erro de acesso a storage (ex: sandbox restrita)
    }
  }

  return false;
}

/**
 * Marca a compra como rastreada em todos os storages
 */
export function markPurchaseAsTracked(orderId) {
  if (!orderId) return;

  firedPurchasesInMemory.add(orderId);

  if (typeof window !== 'undefined') {
    const key = `google_ads_purchase_${orderId}`;
    try {
      if (window.sessionStorage) {
        window.sessionStorage.setItem(key, String(Date.now()));
      }
      if (window.localStorage) {
        window.localStorage.setItem(key, String(Date.now()));
      }
    } catch {
      // Ignora erro de acesso a storage
    }
  }
}

/**
 * Dispara o evento de Purchase no Google Ads / GA4
 * 
 * @param {Object} order Objeto do pedido concluído
 * @returns {Object} Resultado do disparo { success: boolean, deduplicated: boolean, payload: Object }
 */
export function trackPurchase(order) {
  if (!order) {
    console.warn('[Tracking] Falha: pedido inválido passado para trackPurchase');
    return { success: false, reason: 'order_null' };
  }

  const orderId = order.orderId || order.id || order.transactionId;
  if (!orderId) {
    console.warn('[Tracking] Falha: pedido sem orderId/transactionId');
    return { success: false, reason: 'missing_id' };
  }

  // Verificação de deduplicação
  if (isPurchaseAlreadyTracked(orderId)) {
    console.log(`[Tracking] Purchase para pedido #${orderId} já foi enviado anteriormente (deduplicado).`);
    return { success: true, deduplicated: true, orderId };
  }

  ensureGtag();

  const adsId =
    (typeof window !== 'undefined' && window.GOOGLE_ADS_CONVERSION_ID) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_ADS_ID) ||
    DEFAULT_GOOGLE_ADS_ID;

  const purchaseLabel =
    (typeof window !== 'undefined' && window.GOOGLE_ADS_PURCHASE_LABEL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_ADS_PURCHASE_LABEL) ||
    DEFAULT_PURCHASE_LABEL;

  const rawValue = order.paidAmount !== undefined ? order.paidAmount : order.total;
  const value = Math.max(0, Number(rawValue) || 0);

  const items = Array.isArray(order.items)
    ? order.items.map((item, idx) => ({
        item_id: String(item.id || `item_${idx}`),
        item_name: String(item.name || 'Produto Donatello'),
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
      }))
    : [];

  const purchasePayload = {
    transaction_id: String(orderId),
    value: Number(value.toFixed(2)),
    currency: 'BRL',
    tax: 0,
    shipping: 0,
    items,
  };

  const sendTo = `${adsId}/${purchaseLabel}`;
  const conversionPayload = {
    send_to: sendTo,
    value: Number(value.toFixed(2)),
    currency: 'BRL',
    transaction_id: String(orderId),
  };

  // Marca ANTES do disparo para garantir idempotência atômica
  markPurchaseAsTracked(orderId);

  try {
    // 1. GA4 / Google Tag Ecommerce Event
    window.gtag('event', 'purchase', purchasePayload);

    // 2. Google Ads Conversion Action Event
    window.gtag('event', 'conversion', conversionPayload);

    console.log(
      `%c[Google Ads Tracking] ✓ CONVERSÃO DE COMPRA DISPARADA COM SUCESSO!`,
      'background: #15803d; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
      {
        orderId,
        valor: purchasePayload.value,
        sendTo,
        purchasePayload,
        conversionPayload,
        timestamp: new Date().toISOString(),
      }
    );

    return {
      success: true,
      deduplicated: false,
      orderId,
      purchasePayload,
      conversionPayload,
    };
  } catch (err) {
    console.error('[Tracking] Erro ao disparar evento no gtag:', err);
    return { success: false, error: err };
  }
}

/**
 * Dispara evento de InitiateCheckout (quando abre o checkout com itens)
 */
export function trackInitiateCheckout(items = [], total = 0) {
  if (typeof window === 'undefined') return;
  ensureGtag();

  const adsId =
    window.GOOGLE_ADS_CONVERSION_ID ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_ADS_ID) ||
    DEFAULT_GOOGLE_ADS_ID;

  const icLabel = window.GOOGLE_ADS_IC_LABEL;

  const payload = {
    value: Number(Number(total || 0).toFixed(2)),
    currency: 'BRL',
    items: (items || []).map((item, idx) => ({
      item_id: String(item.id || `item_${idx}`),
      item_name: String(item.name || 'Produto Donatello'),
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
    })),
  };

  try {
    window.gtag('event', 'begin_checkout', payload);
    if (icLabel && icLabel !== 'COLE_O_LABEL_IC_AQUI') {
      window.gtag('event', 'conversion', {
        send_to: `${adsId}/${icLabel}`,
        value: payload.value,
        currency: 'BRL',
      });
    }
  } catch {}
}
