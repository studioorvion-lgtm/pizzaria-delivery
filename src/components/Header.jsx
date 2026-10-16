import React from 'react';
import { ShoppingBag, Clock, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { siteConfig } from '../config/site';

export default function Header({ onOpenOrders }) {
  const { totalItems, setIsCartOpen, activeOrder, paidOrder } = useCart();
  const hasOrder = Boolean(activeOrder || paidOrder);

  const scrollToMenu = (e) => {
    e.preventDefault();
    const el = document.getElementById('cardapio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Lado Esquerdo: Logo e Nome no Estilo YOR */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-red-600 flex items-center justify-center shadow-xs shrink-0">
            <img
              src="/images/pizzaria.webp"
              alt={siteConfig.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <span className="font-black text-gray-900 text-sm sm:text-base tracking-tight block uppercase">
              DONATELLO PIZZARIA.
            </span>
            <span className="text-[10px] text-gray-400 font-bold block leading-none">
              Pizzaria artesanal delivery
            </span>
          </div>
        </div>

        {/* Lado Direito: Navegação, Status, Meus Pedidos e Sacola */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Link Cardápio */}
          <a
            href="#cardapio"
            onClick={scrollToMenu}
            className="hidden sm:inline-block text-xs font-bold text-gray-600 hover:text-red-600 transition cursor-pointer"
          >
            Cardápio
          </a>

          {/* Status Aberto Agora */}
          <div className="hidden xs:inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-2xs">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Aberto agora</span>
          </div>

          {/* Meus Pedidos */}
          <button
            type="button"
            onClick={onOpenOrders}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer active:scale-95 border ${
              hasOrder
                ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
            }`}
            title="Acompanhar meu pedido"
          >
            <Clock className={`w-3.5 h-3.5 ${hasOrder ? 'text-amber-600' : 'text-gray-500'}`} />
            <span className="hidden sm:inline">Meus Pedidos</span>
            {hasOrder && (
              <span className={`w-2 h-2 rounded-full ${paidOrder ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            )}
          </button>

          {/* Botão Sacola */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full text-xs font-extrabold transition cursor-pointer active:scale-95 border border-gray-200/60"
            aria-label="Abrir sacola de compras"
          >
            <ShoppingBag className="w-4 h-4 text-red-600" />
            <span className="hidden xs:inline">Sacola</span>
            <span className="bg-red-600 text-white text-[10px] font-black min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center shadow-2xs">
              {totalItems}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
