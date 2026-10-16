import React, { useState, useEffect } from 'react';
import { ShoppingBag, Receipt, Navigation, Star, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { siteConfig } from '../config/site';
import {
  getCachedClientCoords,
  requestClientLocation,
  getPizzeriaDistance,
  formatDistanceString,
} from '../utils/geolocation';

export default function Header({ onOpenOrders }) {
  const { totalItems, setIsCartOpen, activeOrder, paidOrder } = useCart();
  const hasOrder = Boolean(activeOrder || paidOrder);

  const [distance, setDistance] = useState(() => {
    const cached = getCachedClientCoords();
    return cached ? getPizzeriaDistance(cached) : null;
  });

  useEffect(() => {
    // Apenas solicita geolocalização se a pizzaria tiver coordenadas cadastradas no siteConfig
    if (siteConfig.coordinates?.lat && siteConfig.coordinates?.lng) {
      const cached = getCachedClientCoords();
      if (cached) {
        setDistance(getPizzeriaDistance(cached));
      } else {
        requestClientLocation(
          (coords) => {
            setDistance(getPizzeriaDistance(coords));
          },
          () => {
            // Se negado pelo cliente, oculta a distância discretamente sem erro
            setDistance(null);
          }
        );
      }
    }
  }, []);

  return (
    <header className="bg-white px-4 pt-3 pb-5 shadow-xs border-b border-gray-100 text-center relative">
      {/* Barra Superior de Ações: Status / Meu Pedido / Carrinho */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-4 gap-2">
        {/* Status 24h ou Botão Meu Pedido */}
        <div className="flex items-center gap-2">
          {hasOrder ? (
            <button
              onClick={onOpenOrders}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-600" />
              <span>Meu Pedido</span>
              <span className={`w-2 h-2 rounded-full ${paidOrder ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 px-3 py-1 rounded-full text-[11px] font-black tracking-wide">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>Aberto Agora • Pedidos 24h</span>
            </div>
          )}
        </div>

        {/* Botão Carrinho */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex items-center gap-2 bg-[#D32F2F] hover:bg-[#b71c1c] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer shadow-sm"
          aria-label="Abrir carrinho"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Carrinho</span>
          {totalItems > 0 && (
            <span className="bg-white text-[#D32F2F] text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center -ml-0.5 shadow-xs animate-bounce">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Identidade Visual Central da Donatello Pizzaria Artesanal */}
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Logo Circular Oficial */}
        <div className="relative mb-3 group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400/80 shadow-lg overflow-hidden bg-white p-1">
            <img
              src="/images/pizzaria.webp"
              alt={siteConfig.name}
              className="w-full h-full object-cover rounded-full group-hover:scale-105 transition duration-300"
              loading="eager"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-md" title="Atendimento 24h">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Nome Oficial */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-1">
          {siteConfig.name}
        </h1>

        <p className="text-gray-500 text-xs sm:text-sm font-medium max-w-md mb-3">
          Massa de fermentação natural de 48h, ingredientes selecionados e forno em alta temperatura.
        </p>

        {/* Pilares de Entrega e Confiança (Estilo YOR Burger) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold text-gray-700 mb-2">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 text-amber-900 px-3 py-1 rounded-full shadow-2xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>4.9 (1.800+ avaliações)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 px-3 py-1 rounded-full shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Entrega: {siteConfig.deliveryTime}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200/80 text-red-700 px-3 py-1 rounded-full shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
            <span>Frete Grátis nos Combos</span>
          </div>
        </div>

        {/* Distância Real (só exibe se houver coordenadas configuradas e localização permitida pelo cliente) */}
        {distance !== null && (
          <div className="mt-1 flex justify-center animate-fade-in">
            <div className="bg-gray-100 text-gray-700 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <Navigation className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
              <span>Estamos a <strong className="font-extrabold text-gray-900">{formatDistanceString(distance)}</strong> de você</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
