import React from 'react';
import { Plus } from 'lucide-react';
import { SUPER_COMBOS } from '../data/menu';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function SuperCombos() {
  const { addItem } = useCart();

  return (
    <section className="w-full" id="menu-pizzas">
      <div className="max-w-4xl mx-auto px-4 mt-8 mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800 uppercase tracking-tighter italic">
          Super Combos 🍕
        </h2>
        <p className="text-red-600 font-bold italic">Os favoritos da galera</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUPER_COMBOS.map((combo) => (
          <div
            key={combo.id}
            onClick={() => addItem(combo)}
            className={`${
              combo.isPulse ? 'animate-card-pulse' : ''
            } bg-white p-4 rounded-3xl flex gap-5 card-shadow cursor-pointer active:scale-95 transition relative overflow-hidden border border-gray-100 group`}
          >
            {/* Badge Mais Pedida */}
            {combo.badge && (
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter z-10">
                {combo.badge}
              </div>
            )}

            {/* Imagem do Combo */}
            <img
              src={combo.image}
              alt={combo.name}
              className="w-36 h-32 md:w-40 md:h-36 object-cover rounded-2xl shrink-0"
              loading="lazy"
              decoding="async"
            />

            {/* Conteúdo */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className={`font-bold text-gray-800 leading-tight mb-1 ${combo.badge ? 'pr-14' : ''}`}>
                  {combo.name}
                </h3>
                <p className="text-gray-500 text-xs mb-2 uppercase tracking-wide">
                  {combo.description}
                </p>

                {/* Scarcity Bar */}
                {combo.scarcity && (
                  <div className="scarcity-wrap">
                    <div className="scarcity-top">
                      <span className="scarcity-label">
                        <span>🔥</span>
                        <span>Restam {combo.scarcity.units}</span>
                      </span>
                      <span className="scarcity-live">acabando</span>
                    </div>
                    <div className="scarcity-bar">
                      <div
                        className="scarcity-fill"
                        style={{ width: `${combo.scarcity.percent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Preço e Botão */}
              <div className="flex justify-between items-end mt-2">
                <span
                  className={`font-bold text-2xl ${
                    combo.priceGreen ? 'text-[#006437]' : 'text-gray-900'
                  }`}
                >
                  {formatCurrency(combo.price)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(combo);
                  }}
                  className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition active:scale-90 shadow-sm cursor-pointer shrink-0"
                  aria-label={`Adicionar ${combo.name}`}
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
