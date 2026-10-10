/**
 * Gerenciador central de pedidos e estoque com persistência em arquivo e memória
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

const DATA_DIR = path.join(process.cwd(), '.data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const STOCK_FILE = path.join(DATA_DIR, 'stock.json');

const TMP_DIR = path.join(os.tmpdir(), 'pizzaria_donatello_data');
const TMP_ORDERS_FILE = path.join(TMP_DIR, 'orders.json');
const TMP_STOCK_FILE = path.join(TMP_DIR, 'stock.json');

// Garante que os diretórios existem
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch {}

try {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }
} catch {}

// Estoque inicial
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

function loadStoredOrders() {
  const merged = {};
  // 1. Base local file
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf8');
      Object.assign(merged, JSON.parse(data));
    }
  } catch {}

  // 2. Tmp file (runtime writes no Vercel serverless)
  try {
    if (fs.existsSync(TMP_ORDERS_FILE)) {
      const data = fs.readFileSync(TMP_ORDERS_FILE, 'utf8');
      Object.assign(merged, JSON.parse(data));
    }
  } catch {}

  return merged;
}

function saveStoredOrders(ordersObj) {
  // Salva no /tmp (garantido no Vercel)
  try {
    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
    fs.writeFileSync(TMP_ORDERS_FILE, JSON.stringify(ordersObj, null, 2), 'utf8');
  } catch {}

  // Salva no .data local se gravável
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(ordersObj, null, 2), 'utf8');
  } catch {}
}

function loadStoredStock() {
  const merged = { ...initialStock };
  try {
    if (fs.existsSync(STOCK_FILE)) {
      const data = fs.readFileSync(STOCK_FILE, 'utf8');
      Object.assign(merged, JSON.parse(data));
    }
  } catch {}

  try {
    if (fs.existsSync(TMP_STOCK_FILE)) {
      const data = fs.readFileSync(TMP_STOCK_FILE, 'utf8');
      Object.assign(merged, JSON.parse(data));
    }
  } catch {}

  return merged;
}

function saveStoredStock(stockObj) {
  try {
    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
    fs.writeFileSync(TMP_STOCK_FILE, JSON.stringify(stockObj, null, 2), 'utf8');
  } catch {}

  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STOCK_FILE, JSON.stringify(stockObj, null, 2), 'utf8');
  } catch {}
}

const ordersStore = loadStoredOrders();
const idempotencyMap = new Map();
const currentStock = loadStoredStock();

export class OrdersService {
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
      status: 'PENDING', // PENDING não conta como venda paga
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

    ordersStore[orderId] = order;
    if (transactionId) {
      ordersStore[transactionId] = order;
    }

    saveStoredOrders(ordersStore);
    return order;
  }

  getOrder(id) {
    if (!id) return null;
    return ordersStore[id] || null;
  }

  confirmPayment(id, actualAmount = null, paidAt = null) {
    const order = this.getOrder(id);
    if (!order) return null;

    if (order.status === 'PAID') {
      return { order, alreadyPaid: true };
    }

    order.status = 'PAID';
    order.isPaid = true;
    order.paidAmount = actualAmount !== null ? Number(actualAmount) : order.total;
    order.paidAt = paidAt || new Date().toISOString();

    if (!order.inventoryDeducted && Array.isArray(order.items)) {
      for (const item of order.items) {
        const id = item.id;
        const qty = item.quantity || 1;
        if (currentStock[id] !== undefined) {
          currentStock[id] = Math.max(0, currentStock[id] - qty);
        }
      }
      order.inventoryDeducted = true;
      saveStoredStock(currentStock);
    }

    saveStoredOrders(ordersStore);
    return { order, alreadyPaid: false };
  }

  getStock() {
    return { ...currentStock };
  }

  getAllOrders() {
    const fresh = loadStoredOrders();
    Object.assign(ordersStore, fresh);
    const map = new Map();
    for (const order of Object.values(ordersStore)) {
      if (order && order.orderId) {
        map.set(order.orderId, order);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  updateOrderStatus(id, newStatus, extra = {}) {
    const order = this.getOrder(id);
    if (!order) return null;
    order.status = newStatus;
    if (newStatus === 'PAID') {
      order.isPaid = true;
      if (!order.paidAt) order.paidAt = new Date().toISOString();
      if (!order.paidAmount) order.paidAmount = order.total;
    }
    if (extra.orderProgress) order.orderProgress = extra.orderProgress;
    if (extra.notes) order.notes = extra.notes;
    saveStoredOrders(ordersStore);
    return order;
  }

  async syncPendingWithGateway(sigiloPayInstance) {
    if (!sigiloPayInstance || !sigiloPayInstance.isConfigured()) return { synced: 0, updated: 0 };
    const orders = this.getAllOrders();
    let updated = 0;
    for (const order of orders) {
      if (order.status === 'PENDING' && order.transactionId) {
        try {
          const check = await sigiloPayInstance.checkTransaction(order.transactionId);
          if (check.success && check.isPaid) {
            this.confirmPayment(order.orderId, check.amount, check.payedAt);
            updated++;
          } else if (check.success && check.status && check.status !== 'PENDING') {
            order.status = check.status;
            saveStoredOrders(ordersStore);
            updated++;
          }
        } catch {}
      }
    }
    return { synced: orders.length, updated };
  }
}

export const ordersService = new OrdersService();

