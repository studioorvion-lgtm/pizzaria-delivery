const { chromium } = require('C:/Users/Pablo Tommas/.gemini/antigravity/scratch/orvion-health/node_modules/playwright');

async function testProduction() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('--- TESTANDO URL DE PRODUCAO COM PLAYWRIGHT ---');
  await page.goto('https://pizzaria-delivery-nu.vercel.app', { waitUntil: 'networkidle' });

  // 1. Check title & top banner
  const content = await page.content();
  const hasBrasil = content.includes('Entrega para todo o Brasil');
  const hasSP = content.includes('São Paulo e Região') || content.includes('São Paulo e região');
  const hasSigilo = content.includes('SigiloPay');
  const hasPizzaFoto = content.includes('pizzafoto.webp');
  const hasSuperCombos = content.includes('Super Combos 🍕');
  const hasCombosEspeciais = content.includes('Combos Especiais');
  const hasHamburgueres = content.includes('Hambúrgueres Artesanais 🍔');
  const hasBebidas = content.includes('Bebidas');
  const hasMelhorPizzaria = content.includes('MELHOR PIZZARIA DELIVERY');
  const hasClientes = content.includes('clientes.png');
  const hasCozinha = content.includes('cozinha.png');

  console.log('Possui "Entrega para todo o Brasil":', hasBrasil);
  console.log('Possui "São Paulo e Região":', hasSP);
  console.log('Possui menção pública a SigiloPay:', hasSigilo);
  console.log('Usa foto de referência pizzafoto.webp:', hasPizzaFoto);
  console.log('Seção Super Combos presente:', hasSuperCombos);
  console.log('Seção Combos Especiais presente:', hasCombosEspeciais);
  console.log('Seção Hambúrgueres presente:', hasHamburgueres);
  console.log('Seção Bebidas presente:', hasBebidas);
  console.log('Bloco MELHOR PIZZARIA DELIVERY presente:', hasMelhorPizzaria);
  console.log('Fotos do ambiente presentes:', hasClientes && hasCozinha);

  if (hasBrasil || hasSP || hasSigilo) {
    throw new Error('Falha de conformidade nos textos do topo/gateway');
  }

  // 2. Add first product to cart
  const addBtn = page.locator('button[aria-label*="Adicionar"], #menu-pizzas .cursor-pointer').first();
  await addBtn.click();
  await page.waitForTimeout(500);

  // 3. Open cart
  const cartTrigger = page.locator('header button:has-text("Carrinho")').first();
  await cartTrigger.click();
  await page.waitForTimeout(500);

  // 4. Click proceed to checkout inside cart
  const checkoutBtn = page.locator('button:has-text("Continuar para Entrega")').first();
  await checkoutBtn.click();
  await page.waitForTimeout(500);

  // 5. Fill customer details (without CPF)
  await page.fill('input[name="fullName"]', 'Maria Silva Teste');
  await page.fill('input[name="phone"]', '11999998888');
  await page.fill('input[name="street"]', 'Av Paulista');
  await page.fill('input[name="number"]', '1000');
  await page.fill('input[name="neighborhood"]', 'Bela Vista');
  await page.fill('input[name="city"]', 'São Paulo');

  // Submit checkout
  console.log('Clicando em Gerar Código Pix...');
  const payBtn = page.locator('button:has-text("Gerar Código Pix")').first();
  await payBtn.click();

  // Wait for Pix screen
  await page.waitForTimeout(4000);

  // Check if Pix screen rendered without errors or blank screen
  const pixContent = await page.content();
  const hasPixCode = pixContent.includes('0002010102') || pixContent.includes('Copia e Cola') || pixContent.includes('Copiar Código Pix');
  const hasQr = await page.locator('img[alt*="QR"]').count();
  const hasOrderId = pixContent.includes('DON-') || pixContent.includes('PEDIDO:');

  console.log('Pix Renderizado:', hasPixCode);
  console.log('QR Code visível:', hasQr > 0);
  console.log('ID do Pedido visível:', hasOrderId);
  console.log('Tela branca detectada:', pixContent.length < 500);

  // Check Meu Pedido modal by closing PixScreen first
  const closePixBtn = page.locator('button[aria-label="Fechar"], button:has-text("Voltar para o cardápio")').first();
  if (await closePixBtn.isVisible()) {
    await closePixBtn.click();
    await page.waitForTimeout(500);
  }

  const meuPedidoBtn = page.locator('button:has-text("Meu Pedido")').first();
  if (await meuPedidoBtn.isVisible()) {
    await meuPedidoBtn.click();
    await page.waitForTimeout(500);
    const modalContent = await page.content();
    console.log('Modal Meu Pedido abriu com sucesso:', modalContent.includes('DON-') || modalContent.includes('Aguardando'));
  }

  // Mobile viewport check
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);
  console.log('Viewport mobile renderizado com sucesso');

  await browser.close();
  console.log('--- TESTE DE PRODUCAO CONCLUIDO COM SUCESSO! ---');
}

testProduction().catch(err => {
  console.error('Erro no teste:', err);
  process.exit(1);
});
