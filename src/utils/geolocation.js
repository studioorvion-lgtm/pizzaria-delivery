/**
 * Utilitário de Geolocalização e Cálculo de Distância Real
 * Donatello Pizzaria Artesanal
 * 
 * Regras:
 * 1. Solicita permissão do navegador de forma não intrusiva.
 * 2. Se permitido, obtém lat/long do cliente e calcula distância REAL via fórmula de Haversine.
 * 3. NUNCA exibe distância fictícia.
 * 4. Se negado ou sem coordenadas da loja configuradas, não exibe erro nem bloqueia nada.
 */

import { siteConfig } from '../config/site.js';

const LOCATION_STORAGE_KEY = 'donatello_client_coords';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

/**
 * Fórmula de Haversine para calcular a distância geodésica em km
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined || lat1 === null ||
    lon1 === undefined || lon1 === null ||
    lat2 === undefined || lat2 === null ||
    lon2 === undefined || lon2 === null
  ) {
    return null;
  }

  const R = 6371; // Raio médio da Terra em km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Number(distance.toFixed(1));
}

/**
 * Formata a distância para exibição amigável em português
 */
export function formatDistanceString(distanceKm) {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) {
    return null;
  }

  if (distanceKm < 1) {
    const meters = Math.max(50, Math.round(distanceKm * 1000));
    return `${meters} m`;
  }

  return `${distanceKm.toFixed(1).replace('.', ',')} km`;
}

/**
 * Obtém as coordenadas salvas em cache se válidas
 */
export function getCachedClientCoords() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
      return { latitude: parsed.latitude, longitude: parsed.longitude };
    }
  } catch {}
  return null;
}

/**
 * Salva coordenadas do cliente em cache
 */
export function saveClientCoords(latitude, longitude) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify({ latitude, longitude, timestamp: Date.now() })
    );
  } catch {}
}

/**
 * Hook ou helper para solicitar localização do cliente de forma segura
 */
export function requestClientLocation(onSuccess, onError) {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    if (onError) onError('unsupported');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      saveClientCoords(latitude, longitude);
      if (onSuccess) onSuccess({ latitude, longitude });
    },
    (err) => {
      // Falha silenciosa: cliente negou ou timeout
      if (onError) onError(err.code === 1 ? 'denied' : 'error');
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: CACHE_TTL_MS,
    }
  );
}

/**
 * Obtém a distância calculada em relação à pizzaria (se as coordenadas da pizzaria estiverem configuradas)
 */
export function getPizzeriaDistance(clientCoords) {
  const shopCoords = siteConfig.coordinates;
  if (!shopCoords || shopCoords.lat === null || shopCoords.lng === null || shopCoords.lat === undefined) {
    // Nenhuma coordenada configurada para a pizzaria: retorna null para nunca inventar distância
    return null;
  }

  if (!clientCoords || clientCoords.latitude === undefined || clientCoords.longitude === undefined) {
    return null;
  }

  return calculateDistanceKm(
    shopCoords.lat,
    shopCoords.lng,
    clientCoords.latitude,
    clientCoords.longitude
  );
}
