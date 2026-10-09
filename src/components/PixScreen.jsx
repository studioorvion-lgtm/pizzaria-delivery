import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, QrCode, ShieldCheck, RefreshCw, MessageSquare, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/validators';

export default function PixScreen() {
  const { activeOrder, setActiveOrder, setPaidOrder } = useCart();
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);

  if (!activeOrder || activeOrder.paymentMethod !== 'pix') return null;

  const pixCode = activeOrder.pix?.code || '';
  const qrCodeImage =
    activeOrder.pix?.qrCodeImage ||
    (pixCode
      ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(pixCode)}`
      : '');

  // Contador regressivo de 15 minutos
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Polling automático a cada 3.5 segundos para checar se foi pago
  useEffect(() => {
    const pollId = setInterval(async () => {
      try {
        const idToCheck = activeOrder.orderId || activeOrder.transactionId;
        const res = await fetch(`/api/status?id=${encodeURIComponent(idToCheck)}`);
        const data = await res.json();

        if (data.success && data.isPaid) {
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

  const copyToClipboard = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const manualCheck = async () => {
    setIsChecking(true);
    try {
      const idToCheck = activeOrder.orderId || activeOrder.transactionId;
      const res = await fetch(`/api/status?id=${encodeURIComponent(idToCheck)}`);
      const data = await res.json();

      if (data.success && data.isPaid) {
        setPaidOrder({
          ...activeOrder,
          status: 'PAID',
          paidAmount: data.paidAmount || activeOrder.total,
          paidAt: data.paidAt || new Date().toISOString(),
        });
        setActiveOrder(null);
      } else {
        alert('Pagamento ainda não identificado no sistema SigiloPay. Por favor, aguarde alguns instantes após transferir.');
      }
    } catch {
      alert('Erro ao consultar status. Tente novamente em instantes.');
    } finally {
      setIsChecking(false);
    }
  };

  const openWhatsApp = () => {
    const msg = `Olá, Donatello Pizzaria! Acabei de fazer o pedido #${activeOrder.orderId} no valor de ${formatCurrency(
      activeOrder.total
    )} via Pix SigiloPay. Poderiam confirmar o envio para ${activeOrder.address?.street}, nº ${
      activeOrder.address?.number
    }?`;
    window.open(`https://wa.me/5511998765432?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative max-h-[95vh] overflow-y-auto">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-red-600 to-[#D32F2F] text-white p-4 sm:p-5 text-center relative">
          <button
            onClick={() => setActiveOrder(null)}
            className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-xs">
            <QrCode className="w-6 h-6 text-white" />
          </div>

          <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
            Pague com o PIX
          </h3>
          <p className="text-xs text-red-100 mt-0.5">
            Pedido <strong className="text-white font-mono">#{activeOrder.orderId}</strong> • Aprovação Imediata
          </p>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 text-center">
          {/* QR Code Container */}
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 inline-block mx-auto max-w-xs shadow-inner">
            {qrCodeImage ? (
              <img
                src={qrCodeImage}
                alt="QR Code Pix SigiloPay"
                className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain rounded-lg bg-white p-2 shadow-xs"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                <span>Carregando QR Code...</span>
              </div>
            )}

            <div className="mt-2 text-xs font-bold text-gray-700">
              Valor: <span className="text-[#D32F2F] text-sm font-extrabold">{formatCurrency(activeOrder.total)}</span>
            </div>
          </div>

          {/* Pix Copia e Cola */}
          {pixCode && (
            <div className="space-y-2 text-left">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Pix Copia e Cola:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixCode}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 truncate select-all"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D32F2F] hover:bg-[#B71C1C] text-white shadow-xs'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Timer de expiração */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200/60 py-2 px-3 rounded-xl font-medium">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              O código expira em <strong className="font-mono">{timeFormatted}</strong>. Pague para iniciar o preparo.
            </span>
          </div>

          {/* Passos de instrução */}
          <div className="bg-gray-50 rounded-xl p-3 text-left text-xs text-gray-600 space-y-1">
            <div className="font-bold text-gray-800 mb-1">Como pagar:</div>
            <div>1. Abra o app do seu banco ou carteira digital.</div>
            <div>2. Escolha a opção <strong>PIX &gt; Pix Copia e Cola</strong> (ou escaneie o QR Code).</div>
            <div>3. Cole o código copiado e confirme a transferência.</div>
            <div className="text-emerald-700 font-semibold pt-1">
              ✓ Nosso sistema detecta o pagamento automaticamente em poucos segundos!
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
              <span>{isChecking ? 'Verificando com SigiloPay...' : 'Já realizei o pagamento (Verificar)'}</span>
            </button>

            <button
              onClick={openWhatsApp}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Avisar a Pizzaria no WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Processado com segurança pelo Gateway SigiloPay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
