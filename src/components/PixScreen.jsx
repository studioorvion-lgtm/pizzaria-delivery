import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Clock,
  QrCode,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
  X,
  AlertCircle,
  MapPin,
  User,
  ShoppingBag,
  Zap,
} from 'lucide-react';
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

  const whatsappMsg = `Olá, ${siteConfig.name}! Gostaria de tirar uma dúvida sobre o meu pedido #${activeOrder.orderId} no valor de ${formatCurrency(activeOrder.total)}.`;
  const whatsappUrl = siteConfig.getWhatsAppLink(whatsappMsg);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative max-h-[95vh] overflow-y-auto">
        {/* ========================================================= */}
        {/* 1. RESUMO CLARO DO PEDIDO NO TOPO                         */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-red-600 to-[#D32F2F] text-white p-4 sm:p-5 text-center relative">
          <button
            onClick={() => setActiveOrder(null)}
            className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-11 h-11 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-xs">
            <QrCode className="w-6 h-6 text-white" />
          </div>

          <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
            Pagamento via Pix
          </h3>
          <div className="flex items-center justify-center gap-2 mt-1 text-xs">
            <span>Pedido <strong className="font-mono">#{activeOrder.orderId}</strong></span>
            <span className="text-white/40">•</span>
            <span className="bg-amber-400 text-gray-900 px-2 py-0.5 rounded-full font-extrabold text-[11px] shadow-2xs">
              Aguardando Pagamento
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 text-center">
          {checkError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{checkError}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. VALOR TOTAL EM DESTAQUE GRANDE E LEGÍVEL               */}
          {/* ========================================================= */}
          <div className="bg-red-50/50 border border-red-100 rounded-xl py-3 px-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Valor Total do Pedido
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#D32F2F] tracking-tight">
              {formatCurrency(activeOrder.total)}
            </span>
            <span className="block text-[11px] text-gray-500 mt-0.5">
              Entrega Grátis inclusa
            </span>
          </div>

          {/* ========================================================= */}
          {/* 3. QR CODE CENTRALIZADO COM BORDA SUAVE E FUNDO BRANCO    */}
          {/* ========================================================= */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 inline-block mx-auto max-w-xs shadow-inner">
            {qrCodeImage ? (
              <img
                src={qrCodeImage}
                alt="QR Code Pix"
                className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain rounded-xl bg-white p-2 shadow-xs border border-gray-100"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-xs">
                <span>Carregando QR Code...</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-amber-700 font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Código expira em: <strong className="font-mono">{timeFormatted}</strong></span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 4. CÓDIGO COPIA E COLA & 5. BOTÃO GRANDE 'COPIAR PIX'     */}
          {/* ========================================================= */}
          {pixCode ? (
            <div className="space-y-2 text-left">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Pix Copia e Cola:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixCode}
                  onClick={(e) => e.target.select()}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono text-gray-700 truncate select-all focus:outline-none focus:ring-1 focus:ring-red-400"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className={`py-3 px-5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer active:scale-95 shadow-md ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#D32F2F] hover:bg-[#B71C1C] text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>CÓDIGO COPIADO!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>COPIAR CÓDIGO PIX</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs text-left">
              Não foi possível carregar o código Pix. Tente novamente.
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

          {/* ========================================================= */}
          {/* 6. INSTRUÇÃO SIMPLES EM PASSOS NUMERADOS                  */}
          {/* ========================================================= */}
          <div className="bg-gray-50 border border-gray-200/70 rounded-xl p-3.5 text-left text-xs text-gray-700 space-y-1.5">
            <div className="font-extrabold text-gray-900 mb-1 flex items-center gap-1.5">
              <span>Como pagar com Pix:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 font-medium">
              <li>Abra o aplicativo do seu banco</li>
              <li>Escolha pagar via Pix</li>
              <li>Selecione Copia e Cola ou aponte a câmera para o QR Code</li>
              <li>Cole o código e confirme o pagamento</li>
              <li>Retorne a esta tela para acompanhar a confirmação automática</li>
            </ol>
          </div>

          {/* ========================================================= */}
          {/* 7. AVISO DE APROVAÇÃO AUTOMÁTICA                          */}
          {/* ========================================================= */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-2.5 text-left text-xs text-emerald-900">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="font-semibold">
              Identificação automática em até 1 minuto após o pagamento.
            </div>
          </div>

          {/* ========================================================= */}
          {/* 8. IDENTIFICADOR DO PEDIDO COM CLIENTE, ITENS E ENDEREÇO  */}
          {/* ========================================================= */}
          <div className="bg-white border border-gray-200 rounded-xl p-3.5 text-left text-xs space-y-2.5 shadow-2xs">
            <div className="font-black text-gray-800 uppercase tracking-wider text-[11px] pb-1 border-b border-gray-100 flex items-center justify-between">
              <span>Dados do Pedido</span>
              <span className="text-gray-400 font-mono">#{activeOrder.orderId}</span>
            </div>

            {/* Cliente */}
            {activeOrder.customer && (
              <div className="flex items-start gap-2 text-gray-700">
                <User className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-gray-900">{activeOrder.customer.fullName}</span>
                  {activeOrder.customer.phone && (
                    <span className="text-gray-500 text-[11px] block">{activeOrder.customer.phone}</span>
                  )}
                </div>
              </div>
            )}

            {/* Endereço */}
            {activeOrder.address && (
              <div className="flex items-start gap-2 text-gray-700">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <span className="font-semibold text-gray-900">
                    {activeOrder.address.street}, {activeOrder.address.number}
                    {activeOrder.address.complement ? ` (${activeOrder.address.complement})` : ''}
                  </span>
                  <span className="text-gray-500 block">
                    {activeOrder.address.neighborhood} - {activeOrder.address.city}/{activeOrder.address.state}
                  </span>
                </div>
              </div>
            )}

            {/* Itens */}
            {Array.isArray(activeOrder.items) && activeOrder.items.length > 0 && (
              <div className="pt-1.5 border-t border-gray-100 space-y-1">
                <div className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" />
                  <span>Itens solicitados:</span>
                </div>
                <div className="space-y-1">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-gray-700">
                      <span>
                        <strong className="text-[#D32F2F] font-bold mr-1">{item.quantity}x</strong>
                        {item.name}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* 9. TEMPO ESTIMADO DE ENTREGA                              */}
          {/* ========================================================= */}
          <div className="bg-gray-50 border border-gray-200/70 rounded-xl p-3 flex items-center justify-between text-xs text-gray-700">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>Tempo estimado de entrega:</span>
            </span>
            <span className="font-extrabold text-gray-900">
              35 a 50 minutos após confirmação
            </span>
          </div>

          {/* ========================================================= */}
          {/* 10. SUPORTE / DÚVIDAS & AÇÕES                             */}
          {/* ========================================================= */}
          <div className="space-y-2 pt-1">
            <button
              onClick={manualCheck}
              disabled={isChecking}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-70 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Verificando pagamento no banco...' : 'Já realizei o pagamento (Verificar)'}</span>
            </button>

            {/* Suporte WhatsApp: se configurado, exibe botão; se não, oculta de forma elegante */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Falar com a pizzaria no WhatsApp</span>
              </a>
            )}

            <p className="text-[11px] text-gray-400">
              Atendimento todos os dias das 18h às 23h30
            </p>

            <button
              onClick={() => setActiveOrder(null)}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-800 py-1 transition cursor-pointer"
            >
              Voltar para o cardápio (Pedido salvo em "Meu Pedido")
            </button>
          </div>

          {/* Microfeedback de segurança final */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ambiente seguro com criptografia de ponta a ponta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
