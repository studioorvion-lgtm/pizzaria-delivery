import React from 'react';
import { Star, CheckCircle, MessageSquareQuote } from 'lucide-react';
import { CLIENT_REVIEWS } from '../data/menu';

export default function CustomerReviews() {
  return (
    <section className="w-full px-4 pt-8 pb-10" id="avaliacoes">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-1">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Avaliações Reais de Clientes</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Quem experimenta, pede de novo
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
            Média de 4.9 estrelas em satisfação, pontualidade na entrega e sabor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLIENT_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Imagem do prato recebido pelo cliente */}
                <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-stone-100 border border-gray-100">
                  <img
                    src={review.image}
                    alt={review.author || 'Pizza entregue'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Estrelas e Badge de Verificação */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Pedido Verificado
                  </span>
                </div>

                {review.author && (
                  <div className="mb-1.5">
                    <p className="font-extrabold text-gray-900 text-xs">{review.author}</p>
                    {review.time && (
                      <p className="text-[10px] text-gray-400 font-medium">{review.time}</p>
                    )}
                  </div>
                )}

                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
