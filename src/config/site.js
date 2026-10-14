/**
 * Configurações centrais do site e dados comerciais
 * Evita hardcode e permite configuração única
 */

export const siteConfig = {
  name: 'Donatello Pizzaria Artesanal',
  tagline: 'A verdadeira pizza na sua casa.',
  deliveryTime: 'até 30 min',
  
  // Telefone centralizado configurável por variável de ambiente (sem fake hardcoded)
  phone: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTACT_PHONE) || '',
  phoneDisplay: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTACT_PHONE) || 'Central de Atendimento',
  
  hours: 'Todos os dias: 18h às 23h30',
  cnpj: '45.123.890/0001-44',

  // Coordenadas geográficas reais da loja para cálculo de proximidade
  // Se null, o sistema não inventa distância fictícia
  coordinates: {
    lat: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PIZZERIA_LAT) ? Number(import.meta.env.VITE_PIZZERIA_LAT) : null,
    lng: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PIZZERIA_LNG) ? Number(import.meta.env.VITE_PIZZERIA_LNG) : null,
  },
  address: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PIZZERIA_ADDRESS) || null,

  getWhatsAppLink(message = '') {
    const raw = this.phone.replace(/\D/g, '');
    if (!raw) return null;
    return `https://wa.me/${raw}?text=${encodeURIComponent(message)}`;
  }
};
