import { sigiloPay } from '../../lib/sigilopay.js';
import { ordersService } from '../../lib/orders.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método não permitido' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    if (!payload) {
      return res.status(400).json({ ok: false, error: 'Payload vazio' });
    }

    const tx = payload.transaction || payload;
    const txId = tx?.id || tx?.transactionId;

    if (!txId) {
      return res.status(400).json({ ok: false, error: 'Identificador de transação ausente' });
    }

    const isApproved = sigiloPay.isWebhookPaymentApproved(payload);

    if (isApproved) {
      // 9 & 12: Atualiza pedido para PAGO, atualiza estoque e salva valor real
      const actualAmount = typeof tx.amount === 'number' ? tx.amount : Number(tx.chargeAmount || 0);
      const paidAt = tx.payedAt || tx.paidAt || new Date().toISOString();

      ordersService.confirmPayment(String(txId), actualAmount, paidAt);

      console.log(`[SigiloPay Webhook] Pagamento confirmado para a transação ${txId}`);
      return res.status(200).json({
        ok: true,
        transactionId: txId,
        status: 'COMPLETED',
      });
    }

    return res.status(200).json({
      ok: true,
      transactionId: txId,
      status: tx.status || 'PENDING',
    });
  } catch (err) {
    console.error('[SigiloPay Webhook Error]:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
