import React, { useState, useEffect } from 'react';
import { AMBIENCE_PHOTOS } from '../data/menu';

export default function TrustAndAmbience() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 25 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <>
      {/* Timer Callout Box */}
      <section className="max-w-xl mx-auto px-4 mt-8 mb-4">
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
          <h2 className="text-red-600 font-black text-lg mb-3 tracking-tight uppercase">
            A Promoção Encerra em:
          </h2>
          <div className="bg-red-600 text-white inline-block px-8 py-2 rounded-xl text-4xl font-black timer-box">
            {formatted}
          </div>
        </div>
      </section>

      {/* Bloco de Prova / Destaque (Faixa Verde Escura Premium) */}
      <section className="max-w-4xl mx-auto px-4 mt-12">
        <div className="premium-box rounded-3xl p-8 text-center text-white shadow-2xl">
          <p className="text-yellow-400 font-bold tracking-[0.3em] text-xs uppercase mb-2"></p>
          <h2 className="text-2xl sm:text-3xl font-black mb-1 italic">
            MELHOR PIZZARIA DELIVERY
          </h2>
          <p className="text-lg sm:text-xl font-light tracking-widest mb-4">
            2024 - 2025
          </p>
          <div className="flex justify-center gap-2 text-2xl text-yellow-400">
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
        </div>
      </section>

      {/* Fotos do Ambiente */}
      <section className="max-w-6xl mx-auto px-4 mt-8 mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-3 shadow-lg">
            <img
              src={AMBIENCE_PHOTOS.kitchen}
              alt="Cozinha da pizzaria"
              className="w-full rounded-2xl object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="bg-white rounded-3xl p-3 shadow-lg">
            <img
              src={AMBIENCE_PHOTOS.restaurant}
              alt="Clientes da pizzaria"
              className="w-full rounded-2xl object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>
    </>
  );
}
