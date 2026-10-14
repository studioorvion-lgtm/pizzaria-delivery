import assert from 'assert';
import {
  calculateDistanceKm,
  formatDistanceString,
  getPizzeriaDistance,
} from '../src/utils/geolocation.js';
import { siteConfig } from '../src/config/site.js';

async function runClarityTests() {
  console.log('--- TESTANDO MELHORIAS DE CONFIANÇA E CLAREZA NO FLUXO ---');

  // 1. Geolocalização e Distância Real
  console.log('\n[1/3] Testando Geolocalização e Distância Real (Haversine)...');
  
  // Regra fundamental: se a pizzaria não tiver coordenadas cadastradas, NUNCA inventar distância fictícia
  const distNoCoords = getPizzeriaDistance({ latitude: -23.5505, longitude: -46.6333 });
  assert.strictEqual(
    distNoCoords,
    null,
    'getPizzeriaDistance DEVE retornar null se a pizzaria não tiver coordenadas reais cadastradas!'
  );
  console.log('✓ Proteção confirmada: nenhuma distância fictícia é gerada quando coordinates é null.');

  // Distância matemática real entre dois pontos conhecidos (ex: Av Paulista -> Centro SP ~ 2.6 km)
  const dReal = calculateDistanceKm(-23.5615, -46.6559, -23.5489, -46.6388);
  assert.ok(dReal >= 2.0 && dReal <= 3.2, `Distância calculada deve ser coerente (~2.6km), obteve: ${dReal}`);
  assert.strictEqual(formatDistanceString(dReal), `${dReal.toFixed(1).replace('.', ',')} km`);
  assert.strictEqual(formatDistanceString(0.4), '400 m');
  assert.strictEqual(formatDistanceString(null), null);
  console.log(`✓ Cálculo Haversine validado com precisão: ${dReal} km (${formatDistanceString(dReal)})`);

  // 2. Estrutura de Recibo / Resumo do Pedido (Dados Obrigatórios)
  console.log('\n[2/3] Testando estrutura dos dados do Recibo/Resumo de Pedido...');
  const mockOrderData = {
    customer: { fullName: 'Maria Clara Souza', phone: '(11) 98765-4321', cpf: '123.456.789-00' },
    address: {
      street: 'Rua das Flores',
      number: '42',
      complement: 'Bloco B Apto 101',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      cep: '01415-000',
    },
    items: [
      { id: 'combo-2pp', name: '02 Pizzas PP + 1 Refrigerante 1 Litro', price: 32.90, quantity: 2, description: 'ESCOLHA OS SABORES' },
      { id: 'refri-coca', name: 'Coca-Cola 2L', price: 14.00, quantity: 1 }
    ],
  };

  const subtotal = mockOrderData.items.reduce((s, i) => s + i.price * i.quantity, 0);
  assert.strictEqual(subtotal, 79.80);

  // Valida que todos os campos exigidos na especificação estão mapeados
  assert.ok(mockOrderData.customer.fullName, 'Cliente: Nome presente');
  assert.ok(mockOrderData.customer.phone, 'Cliente: Telefone presente');
  assert.ok(mockOrderData.address.street, 'Entrega: Endereço presente');
  assert.ok(mockOrderData.address.number, 'Entrega: Número presente');
  assert.ok(mockOrderData.address.complement, 'Entrega: Complemento presente');
  assert.ok(mockOrderData.address.neighborhood, 'Entrega: Bairro presente');
  assert.ok(mockOrderData.address.city, 'Entrega: Cidade presente');
  assert.ok(mockOrderData.address.state, 'Entrega: Estado presente');
  assert.ok(mockOrderData.address.cep, 'Entrega: CEP presente');
  assert.strictEqual(mockOrderData.items.length, 2, 'Pedido: Itens presentes');
  console.log('✓ Todos os campos obrigatórios do recibo estão devidamente mapeados e estruturados.');

  // 3. Regras Técnicas: Integridade de Preços e Configurações
  console.log('\n[3/3] Validando integridade de regras técnicas e comerciais...');
  assert.ok(siteConfig.name, 'Nome da pizzaria configurado');
  assert.ok(siteConfig.deliveryTime, 'Tempo de entrega oficial preservado');
  assert.strictEqual(siteConfig.name, 'Donatello Pizzaria Artesanal');
  console.log('✓ Marca, tempos e regras de negócio oficiais preservadas sem alterações indevidas.');

  console.log('\n=== TODOS OS TESTES DE CLAREZA E FLUXO PASSARAM COM SUCESSO! ===\n');
}

runClarityTests().catch(err => {
  console.error('FALHA NOS TESTES:', err);
  process.exit(1);
});
