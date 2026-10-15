import React from 'react';
import { AMBIENCE_PHOTOS } from '../data/menu';

export default function TrustAndAmbience() {
  return (
    <>
      {/* Bloco de Prova / Destaque (Faixa Verde Escura Premium) */}
      <section className="max-w-4xl mx-auto px-4 mt-8">
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
