import React from 'react';
import { Plus } from 'lucide-react';
import { BEBIDAS } from '../data/menu';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function DrinksSection() {
  const { addItem } = useCart();

  return (
    <section id="bebidas" className="max-w-4xl mx-auto px-4 mt-10 mb-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-xs font-black text-green-700 uppercase tracking-[0.22em]">
            Adicione ao pedido
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Bebidas
          </h2>
        </div>
        <span className="text-xs font-bold text-gray-400">
          Arraste para o lado ➔
        </span>
      </div>

      <div
        id="drinkCarousel"
        className="flex gap-4 overflow-x-auto pb-4 snap-x scroll-smooth no-scrollbar"
      >
        {BEBIDAS.map((drink) => (
          <div
            key={drink.id}
            className="drink-card-premium snap-start bg-white rounded-3xl p-3 card-shadow border border-gray-100 flex flex-col justify-between shrink-0"
          >
            <div className="flex items-center justify-center rounded-2xl mb-3 bg-gradient-to-b from-white to-slate-50 p-2.5 h-[118px]">
              <img
                src={drink.image}
                alt={drink.name}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div>
              <h3 className="font-black text-sm text-gray-900 leading-tight min-h-[38px] line-clamp-2">
                {drink.name}
              </h3>
              <div className="flex items-center justify-between mt-3">
                <span className="font-black text-green-700 text-sm">
                  {formatCurrency(drink.price)}
                </span>
                <button
                  type="button"
                  onClick={() => addItem(drink)}
                  className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center justify-center transition active:scale-90 cursor-pointer"
                  aria-label={`Adicionar ${drink.name}`}
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
