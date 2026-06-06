"use client";

import { useCookieConsent } from "@/components/cookies/cookie-consent-provider";

/** Footer „Kolačići” — ponovo otvara baner (podešavanja), kao na Ghost portalu. */
export function CookieSettingsLink() {
  const { openSettings } = useCookieConsent();

  return (
    <button
      type="button"
      className="gh-footer-cookie-settings"
      onClick={openSettings}
    >
      Kolačići
    </button>
  );
}
