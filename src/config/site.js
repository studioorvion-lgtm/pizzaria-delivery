/**
 * Configurações centrais do site e dados comerciais
 * Evita hardcode e permite configuração única
 */

export const siteConfig = {
  name: 'Donatello Pizzaria Artesanal',
  tagline: 'A verdadeira pizza na sua casa.',
  deliveryTime: '20 a 45 min',
  
  // Telefone centralizado configurável por variável de ambiente (sem fake hardcoded)
  phone: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTACT_PHONE) || '',
  phoneDisplay: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CONTACT_PHONE) || 'Central de Atendimento',
  
  hours: 'Atendimento & Delivery 24 Horas',
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

export function getBusinessHoursStatus() {
  // A loja aceita pedidos 24 horas por dia, 7 dias por semana
  return {
    isOpen: true,
    badgeText: 'ABERTO AGORA',
    detailText: 'Pedidos 24 Horas',
    scheduleNotice: null,
  };
}
