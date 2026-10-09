import React from 'react';
import { Plus } from 'lucide-react';
import { HAMBURGUERES } from '../data/menu';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function BurgersSection() {
  const { addItem } = useCart();

  return (
    <section id="hamburgues" className="max-w-4xl mx-auto px-4 mt-10">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-black text-red-600 uppercase tracking-[0.22em]">
            Novidade
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Hambúrgueres Artesanais 🍔
          </h2>
          <p className="text-gray-500 font-semibold text-sm mt-1">
            Todos acompanham batata frita crocante + 01 refrigerante lata.
          </p>
        </div>
        <span className="hidden md:inline-flex bg-green-100 text-green-700 font-black text-xs px-4 py-2 rounded-full">
          Entrega até 30 min
        </span>
      </div>

      <div id="burgerGrid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HAMBURGUERES.map((burger) => (
          <div
            key={burger.id}
            onClick={() => addItem(burger)}
            className="burger-card-compact bg-white p-3 rounded-3xl flex gap-4 card-shadow cursor-pointer active:scale-95 transition border border-gray-100 overflow-hidden group"
          >
            <img
              src={burger.image}
              alt={burger.name}
              className="w-28 h-28 object-cover rounded-2xl shrink-0"
              loading="lazy"
              decoding="async"
            />
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="font-black text-gray-900 leading-tight mb-1">
                  {burger.name}
                </h3>
                <p className="text-[11px] text-gray-500 font-bold mb-2 line-clamp-2">
                  {burger.description}
                </p>
                <span className="inline-flex bg-red-50 text-red-600 text-[10px] font-black px-2 py-1 rounded-full mb-2">
                  {burger.badge}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <span className="burger-price font-black text-2xl text-gray-900">
                  {formatCurrency(burger.price)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(burger);
                  }}
                  className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition active:scale-90 shadow-sm cursor-pointer shrink-0"
                  aria-label={`Adicionar ${burger.name}`}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
