import subprocess
import time
import urllib.request
import socket
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
                page.goto(target_url, wait_until="networkidle")

                # 1. Verifica Header e ausência de overflow horizontal
                scroll_width = page.evaluate("document.documentElement.scrollWidth")
                inner_width = page.evaluate("window.innerWidth")
                assert scroll_width <= inner_width + 1, f"Overflow horizontal detectado no viewport {vp['width']}px: scrollWidth={scroll_width}, innerWidth={inner_width}"
                print(f"[OK] Sem overflow horizontal na página inicial ({vp['width']}px).")

                # 2. Adiciona item ao carrinho
                add_btn = page.locator("button:has-text('Adicionar'), button:has-text('ADICIONAR')").first
                if not add_btn.is_visible():
                    # Clica no card do combo
                    card = page.locator("#menu-pizzas .card-shadow").first
                    card.click()
                else:
                    add_btn.click()
                page.wait_for_timeout(300)

                # 3. Abre Carrinho
                page.locator("button:has-text('Carrinho')").first.click()
                page.wait_for_timeout(300)

                # 4. Clica em Continuar para Entrega
                page.locator("button:has-text('Continuar para Entrega')").first.click()
                page.wait_for_timeout(300)

                # 5. ETAPA 1 — ENDEREÇO
                assert page.locator("text=Endereço de Entrega").is_visible(), "Título Etapa 1 não visível"
                page.fill("input[name='cep']", "01415-000")
                page.fill("input[name='street']", "Rua das Flores")
                page.fill("input[name='number']", "123")
                page.fill("input[name='complement']", "Apto 45")
                page.fill("input[name='neighborhood']", "Bela Vista")
                page.fill("input[name='city']", "São Paulo")

                # Clica em Continuar para Dados
                page.locator("button:has-text('Continuar para Dados')").first.click()
                page.wait_for_timeout(300)

                # 6. ETAPA 2 — DADOS PESSOAIS
                assert page.locator("text=Seus Dados de Contato").is_visible(), "Título Etapa 2 não visível"
                page.fill("input[name='fullName']", "Carlos Eduardo Silva")
                page.fill("input[name='phone']", "11999887766")

                # Clica em Revisar Pedido
                page.locator("button:has-text('Revisar Pedido')").first.click()
                page.wait_for_timeout(400)

                # 7. ETAPA 3 — CONFERÊNCIA DO PEDIDO / RECIBO
                assert page.locator("text=Conferência do Pedido").first.is_visible(), "Título do recibo não visível"
                assert page.locator("text=Carlos Eduardo Silva").first.is_visible(), "Nome do cliente não visível no recibo"
                assert page.locator("text=123").first.is_visible(), "Número da residência não visível no recibo"
                assert page.locator("text=São Paulo").first.is_visible(), "Cidade não visível no recibo"
                assert page.locator("text=RESUMO FINANCEIRO").is_visible(), "Resumo financeiro não visível no recibo"
                assert page.locator("text=Grátis").first.is_visible(), "Taxa de entrega Grátis não visível no recibo"
                assert page.locator("button:has-text('Gerar Pix e Concluir Pedido')").is_visible(), "Botão Gerar Pix não visível"
                assert page.locator("button:has-text('Voltar para Editar Dados')").is_visible(), "Botão Editar não visível"

                # Verifica ausência de overflow horizontal no modal de recibo
                modal_overflow = page.evaluate("document.querySelector('.max-w-xl')?.scrollWidth <= window.innerWidth + 2")
                assert modal_overflow, f"Overflow no modal de recibo em {vp['width']}px"
                print(f"[OK] Checkout em 3 etapas perfeitamente renderizado e responsivo em {vp['width']}px!")

                # 8. Testa botão "Voltar para Editar Dados"
                page.locator("button:has-text('Voltar para Editar Dados')").click()
                page.wait_for_timeout(300)
                assert page.locator("input[name='fullName']").is_visible(), "Formulário de dados deve reaparecer ao clicar em editar"
                assert page.input_value("input[name='fullName']") == "Carlos Eduardo Silva", "Dados do formulário devem ser preservados"
                print(f"[OK] Edição de dados testada com sucesso em {vp['width']}px: campos preservados.")

                context.close()

            browser.close()

        print("\n=== TODOS OS TESTES MOBILE (320, 360, 390 e 414px) FORAM CONCLUÍDOS COM 100% DE SUCESSO! ===")

    finally:
        subprocess.call(["taskkill", "/F", "/T", "/PID", str(proc.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

if __name__ == "__main__":
    run_e2e()
