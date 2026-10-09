import { sigiloPay } from '../lib/sigilopay.js';
import { ordersService } from '../lib/orders.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { items, customer, address, paymentMethod = 'pix', idempotencyKey } = body;

    // 1. Validação dos itens
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'O carrinho está vazio.' });
    }

    // 2. Validação dos dados do comprador
    if (!customer?.fullName || !customer?.phone) {
      return res.status(400).json({
        success: false,
        error: 'Nome completo e telefone são obrigatórios.',
      });
    }

    // 3. Verificação de idempotência / duplicidade
    const checkKey = idempotencyKey || `${customer.phone}_${JSON.stringify(items)}`;
    const duplicateOrder = ordersService.checkIdempotency(checkKey);
    if (duplicateOrder) {
      return res.status(200).json({
        success: true,
        orderId: duplicateOrder.orderId,
        transactionId: duplicateOrder.transactionId,
        total: duplicateOrder.total,
        pix: duplicateOrder.pix,
        status: duplicateOrder.status,
        reused: true,
      });
    }

    // 4. Cálculo do valor total
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const total = subtotal; // entrega grátis conforme informado na landing page

    const orderId = `DON-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const transactionIdentifier = `pizza_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 5. Integração com SigiloPay se Pix
    if (paymentMethod === 'pix') {
      const pixResult = await sigiloPay.createPixPayment({
        identifier: transactionIdentifier,
        amount: total,
        client: {
          name: customer.fullName,
          email: customer.email || 'contato@donatellopizza.com.br',
          phone: customer.phone,
          document: customer.document || customer.cpf || '',
        },
      });

      if (!pixResult.success) {
        return res.status(502).json({
          success: false,
          error: pixResult.error || 'Falha ao gerar cobrança no SigiloPay.',
        });
      }

      // Cria pedido com status PENDING (não conta como venda paga ainda)
      const order = ordersService.createOrder({
        orderId,
        transactionId: pixResult.transactionId || transactionIdentifier,
        items,
        customer,
        address,
        total,
        pix: {
          code: pixResult.pixCode,
          qrCodeImage: pixResult.qrCodeImage,
        },
      });

      ordersService.saveIdempotency(checkKey, order);

      return res.status(200).json({
        success: true,
        orderId: order.orderId,
        transactionId: order.transactionId,
        paymentMethod: 'pix',
        total: order.total,
        pix: order.pix,
        status: 'PENDING',
      });
    }

    // Outros métodos (dinheiro/cartão na entrega)
    const order = ordersService.createOrder({
      orderId,
      transactionId: null,
      items,
      customer,
      address,
      total,
      pix: null,
    });

    return res.status(200).json({
      success: true,
      orderId: order.orderId,
      paymentMethod,
      total: order.total,
      status: 'PENDING',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Erro interno no checkout: ${err.message}`,
    });
  }
}
