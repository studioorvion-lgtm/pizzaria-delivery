import json
from playwright.sync_api import sync_playwright

def validate_production():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            headless=True
        )
        page = browser.new_page(viewport={"width": 390, "height": 844})

        # Intercepta /api/checkout para não criar cobrança real no gateway SigiloPay
        def handle_checkout(route):
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "success": True,
                    "orderId": "DON-PROD-TEST",
                    "transactionId": "mock_tx_prod_test",
                    "status": "PENDING",
                    "pix": {
                        "code": "00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5925Donatello Pizzaria6009Sao Paulo62070503***6304ABCD",
                        "qrCodeImage": "https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=mockpix"
                    }
                })
            )

        def handle_status(route):
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps({
                    "success": True,
                    "status": "PENDING",
                    "isPaid": False
                })
            )

        page.route("**/api/checkout", handle_checkout)
        page.route("**/api/status*", handle_status)

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
        page.locator("form button", has_text="Continuar").first.click()
        page.wait_for_timeout(400)

        # 5. ETAPA 2 — Dados
        assert page.locator("text=Seus Dados de Contato").is_visible(), "Etapa 2 não visível"
        page.fill("input[name='fullName']", "Teste Producao Donatello")
        page.fill("input[name='phone']", "11999887766")
        page.locator("button", has_text="Gerar Pix e Ir para Pagamento").first.click()
        page.wait_for_timeout(800)

        # 6. ETAPA 3 — Pagamento Pix com Recibo na mesma tela
        assert page.locator("text=Pagamento via Pix").first.is_visible(), "Tela de Pix não visível"
        assert page.locator("text=Aguardando pagamento").first.is_visible(), "Status aguardando não visível"
        assert page.locator("text=Recibo do Pedido").first.is_visible(), "Recibo dentro da tela do Pix não visível"
        assert page.locator("text=Teste Producao Donatello").first.is_visible(), "Nome do cliente não visível no recibo"
        assert page.locator("text=123").first.is_visible(), "Número não visível no recibo"
        assert page.locator("button", has_text="COPIAR CÓDIGO PIX").or_(page.locator("button", has_text="CÓDIGO COPIADO!")).first.is_visible(), "Botão copiar Pix não visível"
        assert page.locator("text=Corrigir meus dados").is_visible(), "Botão Corrigir meus dados não visível"
        print("[OK] Fluxo de EXATAMENTE 3 etapas com recibo dentro do Pix 100% funcional!")

        browser.close()
    print("\n=== VALIDAÇÃO DA URL DE PRODUÇÃO CONCLUÍDA COM 100% DE SUCESSO! ===")

if __name__ == "__main__":
    validate_production()
