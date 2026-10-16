import React, { useState } from 'react';
import { Plus, Check, Sparkles, Flame, Clock, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function HeroOffer() {
  const { addItem, setIsCartOpen } = useCart();
  const [added, setAdded] = useState(false);

  // Oferta Principal: 02 Pizzas G + 1 Refri 2L (combo-2g)
  const mainOffer = {
    id: 'combo-2g',
    name: '02 Pizzas G + 1 Refrigerante 2 Litros',
    description: 'ESCOLHA OS SABORES',
    price: 64.90,
    image: '/images/pizzafoto.webp',
    category: 'super-combos',
  };

  const handleOrderMain = () => {
    addItem(mainOffer);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsCartOpen(true);
    }, 600);
  };

  const handleOrderEntry = () => {
    addItem({
      id: 'combo-2pp',
      name: '02 Pizzas PP + 1 Refrigerante 1 Litro',
      description: 'ESCOLHA OS SABORES',
      price: 32.90,
      image: '/images/supercombo.png',
      category: 'super-combos',
    });
    setIsCartOpen(true);
  };

  return (
    <section className="w-full px-4 pt-4 pb-2">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-stone-900 via-neutral-900 to-red-950 text-white rounded-3xl p-5 sm:p-7 md:p-8 shadow-xl border border-red-900/30 relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Informações da Oferta Principal */}
          <div className="flex-1 text-center md:text-left">
            {/* Tag de Destaque */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3 shadow-md">
              <Flame className="w-4 h-4 fill-white animate-pulse" />
              <span>Oferta Principal da Donatello</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-2">
              Super Combo Família
            </h2>
            <p className="text-amber-300 font-extrabold text-base sm:text-lg mb-3">
              02 Pizzas Grandes (G) + 01 Refrigerante 2 Litros
            </p>

            {/* O que está incluso */}
            <div className="bg-black/40 backdrop-blur-xs border border-white/10 rounded-2xl p-3.5 sm:p-4 mb-4 text-left text-xs sm:text-sm text-stone-200 space-y-2">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>02 Pizzas Grandes Artesanais</strong> (8 fatias cada) com massa leve de fermentação natural
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Mais de 6 sabores à sua escolha</strong> (Calabresa, Frango c/ Catupiry, Marguerita, Três Queijos e mais)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>01 Refrigerante de 2 Litros</strong> gelado (Coca-Cola, Guaraná, Fanta ou Sprite)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Entrega Própria Rápida:</strong> Embalagem térmica lacrada com frete grátis
                </span>
              </div>
            </div>

            {/* Bloco de Preço e CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 justify-between">
              <div>
                <span className="text-xs text-stone-400 block line-through">De R$ 89,90</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase">Por apenas</span>
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {formatCurrency(mainOffer.price)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOrderMain}
                className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wide flex items-center justify-center gap-2.5 transition transform active:scale-95 shadow-xl cursor-pointer ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#D32F2F] hover:bg-[#b71c1c] text-white hover:shadow-red-600/30'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Adicionado ao Pedido!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 stroke-[3]" />
                    <span>Pedir Este Combo • {formatCurrency(mainOffer.price)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Alternativa de Entrada Econômica */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-stone-300">
              <span>Quer uma opção individual?</span>
              <button
                type="button"
                onClick={handleOrderEntry}
                className="text-amber-400 hover:text-amber-300 font-extrabold underline cursor-pointer transition"
              >
                02 Pizzas PP + 1 Refri 1L por {formatCurrency(32.90)} →
              </button>
            </div>
          </div>

          {/* Imagem Suculenta do Combo com Badge */}
          <div className="w-full md:w-72 lg:w-80 shrink-0 relative flex flex-col items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/30 group">
              <img
                src={mainOffer.image}
                alt={mainOffer.name}
                className="w-full h-56 sm:h-64 object-cover transform group-hover:scale-105 transition duration-500"
                loading="eager"
              />
              <div className="absolute top-3 right-3 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight shadow-md">
                Mais Vendido
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 text-center">
                <span className="text-xs font-bold text-stone-200">
                  Serve 3 a 4 pessoas com fartura
                </span>
              </div>
            </div>

            {/* Selos de Confiança logo abaixo */}
            <div className="grid grid-cols-2 gap-2 mt-3 w-full text-[11px] font-bold text-stone-300">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pix Instantâneo</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
                <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Entrega Grátis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
