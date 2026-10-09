import React from 'react';
import { Plus } from 'lucide-react';
import { SUPER_COMBOS } from '../data/menu';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function SuperCombos() {
  const { addItem } = useCart();

  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-5" id="super-combos">
      <div className="mb-3.5">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 flex items-center gap-1.5 uppercase tracking-tight">
          <span>SUPER COMBOS</span>
          <span className="text-base">🔥</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium">Os favoritos da galera</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
        {SUPER_COMBOS.map((combo) => (
          <div
            key={combo.id}
            className="bg-white rounded-xl border border-gray-100 p-2.5 sm:p-3 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition flex items-center gap-3 relative group"
          >
            {/* Foto do Produto com Badge */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0 relative bg-gray-50">
              <img
                src={combo.image}
                alt={combo.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                loading="lazy"
              />
              {combo.badge && (
                <div className="absolute top-1 left-1 bg-red-600 text-yellow-300 text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm tracking-tighter">
                  {combo.badge}
                </div>
              )}
            </div>

            {/* Informações e Preço */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                  {combo.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium mt-1 leading-tight line-clamp-2">
                  {combo.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50">
                <div className="flex flex-col">
                  {combo.oldPrice && (
                    <span className="text-[10px] sm:text-xs text-gray-400 line-through leading-none">
                      {formatCurrency(combo.oldPrice)}
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight">
                    {formatCurrency(combo.price)}
                  </span>
                </div>

                <button
                  onClick={() => addItem(combo)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D32F2F] text-white flex items-center justify-center hover:bg-[#B71C1C] transition active:scale-90 shadow-sm cursor-pointer"
                  title="Adicionar ao pedido"
                  aria-label={`Adicionar ${combo.name}`}
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
