import React from 'react';
import { ShoppingBag, ChevronRight, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function MobileBottomBar() {
  const { totalItems, subtotal, setIsCartOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <aside
      aria-label="Barra do carrinho"
      className="fixed bottom-0 left-0 right-0 z-40 p-2.5 sm:p-3 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.12)] md:hidden animate-slide-up"
    >
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="w-full bg-[#D32F2F] active:bg-[#b71c1c] text-white font-black py-3 px-4 rounded-2xl flex items-center justify-between shadow-md transition active:scale-[0.98] cursor-pointer"
          aria-label={`Ver carrinho com ${totalItems} itens totalizando ${formatCurrency(subtotal)}`}
        >
          {/* Informações dos Itens */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-black/20">
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1.5 bg-amber-400 text-gray-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            </div>
            <div className="text-left">
              <span className="text-[11px] font-semibold text-red-100 uppercase tracking-wider block leading-none">
                {totalItems} {totalItems === 1 ? 'item adicionado' : 'itens adicionados'}
              </span>
              <span className="text-xs font-black uppercase tracking-wide">
                Ver Carrinho
              </span>
            </div>
          </div>

          {/* Valor Total e Botão */}
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl">
            <span className="text-sm font-black tracking-tight">
              {formatCurrency(subtotal)}
            </span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </div>
        </button>
      </div>
    </aside>
  );
}
