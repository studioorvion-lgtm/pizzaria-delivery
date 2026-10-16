import subprocess
import time
import urllib.request
import socket
import json
from playwright.sync_api import sync_playwright

def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

def run_e2e():
    port = get_free_port()
    print(f"Iniciando servidor Vite de preview na porta {port}...")
    proc = subprocess.Popen(["npm", "run", "preview", "--", "--port", str(port), "--strictPort"], shell=True, cwd=".")
    
    try:
        target_url = None
        for _ in range(40):
            try:
                with urllib.request.urlopen(f"http://localhost:{port}") as r:
                    if r.status == 200:
                        target_url = f"http://localhost:{port}"
                        break
            except:
                pass
            time.sleep(0.5)

        if not target_url:
            raise Exception(f"Não foi possível conectar ao servidor preview na porta {port}")

        print(f"Servidor preview ativo em {target_url}")

        viewports = [
            {"width": 320, "height": 650, "name": "320px (Mobile Pequeno)"},
            {"width": 360, "height": 740, "name": "360px (Galaxy S)"},
            {"width": 390, "height": 844, "name": "390px (iPhone 13/14/15)"},
            {"width": 414, "height": 896, "name": "414px (iPhone Plus/Max)"},
        ]

        with sync_playwright() as p:
            browser = p.chromium.launch(
                executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                headless=True
            )

            for vp in viewports:
                print(f"\n--- Testando Viewport: {vp['name']} ({vp['width']}x{vp['height']}) ---")
                context = browser.new_context(
                    viewport={"width": vp["width"], "height": vp["height"]},
                    permissions=["geolocation"],
                    geolocation={"latitude": -23.5505, "longitude": -46.6333}
                )
                page = context.new_page()

                def handle_checkout(route):
                    route.fulfill(
                        status=200,
                        content_type="application/json",
                        body=json.dumps({
                            "success": True,
                            "orderId": "DON-998877",
                            "transactionId": "mock_tx_123",
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

                page.goto(target_url, wait_until="networkidle")

                # 1. Verifica Header e ausência de overflow horizontal
                scroll_width = page.evaluate("document.documentElement.scrollWidth")
                inner_width = page.evaluate("window.innerWidth")
                assert scroll_width <= inner_width + 1, f"Overflow horizontal detectado no viewport {vp['width']}px: scrollWidth={scroll_width}, innerWidth={inner_width}"
                print(f"[OK] Sem overflow horizontal na página inicial ({vp['width']}px).")

                # 2. Adiciona item ao carrinho
                add_btn = page.locator("button:has-text('Montar meu combo'), button:has-text('Adicionar'), button:has-text('ADICIONAR')").first
                add_btn.click()
                page.wait_for_timeout(300)

                # 3. Abre Carrinho / Sacola
                page.locator("button:has-text('Ver Carrinho'), header button:has-text('Sacola')").first.click()
                page.wait_for_timeout(300)

                # 4. Clica em Continuar para Entrega no drawer visível
                page.locator("button:has-text('Continuar para Entrega')").click()
                page.wait_for_timeout(300)

                # 5. ETAPA 1 — ENDEREÇO
                assert page.locator("text=Endereço de Entrega").is_visible(), "Título Etapa 1 não visível"
                page.fill("input[name='cep']", "01415-000")
                page.fill("input[name='street']", "Rua das Flores")
                page.fill("input[name='number']", "123")
                page.fill("input[name='complement']", "Apto 45")
                page.fill("input[name='neighborhood']", "Bela Vista")
                page.fill("input[name='city']", "São Paulo")

                # Clica em Continuar (Etapa 1 -> Etapa 2)
                page.locator("form button:has-text('Continuar')").click()
                page.wait_for_timeout(300)

                # 6. ETAPA 2 — DADOS PESSOAIS
                assert page.locator("text=Seus Dados de Contato").is_visible(), "Título Etapa 2 não visível"
                page.fill("input[name='fullName']", "Carlos Eduardo Silva")
                page.fill("input[name='phone']", "11999887766")

                # Clica em "Gerar Pix e Ir para Pagamento" (vai DIRETAMENTE para a Etapa 3)
                page.locator("button:has-text('Gerar Pix e Ir para Pagamento')").first.click()
                page.wait_for_timeout(600)

                # 7. ETAPA 3 — PAGAMENTO PIX COM RECIBO ACOPLADO NA MESMA TELA
                assert page.locator("text=Pagamento via Pix").first.is_visible(), "Tela de Pix não visível"
                assert page.locator("text=Aguardando pagamento").first.is_visible(), "Status aguardando não visível"
                assert page.locator("text=Recibo do Pedido").first.is_visible(), "Recibo dentro da tela do Pix não visível"
                assert page.locator("text=Carlos Eduardo Silva").first.is_visible(), "Nome do cliente não visível no recibo"
                assert page.locator("text=123").first.is_visible(), "Número da residência não visível no recibo"
                assert page.locator("text=São Paulo").first.is_visible(), "Cidade não visível no recibo"
                assert page.locator("text=COPIAR CÓDIGO PIX").or_(page.locator("text=CÓDIGO COPIADO!")).first.is_visible(), "Botão copiar Pix não visível"
                assert page.locator("text=Corrigir meus dados").is_visible(), "Botão Corrigir meus dados não visível"

                # Verifica ausência de overflow horizontal no modal de Pix + Recibo
                modal_overflow = page.evaluate("document.querySelector('.max-w-lg')?.scrollWidth <= window.innerWidth + 2")
                assert modal_overflow, f"Overflow no modal de Pix/Recibo em {vp['width']}px"
                print(f"[OK] Fluxo de 3 etapas com recibo dentro do Pix perfeitamente renderizado e responsivo em {vp['width']}px!")

                # 8. Testa botão discreto "Corrigir meus dados"
                page.locator("text=Corrigir meus dados").click()
                page.wait_for_timeout(300)
                assert page.locator("input[name='fullName']").or_(page.locator("text=Endereço de Entrega")).first.is_visible(), "Checkout deve reabrir ao clicar em corrigir"
                print(f"[OK] 'Corrigir meus dados' testado com sucesso em {vp['width']}px.")

                context.close()

            browser.close()

        print("\n=== TODOS OS TESTES MOBILE (320, 360, 390 e 414px) FORAM CONCLUÍDOS COM 100% DE SUCESSO! ===")

    finally:
        subprocess.call(["taskkill", "/F", "/T", "/PID", str(proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

if __name__ == "__main__":
    run_e2e()
