/** Isti ključ kao na bilbord.rs (Ghost tema). */
export const COOKIE_CONSENT_KEY = "bilbord_cookie_consent";

export type CookieConsentValue = "accepted" | "rejected";

export const COOKIE_SETTINGS_EVENT = "bilbord:open-cookie-settings";
export const COOKIE_CONSENT_EVENT = "bilbord:cookie-consent-change";
export const COOKIE_BANNER_DISMISS_EVENT = "bilbord:cookie-banner-dismiss";

/** Skriveno X-om do kraja sesije — ne upisuje se pristanak/odbijanje. */
export const COOKIE_BANNER_SESSION_DISMISSED_KEY =
  "bilbord_cookie_banner_dismissed";

export function parseStoredConsent(raw: string | null): CookieConsentValue | null {
  if (!raw) return null;
  if (raw === "accepted" || raw === "rejected") return raw;
  if (raw === "1") return "accepted";
  return null;
}

export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredConsent(localStorage.getItem(COOKIE_CONSENT_KEY));
  } catch {
    return null;
  }
}

export function setCookieConsent(value: CookieConsentValue): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // privatni režim / pun storage
  }
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value })
  );
}

export function openCookieSettings(): void {
  window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT));
}

export function isCookieBannerDismissedForSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      sessionStorage.getItem(COOKIE_BANNER_SESSION_DISMISSED_KEY) === "1"
    );
  } catch {
    return false;
  }
}

/** Zatvara baner do kraja taba; pri sledećoj poseti baner se ponovo prikazuje. */
export function dismissCookieBannerForSession(): void {
  try {
    sessionStorage.setItem(COOKIE_BANNER_SESSION_DISMISSED_KEY, "1");
  } catch {
    // privatni režim
  }
  window.dispatchEvent(new CustomEvent(COOKIE_BANNER_DISMISS_EVENT));
}
