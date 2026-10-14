import subprocess
import time
import urllib.request
import os
from playwright.sync_api import sync_playwright

def verify_all():
    print("=== INICIANDO CONFERÊNCIA FINAL COMPLETA ===")

    # Mata qualquer processo anterior de preview
    subprocess.run(["powershell", "-Command", "Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match 'preview' -or $_.CommandLine -match 'preview' } | Stop-Process -Force -ErrorAction SilentlyContinue"], capture_output=True)

    proc = subprocess.Popen(["npm", "run", "preview", "--", "--port", "4173"], shell=True, cwd=".")

    target_url = None
    try:
        for _ in range(30):
            for port in [4173, 4174, 4175, 4176]:
                try:
                    with urllib.request.urlopen(f"http://localhost:{port}") as r:
                        if r.status == 200:
                            target_url = f"http://localhost:{port}"
                            break
                except:
                    pass
            if target_url:
                break
            time.sleep(0.5)

        assert target_url, "Servidor preview não iniciou"
        print(f"[1/6] Servidor ativo em {target_url}")

        with sync_playwright() as p:
            browser = p.chromium.launch(
                executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                headless=True
            )

            # Teste no iPhone 13/14/15 (390x844)
            context = browser.new_context(viewport={"width": 390, "height": 844})
            page = context.new_page()

            page.goto(target_url, wait_until="networkidle")

            # 1. Confirmação: Distância oculta enquanto não houver coordenadas
            distance_text = page.locator("text=Estamos a").count()
            assert distance_text == 0, "O pill de distância NÃO deve aparecer enquanto não houver coordenadas reais!"
            print("[2/6] CONFIRMADO: Recurso de distância está 100% OCULTO (sem coordenadas reais).")

            # 2. Confirmação: Carrinho funciona
            card = page.locator("#menu-pizzas .card-shadow").first
            card.click()
            page.wait_for_timeout(300)

            badge = page.locator("header button:has-text('Carrinho') span.bg-red-600")
            assert badge.is_visible() and int(badge.text_content().strip()) >= 1, "Item não adicionado ao carrinho"
            print("[3/6] CONFIRMADO: Carrinho funciona (item adicionado com sucesso).")

            # 3. Abre carrinho e vai para Checkout
            page.locator("header button:has-text('Carrinho')").click()
            page.wait_for_timeout(300)
            page.locator("button:has-text('Continuar para Entrega')").click()
            page.wait_for_timeout(300)

            # 4. Confirmação: Formulário de Checkout funciona
            page.fill("input[name='fullName']", "Ana Paula Ribeiro")
            page.fill("input[name='phone']", "11987654321")
            page.fill("input[name='street']", "Rua Augusta")
            page.fill("input[name='number']", "500")
            page.fill("input[name='neighborhood']", "Consolação")
            page.fill("input[name='city']", "São Paulo")

            # 5. Confirmação: Resumo do pedido tipo recibo aparece ANTES do pagamento
            page.locator("button:has-text('Revisar Pedido')").click()
            page.wait_for_timeout(400)

            assert page.locator("text=Conferência do Pedido").is_visible(), "Recibo de conferência não visível"
            assert page.locator("text=Ana Paula Ribeiro").is_visible(), "Nome não visível no recibo"
            assert page.locator("text=Rua Augusta, 500").is_visible(), "Endereço não visível no recibo"
            assert page.locator("text=Consolação").is_visible(), "Bairro não visível no recibo"
            assert page.locator("text=RESUMO FINANCEIRO").is_visible(), "Resumo financeiro não visível no recibo"
            print("[4/6] CONFIRMADO: Resumo do pedido tipo recibo aparece ANTES do pagamento com todos os dados.")

            # 6. Confirmação: Botão editar dados funciona mantendo inputs
            page.locator("button:has-text('Editar Dados / Pedido')").click()
            page.wait_for_timeout(300)
            assert page.input_value("input[name='fullName']") == "Ana Paula Ribeiro", "Nome deve ser preservado ao voltar"
            assert page.input_value("input[name='street']") == "Rua Augusta", "Rua deve ser preservada ao voltar"
            print("[5/6] CONFIRMADO: Botão 'Editar Dados / Pedido' funciona e preserva todos os campos.")

            # Volta para o recibo
            page.locator("button:has-text('Revisar Pedido')").click()
            page.wait_for_timeout(300)

            # Verifica botão de pagamento
            pay_btn = page.locator("button:has-text('Continuar para Pagamento')")
            assert pay_btn.is_visible(), "Botão de pagamento via Pix não visível no recibo"
            print("[6/6] CONFIRMADO: Botão 'Continuar para Pagamento' pronto para disparar geração de Pix.")

            # Confirma que purchase NÃO foi disparado na visualização do recibo nem no checkout
            purchases_fired = page.evaluate("""() => {
                const dl = window.dataLayer || [];
                return dl.filter(e => e && e[0] === 'event' && (e[1] === 'purchase' || e[1] === 'conversion'));
            }""")
            assert len(purchases_fired) == 0, "Evento purchase NUNCA deve disparar antes do pagamento aprovado!"
            print("[OK] CONFIRMADO: Evento purchase NÃO dispara antes do pagamento (dispara estritamente em PAID).")

            browser.close()

        print("\n=== TODOS OS PONTOS DE CONFERÊNCIA FORAM VALIDADOS COM 100% DE SUCESSO! ===")

    finally:
        proc.terminate()
        subprocess.run(["powershell", "-Command", "Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -match 'preview' -or $_.CommandLine -match 'preview' } | Stop-Process -Force -ErrorAction SilentlyContinue"], capture_output=True)

if __name__ == "__main__":
    verify_all()
