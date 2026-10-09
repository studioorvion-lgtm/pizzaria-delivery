/**
 * Configurações centrais do site e dados comerciais
 * Evita hardcode e permite configuração única
 */

export const siteConfig = {
  name: 'Donatello Pizzaria Artesanal',
  tagline: 'A verdadeira pizza artesanal na sua casa • Massa de fermentação lenta',
  deliveryCoverage: 'Entrega para todo o Brasil',
  deliveryTime: 'até 30 min',
  
  // Telefone centralizado configurável por variável de ambiente
  phone: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTACT_PHONE) || '',
  phoneDisplay: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTACT_PHONE) || 'Central de Atendimento',
  
  hours: 'Todos os dias: 18h às 23h30',
  cnpj: '45.123.890/0001-44',

  getWhatsAppLink(message = '') {
    const raw = this.phone.replace(/\D/g, '');
    if (!raw) return null;
    return `https://wa.me/${raw}?text=${encodeURIComponent(message)}`;
  }
};
