import { sigiloPay } from '../lib/sigilopay.js';
import { ordersService } from '../lib/orders.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query || {};
  if (!id) {
    return res.status(400).json({ success: false, error: 'ID do pedido ou da transação não fornecido.' });
  }

  try {
    let order = ordersService.getOrder(id);

    // Se já estiver pago em memória, retorna imediatamente
    if (order && order.isPaid) {
      return res.status(200).json({
        success: true,
        isPaid: true,
        status: 'PAID',
        paidAmount: order.paidAmount,
        paidAt: order.paidAt,
        orderId: order.orderId,
      });
    }

    // Se possui transactionId ou se id é uma transactionId, consulta na API SigiloPay
    const txId = order?.transactionId || id;
    if (txId && sigiloPay.isConfigured()) {
      const checkResult = await sigiloPay.checkTransaction(txId);
      
      if (checkResult.success && checkResult.isPaid) {
        // 9 & 12: Só confirmar após retorno real do SigiloPay, atualizar pedido para PAGO e atualizar estoque
        ordersService.confirmPayment(id, checkResult.amount, checkResult.payedAt);
        order = ordersService.getOrder(id);

        return res.status(200).json({
          success: true,
          isPaid: true,
          status: 'PAID',
          paidAmount: checkResult.amount,
          paidAt: checkResult.payedAt,
          orderId: order?.orderId || id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      isPaid: false,
      status: order?.status || 'PENDING',
      orderId: order?.orderId || id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Erro ao consultar status: ${err.message}`,
    });
  }
}
