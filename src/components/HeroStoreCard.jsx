import React, { useState, useEffect } from 'react';
import { Clock, Bike, Star, Navigation } from 'lucide-react';
import { siteConfig } from '../config/site';
import {
  getCachedClientCoords,
  requestClientLocation,
  getPizzeriaDistance,
  formatDistanceString,
} from '../utils/geolocation';

export default function HeroStoreCard() {
  const [distance, setDistance] = useState(() => {
    const cached = getCachedClientCoords();
    return cached ? getPizzeriaDistance(cached) : null;
  });

  useEffect(() => {
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
            setDistance(null);
          }
        );
      }
    }
  }, []);

  return (
    <section className="w-full pt-3 pb-2">
      <div className="max-w-6xl mx-auto px-4">
        {/* Banner Fotográfico Amplo Estilo YOR */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden h-60 sm:h-72 md:h-84 lg:h-[400px] shadow-sm bg-neutral-900">
          <img
            src="/images/pizzafoto.webp"
            alt="Pizza Artesanal Donatello saindo do forno"
            className="w-full h-full object-cover object-[center_20%] sm:object-[center_22%] md:object-[center_25%] brightness-95 contrast-105"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 pointer-events-none" />
        </div>

        {/* Card Branco Sobreposto ao Hero (Igual à YOR) */}
        <div className="relative z-10 -mt-10 sm:-mt-14 md:-mt-16 mx-2 sm:mx-6 md:mx-8 bg-white rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 shadow-xl border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Lado Esquerdo: Logo + Nome + Descrição */}
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-neutral-900 border-2 border-amber-400/80 shadow-md shrink-0 flex items-center justify-center p-0.5">
                <img
                  src="/images/pizzaria.webp"
                  alt={siteConfig.name}
                  className="w-full h-full object-cover rounded-xl"
                  loading="eager"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                    {siteConfig.name}
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Pizzaria artesanal delivery • Massa de fermentação lenta 48h
                </p>

                {distance !== null && (
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 mt-0.5">
                    <Navigation className="w-3 h-3 text-red-500 fill-red-500" />
                    <span>A cerca de <strong className="text-gray-800">{formatDistanceString(distance)}</strong> de você</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lado Direito: Status Aberto Agora */}
            <div className="self-start md:self-center shrink-0">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-black shadow-2xs">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span>Aberto agora</span>
              </div>
            </div>
          </div>

          {/* Barra Inferior com Prazo, Frete e Avaliação */}
          <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-wrap items-center gap-4 sm:gap-8 text-xs font-bold text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-normal leading-none">Prazo de entrega</span>
                <span className="font-extrabold text-gray-800">{siteConfig.deliveryTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Bike className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-normal leading-none">Taxa de entrega</span>
                <span className="font-extrabold text-emerald-600 uppercase">Grátis</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-normal leading-none">Avaliação</span>
                <span className="font-extrabold text-gray-800">4.9 (1.800+ pedidos)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
