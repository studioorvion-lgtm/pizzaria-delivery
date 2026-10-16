import React, { useState } from 'react';
import { Plus, Check, Wine } from 'lucide-react';
import { BEBIDAS } from '../data/menu';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function DrinksSection() {
  const { addItem } = useCart();
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  const handleAdd = (drink) => {
    addItem(drink);
    setRecentlyAddedId(drink.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1000);
  };

  return (
    <section id="bebidas" className="w-full px-4 pt-6 pb-4">
      <div className="max-w-4xl mx-auto mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wine className="w-5 h-5 text-red-600" />
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Bebidas Geladas
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Refrigerantes geladinhos em lata, 1 litro e 2 litros para acompanhar sua pizza.
          </p>
        </div>
        <span className="text-xs font-bold text-gray-400 hidden sm:inline">
          Deslize para ver todas ➔
        </span>
      </div>

      <div className="max-w-4xl mx-auto">
        <div
          id="drinkCarousel"
          className="flex gap-3 overflow-x-auto pb-4 snap-x scroll-smooth no-scrollbar"
        >
          {BEBIDAS.map((drink) => {
            const isJustAdded = recentlyAddedId === drink.id;
            return (
              <div
                key={drink.id}
                onClick={() => handleAdd(drink)}
                className="drink-card-premium snap-start bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between shrink-0 w-36 sm:w-40 cursor-pointer group active:scale-95"
              >
                <div className="flex items-center justify-center rounded-xl mb-2 bg-stone-50 p-2 h-28 sm:h-32">
                  <img
                    src={drink.image}
                    alt={drink.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 leading-tight min-h-[34px] line-clamp-2">
                    {drink.name}
                  </h3>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="font-black text-gray-900 text-sm">
                      {formatCurrency(drink.price)}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(drink);
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition active:scale-90 shadow-xs cursor-pointer ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#D32F2F] hover:bg-[#b71c1c] text-white'
                      }`}
                      aria-label={`Adicionar ${drink.name}`}
                    >
                      {isJustAdded ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[3]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
