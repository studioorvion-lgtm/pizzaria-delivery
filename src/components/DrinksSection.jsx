import React from 'react';
import { Plus } from 'lucide-react';
import { BEBIDAS } from '../data/menu';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function DrinksSection() {
  const { addItem } = useCart();

  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-4" id="bebidas">
      <div className="mb-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
          ADICIONE AO PEDIDO
        </span>
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
          Bebidas
        </h2>
      </div>

      {/* Grid responsivo com scroll horizontal suave no mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2.5 sm:gap-3">
        {BEBIDAS.map((drink) => (
          <div
            key={drink.id}
            className="bg-white rounded-xl border border-gray-100 p-2 sm:p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition flex flex-col items-center text-center justify-between group"
          >
            {/* Foto da Bebida */}
            <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center mb-1 overflow-hidden">
              <img
                src={drink.image}
                alt={drink.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-200"
                loading="lazy"
              />
            </div>

            <div className="w-full pt-1 border-t border-gray-50 flex flex-col items-center">
              <h3 className="text-[11px] sm:text-xs font-bold text-gray-800 line-clamp-1 mb-1">
                {drink.name}
              </h3>

              <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                  {formatCurrency(drink.price)}
                </span>

                <button
                  onClick={() => addItem(drink)}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#D32F2F] text-white flex items-center justify-center hover:bg-[#B71C1C] transition active:scale-90 shadow-sm cursor-pointer shrink-0"
                  title="Adicionar ao pedido"
                  aria-label={`Adicionar ${drink.name}`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
