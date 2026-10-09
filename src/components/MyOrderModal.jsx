import React from 'react';
import { X, Receipt, Clock, CheckCircle2, QrCode } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function MyOrderModal({ isOpen, onClose }) {
  const { activeOrder, paidOrder, setActiveOrder } = useCart();

  if (!isOpen) return null;

  const order = paidOrder || activeOrder;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#D32F2F]" />
            <h3 className="font-extrabold text-gray-900 text-base">Meu Pedido</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {!order ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl mb-2 block">📋</span>
              <p className="font-bold text-gray-800 text-sm">Nenhum pedido em andamento</p>
              <p className="text-xs text-gray-400 mt-1">
                Faça seu pedido pelo cardápio e acompanhe o status em tempo real aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Status Header */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Código:</span>
                  <div className="font-mono font-black text-gray-900 text-sm">#{order.orderId}</div>
                </div>

                <div>
                  {order.status === 'PAID' ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-extrabold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      PAGO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-extrabold animate-pulse">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      AGUARDANDO PAGAMENTO
                    </span>
                  )}
                </div>
              </div>

              {/* Itens do Pedido */}
              {order.items && order.items.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-700">Itens:</span>
                  <div className="bg-gray-50 rounded-xl p-2.5 space-y-1 max-h-36 overflow-y-auto border border-gray-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-700">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumo Financeiro */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs font-bold">
                <span className="text-gray-600">Total:</span>
                <span className="text-base font-black text-[#D32F2F]">
                  {formatCurrency(order.paidAmount || order.total)}
                </span>
              </div>

              {/* Endereço */}
              {order.address && (
                <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                  <strong className="text-gray-700">Entrega:</strong> {order.address.street}, {order.address.number}
                  {order.address.complement ? ` - ${order.address.complement}` : ''}, {order.address.neighborhood} - {order.address.city}/{order.address.state}
                </div>
              )}

              {/* Se estiver pendente, botão para abrir o Pix */}
              {order.status !== 'PAID' && (
                <button
                  onClick={() => {
                    onClose();
                    setActiveOrder(order);
                  }}
                  className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm active:scale-95"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Ver Código Pix para Pagamento</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
