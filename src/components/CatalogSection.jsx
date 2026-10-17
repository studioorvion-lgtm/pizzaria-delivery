import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, Flame, Pizza, UtensilsCrossed, Wine, Sparkles } from 'lucide-react';
import { SUPER_COMBOS, COMBOS_ESPECIAIS, HAMBURGUERES, BEBIDAS } from '../data/menu';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function CatalogSection() {
  const { addItem } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  const handleAdd = (item) => {
    addItem(item);
    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 900);
  };

  const scrollToCategory = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Filtro de busca em tempo real
  const filterList = (list) => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
    );
  };

  const filteredCombos = useMemo(() => filterList(SUPER_COMBOS), [searchTerm]);
  const filteredPizzas = useMemo(() => filterList(COMBOS_ESPECIAIS), [searchTerm]);
  const filteredBurgers = useMemo(() => filterList(HAMBURGUERES), [searchTerm]);
  const filteredBebidas = useMemo(() => filterList(BEBIDAS), [searchTerm]);

  const totalResults =
    filteredCombos.length +
    filteredPizzas.length +
    filteredBurgers.length +
    filteredBebidas.length;

  return (
    <div className="flex-1 min-w-0" id="cardapio">
      {/* 1. Barra de Abas de Categoria no Estilo YOR */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        <button
          type="button"
          onClick={() => scrollToCategory('sec-combos')}
          className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 transition shadow-2xs active:scale-95 cursor-pointer"
        >
          Combos
        </button>
        <button
          type="button"
          onClick={() => scrollToCategory('sec-pizzas')}
          className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 transition shadow-2xs active:scale-95 cursor-pointer"
        >
          Pizzas
        </button>
        <button
          type="button"
          onClick={() => scrollToCategory('sec-acompanhamentos')}
          className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 transition shadow-2xs active:scale-95 cursor-pointer"
        >
          Acompanhamentos
        </button>
        <button
          type="button"
          onClick={() => scrollToCategory('sec-bebidas')}
          className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 transition shadow-2xs active:scale-95 cursor-pointer"
        >
          Bebidas
        </button>
      </div>

      {/* 2. Campo de Busca no Cardápio (Exigência 6) */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar no cardápio..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
          >
            Limpar
          </button>
        )}
      </div>

      {searchTerm && totalResults === 0 && (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 my-4">
          <p className="text-gray-500 text-sm">
            Nenhum produto encontrado para "<strong>{searchTerm}</strong>".
          </p>
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="mt-2 text-xs font-bold text-red-600 underline cursor-pointer"
          >
            Ver todo o cardápio
          </button>
        </div>
      )}

      {/* SEÇÃO 1: COMBOS */}
      {filteredCombos.length > 0 && (
        <section id="sec-combos" className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-black text-gray-900 text-base sm:text-lg flex items-center gap-1.5">
              <span>🍕 Combos</span>
            </h3>
            <span className="text-[11px] font-bold text-gray-400">
              {filteredCombos.length} itens
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredCombos.map((combo) => (
              <ProductCard
                key={combo.id}
                item={combo}
                onAdd={handleAdd}
                isAdded={recentlyAddedId === combo.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Banner Digital estilo YOR no Meio do Cardápio */}
      <div className="my-6 rounded-2xl bg-neutral-900 text-white p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm border border-neutral-800">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            PEÇA AGORA
          </span>
          <h4 className="font-black text-sm sm:text-base text-white">
            Peça pelo Cardápio Digital
          </h4>
          <p className="text-stone-300 text-xs mt-0.5">
            Escolha seus favoritos, monte seu pedido e receba quentinho na sua porta.
          </p>
        </div>
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 hidden xs:block">
          <img
            src="/images/pizzafoto.webp"
            alt="Pizza"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* SEÇÃO 2: PIZZAS INDIVIDUAIS / ESPECIAIS */}
      {filteredPizzas.length > 0 && (
        <section id="sec-pizzas" className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-black text-gray-900 text-base sm:text-lg flex items-center gap-1.5">
              <span>🍕 Pizzas</span>
            </h3>
            <span className="text-[11px] font-bold text-gray-400">
              {filteredPizzas.length} itens
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredPizzas.map((pizza) => (
              <ProductCard
                key={pizza.id}
                item={pizza}
                onAdd={handleAdd}
                isAdded={recentlyAddedId === pizza.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* SEÇÃO 3: ACOMPANHAMENTOS & HAMBÚRGUERES */}
      {filteredBurgers.length > 0 && (
        <section id="sec-acompanhamentos" className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-black text-gray-900 text-base sm:text-lg flex items-center gap-1.5">
              <span>🍔 Acompanhamentos &amp; Hambúrgueres</span>
            </h3>
            <span className="text-[11px] font-bold text-gray-400">
              {filteredBurgers.length} itens
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredBurgers.map((burger) => (
              <ProductCard
                key={burger.id}
                item={burger}
                onAdd={handleAdd}
                isAdded={recentlyAddedId === burger.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* SEÇÃO 4: BEBIDAS */}
      {filteredBebidas.length > 0 && (
        <section id="sec-bebidas" className="mb-8">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="font-black text-gray-900 text-base sm:text-lg flex items-center gap-1.5">
              <span>🥤 Bebidas</span>
            </h3>
            <span className="text-[11px] font-bold text-gray-400">
              {filteredBebidas.length} itens
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {filteredBebidas.map((drink) => (
              <ProductCard
                key={drink.id}
                item={drink}
                onAdd={handleAdd}
                isAdded={recentlyAddedId === drink.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Card horizontal no estilo YOR Burger
 */
function ProductCard({ item, onAdd, isAdded }) {
  return (
    <div
      onClick={() => onAdd(item)}
      className="bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex justify-between gap-3 group active:scale-[0.99] relative overflow-hidden"
    >
      {/* Lado Esquerdo: Nome, Descrição e Preço */}
      <div className="flex-1 min-w-0 flex flex-col justify-between pr-1">
        <div>
          <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm leading-snug mb-1 line-clamp-2">
            {item.name}
          </h4>
          {item.description && (
            <p className="text-gray-400 text-[11px] leading-tight line-clamp-2 mb-2">
              {item.description}
            </p>
          )}
        </div>

        <div className="mt-2">
          <span className="text-sm sm:text-base font-black text-gray-900">
            {formatCurrency(item.price)}
          </span>
        </div>
      </div>

      {/* Lado Direito: Imagem com Botão Vermelho Redondo '+' no Canto */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-100 flex items-center justify-center">
        <img
          src={item.image}
          alt={item.name}
          className={`w-full h-full group-hover:scale-105 transition duration-300 ${
            item.category === 'bebidas' ? 'object-contain p-1.5' : 'object-cover'
          }`}
          loading="lazy"
          decoding="async"
        />

        {/* Botão Redondo Vermelho com '+' exatamente como na YOR */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(item);
          }}
          className={`absolute bottom-1.5 right-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition active:scale-90 shadow-md cursor-pointer ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-[#D32F2F] hover:bg-[#b71c1c] text-white'
          }`}
          aria-label={`Adicionar ${item.name}`}
        >
          {isAdded ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : (
            <Plus className="w-4 h-4 stroke-[3]" />
          )}
        </button>
      </div>
    </div>
  );
}
