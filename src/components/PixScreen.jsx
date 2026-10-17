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
  Receipt,
  Edit3,
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

  const handleCorrectData = () => {
    setIsCheckoutOpen(true);
    setActiveOrder(null);
  };

  const whatsappMsg = `Olá, ${siteConfig.name}! Gostaria de tirar uma dúvida sobre o meu pedido #${activeOrder.orderId} no valor de ${formatCurrency(activeOrder.total)}.`;
  const whatsappUrl = siteConfig.getWhatsAppLink(whatsappMsg);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative max-h-[95vh] overflow-y-auto">
        {/* Indicador Visual de Progresso: [1 Endereço] → [2 Dados] → [3 Pagamento] */}
        <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5">
          <div className="flex items-center justify-between max-w-xs mx-auto text-xs font-bold">
            {/* 1. Endereço */}
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-emerald-600 text-white">
                ✓
              </span>
              <span>Endereço</span>
            </div>

            <div className="flex-1 h-0.5 mx-2 bg-emerald-500" />

            {/* 2. Dados */}
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-emerald-600 text-white">
                ✓
              </span>
              <span>Dados</span>
            </div>

            <div className="flex-1 h-0.5 mx-2 bg-emerald-500" />

            {/* 3. Pagamento (Ativo) */}
            <div className="flex items-center gap-1.5 text-[#D32F2F]">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-[#D32F2F] text-white">
                3
              </span>
              <span>Pagamento</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 1. DONATELLO PIZZARIA ARTESANAL & 2. STATUS DO PEDIDO     */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-red-600 to-[#D32F2F] text-white p-4 sm:p-5 text-center relative">
          <button
            onClick={() => setActiveOrder(null)}
            className="absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-red-100 tracking-wider mb-1">
            <QrCode className="w-4 h-4 text-white" />
            <span>{siteConfig.name}</span>
          </div>

          <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
            Pagamento via Pix
          </h3>

          <div className="flex items-center justify-center gap-2 mt-1.5 text-xs">
            <span>Pedido <strong className="font-mono">#{activeOrder.orderId}</strong></span>
            <span className="text-white/40">•</span>
            <span className="bg-amber-400 text-gray-900 px-2 py-0.5 rounded-full font-extrabold text-[11px] shadow-2xs">
              Aguardando pagamento
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
          {/* 3. VALOR TOTAL EM DESTAQUE                                */}
          {/* ========================================================= */}
          <div className="bg-red-50/50 border border-red-100 rounded-xl py-3 px-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Valor Total do Pedido
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#D32F2F] tracking-tight">
              {formatCurrency(activeOrder.total)}
            </span>
            <span className="block text-[11px] text-gray-500 mt-0.5">
              Taxa de entrega: <strong className="text-emerald-600 uppercase">Grátis</strong>
            </span>
          </div>

          {/* ========================================================= */}
          {/* 4. QR CODE CENTRALIZADO COM BORDA SUAVE E FUNDO BRANCO    */}
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
          {/* 5. CÓDIGO PIX COPIA E COLA & 6. BOTÃO 'COPIAR CÓDIGO PIX' */}
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
          {/* 7. INSTRUÇÕES 'COMO PAGAR'                                */}
          {/* ========================================================= */}
          <div className="bg-gray-50 border border-gray-200/70 rounded-xl p-3.5 text-left text-xs text-gray-700 space-y-1.5">
            <div className="font-extrabold text-gray-900 mb-1 flex items-center gap-1.5">
              <span>Como pagar:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 font-medium">
              <li>Abra o app do seu banco</li>
              <li>Escolha pagar via Pix</li>
              <li>Selecione Copia e Cola ou aponte a câmera para o QR Code</li>
              <li>Cole o código e confirme</li>
              <li>Retorne a esta tela para acompanhar a confirmação automática</li>
            </ol>
            <div className="pt-1.5 flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
              <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Identificação automática em até 1 minuto após o pagamento.</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 8. RECIBO / RESUMO DO PEDIDO (ABAIXO DO PIX NA MESMA TELA) */}
          {/* ========================================================= */}
          <div className="bg-gradient-to-b from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-4 text-left text-xs text-gray-800 space-y-3 shadow-xs">
            {/* Topo do Recibo */}
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-200">
              <div className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#D32F2F]" />
                <span className="font-black text-gray-900 uppercase tracking-tight text-xs">
                  Recibo do Pedido
                </span>
                <span className="font-mono text-gray-500 font-bold">#{activeOrder.orderId}</span>
              </div>
              <button
                type="button"
                onClick={handleCorrectData}
                className="text-[#D32F2F] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                title="Editar endereço ou dados"
              >
                <Edit3 className="w-3 h-3" />
                <span>Corrigir meus dados</span>
              </button>
            </div>

            {/* Dados do Cliente */}
            {activeOrder.customer && (
              <div className="space-y-1 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-gray-400">
                  <User className="w-3 h-3 text-gray-400" />
                  <span>CLIENTE</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Nome:</span>
                  <span className="font-bold text-gray-900">{activeOrder.customer.fullName}</span>
                </div>
                {activeOrder.customer.phone && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Telefone:</span>
                    <span className="font-bold text-gray-900">{activeOrder.customer.phone}</span>
                  </div>
                )}
                {activeOrder.customer.cpf && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">CPF:</span>
                    <span className="font-semibold text-gray-700">{activeOrder.customer.cpf}</span>
                  </div>
                )}
              </div>
            )}

            {/* Endereço de Entrega */}
            {activeOrder.address && (
              <div className="space-y-1 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-gray-400">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>ENDEREÇO COMPLETO</span>
                </div>
                <div className="text-xs text-gray-800 space-y-0.5">
                  <div className="font-semibold text-gray-900">
                    {activeOrder.address.street}, {activeOrder.address.number}
                    {activeOrder.address.complement ? ` (${activeOrder.address.complement})` : ''}
                  </div>
                  <div className="text-gray-600 text-[11px]">
                    {activeOrder.address.neighborhood} - {activeOrder.address.city}/{activeOrder.address.state}
                    {activeOrder.address.cep ? ` • CEP: ${activeOrder.address.cep}` : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Itens do Pedido */}
            {Array.isArray(activeOrder.items) && activeOrder.items.length > 0 && (
              <div className="space-y-1.5 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-gray-400">
                  <ShoppingBag className="w-3 h-3 text-gray-400" />
                  <span>ITENS &amp; QUANTIDADES</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex items-start justify-between gap-2 text-xs">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900">
                          <span className="text-[#D32F2F] font-extrabold mr-1.5">{item.quantity}x</span>
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wide">
                            {item.description}
                          </div>
                        )}
                      </div>
                      <div className="font-extrabold text-gray-900 shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo Financeiro */}
            <div className="space-y-1 pt-1 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal:</span>
                <span className="font-medium text-gray-800">{formatCurrency(activeOrder.total)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Taxa de Entrega:</span>
                <span className="font-bold text-emerald-600 uppercase">Grátis</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Desconto:</span>
                <span className="font-medium text-gray-400">R$ 0,00</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-300 text-sm font-bold">
                <span className="text-gray-900">Total a Pagar:</span>
                <span className="text-base font-black text-[#D32F2F]">{formatCurrency(activeOrder.total)}</span>
              </div>
            </div>

            {/* Previsão de Entrega */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-center justify-between text-xs text-emerald-900 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tempo estimado de entrega:</span>
              </span>
              <span className="font-extrabold text-emerald-900">20 a 45 min após confirmação</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 9. INFORMAÇÕES DE SUPORTE & AÇÕES                         */}
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

            {/* Suporte WhatsApp */}
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
              Atendimento e delivery 24 horas todos os dias
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
