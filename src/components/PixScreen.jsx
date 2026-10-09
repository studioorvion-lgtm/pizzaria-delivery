import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, QrCode, ShieldCheck, RefreshCw, MessageSquare, X, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';
import { siteConfig } from '../config/site';

export default function PixScreen() {
  const { activeOrder, setActiveOrder, setPaidOrder, setIsCheckoutOpen } = useCart();
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkError, setCheckError] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);

  // REGRA DE HOOKS: Todos os hooks no topo antes de qualquer retorno condicional
  useEffect(() => {
    if (!activeOrder) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeOrder]);

  // Polling automático seguro
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'PAID') return;

    const idToCheck = activeOrder.orderId || activeOrder.transactionId;
    if (!idToCheck) return;

    const pollId = setInterval(async () => {
      try {
        const res = await fetch(`/api/status?id=${encodeURIComponent(idToCheck)}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data && data.success && data.isPaid) {
          clearInterval(pollId);
          setPaidOrder({
            ...activeOrder,
            status: 'PAID',
            paidAmount: data.paidAmount || activeOrder.total,
            paidAt: data.paidAt || new Date().toISOString(),
          });
          setActiveOrder(null);
        }
      } catch {}
    }, 3500);

    return () => clearInterval(pollId);
  }, [activeOrder, setActiveOrder, setPaidOrder]);

  // Se não houver pedido ativo na tela de Pix, não renderiza nada
  if (!activeOrder) return null;

  const pixCode = activeOrder.pix?.code || '';
  const qrCodeImage =
    activeOrder.pix?.qrCodeImage ||
    (pixCode
      ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(pixCode)}`
      : '');

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const copyToClipboard = () => {
    if (pixCode) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pixCode).catch(() => {});
      } else {
        // Fallback para navegadores sem permissão de clipboard
        const input = document.createElement('textarea');
        input.value = pixCode;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const manualCheck = async () => {
    setIsChecking(true);
    setCheckError(null);
    try {
      const idToCheck = activeOrder.orderId || activeOrder.transactionId;
      const res = await fetch(`/api/status?id=${encodeURIComponent(idToCheck)}`);
      const data = await res.json().catch(() => ({}));

      if (data && data.success && data.isPaid) {
        setPaidOrder({
          ...activeOrder,
          status: 'PAID',
          paidAmount: data.paidAmount || activeOrder.total,
          paidAt: data.paidAt || new Date().toISOString(),
        });
        setActiveOrder(null);
      } else {
        setCheckError('Ainda aguardando identificação bancária do Pix. Aguarde alguns instantes e tente novamente.');
      }
    } catch {
      setCheckError('Erro temporário de conexão. Verifique novamente em instantes.');
    } finally {
      setIsChecking(false);
    }
  };

  const openWhatsApp = () => {
    const msg = `Olá, ${siteConfig.name}! Acabei de gerar o pedido #${activeOrder.orderId} no valor de ${formatCurrency(
      activeOrder.total
    )} via Pix.`;
    const link = siteConfig.getWhatsAppLink(msg);
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative max-h-[95vh] overflow-y-auto">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-red-600 to-[#D32F2F] text-white p-4 sm:p-5 text-center relative">
          <button
            onClick={() => setActiveOrder(null)}
            className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-xs">
            <QrCode className="w-6 h-6 text-white" />
          </div>

          <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
            Pagamento via Pix
          </h3>
          <p className="text-xs text-red-100 mt-0.5">
            Pedido <strong className="text-white font-mono">#{activeOrder.orderId}</strong> •{' '}
            <span className="bg-yellow-400 text-gray-900 px-1.5 py-0.2 rounded font-bold">Aguardando pagamento</span>
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 text-center">
          {checkError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{checkError}</span>
            </div>
          )}

          {/* QR Code Container */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 inline-block mx-auto max-w-xs shadow-inner">
            {qrCodeImage ? (
              <img
                src={qrCodeImage}
                alt="QR Code Pix"
                className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain rounded-lg bg-white p-2 shadow-xs"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-xs">
                <span>Carregando QR Code...</span>
              </div>
            )}

            <div className="mt-2 text-xs font-bold text-gray-700">
              Valor Total: <span className="text-[#D32F2F] text-base font-extrabold">{formatCurrency(activeOrder.total)}</span>
            </div>
          </div>

          {/* Pix Copia e Cola */}
          {pixCode ? (
            <div className="space-y-2 text-left">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Pix Copia e Cola:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixCode}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 truncate select-all focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D32F2F] hover:bg-[#B71C1C] text-white shadow-xs'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Pix Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPIAR PIX</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs text-left">
              Não foi possível carregar o código Pix. Clique em tentar novamente para gerar uma nova cobrança.
              <button
                onClick={() => {
                  setActiveOrder(null);
                  setIsCheckoutOpen(true);
                }}
                className="block mt-2 font-bold underline"
              >
                Voltar e tentar novamente
              </button>
            </div>
          )}

          {/* Timer de expiração */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200/60 py-2 px-3 rounded-xl font-medium">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              O código expira em <strong className="font-mono">{timeFormatted}</strong>. Pague para iniciar o preparo.
            </span>
          </div>

          {/* Instruções Curtas */}
          <div className="bg-gray-50 rounded-xl p-3 text-left text-xs text-gray-600 space-y-1">
            <div className="font-bold text-gray-800 mb-1">Como pagar:</div>
            <div>1. Abra o aplicativo do seu banco.</div>
            <div>2. Selecione <strong>Pix &gt; Copia e Cola</strong> (ou aponte a câmera para o QR Code).</div>
            <div>3. Cole o código copiado e confirme o pagamento.</div>
            <div className="text-emerald-700 font-semibold pt-1">
              ✓ A confirmação é automática em poucos segundos assim que o pagamento for concluído!
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-2 pt-2">
            <button
              onClick={manualCheck}
              disabled={isChecking}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-70 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Verificando pagamento...' : 'Já realizei o pagamento (Verificar)'}</span>
            </button>

            {siteConfig.phone && (
              <button
                onClick={openWhatsApp}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Avisar a Pizzaria no WhatsApp</span>
              </button>
            )}

            <button
              onClick={() => setActiveOrder(null)}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-800 py-1 transition cursor-pointer"
            >
              Voltar para o cardápio (Pedido salvo em "Meu Pedido")
            </button>
          </div>

          {/* Item 5: Remover qualquer menção ao SigiloPay */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pagamento seguro via Pix com criptografia de ponta a ponta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
