import React from 'react';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function DesktopSidebarCart() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    setIsCheckoutOpen,
  } = useCart();

  const handleProceed = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <aside className="hidden lg:block w-[340px] shrink-0">
      <div className="sticky top-20 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[460px]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
            <h3 className="font-black text-gray-900 text-base">
              Sua sacola
            </h3>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-bold text-gray-400 hover:text-red-600 transition cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Conteúdo: Vazio ou Lista de Itens */}
          {items.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-stone-50 border border-gray-100 flex items-center justify-center text-gray-300 mb-3.5">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h4 className="font-black text-gray-800 text-base mb-1">
                Deu fome por aí?
              </h4>
              <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                Seu pedido vai aparecer aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-2.5 pb-3 border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-xs text-gray-900 leading-snug line-clamp-2">
                      {item.name}
                    </p>
                    <span className="text-xs font-black text-gray-800 mt-1 block">
                      {formatCurrency(item.price * item.quantity)}
                    </span>

                    {/* Controles de Quantidade */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/80">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-gray-600 hover:text-black cursor-pointer"
                          title="Diminuir"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-gray-600 hover:text-black cursor-pointer"
                          title="Aumentar"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-600 p-1 transition cursor-pointer"
                        title="Remover item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé da Sacola Ativa */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-gray-100 mt-4 space-y-2.5">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Subtotal:</span>
              <span className="font-bold text-gray-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Entrega:</span>
              <span className="font-extrabold text-emerald-600 uppercase">Grátis</span>
            </div>
            <div className="flex justify-between items-center text-sm font-black text-gray-900 pt-1 border-t border-gray-100">
              <span>Total:</span>
              <span className="text-lg text-[#D32F2F]">{formatCurrency(subtotal)}</span>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              className="w-full bg-[#D32F2F] hover:bg-[#b71c1c] active:bg-[#9a1414] text-white py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-md transition transform active:scale-95 cursor-pointer mt-2"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
