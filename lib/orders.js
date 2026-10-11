/**
 * Gerenciador central de pedidos e estoque com persistência real em banco PostgreSQL (Neon Serverless)
 * e cache local resiliente.
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  dbSaveOrder,
  dbGetOrder,
  dbGetAllOrders,
  dbUpdateOrderStatus,
  dbCheckIdempotency,
} from './db.js';

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
  async checkIdempotency(key) {
    if (!key) return null;
    const existing = idempotencyMap.get(key);
    if (existing && Date.now() - existing.timestamp < 30000) {
      return existing.order;
    }

    try {
      const dbOrder = await dbCheckIdempotency(key);
      if (dbOrder) {
        idempotencyMap.set(key, { order: dbOrder, timestamp: Date.now() });
        return dbOrder;
      }
    } catch {}

    return null;
  }

  saveIdempotency(key, order) {
    if (!key) return;
    idempotencyMap.set(key, { order, timestamp: Date.now() });
  }

  async createOrder({
    orderId,
    transactionId,
    items,
    customer,
    address,
    total,
    pix,
    paymentMethod = 'pix',
    idempotencyKey,
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
      paymentMethod,
      idempotencyKey: idempotencyKey || null,
      inventoryDeducted: false,
      createdAt: new Date().toISOString(),
      paidAt: null,
    };

    // 1. Atualiza memória e cache local
    ordersStore[orderId] = order;
    if (transactionId) {
      ordersStore[transactionId] = order;
    }
    saveStoredOrders(ordersStore);

    // 2. Persiste no Neon PostgreSQL (garantia de não sumir entre lambdas e redeploys)
    try {
      const savedInDb = await dbSaveOrder(order);
      if (savedInDb) {
        ordersStore[orderId] = savedInDb;
        if (transactionId) ordersStore[transactionId] = savedInDb;
      }
    } catch (err) {
      console.error(`[OrdersService.createOrder] Erro ao persistir pedido #${orderId} no banco:`, err.message);
    }

    return order;
  }

  async getOrder(id) {
    if (!id) return null;

    // 1. Verifica cache em memória
    if (ordersStore[id]) {
      return ordersStore[id];
    }

    // 2. Busca no banco de dados Neon Postgres
    try {
      const dbOrder = await dbGetOrder(id);
      if (dbOrder) {
        ordersStore[dbOrder.orderId] = dbOrder;
        if (dbOrder.transactionId) ordersStore[dbOrder.transactionId] = dbOrder;
        return dbOrder;
      }
    } catch {}

    return null;
  }

  async confirmPayment(id, actualAmount = null, paidAt = null) {
    let order = await this.getOrder(id);
    if (!order) return null;

    if (order.status === 'PAID') {
      return { order, alreadyPaid: true };
    }

    const paidIso = paidAt ? new Date(paidAt).toISOString() : new Date().toISOString();
    const paidValue = actualAmount !== null ? Number(actualAmount) : order.total;

    order.status = 'PAID';
    order.isPaid = true;
    order.paidAmount = paidValue;
    order.paidAt = paidIso;

    // Baixa de estoque
    if (!order.inventoryDeducted && Array.isArray(order.items)) {
      for (const item of order.items) {
        const itemId = item.id;
        const qty = item.quantity || 1;
        if (currentStock[itemId] !== undefined) {
          currentStock[itemId] = Math.max(0, currentStock[itemId] - qty);
        }
      }
      order.inventoryDeducted = true;
      saveStoredStock(currentStock);
    }

    ordersStore[order.orderId] = order;
    if (order.transactionId) {
      ordersStore[order.transactionId] = order;
    }
    saveStoredOrders(ordersStore);

    // Atualiza no banco de dados Neon Postgres
    try {
      const updatedDb = await dbUpdateOrderStatus(order.orderId, 'PAID', {
        paidAmount: paidValue,
        paidAt: paidIso,
        inventoryDeducted: true,
      });
      if (updatedDb) {
        ordersStore[order.orderId] = updatedDb;
        if (order.transactionId) ordersStore[order.transactionId] = updatedDb;
        order = updatedDb;
      }
    } catch (err) {
      console.error(`[confirmPayment] Erro ao atualizar #${id} no banco:`, err.message);
    }

    return { order, alreadyPaid: false };
  }

  getStock() {
    return { ...currentStock };
  }

  async getAllOrders() {
    const ordersMap = new Map();

    // 1. Busca todos os pedidos persistidos no Neon Postgres
    try {
      const dbOrders = await dbGetAllOrders(300);
      for (const o of dbOrders) {
        if (o && o.orderId) {
          ordersMap.set(o.orderId, o);
          ordersStore[o.orderId] = o;
          if (o.transactionId) ordersStore[o.transactionId] = o;
        }
      }
    } catch (err) {
      console.error('[getAllOrders] Erro ao consultar banco:', err.message);
    }

    // 2. Mescla com pedidos do arquivo local caso algum não esteja no banco
    const localFresh = loadStoredOrders();
    for (const o of Object.values(localFresh)) {
      if (o && o.orderId && !ordersMap.has(o.orderId)) {
        ordersMap.set(o.orderId, o);
      }
    }

    // 3. Mescla com pedidos em memória
    for (const o of Object.values(ordersStore)) {
      if (o && o.orderId && !ordersMap.has(o.orderId)) {
        ordersMap.set(o.orderId, o);
      }
    }

    return Array.from(ordersMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async updateOrderStatus(id, newStatus, extra = {}) {
    let order = await this.getOrder(id);
    if (!order) return null;

    order.status = newStatus;
    if (newStatus === 'PAID') {
      order.isPaid = true;
      if (!order.paidAt) order.paidAt = new Date().toISOString();
      if (!order.paidAmount) order.paidAmount = order.total;
    }
    if (extra.orderProgress) order.orderProgress = extra.orderProgress;
    if (extra.notes) order.notes = extra.notes;

    ordersStore[order.orderId] = order;
    if (order.transactionId) {
      ordersStore[order.transactionId] = order;
    }
    saveStoredOrders(ordersStore);

    // Atualiza no banco Postgres
    try {
      const dbUpdated = await dbUpdateOrderStatus(order.orderId, newStatus, extra);
      if (dbUpdated) {
        ordersStore[order.orderId] = dbUpdated;
        if (order.transactionId) ordersStore[order.transactionId] = dbUpdated;
        order = dbUpdated;
      }
    } catch {}

    return order;
  }

  async syncPendingWithGateway(sigiloPayInstance) {
    if (!sigiloPayInstance || !sigiloPayInstance.isConfigured()) return { synced: 0, updated: 0 };
    const orders = await this.getAllOrders();
    let updated = 0;

    for (const order of orders) {
      if (order.status === 'PENDING' && order.transactionId) {
        try {
          const check = await sigiloPayInstance.checkTransaction(order.transactionId);
          if (check.success && check.isPaid) {
            await this.confirmPayment(order.orderId, check.amount, check.payedAt);
            updated++;
          } else if (check.success && check.status && check.status !== 'PENDING') {
            await this.updateOrderStatus(order.orderId, check.status);
            updated++;
          }
        } catch {}
      }
    }
    return { synced: orders.length, updated };
  }
}

export const ordersService = new OrdersService();
