import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  QrCode,
  Loader2,
  AlertCircle,
  Receipt,
  ArrowRight,
  ArrowLeft,
  Edit3,
  Clock,
  MapPin,
  User,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPhone, formatCEP, formatCurrency } from '../utils/validators';
import { siteConfig } from '../config/site';

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function CheckoutModal() {
  const {
    items,
    subtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setActiveOrder,
    clearCart,
  } = useCart();

  const [step, setStep] = useState('form'); // 'form' | 'receipt'
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    cpf: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  if (!isCheckoutOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === 'phone') formatted = formatPhone(value);
    if (name === 'cep') formatted = formatCEP(value);

    setFormData((prev) => ({ ...prev, [name]: formatted }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleCepBlur = async () => {
    const rawCep = formData.cep.replace(/\D/g, '');
    if (rawCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      } catch {}
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Digite seu nome completo (ao menos 2 palavras)';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      newErrors.phone = 'Telefone/WhatsApp com DDD é obrigatório';
    }

    // Item 7: CPF é estritamente OPCIONAL no checkout inicial
    if (!formData.street.trim()) newErrors.street = 'Endereço obrigatório';
    if (!formData.number.trim()) newErrors.number = 'Número obrigatório';
    if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToReview = (e) => {
    if (e) e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setStep('receipt');
  };

  const handleConfirmPayment = async () => {
    setSubmitError(null);

    try {
      setIsSubmitting(true);

      const payload = {
        items,
        customer: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          cpf: formData.cpf ? formData.cpf.replace(/\D/g, '') : '',
          email: 'pedido@donatellopizza.com.br',
        },
        address: {
          cep: formData.cep,
          street: formData.street.trim(),
          number: formData.number.trim(),
          complement: formData.complement.trim(),
          neighborhood: formData.neighborhood.trim(),
          city: formData.city.trim(),
          state: formData.state,
        },
        paymentMethod: 'pix',
        idempotencyKey: `${formData.phone}_${Date.now().toString().slice(0, 8)}`,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao processar pedido no gateway de pagamento.');
      }

      // Sucesso
      setIsCheckoutOpen(false);
      clearCart();
      setStep('form');
      setActiveOrder({
        ...data,
        customer: payload.customer,
        address: payload.address,
        items,
      });
    } catch (err) {
      setSubmitError(err.message || 'Falha de comunicação ao gerar o Pix. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col relative">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          {step === 'form' ? (
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">Finalizar Pedido</h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ambiente 100% Seguro • Pagamento Instantâneo</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition mr-1 cursor-pointer"
                title="Voltar para editar dados"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-extrabold text-gray-900 text-lg">Resumo do Pedido</h3>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-0.5">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Confira os dados antes de pagar</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setStep('form');
            }}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitError && (
          <div className="mx-4 sm:mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Aviso:</p>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        {/* ETAPA 1: Formulário de Contato e Endereço */}
        {step === 'form' && (
          <form onSubmit={handleProceedToReview} className="p-4 sm:p-6 space-y-5">
            {/* 1. Dados Pessoais */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#D32F2F] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Dados de Contato
              </h4>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${
                    errors.fullName ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
                  }`}
                />
                {errors.fullName && <p className="text-red-500 text-[11px] mt-0.5">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${
                      errors.phone ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-[11px] mt-0.5">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    CPF <span className="text-gray-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00 (Opcional)"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Endereço de Entrega */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#D32F2F] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Endereço de Entrega
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">CEP</label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rua / Logradouro *</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    placeholder="Nome da sua rua / avenida"
                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${
                      errors.street ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.street && <p className="text-red-500 text-[11px] mt-0.5">{errors.street}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Número *</label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder="123"
                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${
                      errors.number ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.number && <p className="text-red-500 text-[11px] mt-0.5">{errors.number}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    name="complement"
                    value={formData.complement}
                    onChange={handleInputChange}
                    placeholder="Apto, Bloco (opcional)"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bairro *</label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    placeholder="Seu bairro"
                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${
                      errors.neighborhood ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.neighborhood && <p className="text-red-500 text-[11px] mt-0.5">{errors.neighborhood}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cidade *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Sua cidade"
                    className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${
                      errors.city ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.city && <p className="text-red-500 text-[11px] mt-0.5">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estado *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    {BRAZILIAN_STATES.map((uf) => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Forma de Pagamento - SOMENTE PIX */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#D32F2F] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Forma de Pagamento
              </h4>

              <div className="p-3.5 rounded-xl border border-[#D32F2F] bg-red-50/40 ring-1 ring-[#D32F2F] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D32F2F] text-white flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-extrabold text-gray-900">Pix</span>
                      <span className="text-[10px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                        APROVAÇÃO INSTANTÂNEA
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      QR Code e código Copia e Cola gerados na próxima etapa
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo e Botão Avançar para Revisão */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-gray-600">Total a Pagar (com Envio Grátis):</span>
                <span className="text-lg font-black text-[#D32F2F]">{formatCurrency(subtotal)}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
              >
                <Receipt className="w-4 h-4" />
                <span>Revisar Pedido • {formatCurrency(subtotal)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ETAPA 2: Resumo do Pedido Tipo Recibo */}
        {step === 'receipt' && (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Bloco Visual de Recibo */}
            <div className="bg-gradient-to-b from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs text-xs sm:text-sm text-gray-800 space-y-4 font-sans relative overflow-hidden">
              {/* Topo do Recibo */}
              <div className="text-center pb-3 border-b-2 border-dashed border-gray-300">
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#006437] tracking-wider mb-0.5">
                  <Receipt className="w-4 h-4 text-[#006437]" />
                  <span>{siteConfig.name}</span>
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight">
                  Conferência do Pedido
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Revise todos os dados antes de prosseguir para o pagamento
                </p>
              </div>

              {/* Seção 1: CLIENTE */}
              <div className="space-y-1.5 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-gray-500">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>CLIENTE</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-500 font-medium">Nome:</span>
                  <span className="font-bold text-gray-900">{formData.fullName}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-500 font-medium">WhatsApp / Telefone:</span>
                  <span className="font-bold text-gray-900">{formData.phone}</span>
                </div>
                {formData.cpf && (
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-500 font-medium">CPF:</span>
                    <span className="font-bold text-gray-700">{formData.cpf}</span>
                  </div>
                )}
              </div>

              {/* Seção 2: ENTREGA */}
              <div className="space-y-1.5 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>ENTREGA</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-800 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500 font-medium">Endereço:</span>
                    <span className="font-bold text-gray-900 text-right">
                      {formData.street}, {formData.number}
                      {formData.complement ? ` (${formData.complement})` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Bairro:</span>
                    <span className="font-semibold text-gray-900">{formData.neighborhood}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Cidade/UF:</span>
                    <span className="font-semibold text-gray-900">{formData.city}/{formData.state}</span>
                  </div>
                  {formData.cep && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-medium">CEP:</span>
                      <span className="font-semibold text-gray-900">{formData.cep}</span>
                    </div>
                  )}
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-center justify-between text-xs text-emerald-800 mt-2 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Previsão de entrega:</span>
                  </span>
                  <span className="font-bold text-emerald-900">{siteConfig.deliveryTime}</span>
                </div>
              </div>

              {/* Seção 3: PEDIDO */}
              <div className="space-y-2 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-gray-500">
                  <Receipt className="w-3.5 h-3.5 text-gray-400" />
                  <span>ITENS DO PEDIDO</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="py-2 flex items-start justify-between gap-3 text-xs sm:text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900">
                          <span className="text-[#D32F2F] font-extrabold mr-1.5">{item.quantity}x</span>
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-[11px] text-gray-500 uppercase tracking-wide mt-0.5">
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

              {/* Seção 4: RESUMO FINANCEIRO */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                  RESUMO FINANCEIRO
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-500">Subtotal dos Itens:</span>
                  <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-500">Taxa de Entrega:</span>
                  <span className="font-bold text-emerald-600 uppercase">Grátis</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-500">Desconto:</span>
                  <span className="font-medium text-gray-400">R$ 0,00</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-gray-300 text-sm sm:text-base">
                  <span className="font-bold text-gray-900">Total Final:</span>
                  <span className="font-black text-[#D32F2F] text-lg sm:text-xl">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
                  <span>Forma de pagamento:</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-[#D32F2F]" />
                    <span>Pix Instantâneo</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Botões de Ação do Recibo */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isSubmitting}
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] active:bg-[#9a1414] text-white py-3.5 px-4 rounded-xl font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition disabled:opacity-70 cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando Cobrança Pix...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Continuar para Pagamento • {formatCurrency(subtotal)}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('form')}
                disabled={isSubmitting}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Dados / Pedido</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
