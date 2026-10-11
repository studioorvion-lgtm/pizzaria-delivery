import { neon } from '@neondatabase/serverless';

const DEFAULT_DATABASE_URL =
  'postgresql://neondb_owner:npg_f7nOe6bILypY@ep-soft-truth-b6a8vbj6.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require';

function getDatabaseUrl() {
  return (process.env.DATABASE_URL || DEFAULT_DATABASE_URL).trim();
}

export function getSql() {
  return neon(getDatabaseUrl());
}

/**
 * Converte linha do banco PostgreSQL para formato de Pedido padrão da Pizzaria
 */
export function mapRowToOrder(row) {
  if (!row) return null;
  return {
    orderId: row.order_id,
    transactionId: row.transaction_id || null,
    status: row.status || 'PENDING',
    isPaid: Boolean(row.is_paid),
    total: Number(row.total || 0),
    paidAmount: row.paid_amount != null ? Number(row.paid_amount) : null,
    customer: {
      fullName: row.customer_name || '',
      phone: row.customer_phone || '',
      email: row.customer_email || '',
      document: row.customer_document || '',
    },
    address: row.address || {},
    items: row.items || [],
    pix: row.pix || null,
    paymentMethod: row.payment_method || 'pix',
    idempotencyKey: row.idempotency_key || null,
    inventoryDeducted: Boolean(row.inventory_deducted),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

/**
 * Garante que a tabela de pedidos exista no Neon Postgres
 */
export async function dbInit() {
  try {
    const sql = getSql();
    await sql`
      CREATE TABLE IF NOT EXISTS pizzaria_orders (
        order_id VARCHAR(64) PRIMARY KEY,
        transaction_id VARCHAR(128),
        status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
        is_paid BOOLEAN NOT NULL DEFAULT FALSE,
        total NUMERIC(10, 2) NOT NULL,
        paid_amount NUMERIC(10, 2),
        customer_name VARCHAR(255),
        customer_phone VARCHAR(64),
        customer_email VARCHAR(255),
        customer_document VARCHAR(64),
        address JSONB,
        items JSONB,
        pix JSONB,
        payment_method VARCHAR(32) DEFAULT 'pix',
        idempotency_key VARCHAR(255),
        inventory_deducted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        paid_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        raw_data JSONB
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_pizzaria_orders_tx ON pizzaria_orders(transaction_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pizzaria_orders_status ON pizzaria_orders(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pizzaria_orders_created ON pizzaria_orders(created_at DESC);`;
    return true;
  } catch (err) {
    console.error('[dbInit] Falha ao inicializar tabela:', err.message);
    return false;
  }
}

/**
 * Salva ou atualiza pedido no Postgres (Persistência real)
 */
export async function dbSaveOrder(order) {
  if (!order || !order.orderId) return null;

  try {
    const sql = getSql();

    const orderId = order.orderId;
    const transactionId = order.transactionId || null;
    const status = order.status || 'PENDING';
    const isPaid = Boolean(order.isPaid || status === 'PAID');
    const total = Number(order.total || 0);
    const paidAmount = order.paidAmount != null ? Number(order.paidAmount) : (isPaid ? total : null);

    const customerName = order.customer?.fullName || '';
    const customerPhone = order.customer?.phone || '';
    const customerEmail = order.customer?.email || '';
    const customerDocument = order.customer?.document || order.customer?.cpf || '';

    const address = JSON.stringify(order.address || {});
    const items = JSON.stringify(order.items || []);
    const pix = JSON.stringify(order.pix || {});
    const paymentMethod = order.paymentMethod || 'pix';
    const idempotencyKey = order.idempotencyKey || null;
    const inventoryDeducted = Boolean(order.inventoryDeducted);

    const createdAt = order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString();
    const paidAt = order.paidAt ? new Date(order.paidAt).toISOString() : null;
    const rawData = JSON.stringify(order);

    const rows = await sql`
      INSERT INTO pizzaria_orders (
        order_id,
        transaction_id,
        status,
        is_paid,
        total,
        paid_amount,
        customer_name,
        customer_phone,
        customer_email,
        customer_document,
        address,
        items,
        pix,
        payment_method,
        idempotency_key,
        inventory_deducted,
        created_at,
        paid_at,
        updated_at,
        raw_data
      ) VALUES (
        ${orderId},
        ${transactionId},
        ${status},
        ${isPaid},
        ${total},
        ${paidAmount},
        ${customerName},
        ${customerPhone},
        ${customerEmail},
        ${customerDocument},
        ${address}::jsonb,
        ${items}::jsonb,
        ${pix}::jsonb,
        ${paymentMethod},
        ${idempotencyKey},
        ${inventoryDeducted},
        ${createdAt}::timestamptz,
        ${paidAt ? sql`${paidAt}::timestamptz` : null},
        NOW(),
        ${rawData}::jsonb
      )
      ON CONFLICT (order_id) DO UPDATE SET
        transaction_id = COALESCE(EXCLUDED.transaction_id, pizzaria_orders.transaction_id),
        status = EXCLUDED.status,
        is_paid = EXCLUDED.is_paid,
        paid_amount = COALESCE(EXCLUDED.paid_amount, pizzaria_orders.paid_amount),
        paid_at = COALESCE(EXCLUDED.paid_at, pizzaria_orders.paid_at),
        inventory_deducted = EXCLUDED.inventory_deducted,
        updated_at = NOW(),
        raw_data = EXCLUDED.raw_data
      RETURNING *;
    `;

    return mapRowToOrder(rows[0]);
  } catch (err) {
    console.error(`[dbSaveOrder] Erro ao salvar pedido #${order.orderId}:`, err.message);
    return null;
  }
}

/**
 * Busca pedido por orderId ou transactionId
 */
export async function dbGetOrder(identifier) {
  if (!identifier) return null;

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM pizzaria_orders
      WHERE order_id = ${identifier} OR transaction_id = ${identifier}
      LIMIT 1;
    `;
    if (!rows || rows.length === 0) return null;
    return mapRowToOrder(rows[0]);
  } catch (err) {
    console.error(`[dbGetOrder] Erro ao buscar pedido ${identifier}:`, err.message);
    return null;
  }
}

/**
 * Busca todos os pedidos cadastrados, ordenados por data decrescente
 */
export async function dbGetAllOrders(limit = 200) {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM pizzaria_orders
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;
    return (rows || []).map(mapRowToOrder);
  } catch (err) {
    console.error('[dbGetAllOrders] Erro ao listar pedidos do banco:', err.message);
    return [];
  }
}

/**
 * Atualiza status do pedido no Postgres
 */
export async function dbUpdateOrderStatus(identifier, status, extra = {}) {
  if (!identifier || !status) return null;

  try {
    const sql = getSql();
    const isPaid = status === 'PAID';
    const paidAt = extra.paidAt || (isPaid ? new Date().toISOString() : null);
    const paidAmount = extra.paidAmount != null ? Number(extra.paidAmount) : null;
    const inventoryDeducted = extra.inventoryDeducted != null ? Boolean(extra.inventoryDeducted) : null;

    const rows = await sql`
      UPDATE pizzaria_orders
      SET
        status = ${status},
        is_paid = ${isPaid},
        paid_at = COALESCE(${paidAt ? sql`${paidAt}::timestamptz` : null}, paid_at),
        paid_amount = COALESCE(${paidAmount}, paid_amount),
        inventory_deducted = COALESCE(${inventoryDeducted}, inventory_deducted),
        updated_at = NOW()
      WHERE order_id = ${identifier} OR transaction_id = ${identifier}
      RETURNING *;
    `;

    if (!rows || rows.length === 0) return null;
    return mapRowToOrder(rows[0]);
  } catch (err) {
    console.error(`[dbUpdateOrderStatus] Erro ao atualizar #${identifier}:`, err.message);
    return null;
  }
}

/**
 * Verifica idempotência por chave
 */
export async function dbCheckIdempotency(key) {
  if (!key) return null;

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM pizzaria_orders
      WHERE idempotency_key = ${key}
      LIMIT 1;
    `;
    if (!rows || rows.length === 0) return null;
    return mapRowToOrder(rows[0]);
  } catch (err) {
    console.error(`[dbCheckIdempotency] Erro ao checar chave ${key}:`, err.message);
    return null;
  }
}
