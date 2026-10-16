import React, { useState, useEffect } from 'react';
import { Flame, Pizza, UtensilsCrossed, Wine, Award } from 'lucide-react';

export default function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState('menu-pizzas');

  const categories = [
    { id: 'menu-pizzas', name: 'Super Combos', icon: Flame },
    { id: 'combos-especiais', name: 'Combos 1 Pizza', icon: Pizza },
    { id: 'hamburgues', name: 'Hambúrgueres', icon: UtensilsCrossed },
    { id: 'bebidas', name: 'Bebidas', icon: Wine },
    { id: 'diferenciais', name: 'Nossa Qualidade', icon: Award },
  ];

  const scrollToSection = (id) => {
    setActiveCategory(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -70; // offset para cabeçalho fixo se houver
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs py-2 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => scrollToSection(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-[#D32F2F] text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
