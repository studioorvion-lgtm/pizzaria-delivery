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

export function getBusinessHoursStatus() {
  try {
    const now = new Date();
    // Horário oficial de Brasília
    const brTimeStr = now.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const [h, m] = brTimeStr.split(':').map(Number);
    const currentMins = h * 60 + m;

    // 18h00 (1080 min) às 23h30 (1410 min)
    const openMins = 18 * 60;
    const closeMins = 23 * 60 + 30;

    const isOpen = currentMins >= openMins && currentMins <= closeMins;
    return {
      isOpen,
      badgeText: isOpen ? 'ABERTO AGORA' : 'FECHADO NO MOMENTO',
      detailText: isOpen ? '18h às 23h30' : 'Abre às 18h00',
      scheduleNotice: !isOpen ? 'Seu pedido será entregue a partir das 18h.' : null,
    };
  } catch {
    return {
      isOpen: true,
      badgeText: 'ABERTO AGORA',
      detailText: '18h às 23h30',
      scheduleNotice: null,
    };
  }
}
