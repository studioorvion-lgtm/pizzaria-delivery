import React from 'react';
import { ShoppingBag, ArrowUp, ShieldCheck, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FinalCTA() {
  const { totalItems, setIsCartOpen } = useCart();

  const handleScrollTop = (e) => {
    e.preventDefault();
    const el = document.getElementById('menu-pizzas');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full px-4 my-8 mb-16">
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-red-600 via-[#D32F2F] to-red-800 text-white rounded-3xl p-6 sm:p-8 text-center shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-black/20 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3">
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Peça Agora • Entrega Rápida</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            Pronto para Saborear a Verdadeira Pizza Artesanal?
          </h2>

          <p className="text-red-100 text-xs sm:text-sm font-medium mb-6">
            Massa leve de fermentação natural de 48h, borda crocante e ingredientes frescos entregues quentinhos na sua casa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {totalItems > 0 ? (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="w-full sm:w-auto bg-white hover:bg-stone-100 text-[#D32F2F] font-black py-3.5 px-8 rounded-2xl shadow-lg transition transform active:scale-95 text-sm sm:text-base cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Finalizar Meu Pedido ({totalItems})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleScrollTop}
                className="w-full sm:w-auto bg-white hover:bg-stone-100 text-[#D32F2F] font-black py-3.5 px-8 rounded-2xl shadow-lg transition transform active:scale-95 text-sm sm:text-base cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowUp className="w-4 h-4" />
                <span>Escolher Meu Super Combo</span>
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-red-100/90 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Pagamento 100% Seguro via Pix • Atendimento 24 Horas</span>
          </div>
        </div>
      </div>
    </section>
  );
}
