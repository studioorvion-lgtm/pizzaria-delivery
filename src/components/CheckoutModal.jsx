import React, { useState } from 'react';
import { X, ShieldCheck, QrCode, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPhone, formatCEP, formatCurrency } from '../utils/validators';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

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
        paymentMethod: 'pix', // Item 6: Somente PIX
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
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg">Finalizar Pedido</h3>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ambiente 100% Seguro • Pagamento Instantâneo</span>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Aviso:</p>
                <p>{submitError}</p>
              </div>
            </div>
          )}

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

            {/* Opção Pix Única e Exclusiva */}
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
                    QR Code e código Copia e Cola gerados na hora
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo e Botão Final */}
          <div className="pt-3 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-gray-600">Total a Pagar (com Envio Grátis):</span>
              <span className="text-lg font-black text-[#D32F2F]">{formatCurrency(subtotal)}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition disabled:opacity-70 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando Cobrança Pix...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>Gerar Código Pix • {formatCurrency(subtotal)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
