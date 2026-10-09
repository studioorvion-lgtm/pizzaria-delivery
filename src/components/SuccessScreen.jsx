import React from 'react';
import { CheckCircle2, MessageSquare, Home, Sparkles, Flame, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function SuccessScreen() {
  const { paidOrder, setPaidOrder } = useCart();

  if (!paidOrder) return null;

  const openWhatsApp = () => {
    const msg = `Olá! Meu pedido #${paidOrder.orderId} no valor de ${formatCurrency(
      paidOrder.paidAmount || paidOrder.total
    )} foi PAGO via Pix! Aguardo a entrega em ${paidOrder.address?.street}, nº ${
      paidOrder.address?.number
    }.`;
    window.open(`https://wa.me/5511998765432?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-emerald-100 flex flex-col relative text-center">
        {/* Banner Topo */}
        <div className="bg-gradient-to-br from-emerald-600 to-green-700 text-white p-6 sm:p-8 relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-bounce" />
          </div>

          <span className="inline-flex items-center gap-1 bg-white/25 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            PAGAMENTO CONFIRMADO NO SIGILOPAY
          </span>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Pedido Realizado!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Status: <strong className="text-white underline">PAGO &amp; EM PREPARAÇÃO</strong>
          </p>
        </div>

        {/* Detalhes do Pedido */}
        <div className="p-5 sm:p-6 space-y-4 text-left">
          {/* Card Resumo */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Código do Pedido:</span>
              <span className="font-mono font-extrabold text-gray-900 text-sm">
                #{paidOrder.orderId}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Valor Total Pago:</span>
              <span className="font-extrabold text-emerald-700 text-base">
                {formatCurrency(paidOrder.paidAmount || paidOrder.total)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Previsão de Entrega:</span>
              <span className="font-bold text-gray-900 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#D32F2F]" />
                25 a 35 minutos
              </span>
            </div>

            {paidOrder.address && (
              <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
                <strong className="text-gray-800">Endereço de Entrega:</strong>{' '}
                {paidOrder.address.street}, {paidOrder.address.number}
                {paidOrder.address.complement ? ` - ${paidOrder.address.complement}` : ''},{' '}
                {paidOrder.address.neighborhood} - {paidOrder.address.city}/{paidOrder.address.state}
              </div>
            )}
          </div>

          {/* Status Forno */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-amber-900">Sua pizza já foi para o forno!</div>
              <div className="text-amber-700">Nosso entregador sairá em instantes com a bolsa térmica.</div>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-2 pt-2">
            <button
              onClick={openWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#1ebd5a] active:bg-[#1a9a4b] text-white py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Acompanhar pelo WhatsApp</span>
            </button>

            <button
              onClick={() => setPaidOrder(null)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Voltar para o Cardápio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
