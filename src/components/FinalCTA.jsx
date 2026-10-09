import React from 'react';

export default function FinalCTA() {
  const handleClick = (e) => {
    e.preventDefault();
    const el = document.getElementById('menu-pizzas');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex justify-center my-12 mb-16 px-4">
      <a
        href="#menu-pizzas"
        onClick={handleClick}
        className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-12 rounded-full shadow-lg transition transform active:scale-95 uppercase text-base sm:text-lg cursor-pointer tracking-wider text-center"
      >
        Pedir Agora
      </a>
    </div>
  );
}
