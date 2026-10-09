import React from 'react';
import { Clock, MapPin, ShoppingBag, Receipt } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { siteConfig } from '../config/site';

export default function Header({ onOpenOrders }) {
  const { totalItems, setIsCartOpen, activeOrder, paidOrder } = useCart();
  const hasOrder = Boolean(activeOrder || paidOrder);

  return (
    <header className="w-full bg-white border-b border-gray-100 pt-5 pb-6 px-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] relative">
      {/* Botões do Topo: Meu Pedido e Carrinho */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-2">
        <div>
          {hasOrder ? (
            <button
              onClick={onOpenOrders}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>Meu Pedido</span>
              <span className={`w-2 h-2 rounded-full ${paidOrder ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-gray-400 hidden sm:inline">
              Delivery Artesanal
            </span>
          )}
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer"
          aria-label="Abrir carrinho"
        >
          <ShoppingBag className="w-4 h-4 text-[#D32F2F]" />
          <span>Carrinho</span>
          {totalItems > 0 && (
            <span className="bg-[#D32F2F] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center -ml-0.5 animate-pulse">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
        {/* Logotipo Central Circular */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-500 to-[#D32F2F] p-1 shadow-md mb-3 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-stone-900 border-2 border-amber-400 flex flex-col items-center justify-center text-white">
            <span className="text-2xl sm:text-3xl leading-none">🍕</span>
            <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 mt-1">DONATELLO</span>
          </div>
        </div>

        {/* Nome da Pizzaria */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
          {siteConfig.name}
        </h1>

        {/* Informações curtas abaixo */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 mt-2 font-medium">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>Tempo de Entrega: <strong className="text-gray-800">{siteConfig.deliveryTime}</strong></span>
          </span>
          <span className="hidden sm:inline text-gray-300">•</span>
          {/* Item 1: Entrega para todo o Brasil */}
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            {siteConfig.deliveryCoverage}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-[#D32F2F]" />
          <span>Atendimento Delivery Online Ativo</span>
        </div>

        {/* Badge Aberto Agora */}
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 -ml-2.5"></span>
            ABERTO AGORA
          </span>
        </div>
      </div>
    </header>
  );
}
