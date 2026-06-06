"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CookieBanner } from "@/components/cookies/cookie-banner";
import {
  COOKIE_BANNER_DISMISS_EVENT,
  COOKIE_CONSENT_EVENT,
  COOKIE_SETTINGS_EVENT,
  getCookieConsent,
  isCookieBannerDismissedForSession,
  type CookieConsentValue,
} from "@/lib/cookies/consent";

interface CookieConsentContextValue {
  consent: CookieConsentValue | null;
  openSettings: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
);

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState<CookieConsentValue | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const syncVisibility = useCallback((stored: CookieConsentValue | null) => {
    setConsent(stored);
    const show = !stored && !isCookieBannerDismissedForSession();
    setVisible(show);
    document.documentElement.classList.toggle("has-cookie-banner", show);
  }, []);

  const openSettings = useCallback(() => {
    setVisible(true);
    document.documentElement.classList.add("has-cookie-banner");
  }, []);

  useEffect(() => {
    syncVisibility(getCookieConsent());
    setHydrated(true);
  }, [syncVisibility]);

  useEffect(() => {
    const onConsent = (event: Event) => {
      const value = (event as CustomEvent<CookieConsentValue>).detail;
      setConsent(value);
      setVisible(false);
      document.documentElement.classList.remove("has-cookie-banner");
    };

    const onOpenSettings = () => openSettings();

    const onDismiss = () => {
      setVisible(false);
      document.documentElement.classList.remove("has-cookie-banner");
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    window.addEventListener(COOKIE_SETTINGS_EVENT, onOpenSettings);
    window.addEventListener(COOKIE_BANNER_DISMISS_EVENT, onDismiss);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
      window.removeEventListener(COOKIE_SETTINGS_EVENT, onOpenSettings);
      window.removeEventListener(COOKIE_BANNER_DISMISS_EVENT, onDismiss);
    };
  }, [openSettings]);

  return (
    <CookieConsentContext.Provider value={{ consent, openSettings }}>
      {children}
      {hydrated && visible ? <CookieBanner /> : null}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return ctx;
}
