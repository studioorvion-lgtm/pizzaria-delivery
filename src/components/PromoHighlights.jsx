import React, { useState } from 'react';
import { Plus, Check, Flame, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function PromoHighlights() {
  const { addItem, setIsCartOpen } = useCart();
  const [addedId, setAddedId] = useState(null);

  // Ofertas reais da Donatello
  const promo1 = {
    id: 'combo-2g',
    name: '02 Pizzas G + 1 Refrigerante 2 Litros',
    description: '2 Pizzas Grandes (8 fatias cada) + Refri 2L • Escolha os sabores',
    price: 64.90,
    originalPrice: 89.90,
    image: '/images/combo-2pizzas-refri2l.webp',
    category: 'super-combos',
    badge: 'MAIS PEDIDO',
  };

  const promo2 = {
    id: 'combo-2pp',
    name: '02 Pizzas PP + 1 Refrigerante 1 Litro',
    description: '2 Pizzas PP + Refri 1L • Escolha os sabores favoritos',
    price: 32.90,
    originalPrice: 45.90,
    image: '/images/supercombo.png',
    category: 'super-combos',
    badge: 'OFERTA ESPECIAL',
  };

  const handleAdd = (item) => {
    addItem(item);
    setAddedId(item.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1200);
  };

  return (
    <section className="w-full pt-4 pb-2">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Mais Pedido */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden hover:shadow-md transition">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 pr-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-full mb-2">
                  <Flame className="w-3 h-3 fill-red-600" />
                  <span>{promo1.badge}</span>
                </span>

                <h3 className="font-black text-gray-900 text-base sm:text-lg leading-tight mb-1">
                  {promo1.name}
                </h3>

                <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                  {promo1.description}
                </p>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl sm:text-2xl font-black text-gray-900">
                    {formatCurrency(promo1.price)}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {formatCurrency(promo1.originalPrice)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(promo1)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer ${
                    addedId === promo1.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D32F2F] hover:bg-[#b71c1c] text-white'
                  }`}
                >
                  {addedId === promo1.id ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Combo adicionado!</span>
                    </>
                  ) : (
                    <>
                      <span>Montar meu combo</span>
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>

              {/* Imagem do Produto no canto direito */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-gray-100">
                <img
                  src={promo1.image}
                  alt={promo1.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Oferta Especial */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden hover:shadow-md transition">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 pr-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full mb-2">
                  <Zap className="w-3 h-3 fill-amber-500" />
                  <span>{promo2.badge}</span>
                </span>

                <h3 className="font-black text-gray-900 text-base sm:text-lg leading-tight mb-1">
                  {promo2.name}
                </h3>

                <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                  {promo2.description}
                </p>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-xl sm:text-2xl font-black text-gray-900">
                    {formatCurrency(promo2.price)}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {formatCurrency(promo2.originalPrice)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(promo2)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer ${
                    addedId === promo2.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D32F2F] hover:bg-[#b71c1c] text-white'
                  }`}
                >
                  {addedId === promo2.id ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Combo adicionado!</span>
                    </>
                  ) : (
                    <>
                      <span>Montar meu combo</span>
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>

              {/* Imagem do Produto no canto direito */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-gray-100">
                <img
                  src={promo2.image}
                  alt={promo2.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
