"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { BILBORD_SITE_URL } from "@/lib/bilbord-footer";
import {
  dismissCookieBannerForSession,
  setCookieConsent,
  type CookieConsentValue,
} from "@/lib/cookies/consent";

const COOKIE_POLICY_URL = `${BILBORD_SITE_URL}/politika-kolacica/`;

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add("has-cookie-banner");
    return () => {
      document.documentElement.classList.remove("has-cookie-banner");
    };
  }, []);

  const save = (value: CookieConsentValue) => {
    setCookieConsent(value);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      id="gh-cookie-banner"
      className="gh-cookie-banner fixed z-[99990] w-[min(420px,calc(100vw-32px))] max-w-[calc(100vw-32px)] border border-border bg-background p-0 shadow-[0_4px_6px_rgb(0_0_0/0.04),0_12px_40px_rgb(0_0_0/0.12)]"
      style={{
        right: "max(16px, env(safe-area-inset-right, 0px))",
        bottom: "max(16px, env(safe-area-inset-bottom, 0px))",
        borderRadius: "clamp(12px, 1.2vw, 16px)",
      }}
      role="dialog"
      aria-modal="false"
      aria-label="Obaveštenje o kolačićima"
      aria-live="polite"
    >
      <div className="relative flex flex-col gap-4 px-5 pb-[1.15rem] pt-[1.2rem]">
        <button
          type="button"
          className="absolute right-2.5 top-2.5 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-muted transition-opacity hover:opacity-70"
          aria-label="Zatvori obaveštenje"
          onClick={dismissCookieBannerForSession}
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </button>
        <p className="m-0 pr-5 text-sm font-normal leading-[1.45] text-foreground">
          Koristimo kolačiće radi boljeg iskustva. Nastavkom posete ovom sajtu
          prihvatate upotrebu kolačića.
        </p>
        <p className="m-0 text-[13.5px] text-foreground">
          <a
            className="text-foreground underline underline-offset-[0.15em] hover:opacity-85"
            href={COOKIE_POLICY_URL}
          >
            Politika kolačića
          </a>
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2.5 max-[380px]:flex-col max-[380px]:items-stretch">
          <button
            type="button"
            className="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center border border-border bg-transparent px-[1.1em] py-[0.65em] text-[13.5px] font-semibold leading-none text-foreground transition-colors hover:bg-secondary hover:opacity-90 max-[380px]:w-full"
            onClick={() => save("rejected")}
          >
            Odbijam
          </button>
          <button
            type="button"
            className="inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center border-0 bg-accent px-[1.1em] py-[0.65em] text-[13.5px] font-semibold leading-none text-white transition-colors hover:bg-accent-hover max-[380px]:w-full"
            onClick={() => save("accepted")}
          >
            Prihvatam
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
