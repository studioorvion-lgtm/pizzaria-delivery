/**
 * Cardápio 100% fiel à referência original do projeto
 * Utiliza fotos e dados oficiais do modelo clonado
 */

export const SUPER_COMBOS = [
  {
    id: 'combo-2pp',
    name: '02 Pizzas PP + 1 Refrigerante 1 Litro',
    description: 'ESCOLHA OS SABORES',
    price: 32.90,
    image: '/images/pizzafoto.webp',
    category: 'super-combos'
  },
  {
    id: 'combo-2p',
    name: '02 Pizzas P + 1 Refrigerante 1 Litro',
    description: 'ESCOLHA OS SABORES',
    price: 49.90,
    image: '/images/pizzafoto.webp',
    category: 'super-combos'
  },
  {
    id: 'combo-2m',
    name: '02 Pizzas M + 1 Refrigerante 2 Litros',
    description: 'ESCOLHA OS SABORES',
    price: 55.90,
    image: '/images/pizzafoto.webp',
    category: 'super-combos'
  },
  {
    id: 'combo-2g',
    name: '02 Pizzas G + 1 Refrigerante 2 Litros',
    description: 'ESCOLHA OS SABORES',
    price: 64.90,
    image: '/images/pizzafoto.webp',
    category: 'super-combos',
    priceGreen: true,
    scarcity: {
      units: '03 unidades',
      percent: 55
    }
  },
  {
    id: 'combo-2gig',
    name: '02 Pizzas Gigantes + 2 Refrigerantes 2 Litros',
    description: 'ESCOLHA OS SABORES',
    price: 73.80,
    badge: 'Mais Pedida',
    isPulse: true,
    image: '/images/pizzafoto.webp',
    category: 'super-combos',
    scarcity: {
      units: '02 unidades',
      percent: 38
    }
  },
  {
    id: 'combo-3gig',
    name: '03 Pizzas Gigantes + 2 Refrigerantes 2 Litros',
    description: 'ESCOLHA OS SABORES',
    price: 99.80,
    badge: 'Mais Pedida',
    isPulse: true,
    image: '/images/plano3.webp',
    category: 'super-combos',
    scarcity: {
      units: '01 unidades',
      percent: 22
    }
  }
];

export const COMBOS_ESPECIAIS = [
  {
    id: 'esp-calabresa',
    name: '01 Pizza Média Calabresa + 01 Refri 1L',
    description: 'Escolha o refrigerante de 1 litro ao abrir',
    price: 49.90,
    image: '/images/calabresa.webp',
    category: 'combos-especiais'
  },
  {
    id: 'esp-carne-sol',
    name: '01 Pizza Média Carne de Sol + 01 Refri 1L',
    description: 'Escolha o refrigerante de 1 litro ao abrir',
    price: 49.90,
    image: '/images/carnedesol.webp',
    category: 'combos-especiais'
  },
  {
    id: 'esp-marguerita',
    name: '01 Pizza Média Marguerita + 01 Refri 1L',
    description: 'Escolha o refrigerante de 1 litro ao abrir',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80',
    category: 'combos-especiais'
  },
  {
    id: 'esp-frango-cat',
    name: '01 Pizza Média Frango Catupiry + 01 Refri 1L',
    description: 'Escolha o refrigerante de 1 litro ao abrir',
    price: 49.90,
    image: '/images/frango.webp',
    priceGreen: true,
    category: 'combos-especiais'
  },
  {
    id: 'esp-portuguesa',
    name: '01 Pizza Média Portuguesa + 01 Refri 1L',
    description: 'Escolha o refrigerante de 1 litro ao abrir',
    price: 49.90,
    image: '/images/portuguesa.webp',
    category: 'combos-especiais'
  },
  {
    id: 'esp-tres-queijos',
    name: '01 Pizza Média Três Queijos + 01 Refri 1L',
    description: 'Escolha o refrigerante de 1 litro ao abrir',
    price: 49.90,
    image: '/images/tres.webp',
    category: 'combos-especiais'
  }
];

export const HAMBURGUERES = [
  {
    id: 'burg-classic',
    name: 'Classic Burger',
    description: 'Pão brioche • Hambúrguer bovino 150g • Queijo cheddar derretido • Alface',
    badge: '+ batata e refri lata',
    price: 22.00,
    image: '/images/h1.webp',
    category: 'burgers'
  },
  {
    id: 'burg-cheddar-bacon',
    name: 'Cheddar Bacon',
    description: 'Pão brioche • Hambúrguer bovino 180g • Cheddar cremoso • Bacon dourado crocante',
    badge: '+ batata e refri lata',
    price: 29.90,
    image: '/images/h2.webp',
    category: 'burgers'
  },
  {
    id: 'burg-double-smash',
    name: 'Double Smash',
    description: 'Pão brioche • 2 hambúrgueres smash 90g • Duplo cheddar derretido • Picles',
    badge: '+ batata e refri lata',
    price: 32.90,
    image: '/images/h3.webp',
    category: 'burgers'
  },
  {
    id: 'burg-bbq-supreme',
    name: 'Barbecue Supreme',
    description: 'Pão australiano • Hambúrguer bovino 180g • Queijo prato • Bacon dourado',
    badge: '+ batata e refri lata',
    price: 34.90,
    image: '/images/h4.webp',
    category: 'burgers'
  },
  {
    id: 'burg-monster',
    name: 'Monster Burguer',
    description: 'Pão brioche • 2 hambúrgueres bovinos 150g • Duplo cheddar • Bacon crocante',
    badge: '+ batata e refri lata',
    price: 39.90,
    image: '/images/h5.webp',
    category: 'burgers'
  }
];

export const BEBIDAS = [
  {
    id: 'refri-coca-lata',
    name: 'Coca lata',
    price: 5.90,
    image: '/images/latacoca1.webp',
    category: 'bebidas'
  },
  {
    id: 'refri-coca-zero',
    name: 'Coca lata Zero',
    price: 5.90,
    image: '/images/latacoca2.webp',
    category: 'bebidas'
  },
  {
    id: 'refri-guarana-lata',
    name: 'Guaraná Antarctica lata',
    price: 5.90,
    image: '/images/lataguarana.webp',
    category: 'bebidas'
  },
  {
    id: 'refri-fanta-lata',
    name: 'Fanta lata',
    price: 5.90,
    image: '/images/lataf2.webp',
    category: 'bebidas'
  },
  {
    id: 'refri-coca-1l',
    name: 'Coca 1L',
    price: 10.90,
    image: '/images/coca1l.webp',
    category: 'bebidas'
  },
  {
    id: 'refri-coca-1l-zero',
    name: 'Coca 1L Zero',
    price: 10.90,
    image: '/images/coca01ld.webp',
    category: 'bebidas'
  },
  {
    id: 'refri-guarana-1l',
    name: 'Guaraná Antarctica 1L',
    price: 10.90,
    image: '/images/guaranaant1l.webp',
    category: 'bebidas'
  },
  {
    id: 'refri-coca-2l',
    name: 'Coca 2L',
    price: 12.90,
    image: '/images/coca2l.webp',
    category: 'bebidas'
  },
  {
    id: 'refri-coca-2l-zero',
    name: 'Coca 2L Zero',
    price: 12.90,
    image: '/images/coca2ldiet.png',
    category: 'bebidas'
  },
  {
    id: 'refri-guarana-2l',
    name: 'Guaraná 2L',
    price: 12.90,
    image: '/images/gua2l.webp',
    category: 'bebidas'
  },
  {
    id: 'refri-sprite-2l',
    name: 'Sprite 2L',
    price: 12.90,
    image: '/images/sprite2l.webp',
    category: 'bebidas'
  },
  {
    id: 'refri-sprite-zero-2l',
    name: 'Sprite Zero 2L',
    price: 12.90,
    image: '/images/spritezero.webp',
    category: 'bebidas'
  },
  {
    id: 'refri-fanta-2l',
    name: 'Fanta 2L',
    price: 12.90,
    image: '/images/fata2l.webp',
    category: 'bebidas'
  }
];

export const CLIENT_REVIEWS = [
  {
    id: 'rev-1',
    author: null,
    rating: 5,
    comment: 'Massa crocante e muito recheio. A melhor que já comi!',
    image: '/images/dep1.webp'
  },
  {
    id: 'rev-2',
    author: null,
    rating: 5,
    comment: 'Ingredientes de primeira. Nota 10 para a Pizzaria.',
    image: '/images/dep07.webp'
  },
  {
    id: 'rev-3',
    author: null,
    rating: 5,
    comment: 'Sempre peço no final de semana, a entrega é muito rápida.',
    image: '/images/dep10.webp'
  },
  {
    id: 'rev-4',
    author: null,
    rating: 5,
    comment: 'Excelente. Recomendo!',
    image: '/images/dep20.webp'
  },
  {
    id: 'rev-5',
    author: null,
    rating: 5,
    comment: 'A melhor pizza da região, sem dúvidas. Preço justo.',
    image: '/images/dep06.webp'
  },
  {
    id: 'rev-6',
    author: 'Mariana Lopes • Águas Claras',
    time: 'há 2 dias',
    rating: 5,
    comment: 'Pizza chegou quentinha, bem recheada e com a massa no ponto. Virou minha pizzaria favorita.',
    image: '/images/pizzafoto.webp'
  },
  {
    id: 'rev-7',
    author: 'Rafael Oliveira • Asa Norte',
    time: 'há 3 dias',
    rating: 5,
    comment: 'A calabresa veio caprichada e a entrega foi rápida. Atendimento muito educado.',
    image: '/images/calabresa.webp'
  },
  {
    id: 'rev-8',
    author: 'Camila Santos • Guará',
    time: 'há 4 dias',
    rating: 5,
    comment: 'Pedi frango com catupiry e veio muito cremosa, bem embalada e saborosa.',
    image: '/images/frango.webp'
  },
  {
    id: 'rev-9',
    author: 'Bruno Costa • Taguatinga',
    time: 'há 5 dias',
    rating: 5,
    comment: 'Pizza grande de verdade, bastante recheio e preço justo pelo combo.',
    image: '/images/portuguesa.webp'
  },
  {
    id: 'rev-10',
    author: 'Ana Beatriz • Asa Sul',
    time: 'há 1 semana',
    rating: 5,
    comment: 'A de três queijos é maravilhosa. Massa leve, queijo bom e chegou antes do prazo.',
    image: '/images/tres.webp'
  },
  {
    id: 'rev-11',
    author: 'Felipe Gomes • Vicente Pires',
    time: 'há 1 semana',
    rating: 5,
    comment: 'Carne de sol muito bem temperada. Pedi para a família e todo mundo elogiou.',
    image: '/images/carnedesol.webp'
  }
];

export const AMBIENCE_PHOTOS = {
  kitchen: '/images/cozinha.png',
  restaurant: '/images/clientes.png'
};
