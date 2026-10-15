from playwright.sync_api import sync_playwright

def validate_production():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            headless=True
        )
        page = browser.new_page(viewport={"width": 390, "height": 844})
        print("Acessando URL de produção: https://pizzaria-delivery-nu.vercel.app ...")
        page.goto("https://pizzaria-delivery-nu.vercel.app", wait_until="networkidle")

        # 1. Checa título e ausência de elementos fake
        assert "Donatello" in page.title() or page.locator("text=Donatello").is_visible(), "Nome da pizzaria não visível"
        assert not page.locator("text=Promoção combo encerra em").is_visible(), "Timer do topo ainda visível!"
        assert not page.locator("text=A Promoção Encerra em").is_visible(), "Timer do meio ainda visível!"
        assert not page.locator("text=Restam 03 unidades").is_visible(), "Barra de escassez ainda visível!"
        print("[OK] Elementos artificiais verificados: nenhum timer regressivo fake ou barra de escassez na produção!")

        # 2. Adiciona combo ao carrinho
        card = page.locator("#menu-pizzas .card-shadow").first
        card.click()
        page.wait_for_timeout(400)

        # 3. Abre Carrinho
        page.locator("button", has_text="Carrinho").first.click()
        page.wait_for_timeout(400)
        page.locator("button", has_text="Continuar para Entrega").first.click()
        page.wait_for_timeout(400)

        # 4. ETAPA 1 — Endereço
        assert page.locator("text=Endereço de Entrega").is_visible(), "Etapa 1 não visível"
        page.fill("input[name='cep']", "01415-000")
        page.fill("input[name='street']", "Rua das Flores")
        page.fill("input[name='number']", "123")
        page.fill("input[name='neighborhood']", "Bela Vista")
        page.fill("input[name='city']", "São Paulo")
        page.locator("button", has_text="Continuar para Dados").first.click()
        page.wait_for_timeout(400)

        # 5. ETAPA 2 — Dados
        assert page.locator("text=Seus Dados de Contato").is_visible(), "Etapa 2 não visível"
        page.fill("input[name='fullName']", "Teste Producao Donatello")
        page.fill("input[name='phone']", "11999887766")
        page.locator("button", has_text="Revisar Pedido").first.click()
        page.wait_for_timeout(400)

        # 6. ETAPA 3 — Conferência do Pedido / Recibo
        assert page.locator("text=Conferência do Pedido").first.is_visible(), "Recibo não visível"
        assert page.locator("text=Teste Producao Donatello").is_visible(), "Nome do cliente não visível no recibo"
        assert page.locator("text=123").first.is_visible(), "Número não visível no recibo"
        assert page.locator("button", has_text="Gerar Pix e Concluir Pedido").is_visible(), "Botão de pagamento Pix não visível"
        assert page.locator("button", has_text="Voltar para Editar Dados").is_visible(), "Botão de edição não visível"
        print("[OK] Fluxo de checkout em 3 etapas verificado e 100% funcional na produção!")

        browser.close()
    print("\n=== VALIDAÇÃO DA URL DE PRODUÇÃO CONCLUÍDA COM 100% DE SUCESSO! ===")

if __name__ == "__main__":
    validate_production()
