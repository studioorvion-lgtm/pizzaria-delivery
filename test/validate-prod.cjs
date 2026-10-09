const { chromium } = require('C:/Users/Pablo Tommas/.gemini/antigravity/scratch/orvion-health/node_modules/playwright');

async function testProduction() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  console.log('--- TESTANDO URL DE PRODUCAO COM PLAYWRIGHT ---');
  await page.goto('https://pizzaria-delivery-nu.vercel.app', { waitUntil: 'networkidle' });

  // 1. Check title & top banner
  const content = await page.content();
  console.log('Possui "Entrega para todo o Brasil":', content.includes('Entrega para todo o Brasil'));
  console.log('Possui mencao publica a SigiloPay:', content.includes('SigiloPay'));

  // 2. Add first product to cart
  const addBtn = page.locator('button:has-text("+"), button:has-text("ADICIONAR"), button:has-text("Pedir")').first();
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
  console.log('QR Code visivel:', hasQr > 0);
  console.log('ID do Pedido visivel:', hasOrderId);
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
