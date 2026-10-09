import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function MobileBottomBar() {
  const { totalItems, subtotal, setIsCartOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl md:hidden animate-slide-up">
      <button
        onClick={() => setIsCartOpen(true)}
        className="w-full bg-[#D32F2F] active:bg-[#B71C1C] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-between shadow-md cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-2 bg-yellow-400 text-gray-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span className="text-xs uppercase tracking-wider">Ver Carrinho</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-extrabold">
          <span>{formatCurrency(subtotal)}</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}
