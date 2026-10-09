import React from 'react';
import { Plus } from 'lucide-react';
import { CLIENT_REVIEWS } from '../data/menu';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function CustomerReviews() {
  const { addItem } = useCart();

  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-6" id="avaliacoes">
      <div className="text-center mb-6">
        <h2 className="text-base sm:text-lg font-extrabold text-gray-800 uppercase tracking-tight">
          O QUE DIZEM NOSSOS CLIENTES
        </h2>
        <div className="w-12 h-0.5 bg-[#D32F2F] mx-auto mt-1.5 rounded-full"></div>
      </div>

      {/* Grid de 3 colunas no desktop e 1 coluna no mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {CLIENT_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-xl border border-gray-100 p-3 sm:p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Estrelas */}
              <div className="flex items-center gap-0.5 text-amber-400 text-sm mb-1.5">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>

              {/* Comentário do Cliente */}
              <p className="text-xs text-gray-700 italic leading-snug mb-2 font-normal">
                "{review.comment}"
              </p>

              {/* Identificação do Cliente */}
              <div className="text-[11px] font-bold text-gray-900 flex items-center justify-between pb-2 border-b border-gray-100">
                <span>{review.name} • {review.location}</span>
                <span className="text-[10px] text-gray-400 font-normal">{review.time}</span>
              </div>
            </div>

            {/* Foto e Adicionar ao Pedido */}
            <div className="mt-2.5">
              <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-50 relative group mb-2">
                <img
                  src={review.image}
                  alt={review.pizzaName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                {review.badge && (
                  <span className="absolute top-1 left-1 bg-red-600 text-yellow-300 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                    {review.badge}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                    {review.pizzaName}
                  </h4>
                  <span className="text-sm font-black text-gray-900">
                    {formatCurrency(review.price)}
                  </span>
                </div>

                <button
                  onClick={() =>
                    addItem({
                      id: review.id,
                      name: review.pizzaName,
                      price: review.price,
                      image: review.image,
                      description: `Pedido favorito de ${review.name} (${review.location})`,
                    })
                  }
                  className="inline-flex items-center gap-1 bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 shadow-xs cursor-pointer"
                  title="Adicionar ao pedido"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Pedir</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
