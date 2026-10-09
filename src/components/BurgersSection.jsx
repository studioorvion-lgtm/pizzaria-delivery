import React from 'react';
import { Plus } from 'lucide-react';
import { HAMBURGUERES } from '../data/menu';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function BurgersSection() {
  const { addItem } = useCart();

  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4" id="hamburgueres">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3.5 gap-1.5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#D32F2F] bg-red-50 px-2 py-0.5 rounded">
            NOVIDADES
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 flex items-center gap-1 mt-1">
            <span>Hambúrgueres Artesanais</span>
            <span>🍔</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Pão brioche artesanal, blend bovino e queijo derretido
          </p>
        </div>

        <div className="self-start sm:self-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            <span>⚡</span> Entrega em até 30 min
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
        {HAMBURGUERES.map((burger) => (
          <div
            key={burger.id}
            className="bg-white rounded-xl border border-gray-100 p-2.5 sm:p-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition flex items-center gap-3 relative group"
          >
            {/* Foto do Burger */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0 relative bg-gray-50">
              <img
                src={burger.image}
                alt={burger.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                loading="lazy"
              />
            </div>

            {/* Informações e Preço */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-1">
                  {burger.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-normal mt-1 leading-tight line-clamp-2">
                  {burger.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                <span className="text-sm sm:text-base font-extrabold text-gray-900">
                  {formatCurrency(burger.price)}
                </span>

                <button
                  onClick={() => addItem(burger)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D32F2F] text-white flex items-center justify-center hover:bg-[#B71C1C] transition active:scale-90 shadow-sm cursor-pointer"
                  title="Adicionar ao pedido"
                  aria-label={`Adicionar ${burger.name}`}
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
