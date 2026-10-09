import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FinalCTA() {
  const { setIsCartOpen, totalItems } = useCart();

  const handleAction = () => {
    if (totalItems > 0) {
      setIsCartOpen(true);
    } else {
      // Faz scroll suave para a seção de Super Combos
      const el = document.getElementById('super-combos');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setIsCartOpen(true);
      }
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8 text-center flex flex-col items-center">
      <button
        onClick={handleAction}
        className="pulse-glow w-full sm:w-auto min-w-[280px] sm:min-w-[320px] bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-black text-base sm:text-lg uppercase tracking-wider py-4 px-8 rounded-full shadow-lg transition duration-200 active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
        id="btn-pedir-agora"
      >
        <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
        <span>PEDIR AGORA</span>
      </button>

      <p className="text-xs text-gray-500 font-medium mt-3 flex items-center justify-center gap-1.5">
        <span>🔒</span>
        <span>Pagamento seguro via <strong>PIX SigiloPay</strong> ou Cartão na Entrega</span>
      </p>
    </section>
  );
}
