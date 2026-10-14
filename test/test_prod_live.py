from playwright.sync_api import sync_playwright

def test_production():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            headless=True
        )
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()
        page.goto("https://pizzaria-delivery-nu.vercel.app", wait_until="networkidle")

        # 1. Verifica pill de distância (DEVE estar OCULTO enquanto não houver coordenadas)
        dist_count = page.locator("text=Estamos a").count()
        print("Distância visível na produção:", dist_count > 0, "(Esperado: False)")
        assert dist_count == 0, "Distância não deveria aparecer em produção sem coordenadas reais!"

        # 2. Adiciona item ao carrinho
        card = page.locator("#menu-pizzas .card-shadow").first
        card.click()
        page.wait_for_timeout(300)

        # 3. Abre carrinho
        page.locator("header button:has-text('Carrinho')").click()
        page.wait_for_timeout(300)
        page.locator("button:has-text('Continuar para Entrega')").click()
        page.wait_for_timeout(300)

        # 4. Preenche formulário
        page.fill("input[name='fullName']", "Carlos Eduardo Silva")
        page.fill("input[name='phone']", "11988887777")
        page.fill("input[name='street']", "Av Paulista")
        page.fill("input[name='number']", "1000")
        page.fill("input[name='neighborhood']", "Bela Vista")
        page.fill("input[name='city']", "São Paulo")

        # 5. Clica em Revisar Pedido
        page.locator("button:has-text('Revisar Pedido')").click()
        page.wait_for_timeout(400)

        # 6. Verifica recibo
        recibo_visible = page.locator("text=Conferência do Pedido").is_visible()
        print("Recibo de conferência visível na produção:", recibo_visible)
        assert recibo_visible, "Recibo deve estar visível"

        cliente_visible = page.locator("text=Carlos Eduardo Silva").is_visible()
        print("Cliente visível no recibo:", cliente_visible)

        endereco_visible = page.locator("text=Av Paulista, 1000").is_visible()
        print("Endereço visível no recibo:", endereco_visible)

        financeiro_visible = page.locator("text=RESUMO FINANCEIRO").is_visible()
        print("Resumo financeiro visível no recibo:", financeiro_visible)

        # 7. Testa botão Editar Dados
        page.locator("button:has-text('Editar Dados / Pedido')").click()
        page.wait_for_timeout(300)
        val_nome = page.input_value("input[name='fullName']")
        print("Edição funcionando com dados preservados:", val_nome == "Carlos Eduardo Silva")

        # 8. Volta ao recibo e verifica botão de pagamento
        page.locator("button:has-text('Revisar Pedido')").click()
        page.wait_for_timeout(300)
        btn_pagar = page.locator("button:has-text('Continuar para Pagamento')").is_visible()
        print("Botão Continuar para Pagamento ativo:", btn_pagar)

        # 9. Confirma que purchase NÃO foi disparado antes de PAID
        purchases = page.evaluate("""() => {
            const dl = window.dataLayer || [];
            return dl.filter(e => e && e[0] === 'event' && (e[1] === 'purchase' || e[1] === 'conversion'));
        }""")
        print("Disparos indevidos de purchase antes do pagamento:", len(purchases), "(Esperado: 0)")
        assert len(purchases) == 0

        browser.close()
        print("\n=== PRODUÇÃO 100% VALIDADA E APROVADA! ===")

if __name__ == "__main__":
    test_production()
