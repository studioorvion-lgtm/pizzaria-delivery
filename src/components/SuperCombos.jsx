import React, { useState } from 'react';
import { Plus, Check, Users, Sparkles, Flame } from 'lucide-react';
import { SUPER_COMBOS } from '../data/menu';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function SuperCombos() {
  const { addItem } = useCart();
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  const handleAdd = (combo) => {
    addItem(combo);
    setRecentlyAddedId(combo.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1000);
  };

  return (
    <section className="w-full px-4 pt-6 pb-4" id="menu-pizzas">
      <div className="max-w-4xl mx-auto mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-5 h-5 text-red-600" />
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Super Combos Donatello
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          Pizzas artesanais com massa de fermentação natural + Refrigerante gelado. Escolha livre dos sabores!
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUPER_COMBOS.map((combo) => {
          const isJustAdded = recentlyAddedId === combo.id;
          return (
            <div
              key={combo.id}
              onClick={() => handleAdd(combo)}
              className="bg-white rounded-2xl p-3.5 sm:p-4 border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.99] relative overflow-hidden"
            >
              {/* Badge no topo se houver */}
              {combo.badge && (
                <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs z-10">
                  {combo.badge}
                </div>
              )}

              <div className="flex gap-3.5 sm:gap-4 items-start">
                {/* Imagem do Combo com Cantos Suaves */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-gray-100 relative">
                  <img
                    src={combo.image}
                    alt={combo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Detalhes do Produto */}
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug mb-1 line-clamp-2">
                    {combo.name}
                  </h3>

                  <p className="text-gray-500 text-xs mb-2">
                    {combo.serves ? (
                      <span className="inline-flex items-center gap-1 text-gray-600 font-semibold mr-1.5">
                        <Users className="w-3 h-3 text-gray-400" />
                        {combo.serves}
                      </span>
                    ) : null}
                    • {combo.description}
                  </p>

                  <span className="inline-block bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                    Frete Grátis
                  </span>
                </div>
              </div>

              {/* Rodapé do Card: Preço e Botão de Ação */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div>
                  <span className="text-[11px] text-gray-400 font-semibold block">Total</span>
                  <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                    {formatCurrency(combo.price)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(combo);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition active:scale-90 shadow-xs cursor-pointer ${
                    isJustAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D32F2F] hover:bg-[#b71c1c] text-white'
                  }`}
                  aria-label={`Adicionar ${combo.name}`}
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
