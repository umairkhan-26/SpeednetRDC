export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidFullName(value: string): boolean {
  return value.trim().length >= 2;
}

export function isValidCardNumber(value: string): boolean {
  const digits = value.replace(/\s+/g, "");
  return /^\d{13,19}$/.test(digits);
}

export function isValidExpiry(value: string): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!match) return false;
  const month = Number(match[1]);
  if (month < 1 || month > 12) return false;
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const expiry = new Date(year, month, 0);
  return expiry >= new Date(now.getFullYear(), now.getMonth(), 1);
}

export function isValidCvc(value: string): boolean {
  return /^\d{3,4}$/.test(value.trim());
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}
