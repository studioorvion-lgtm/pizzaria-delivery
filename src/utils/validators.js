/**
 * Utilitários de validação e formatação brasileiros
 */

export function isValidCPF(cpf) {
  if (!cpf) return false;
  const clean = String(cpf).replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

export function formatCPF(val) {
  const digits = String(val).replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatPhone(val) {
  const digits = String(val).replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function isValidPhone(phone) {
  if (!phone) return false;
  const digits = String(phone).replace(/\D/g, '');
  // Deve ter 10 dígitos (fixo) ou 11 dígitos (celular/WhatsApp)
  if (digits.length !== 10 && digits.length !== 11) return false;
  // Rejeita números com todos os dígitos iguais (ex: 00000000000, 11111111111)
  if (/^(\d)\1+$/.test(digits)) return false;
  // Valida DDD brasileiro (11 a 99)
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  // Se for celular (11 dígitos), o nono dígito (índice 2) deve ser 9
  if (digits.length === 11 && digits.charAt(2) !== '9') return false;
  return true;
}

export function isValidCEP(cep) {
  if (!cep) return false;
  const digits = String(cep).replace(/\D/g, '');
  if (digits.length !== 8) return false;
  if (/^(\d)\1{7}$/.test(digits)) return false;
  return true;
}

export function formatCEP(val) {
  const digits = String(val).replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatCurrency(amount) {
  return Number(amount || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
