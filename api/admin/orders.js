import { ordersService } from '../../lib/orders.js';
import { sigiloPay } from '../../lib/sigilopay.js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'donatello2026';
const VALID_TOKEN = 'donatello_admin_token_2026';

function isAuthorized(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const customKey = (req.headers['x-admin-key'] || '').trim();
  const queryKey = (req.query?.key || req.query?.token || '').trim();

  const candidate = token || customKey || queryKey;
  return candidate === VALID_TOKEN || candidate === ADMIN_PASSWORD;
}

function getTodayString() {
  // Retorna YYYY-MM-DD no fuso de Brasília (UTC-3)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const brt = new Date(utc - 3 * 3600000);
  return brt.toISOString().split('T')[0];
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Rota de Login (POST)
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    
    if (body.action === 'login') {
      const { username, password } = body;
      const validUser = !username || username.toLowerCase() === 'admin' || username.toLowerCase() === 'donatello';
      const validPass = password === ADMIN_PASSWORD;

      if (validUser && validPass) {
        return res.status(200).json({
          success: true,
          token: VALID_TOKEN,
          message: 'Autenticado com sucesso',
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Usuário ou senha incorretos.',
      });
    }

    // Exige autenticação para outras ações POST
    if (!isAuthorized(req)) {
      return res.status(401).json({ success: false, error: 'Acesso não autorizado.' });
    }

    if (body.action === 'updateStatus') {
      const { orderId, status, orderProgress, notes } = body;
      if (!orderId || !status) {
        return res.status(400).json({ success: false, error: 'orderId e status são obrigatórios.' });
      }
      const updated = ordersService.updateOrderStatus(orderId, status, { orderProgress, notes });
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Pedido não encontrado.' });
      }
      return res.status(200).json({ success: true, order: updated });
    }
  }

  // 2. Consulta de Pedidos e Métricas (GET)
  if (req.method === 'GET') {
    if (!isAuthorized(req)) {
      return res.status(401).json({
        success: false,
        error: 'Acesso não autorizado. Forneça o token ou chave administrativa.',
      });
    }

    try {
      // Sincroniza pedidos PENDING com o gateway SigiloPay se solicitado ou periodicamente
      const shouldSync = req.query?.sync !== 'false';
      let syncResult = null;
      if (shouldSync && sigiloPay.isConfigured()) {
        syncResult = await ordersService.syncPendingWithGateway(sigiloPay);
      }

      const orders = ordersService.getAllOrders();
      const todayStr = getTodayString();

      // Métricas
      let ordersToday = 0;
      let revenueToday = 0;
      let paidCount = 0;
      let paidRevenue = 0;
      let pendingCount = 0;
      let pendingRevenue = 0;
      let failedCount = 0;
      let expiredCount = 0;
      let cancelledCount = 0;

      for (const o of orders) {
        const orderDateStr = (o.createdAt || '').split('T')[0];
        const isToday = orderDateStr === todayStr;
        const total = Number(o.total || 0);
        const paidAmount = Number(o.paidAmount || total);

        if (isToday) {
          ordersToday++;
          if (o.status === 'PAID') {
            revenueToday += paidAmount;
          }
        }

        if (o.status === 'PAID') {
          paidCount++;
          paidRevenue += paidAmount;
        } else if (o.status === 'PENDING') {
          pendingCount++;
          pendingRevenue += total;
        } else if (o.status === 'FAILED') {
          failedCount++;
        } else if (o.status === 'EXPIRED') {
          expiredCount++;
        } else if (o.status === 'CANCELLED') {
          cancelledCount++;
        }
      }

      return res.status(200).json({
        success: true,
        metrics: {
          ordersToday,
          revenueToday: Number(revenueToday.toFixed(2)),
          paidCount,
          paidRevenue: Number(paidRevenue.toFixed(2)),
          pendingCount,
          pendingRevenue: Number(pendingRevenue.toFixed(2)),
          failedCount,
          expiredCount,
          cancelledCount,
          totalOrders: orders.length,
        },
        orders,
        gatewayConfigured: sigiloPay.isConfigured(),
        syncResult,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: `Erro ao buscar pedidos: ${err.message}`,
      });
    }
  }

  return res.status(405).json({ success: false, error: 'Método não permitido.' });
}
