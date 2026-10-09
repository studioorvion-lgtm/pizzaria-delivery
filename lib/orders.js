/**
 * Gerenciador central de pedidos e estoque
 */

// Estoque inicial dos produtos (mock de inventário)
const initialStock = {
  'combo-2pp': 50,
  'combo-2p': 50,
  'combo-2m': 45,
  'combo-2g': 40,
  'combo-2gig': 30,
  'combo-3gig': 25,
  'esp-calabresa': 40,
  'esp-carne-sol': 35,
  'esp-marguerita': 40,
  'esp-frango-cat': 40,
  'esp-portuguesa': 35,
  'esp-tres-queijos': 35,
  'burg-classic': 60,
  'burg-cheddar-bacon': 55,
  'burg-double-smash': 50,
  'burg-bbq-supreme': 45,
  'burg-monster': 40,
  'refri-coca-lata': 100,
  'refri-coca-zero': 80,
  'refri-guarana-lata': 90,
  'refri-fanta-lata': 75,
  'refri-coca-1l': 60,
  'refri-coca-2l': 80,
  'refri-guarana-2l': 70,
  'agua-500': 120,
};

// Armazenamento em memória persistente durante a sessão do servidor
const ordersMap = new Map();
const idempotencyMap = new Map();
const currentStock = { ...initialStock };

export class OrdersService {
  /**
   * Previne pedido duplicado checando uma chave de idempotência
   */
  checkIdempotency(key) {
    if (!key) return null;
    const existing = idempotencyMap.get(key);
    if (existing && Date.now() - existing.timestamp < 30000) {
      return existing.order;
    }
    return null;
  }

  saveIdempotency(key, order) {
    if (!key) return;
    idempotencyMap.set(key, { order, timestamp: Date.now() });
  }

  /**
   * Registra novo pedido com status inicial PENDING
   */
  createOrder({
    orderId,
    transactionId,
    items,
    customer,
    address,
    total,
    pix,
  }) {
    const order = {
      orderId,
      transactionId: transactionId || null,
      status: 'PENDING', // PENDING nunca conta como venda paga
      isPaid: false,
      items: items || [],
      customer: {
        fullName: customer?.fullName || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        document: customer?.document || customer?.cpf || '',
      },
      address: {
        cep: address?.cep || '',
        street: address?.street || '',
        number: address?.number || '',
        complement: address?.complement || '',
        neighborhood: address?.neighborhood || '',
        city: address?.city || '',
        state: address?.state || '',
      },
      total: Number(total.toFixed(2)),
      paidAmount: 0,
      pix: {
        code: pix?.code || '',
        qrCodeImage: pix?.qrCodeImage || '',
      },
      inventoryDeducted: false,
      createdAt: new Date().toISOString(),
      paidAt: null,
    };

    ordersMap.set(orderId, order);
    if (transactionId) {
      ordersMap.set(transactionId, order);
    }

    return order;
  }

  /**
   * Busca pedido por ID ou por TransactionId
   */
  getOrder(id) {
    if (!id) return null;
    return ordersMap.get(id) || null;
  }

  /**
   * Confirma pagamento e atualiza estoque e valores
   */
  confirmPayment(id, actualAmount = null, paidAt = null) {
    const order = this.getOrder(id);
    if (!order) return null;

    // Previne processamento de pagamento duplicado
    if (order.status === 'PAID') {
      return { order, alreadyPaid: true };
    }

    // 12. Atualizar pedido para PAGO e registrar valor real
    order.status = 'PAID';
    order.isPaid = true;
    order.paidAmount = actualAmount !== null ? Number(actualAmount) : order.total;
    order.paidAt = paidAt || new Date().toISOString();

    // 12. Atualizar estoque somente agora que foi pago
    if (!order.inventoryDeducted && Array.isArray(order.items)) {
      for (const item of order.items) {
        const id = item.id;
        const qty = item.quantity || 1;
        if (currentStock[id] !== undefined) {
          currentStock[id] = Math.max(0, currentStock[id] - qty);
        }
      }
      order.inventoryDeducted = true;
    }

    return { order, alreadyPaid: false };
  }

  getStock() {
    return { ...currentStock };
  }
}

export const ordersService = new OrdersService();
