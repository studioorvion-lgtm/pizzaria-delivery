import React from 'react';
import { ShoppingBag, Receipt } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { siteConfig } from '../config/site';

export default function Header({ onOpenOrders }) {
  const { totalItems, setIsCartOpen, activeOrder, paidOrder } = useCart();
  const hasOrder = Boolean(activeOrder || paidOrder);

  return (
    <header className="bg-white px-4 pt-4 pb-6 rounded-b-[40px] shadow-sm text-center relative border-b border-gray-100">
      {/* Botões do Topo: Meu Pedido e Carrinho */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-3">
        <div>
          {hasOrder ? (
            <button
              onClick={onOpenOrders}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>Meu Pedido</span>
              <span className={`w-2 h-2 rounded-full ${paidOrder ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-gray-400 hidden sm:inline">
              Delivery Online
            </span>
          )}
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer"
          aria-label="Abrir carrinho"
        >
          <ShoppingBag className="w-4 h-4 text-red-600" />
          <span>Carrinho</span>
          {totalItems > 0 && (
            <span className="bg-red-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center -ml-0.5 animate-pulse">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Logotipo Central */}
      <div className="flex justify-center mb-4">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
          <img
            src="/images/pizzaria.webp"
            alt={siteConfig.name}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      {/* Nome da Pizzaria */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#006437] mb-2 tracking-tight">
        {siteConfig.name}
      </h1>

      {/* Tempo de Entrega */}
      <div className="text-[#006437] font-bold text-sm mb-3">
        Tempo de Entrega <span className="bg-green-100 px-2 py-0.5 rounded text-green-700 font-extrabold">até 30 min</span>
      </div>

      {/* Informações seguras: pedido online ativo */}
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-600">
        <span className="text-green-600 font-bold">● Pedido Online Ativo</span>
      </div>

      {/* Badge Aberto Agora */}
      <div className="mt-4 flex justify-center">
        <div className="bg-green-100 text-green-700 px-6 py-1 rounded-full text-xs font-black flex items-center gap-2">
          <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse-fast"></span>
          <span>ABERTO AGORA</span>
        </div>
      </div>
    </header>
  );
}
