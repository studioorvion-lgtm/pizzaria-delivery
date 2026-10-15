import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  QrCode,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  MapPin,
  User,
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

  // Etapa 1 = Endereço, Etapa 2 = Dados
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('donatello_checkout_form');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
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
    };
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

    setFormData((prev) => {
      const updated = { ...prev, [name]: formatted };
      try {
        localStorage.setItem('donatello_checkout_form', JSON.stringify(updated));
      } catch {}
      return updated;
    });

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

  const handleCepLookup = async (cepOverride) => {
    let rawCep = '';
    if (typeof cepOverride === 'string') {
      rawCep = cepOverride.replace(/\D/g, '');
    } else {
      rawCep = (formData.cep || '').replace(/\D/g, '');
    }

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
        setFormData((prev) => {
          const updated = {
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          };
          try {
            localStorage.setItem('donatello_checkout_form', JSON.stringify(updated));
          } catch {}
          return updated;
        });

        setCepNotice({ type: 'success', message: 'Endereço preenchido automaticamente!' });
        setErrors((prev) => {
          const copy = { ...prev };
          delete copy.cep;
          return copy;
        });
      }
    } catch {
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

  const handleGeneratePix = async (e) => {
    if (e) e.preventDefault();
    setSubmitError(null);
    if (!validateStep2()) return;

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

      // Sucesso: fecha o checkout e vai DIRETAMENTE para a Etapa 3 (Pagamento Pix)
      setIsCheckoutOpen(false);
      clearCart();
      setActiveOrder({
        ...data,
        customer: payload.customer,
        address: payload.address,
        items,
        total: subtotal,
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
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition mr-1 cursor-pointer"
                title="Voltar para Endereço"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">
                {step === 1 ? 'Endereço de Entrega' : 'Seus Dados de Contato'}
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
            }}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador Visual de Progresso: [1 Endereço] → [2 Dados] → [3 Pagamento] */}
        <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5">
          <div className="flex items-center justify-between max-w-xs mx-auto text-xs font-bold">
            {/* 1. Endereço */}
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

            {/* 2. Dados */}
            <div
              className={`flex items-center gap-1.5 transition ${
                step === 2 ? 'text-[#D32F2F]' : 'text-gray-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  step === 2
                    ? 'bg-[#D32F2F] text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </span>
              <span>Dados</span>
            </div>

            <div className="flex-1 h-0.5 mx-2 bg-gray-200" />

            {/* 3. Pagamento */}
            <div className="flex items-center gap-1.5 text-gray-400">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-gray-200 text-gray-500">
                3
              </span>
              <span>Pagamento</span>
            </div>
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

            {/* Ação: Continuar */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* ETAPA 2 — DADOS PESSOAIS                                  */}
        {/* ========================================================= */}
        {step === 2 && (
          <form onSubmit={handleGeneratePix} className="p-4 sm:p-6 space-y-4">
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

            {/* Botões: Voltar e Gerar Pix e Ir para Pagamento */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#D32F2F] hover:bg-[#B71C1C] active:bg-[#9a1414] text-white py-3.5 px-4 rounded-xl font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition disabled:opacity-70 cursor-pointer active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando Pix...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>Gerar Pix e Ir para Pagamento • {formatCurrency(subtotal)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
