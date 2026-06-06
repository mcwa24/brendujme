function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isBelgradeAreaCity(city: string): boolean {
  const c = city.trim().toLowerCase();
  return c === "beograd" || c.startsWith("beograd ");
}

/** Centralni 011 brojevi na sajtovima prodavaca nisu lokalni — ne prikazuj ih van Beograda. */
export function shouldShowStorePhone(city: string, phone: string): boolean {
  const digits = normalizePhoneDigits(phone);
  if (digits.startsWith("011") && !isBelgradeAreaCity(city)) {
    return false;
  }
  return true;
}

export function formatSerbianPhone(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  if (digits.length === 9 || digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone.trim();
}

export function storePhoneHref(phone: string): string {
  return `tel:${normalizePhoneDigits(phone)}`;
}
