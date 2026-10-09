import React, { useState, useEffect } from 'react';
import { AMBIENCE_PHOTOS } from '../data/menu';

export default function TrustAndAmbience() {
  const [secondsLeft, setSecondsLeft] = useState(24 * 60 + 20); // 24:20

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 24 * 60 + 59));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-5 space-y-4">
      {/* 1. Timer Callout Box */}
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-[11px] sm:text-xs font-extrabold uppercase text-gray-500 tracking-wider mb-1">
          A PROMOÇÃO ENCERRA EM:
        </span>
        <div className="bg-[#D32F2F] text-white px-6 py-2 rounded-xl shadow-sm flex items-center justify-center">
          <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-yellow-300">
            {formatted}
          </span>
        </div>
      </div>

      {/* 2. Bloco de Prova / Destaque (Faixa Verde Escura) */}
      <div className="bg-[#1b4332] text-white rounded-2xl p-5 sm:p-6 text-center shadow-sm border border-emerald-900/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <h3 className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-1">
            MELHOR PIZZARIA DELIVERY
          </h3>
          <p className="text-xs sm:text-sm font-bold text-emerald-200 tracking-widest uppercase mb-2">
            2024 - 2025
          </p>

          {/* 5 Estrelas Douradas */}
          <div className="flex items-center gap-1 text-amber-400 text-lg sm:text-xl">
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>

          <p className="text-[11px] sm:text-xs text-emerald-100 font-medium mt-2 max-w-md">
            Mais de 15.000 pizzas entregues pontualmente no ponto ideal da massa e do queijo.
          </p>
        </div>
      </div>

      {/* 3. Fotos do Ambiente (Duas imagens grandes lado a lado com cantos arredondados) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
        <div className="h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden shadow-sm relative group bg-gray-100">
          <img
            src={AMBIENCE_PHOTOS.kitchen}
            alt="Forno à lenha tradicional da Donatello Pizzaria"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3.5">
            <span className="text-white text-xs sm:text-sm font-bold drop-shadow">
              🔥 Forno a Lenha Tradicional & Massa Artesanal
            </span>
          </div>
        </div>

        <div className="h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden shadow-sm relative group bg-gray-100">
          <img
            src={AMBIENCE_PHOTOS.restaurant}
            alt="Ambiente e expedição Donatello Pizzaria"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3.5">
            <span className="text-white text-xs sm:text-sm font-bold drop-shadow">
              📍 Cozinha de Padrão Internacional & Entrega Express
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
