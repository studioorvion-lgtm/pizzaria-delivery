import React, { useState } from 'react';
import { Plus, Check, UtensilsCrossed } from 'lucide-react';
import { HAMBURGUERES } from '../data/menu';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function BurgersSection() {
  const { addItem } = useCart();
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  const handleAdd = (burger) => {
    addItem(burger);
    setRecentlyAddedId(burger.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1000);
  };

  return (
    <section className="w-full px-4 pt-6 pb-4" id="hamburgues">
      <div className="max-w-4xl mx-auto mb-5">
        <div className="flex items-center gap-2 mb-1">
          <UtensilsCrossed className="w-5 h-5 text-amber-600" />
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Hambúrgueres Artesanais
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Blend de carnes nobres grelhadas no fogo • Todos acompanham batata frita crocante + 01 refrigerante lata.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {HAMBURGUERES.map((burger) => {
          const isJustAdded = recentlyAddedId === burger.id;
          return (
            <div
              key={burger.id}
              onClick={() => handleAdd(burger)}
              className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
            >
              <div className="flex gap-3.5 sm:gap-4 items-start">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-gray-100">
                  <img
                    src={burger.image}
                    alt={burger.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug mb-1">
                    {burger.name}
                  </h3>
                  <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                    {burger.description}
                  </p>
                  <span className="inline-block bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    {burger.badge}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div>
                  <span className="text-[11px] text-gray-400 font-semibold block">Total</span>
                  <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    {formatCurrency(burger.price)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(burger);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition active:scale-90 shadow-xs cursor-pointer ${
                    isJustAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D32F2F] hover:bg-[#b71c1c] text-white'
                  }`}
                  aria-label={`Adicionar ${burger.name}`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Adicionado</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>Adicionar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
