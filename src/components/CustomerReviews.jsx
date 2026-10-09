import React from 'react';
import { CLIENT_REVIEWS } from '../data/menu';

export default function CustomerReviews() {
  return (
    <section className="max-w-4xl mx-auto px-4 mt-12 mb-10" id="avaliacoes">
      <h3 className="text-center font-extrabold text-gray-800 mb-6 uppercase tracking-tight text-xl md:text-2xl">
        O que dizem nossos clientes
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CLIENT_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <img
              src={review.image}
              alt={review.author || 'Cliente'}
              className="w-full h-32 object-cover rounded-xl mb-3"
              loading="lazy"
              decoding="async"
            />
            <div className="flex text-yellow-400 text-xs mb-2">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>

            {review.author && (
              <>
                <p className="font-black text-gray-800 text-sm mb-1">{review.author}</p>
                {review.time && (
                  <p className="text-[11px] text-gray-400 font-bold mb-2">{review.time}</p>
                )}
              </>
            )}

            <p className="text-gray-600 text-sm italic">
              "{review.comment}"
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
