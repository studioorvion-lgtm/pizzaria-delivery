import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Download,
  ExternalLink,
  Lock,
  LogOut,
  Copy,
  Check,
  Phone,
  MapPin,
  Eye,
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { siteConfig } from '../config/site';

const AUTH_STORAGE_KEY = 'donatello_admin_auth_v1';

export default function AdminPanel({ onBackToSite }) {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_STORAGE_KEY) || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    ordersToday: 0,
    revenueToday: 0,
    paidCount: 0,
    paidRevenue: 0,
    pendingCount: 0,
    pendingRevenue: 0,
    failedCount: 0,
    expiredCount: 0,
    cancelledCount: 0,
    totalOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PAID' | 'PENDING' | 'EXPIRED' | 'CANCELLED'
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [copiedId, setCopiedId] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // 1. Carrega dados quando autenticado
  const fetchOrders = useCallback(async (showLoading = true) => {
    if (!token) return;
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?sync=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        // Token inválido/expirado
        setToken('');
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.metrics) setMetrics(data.metrics);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos no admin:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchOrders(false);
    }
  }, [token, fetchOrders]);

  // Auto-refresh a cada 10s se ativado
  useEffect(() => {
    if (!token || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [token, autoRefresh, fetchOrders]);

  // Função de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        setToken(data.token);
        localStorage.setItem(AUTH_STORAGE_KEY, data.token);
        setPasswordInput('');
      } else {
        setLoginError(data.error || 'Senha incorreta. Tente novamente.');
      }
    } catch (err) {
      setLoginError(err?.message || 'Falha ao conectar ao servidor. Verifique sua conexão.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Copiar para área de transferência
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2500);
  };

  // Alterar status de pedido manualmente
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'updateStatus',
          orderId,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Status do pedido #${orderId} atualizado para ${newStatus}`);
        setTimeout(() => setActionMessage(''), 4000);
        fetchOrders(false);
      }
    } catch {}
  };

  // Exportar para CSV
  const handleExportCSV = () => {
    if (!orders.length) return;
    const headers = [
      'ID Pedido',
      'Data/Hora',
      'Cliente',
      'Telefone',
      'Total (R$)',
      'Status Pagamento',
      'Método',
      'Transação Gateway',
      'Itens',
    ];

    const rows = orders.map((o) => [
      `"${o.orderId}"`,
      `"${new Date(o.createdAt).toLocaleString('pt-BR')}"`,
      `"${o.customer?.fullName || ''}"`,
      `"${o.customer?.phone || ''}"`,
      `"${Number(o.total || 0).toFixed(2)}"`,
      `"${o.status}"`,
      `"${o.paymentMethod || (o.pix ? 'pix' : 'outro')}"`,
      `"${o.transactionId || ''}"`,
      `"${(o.items || []).map((i) => `${i.quantity}x ${i.name}`).join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pedidos_donatello_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtragem e busca
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filtro de status
      if (activeFilter === 'PAID' && order.status !== 'PAID') return false;
      if (activeFilter === 'PENDING' && order.status !== 'PENDING') return false;
      if (activeFilter === 'EXPIRED' && order.status !== 'EXPIRED') return false;
      if (activeFilter === 'CANCELLED' && order.status !== 'CANCELLED' && order.status !== 'FAILED') return false;

      // Busca por texto
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesId = String(order.orderId || '').toLowerCase().includes(q);
        const matchesTx = String(order.transactionId || '').toLowerCase().includes(q);
        const matchesName = String(order.customer?.fullName || '').toLowerCase().includes(q);
        const matchesPhone = String(order.customer?.phone || '').includes(q);
        if (!matchesId && !matchesTx && !matchesName && !matchesPhone) return false;
      }

      return true;
    });
  }, [orders, activeFilter, searchTerm]);

  // -------------------------------------------------------------
  // TELA DE LOGIN PROTEGIDO
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0d1512] text-white flex items-center justify-center p-4">
        <div className="bg-[#15231e] border border-[#233830] rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-emerald-950/60 rounded-full flex items-center justify-center border-2 border-emerald-500/40 p-2 shadow-inner">
              <img
                src="/images/pizzaria.webp"
                alt="Donatello"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Donatello Pizzaria Artesanal
            </h1>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mt-1">
              Painel de Vendas & Gestão
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                Senha Administrativa
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Digite a senha de acesso"
                  className="w-full pl-11 pr-4 py-3 bg-[#0d1512] border border-[#2b443a] focus:border-emerald-500 rounded-xl text-white text-sm outline-none transition"
                  autoFocus
                  required
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-sm rounded-xl transition cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Acessar Painel</span>
                </>
              )}
            </button>

            {onBackToSite && (
              <button
                type="button"
                onClick={onBackToSite}
                className="w-full py-2.5 text-gray-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para o Cardápio</span>
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // TELA PRINCIPAL DO PAINEL ADMINISTRATIVO
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0f1715] text-gray-100 font-sans pb-16">
      {/* Top Header do Painel */}
      <header className="bg-[#15231e] border-b border-[#233830] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-950 border border-emerald-500/40 p-1 shrink-0 overflow-hidden">
              <img
                src="/images/pizzaria.webp"
                alt="Donatello"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-base md:text-lg tracking-tight">
                  {siteConfig.name}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Visibilidade de Pedidos em Produção</span>
                {lastSyncTime && (
                  <span className="text-gray-500 hidden md:inline">
                    • Atualizado às {lastSyncTime.toLocaleTimeString('pt-BR')}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(true)}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-[#1d312a] hover:bg-[#253e35] text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
              title="Sincronizar com SigiloPay"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 bg-[#1d312a] hover:bg-[#253e35] text-gray-200 border border-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
              title="Exportar CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            {onBackToSite && (
              <button
                onClick={onBackToSite}
                className="flex items-center gap-1 bg-[#1d312a] hover:bg-[#253e35] text-gray-300 border border-gray-700 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ver Cardápio</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
              title="Sair do painel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notificação Temporária de Ação */}
      {actionMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-3">
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {/* CARDS DE MÉTRICAS NO TOPO */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          {/* Card 1: Pedidos Hoje */}
          <div className="bg-[#15231e] border border-[#233830] rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold mb-2">
              <span>Pedidos Hoje</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {metrics.ordersToday}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Criados na data de hoje
            </p>
          </div>

          {/* Card 2: Faturamento Hoje */}
          <div className="bg-[#15231e] border border-[#233830] rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold mb-2">
              <span>Faturamento Hoje</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              R$ {metrics.revenueToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-emerald-500/80 mt-1 font-medium">
              Vendas pagas confirmadas
            </p>
          </div>

          {/* Card 3: Pagamentos Aprovados */}
          <div className="bg-[#15231e] border border-[#233830] rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold mb-2">
              <span>Pagamentos Aprovados</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-2">
              <span>{metrics.paidCount}</span>
              <span className="text-xs font-bold text-emerald-400">
                (R$ {metrics.paidRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Status PAID no gateway
            </p>
          </div>

          {/* Card 4: Pagamentos Pendentes */}
          <div className="bg-[#15231e] border border-[#233830] rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-gray-400 text-xs font-semibold mb-2">
              <span>Pagamentos Pendentes</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 flex items-baseline gap-2">
              <span>{metrics.pendingCount}</span>
              <span className="text-xs font-bold text-gray-400">
                (R$ {metrics.pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Aguardando pagamento Pix
            </p>
          </div>
        </div>

        {/* BARRA DE CONTROLE: ABAS DE STATUS E BUSCA */}
        <div className="bg-[#15231e] border border-[#233830] rounded-2xl p-3.5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Abas */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === 'ALL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0f1715] text-gray-400 hover:text-white'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setActiveFilter('PAID')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'PAID'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#0f1715] text-emerald-400 hover:bg-emerald-950/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aprovados ({metrics.paidCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('PENDING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'PENDING'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#0f1715] text-amber-400 hover:bg-amber-950/40'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendentes ({metrics.pendingCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('EXPIRED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === 'EXPIRED'
                  ? 'bg-gray-700 text-white'
                  : 'bg-[#0f1715] text-gray-400 hover:text-white'
              }`}
            >
              Expirados ({metrics.expiredCount})
            </button>
            <button
              onClick={() => setActiveFilter('CANCELLED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === 'CANCELLED'
                  ? 'bg-red-800 text-white'
                  : 'bg-[#0f1715] text-red-400 hover:bg-red-950/40'
              }`}
            >
              Falhas / Cancelados ({metrics.failedCount + metrics.cancelledCount})
            </button>
          </div>

          {/* Campo de Busca e Toggle Auto-refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar pedido, cliente, fone..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#0f1715] border border-[#2b443a] focus:border-emerald-500 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer select-none shrink-0 bg-[#0f1715] px-2.5 py-1.5 rounded-xl border border-[#2b443a]">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <span className="hidden sm:inline">Auto 10s</span>
            </label>
          </div>
        </div>

        {/* LISTA / TABELA DE PEDIDOS */}
        {filteredOrders.length === 0 ? (
          <div className="bg-[#15231e] border border-[#233830] rounded-2xl p-12 text-center text-gray-400">
            <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="font-bold text-white text-base mb-1">Nenhum pedido encontrado</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {searchTerm
                ? 'Nenhum resultado corresponde à sua pesquisa.'
                : 'Os novos pedidos aparecerão aqui automaticamente assim que criados no cardápio.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const dateFormatted = new Date(order.createdAt).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const isPaid = order.status === 'PAID';
              const isPending = order.status === 'PENDING';

              return (
                <div
                  key={order.orderId}
                  className={`bg-[#15231e] border rounded-2xl p-4 transition ${
                    isPaid
                      ? 'border-emerald-500/50 shadow-md shadow-emerald-950/20'
                      : isPending
                      ? 'border-amber-500/40'
                      : 'border-[#233830]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#233830]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-white text-sm sm:text-base">
                        #{order.orderId}
                      </span>
                      <button
                        onClick={() => copyToClipboard(order.orderId, `id-${order.orderId}`)}
                        className="text-gray-400 hover:text-white p-1 rounded transition cursor-pointer"
                        title="Copiar número do pedido"
                      >
                        {copiedId === `id-${order.orderId}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Status do Pagamento */}
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isPaid
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isPending
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : order.status === 'EXPIRED'
                            ? 'bg-gray-800 text-gray-400 border border-gray-700'
                            : 'bg-red-900/30 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {isPaid
                          ? 'PAID • PAGO'
                          : isPending
                          ? 'PENDING • AGUARDANDO PIX'
                          : order.status === 'EXPIRED'
                          ? 'EXPIRED • EXPIRADO'
                          : `${order.status} • CANCELADO`}
                      </span>

                      {/* Método */}
                      <span className="bg-[#0f1715] text-gray-300 border border-[#2b443a] text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {order.pix ? 'Pix SigiloPay' : order.paymentMethod || 'Pix'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{dateFormatted}</span>
                      <span className="font-extrabold text-white text-base sm:text-lg">
                        R$ {Number(order.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Informações do Cliente, Endereço e Itens */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs">
                    {/* Coluna 1: Cliente e Contato */}
                    <div className="bg-[#0f1715] p-3 rounded-xl border border-[#233830]">
                      <div className="font-bold text-white text-xs mb-1">
                        {order.customer?.fullName || 'Cliente sem nome'}
                      </div>
                      {order.customer?.phone && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-gray-300">{order.customer.phone}</span>
                          <a
                            href={`https://wa.me/55${order.customer.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1"
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}
                      {order.customer?.document && (
                        <div className="text-[11px] text-gray-400 mt-1">
                          CPF: {order.customer.document}
                        </div>
                      )}
                    </div>

                    {/* Coluna 2: Endereço de Entrega */}
                    <div className="bg-[#0f1715] p-3 rounded-xl border border-[#233830]">
                      <div className="flex items-start gap-1.5 text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">
                            {order.address?.street
                              ? `${order.address.street}, ${order.address.number || 'S/N'}`
                              : 'Endereço não informado'}
                          </p>
                          {order.address?.complement && (
                            <p className="text-[11px] text-gray-400">{order.address.complement}</p>
                          )}
                          <p className="text-[11px] text-gray-400">
                            {order.address?.neighborhood} • {order.address?.city || 'São Paulo'} - {order.address?.state || 'SP'}
                          </p>
                          {order.address?.cep && (
                            <p className="text-[10px] text-gray-400">CEP: {order.address.cep}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Coluna 3: Itens do Pedido */}
                    <div className="bg-[#0f1715] p-3 rounded-xl border border-[#233830]">
                      <div className="font-bold text-gray-300 mb-1">Itens ({order.items?.length || 0})</div>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] text-gray-300">
                            <span className="font-semibold text-white">
                              {item.quantity || 1}x {item.name}
                            </span>
                            <span className="text-gray-400">
                              R$ {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Gateway ID & Ações Rápidas */}
                  <div className="mt-3 pt-2.5 border-t border-[#233830] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      {order.transactionId && (
                        <span>
                          ID Gateway: <code className="text-emerald-400 font-mono">{order.transactionId}</code>
                        </span>
                      )}
                      {order.paidAt && (
                        <span className="text-emerald-400 font-semibold">
                          • Pago em: {new Date(order.paidAt).toLocaleTimeString('pt-BR')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-[#1d312a] hover:bg-[#253e35] text-gray-200 px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ver Detalhes / Pix</span>
                      </button>

                      {!isPaid && (
                        <button
                          onClick={() => handleUpdateStatus(order.orderId, 'PAID')}
                          className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Marcar como Pago
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL DE DETALHES DO PEDIDO / QR CODE PIX */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#15231e] border border-[#233830] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#233830] mb-4">
              <div>
                <h3 className="font-extrabold text-white text-base">
                  Pedido #{selectedOrder.orderId}
                </h3>
                <p className="text-xs text-gray-400">
                  {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Pix se existir e estiver pendente */}
            {selectedOrder.pix?.code && (
              <div className="bg-[#0f1715] p-4 rounded-2xl border border-[#233830] text-center mb-4">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-2">
                  Código Pix da Cobrança
                </p>
                {selectedOrder.pix.qrCodeImage && (
                  <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl mb-3 shadow-md">
                    <img
                      src={selectedOrder.pix.qrCodeImage}
                      alt="QR Code Pix"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={selectedOrder.pix.code}
                    className="w-full bg-[#15231e] border border-[#2b443a] text-gray-300 text-[11px] p-2 pr-10 rounded-lg font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(selectedOrder.pix.code, 'modal-pix')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-300 p-1 cursor-pointer"
                    title="Copiar código Pix"
                  >
                    {copiedId === 'modal-pix' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Itens */}
            <div className="bg-[#0f1715] p-4 rounded-2xl border border-[#233830] mb-4">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
                Itens do Pedido
              </h4>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-gray-300 border-b border-gray-800 pb-1">
                    <div>
                      <span className="font-bold text-white">
                        {item.quantity || 1}x {item.name}
                      </span>
                      {item.refri && (
                        <p className="text-[11px] text-gray-400">{item.refri}</p>
                      )}
                      {item.observacao && (
                        <p className="text-[11px] text-amber-400">Obs: {item.observacao}</p>
                      )}
                    </div>
                    <span className="font-bold text-white">
                      R$ {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm font-black text-white mt-3 pt-2 border-t border-[#233830]">
                <span>Total a Pagar:</span>
                <span className="text-emerald-400 text-base">
                  R$ {Number(selectedOrder.total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Dados do Cliente e Endereço */}
            <div className="bg-[#0f1715] p-4 rounded-2xl border border-[#233830] text-xs space-y-1.5 mb-4">
              <p className="text-gray-400">
                <strong className="text-white">Cliente:</strong> {selectedOrder.customer?.fullName}
              </p>
              <p className="text-gray-400">
                <strong className="text-white">Telefone:</strong> {selectedOrder.customer?.phone}
              </p>
              <p className="text-gray-400">
                <strong className="text-white">Endereço:</strong>{' '}
                {selectedOrder.address?.street}, {selectedOrder.address?.number} - {selectedOrder.address?.neighborhood}, {selectedOrder.address?.city}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
