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
  Lock,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import {
  formatPhone,
  formatCEP,
  formatCPF,
  formatCurrency,
  isValidPhone,
  isValidCEP,
} from '../utils/validators';
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

  // 1 = Endereço, 2 = Seus Dados, 3 = Pagamento / Recibo
  const [step, setStep] = useState(1);
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
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepNotice, setCepNotice] = useState(null); // { type: 'success' | 'error', message: string }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  if (!isCheckoutOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === 'phone') formatted = formatPhone(value);
    if (name === 'cep') formatted = formatCEP(value);
    if (name === 'cpf') formatted = formatCPF(value);

    setFormData((prev) => ({ ...prev, [name]: formatted }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }

    if (name === 'cep' && cepNotice) {
      setCepNotice(null);
    }
  };

  const handleCepLookup = async () => {
    const rawCep = formData.cep.replace(/\D/g, '');
    if (!rawCep) return;
    if (rawCep.length !== 8) {
      setErrors((prev) => ({ ...prev, cep: 'CEP incompleto. Digite 8 dígitos.' }));
      return;
    }

    setIsLoadingCep(true);
    setCepNotice(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setCepNotice({ type: 'error', message: 'CEP não encontrado. Confira e tente novamente.' });
        setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado. Confira e tente novamente.' }));
      } else {
        setFormData((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
        setCepNotice({ type: 'success', message: 'Endereço preenchido automaticamente!' });
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.cep;
          return copy;
        });
      }
    } catch {
      // Falha na API: permite preenchimento manual sem travar
      setCepNotice({
        type: 'error',
        message: 'Não foi possível consultar o CEP automaticamente. Preencha seu endereço abaixo.',
      });
    } finally {
      setIsLoadingCep(false);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    const rawCep = formData.cep.replace(/\D/g, '');
    if (!rawCep || rawCep.length !== 8) {
      newErrors.cep = 'CEP obrigatório (8 dígitos)';
    } else if (!isValidCEP(rawCep)) {
      newErrors.cep = 'CEP não encontrado. Confira e tente novamente.';
    }

    if (!formData.street.trim()) newErrors.street = 'Rua / logradouro é obrigatório';
    if (!formData.number.trim()) newErrors.number = 'Número da residência é obrigatório';
    if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const trimmedName = formData.fullName.trim();
    if (!trimmedName || trimmedName.split(' ').filter(Boolean).length < 2) {
      newErrors.fullName = 'Digite seu nome completo (nome e sobrenome)';
    }

    if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Informe um WhatsApp válido com DDD';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdvanceToStep2 = (e) => {
    if (e) e.preventDefault();
    setSubmitError(null);
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleAdvanceToStep3 = (e) => {
    if (e) e.preventDefault();
    setSubmitError(null);
    if (!validateStep2()) return;
    setStep(3);
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
      setStep(1);
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
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-20">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition mr-1 cursor-pointer"
                title="Voltar à etapa anterior"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">
                {step === 1 && 'Endereço de Entrega'}
                {step === 2 && 'Seus Dados de Contato'}
                {step === 3 && 'Conferência do Pedido'}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ambiente Seguro • Sem taxas ocultas</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setStep(1);
            }}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador Visual de Progresso em 3 Etapas */}
        <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5">
          <div className="flex items-center justify-between max-w-md mx-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-1.5 transition cursor-pointer ${
                step === 1 ? 'text-[#D32F2F]' : 'text-emerald-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === 1
                    ? 'bg-[#D32F2F] text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {step > 1 ? '✓' : '1'}
              </span>
              <span>Endereço</span>
            </button>

            <div
              className={`flex-1 h-0.5 mx-2 transition-colors ${
                step > 1 ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            />

            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className={`flex items-center gap-1.5 transition cursor-pointer ${
                step === 2
                  ? 'text-[#D32F2F]'
                  : step > 2
                  ? 'text-emerald-700'
                  : 'text-gray-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === 2
                    ? 'bg-[#D32F2F] text-white'
                    : step > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > 2 ? '✓' : '2'}
              </span>
              <span>Seus Dados</span>
            </button>

            <div
              className={`flex-1 h-0.5 mx-2 transition-colors ${
                step === 3 ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            />

            <button
              type="button"
              onClick={() => {
                if (validateStep1() && validateStep2()) setStep(3);
              }}
              className={`flex items-center gap-1.5 transition cursor-pointer ${
                step === 3 ? 'text-[#D32F2F]' : 'text-gray-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === 3
                    ? 'bg-[#D32F2F] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                3
              </span>
              <span>Pagamento</span>
            </button>
          </div>
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

        {/* ========================================================= */}
        {/* ETAPA 1 — ENDEREÇO                                        */}
        {/* ========================================================= */}
        {step === 1 && (
          <form onSubmit={handleAdvanceToStep2} className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#D32F2F]" />
                <span>Onde entregamos sua pizza?</span>
              </h4>
              <span className="text-[11px] text-gray-500 font-medium">Etapa 1 de 3</span>
            </div>

            {/* CEP com busca automática ViaCEP */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                CEP * <span className="text-gray-400 font-normal">(Preenchimento automático do endereço)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  onBlur={handleCepLookup}
                  placeholder="00000-000"
                  maxLength={9}
                  className={`flex-1 px-3 py-2.5 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${
                    errors.cep ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleCepLookup}
                  disabled={isLoadingCep}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {isLoadingCep ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <span>Buscar CEP</span>
                  )}
                </button>
              </div>

              {errors.cep && (
                <p className="text-red-500 text-[11px] mt-1 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.cep}
                </p>
              )}
              {cepNotice && cepNotice.type === 'success' && (
                <p className="text-emerald-600 text-[11px] mt-1 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {cepNotice.message}
                </p>
              )}
              {cepNotice && cepNotice.type === 'error' && !errors.cep && (
                <p className="text-amber-600 text-[11px] mt-1 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {cepNotice.message}
                </p>
              )}
            </div>

            {/* Rua e Número */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Rua / Logradouro *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Nome da sua rua / avenida"
                  className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${
                    errors.street ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
                  }`}
                />
                {errors.street && <p className="text-red-500 text-[11px] mt-0.5">{errors.street}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Número *</label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="123"
                  className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${
                    errors.number ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
                  }`}
                />
                {errors.number && <p className="text-red-500 text-[11px] mt-0.5">{errors.number}</p>}
              </div>
            </div>

            {/* Complemento e Bairro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Complemento <span className="text-gray-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  name="complement"
                  value={formData.complement}
                  onChange={handleInputChange}
                  placeholder="Apto, Bloco, Casa fundos"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Bairro *</label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  placeholder="Seu bairro"
                  className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${
                    errors.neighborhood ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
                  }`}
                />
                {errors.neighborhood && <p className="text-red-500 text-[11px] mt-0.5">{errors.neighborhood}</p>}
              </div>
            </div>

            {/* Cidade e Estado */}
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
                    errors.city ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
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

            {/* Aviso de Frete Grátis e Tempo */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">Entrega própria / rastreada</span>
              </div>
              <span className="font-extrabold uppercase text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                Frete Grátis
              </span>
            </div>

            {/* Ação: Continuar para Dados */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
              >
                <span>Continuar para Dados</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* ETAPA 2 — DADOS PESSOAIS                                  */}
        {/* ========================================================= */}
        {step === 2 && (
          <form onSubmit={handleAdvanceToStep3} className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#D32F2F]" />
                <span>Quem receberá o pedido?</span>
              </h4>
              <span className="text-[11px] text-gray-500 font-medium">Etapa 2 de 3</span>
            </div>

            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nome Completo * <span className="text-gray-400 font-normal">(Identificação na entrega)</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Ex: Carlos Eduardo Silva"
                className={`w-full px-3 py-2.5 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${
                  errors.fullName ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
                }`}
              />
              {errors.fullName && <p className="text-red-500 text-[11px] mt-0.5">{errors.fullName}</p>}
            </div>

            {/* WhatsApp e CPF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  WhatsApp / Telefone * <span className="text-gray-400 font-normal">(com DDD)</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className={`w-full px-3 py-2.5 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none ${
                    errors.phone ? 'border-red-500 bg-red-50/30' : 'border-gray-200'
                  }`}
                />
                {errors.phone ? (
                  <p className="text-red-500 text-[11px] mt-0.5 font-semibold">{errors.phone}</p>
                ) : (
                  <p className="text-[11px] text-gray-400 mt-0.5">Enviaremos o status do pedido via WhatsApp</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  CPF <span className="text-gray-400 font-normal">(Opcional na nota)</span>
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Resumo do Endereço preenchido na Etapa 1 */}
            <div className="bg-gray-50 border border-gray-200/70 rounded-xl p-3 text-xs text-gray-600 flex items-start justify-between">
              <div>
                <span className="font-bold text-gray-800 block mb-0.5">Entregar em:</span>
                <span>
                  {formData.street}, {formData.number}
                  {formData.complement ? ` (${formData.complement})` : ''} - {formData.neighborhood}, {formData.city}/{formData.state}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[#D32F2F] font-bold text-xs hover:underline shrink-0 ml-2 cursor-pointer"
              >
                Alterar
              </button>
            </div>

            {/* Botões: Voltar e Avançar para Revisão */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="submit"
                className="flex-1 bg-[#D32F2F] hover:bg-[#B71C1C] text-white py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
              >
                <span>Revisar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* ETAPA 3 — PAGAMENTO / RECIBO                              */}
        {/* ========================================================= */}
        {step === 3 && (
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
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>CLIENTE</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[#D32F2F] font-bold lowercase hover:underline cursor-pointer"
                  >
                    editar
                  </button>
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
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>ENTREGA</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[#D32F2F] font-bold lowercase hover:underline cursor-pointer"
                  >
                    editar
                  </button>
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

            {/* Microfeedbacks de Confiança */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 space-y-1 text-xs text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ambiente Seguro • Sem taxas ocultas</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                • Seu pedido começa a ser preparado assim que o Pix for confirmado.
              </p>
              <p className="text-[11px] text-emerald-800">
                • Entrega própria e rastreada direto até o seu endereço.
              </p>
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
                    <span>Gerar Pix e Concluir Pedido • {formatCurrency(subtotal)}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Voltar para Editar Dados</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
