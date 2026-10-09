/**
 * Dados de cardápio completos para a Donatello Pizzaria Artesanal
 * Estrutura 100% fiel à hierarquia das referências
 */

export const SUPER_COMBOS = [
  {
    id: 'combo-2pp',
    name: '02 Pizzas PP + 1 Refrigerante 1 Litro',
    description: 'ESCOLHA ATÉ 04 SABORES • BORDA RECHEADA GRÁTIS',
    oldPrice: 44.90,
    price: 32.90,
    badge: '2X1',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    category: 'super-combos'
  },
  {
    id: 'combo-2p',
    name: '02 Pizzas P + 1 Refrigerante 1 Litro',
    description: 'ESCOLHA ATÉ 04 SABORES • MASSA ARTESANAL',
    oldPrice: 59.90,
    price: 49.90,
    badge: '2X1',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80',
    category: 'super-combos'
  },
  {
    id: 'combo-2m',
    name: '02 Pizzas M + 1 Refrigerante 2 Litros',
    description: 'ESCOLHA ATÉ 04 SABORES • BORDA VULCÃO',
    oldPrice: 69.90,
    price: 55.90,
    badge: '2X1',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80',
    category: 'super-combos'
  },
  {
    id: 'combo-2g',
    name: '02 Pizzas G + 1 Refrigerante 2 Litros',
    description: 'ESCOLHA ATÉ 06 SABORES • BORDA RECHEADA',
    oldPrice: 79.90,
    price: 64.90,
    badge: '2X1',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&auto=format&fit=crop&q=80',
    category: 'super-combos'
  },
  {
    id: 'combo-2gig',
    name: '02 Pizzas Gigantes + 2 Refrigerantes 2 Litros',
    description: 'ESCOLHA ATÉ 08 SABORES • SERVE ATÉ 8 PESSOAS',
    oldPrice: 94.90,
    price: 73.80,
    badge: '2X1',
    image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=500&auto=format&fit=crop&q=80',
    category: 'super-combos'
  },
  {
    id: 'combo-3gig',
    name: '03 Pizzas Gigantes + 2 Refrigerantes 2 Litros',
    description: 'TRIPLO ESPECIAL • COMBO FAMÍLIA OU GALERA',
    oldPrice: 129.90,
    price: 99.80,
    badge: 'TRIPLO ESPECIAL',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=80',
    category: 'super-combos'
  }
];

export const COMBOS_ESPECIAIS = [
  {
    id: 'esp-calabresa',
    name: '01 Pizza Média Calabresa + 01 Refri 1L',
    description: 'Massa crocante, molho de tomate rústico, queijo mussarela especial, calabresa fatiada e cebola.',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80',
    category: 'combos-especiais'
  },
  {
    id: 'esp-carne-sol',
    name: '01 Pizza Média Carne de Sol + 01 Refri 1L',
    description: 'Carne de sol desfiada temperada na manteiga de garrafa, queijo coalho e catupiry original.',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&auto=format&fit=crop&q=80',
    category: 'combos-especiais'
  },
  {
    id: 'esp-marguerita',
    name: '01 Pizza Média Marguerita + 01 Refri 1L',
    description: 'Mussarela de búfala, rodelas de tomate fresco, folhas de manjericão fresco e azeite extravirgem.',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80',
    category: 'combos-especiais'
  },
  {
    id: 'esp-frango-cat',
    name: '01 Pizza Média Frango Catupiry + 01 Refri 1L',
    description: 'Peito de frango selecionado desfiado, temperado e coberto com legítimo Catupiry cremoso.',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&auto=format&fit=crop&q=80',
    category: 'combos-especiais'
  },
  {
    id: 'esp-portuguesa',
    name: '01 Pizza Média Portuguesa + 01 Refri 1L',
    description: 'Presunto magro, ovos cozidos picados, cebola, azeitonas pretas, ervilha fresca e mussarela.',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=500&auto=format&fit=crop&q=80',
    category: 'combos-especiais'
  },
  {
    id: 'esp-tres-queijos',
    name: '01 Pizza Média Três Queijos + 01 Refri 1L',
    description: 'Harmonização perfeita de queijo mussarela, provolone defumado e catupiry original.',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=500&auto=format&fit=crop&q=80',
    category: 'combos-especiais'
  }
];

export const HAMBURGUERES = [
  {
    id: 'burg-classic',
    name: 'Classic Burger',
    description: 'Pão brioche artesanal tostado na manteiga, burger bovino 150g, queijo cheddar derretido e maionese verde.',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    category: 'burgers'
  },
  {
    id: 'burg-cheddar-bacon',
    name: 'Cheddar Bacon',
    description: 'Pão brioche, burger artesanal 150g, generosa camada de cheddar cremoso e fatias de bacon crocante.',
    price: 29.90,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&auto=format&fit=crop&q=80',
    category: 'burgers'
  },
  {
    id: 'burg-double-smash',
    name: 'Double Smash',
    description: 'Pão brioche, dois smash burgers prensados na chapa de 90g cada, queijo prato duplo e cebola caramelizada.',
    price: 32.90,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80',
    category: 'burgers'
  },
  {
    id: 'burg-bbq-supreme',
    name: 'Barbecue Supreme',
    description: 'Pão brioche, burger 160g, cheddar duplo, bacon em tiras, anéis de cebola empanada e molho barbecue rústico.',
    price: 34.90,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&auto=format&fit=crop&q=80',
    category: 'burgers'
  },
  {
    id: 'burg-monster',
    name: 'Monster Burguer',
    description: 'Pão brioche gigante, 3 smashs bovinos, triplo queijo, bacon em dobro e maionese defumada.',
    price: 39.90,
    image: 'https://images.unsplash.com/photo-1582196016295-f8c8bd4b3e99?w=500&auto=format&fit=crop&q=80',
    category: 'burgers'
  }
];

export const BEBIDAS = [
  {
    id: 'refri-coca-lata',
    name: 'Coca-Cola 350ml',
    price: 5.90,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80',
    category: 'bebidas'
  },
  {
    id: 'refri-coca-zero',
    name: 'Coca-Cola Zero 350ml',
    price: 5.90,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&auto=format&fit=crop&q=80',
    category: 'bebidas'
  },
  {
    id: 'refri-guarana-lata',
    name: 'Guaraná Antarctica 350ml',
    price: 5.90,
    image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=300&auto=format&fit=crop&q=80',
    category: 'bebidas'
  },
  {
    id: 'refri-fanta-lata',
    name: 'Fanta Laranja 350ml',
    price: 5.90,
    image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=300&auto=format&fit=crop&q=80',
    category: 'bebidas'
  },
  {
    id: 'refri-coca-1l',
    name: 'Coca-Cola 1 Litro',
    price: 10.90,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300&auto=format&fit=crop&q=80',
    category: 'bebidas'
  },
  {
    id: 'refri-coca-2l',
    name: 'Coca-Cola 2 Litros',
    price: 13.90,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80',
    category: 'bebidas'
  },
  {
    id: 'refri-guarana-2l',
    name: 'Guaraná 2 Litros',
    price: 12.90,
    image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=300&auto=format&fit=crop&q=80',
    category: 'bebidas'
  },
  {
    id: 'agua-500',
    name: 'Água Mineral 500ml',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=80',
    category: 'bebidas'
  }
];

export const CLIENT_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Rafael Oliveira',
    location: 'Asa Norte',
    time: 'há 15 min',
    rating: 5,
    comment: 'Massa crocante e muito recheio. A melhor que já comi! Chegou super rápida e quentinha.',
    pizzaName: 'Pizza Calabresa Especial',
    price: 44.90,
    badge: 'PROMOÇÃO 2X1',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-2',
    name: 'Mariana Lopes',
    location: 'Águas Claras',
    time: 'há 32 min',
    rating: 5,
    comment: 'Pizza chegou quentinha, bem recheada e com a massa no ponto! Meus filhos adoraram.',
    pizzaName: 'Combo Família 2 Pizzas G',
    price: 64.90,
    badge: 'O MAIS PEDIDO',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-3',
    name: 'Bruna Costa',
    location: 'Taguatinga',
    time: 'há 45 min',
    rating: 5,
    comment: 'Sempre peço no final de semana, a entrega é super rápida e o preço justo pelo combo.',
    pizzaName: 'Pizza Carne de Sol e Queijo',
    price: 49.90,
    badge: 'BORDA GRÁTIS',
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-4',
    name: 'Ana Beatriz',
    location: 'Asa Sul',
    time: 'há 1 hora',
    rating: 5,
    comment: 'A de três queijos é maravilhosa. Massa leve, queijo derretido e borda vulcão espetacular.',
    pizzaName: 'Pizza Três Queijos Nobres',
    price: 49.90,
    badge: 'FAVORITA',
    image: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-5',
    name: 'Felipe Gomes',
    location: 'Vicente Pires',
    time: 'há 1 hora',
    rating: 5,
    comment: 'Carne de sol muito bem temperada e borda recheada nota 10. Recomendo para toda família!',
    pizzaName: 'Combo 02 Pizzas M + Refri 2L',
    price: 55.90,
    badge: '2X1',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-6',
    name: 'Letícia Rocha',
    location: 'Sudoeste',
    time: 'há 2 horas',
    rating: 5,
    comment: 'Ingredientes frescos e pizza quentinha. Vale a pena ver o cuidado na embalagem térmica.',
    pizzaName: 'Pizza Frango com Catupiry',
    price: 49.90,
    badge: 'PROMOÇÃO',
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-7',
    name: 'Gustavo Henrique',
    location: 'Núcleo Bandeirante',
    time: 'há 2 horas',
    rating: 5,
    comment: 'Entrega rápida mesmo no sábado à noite. Pizza chegou perfeita e bem montada.',
    pizzaName: 'Combo 03 Pizzas Gigantes',
    price: 99.80,
    badge: 'TRIPLO ESPECIAL',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-8',
    name: 'Patrícia Souza',
    location: 'Ceilândia',
    time: 'há 3 horas',
    rating: 5,
    comment: 'Excelente custo-benefício. O combo vale muito a pena e o refrigerante veio bem gelado!',
    pizzaName: 'Pizza Portuguesa Tradicional',
    price: 49.90,
    badge: 'MAIS VENDIDA',
    image: 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'rev-9',
    name: 'Diego Rodrigues',
    location: 'Samambaia',
    time: 'há 3 horas',
    rating: 5,
    comment: 'Massa crocante na borda e macia no meio. É a nossa pizzaria fixa de toda sexta-feira.',
    pizzaName: 'Combo 02 Pizzas PP + Refri',
    price: 32.90,
    badge: '2X1',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80'
  }
];

export const AMBIENCE_PHOTOS = {
  kitchen: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=800&auto=format&fit=crop&q=80',
  restaurant: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
};
