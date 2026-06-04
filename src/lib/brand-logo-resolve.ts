import logoManifest from "@/lib/data/logo-manifest.json";
import type { BrandLogoInput, LogoManifest } from "@/types";

const manifest = logoManifest as LogoManifest;

/** Prvo slovo brenda za typography placeholder */
export function getBrandLetter(name: string): string {
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase() || "?";
}

/** Hero typography fallback */
export function getBrandDisplayTitle(name: string): string {
  return name.toUpperCase();
}

/**
 * Prioritet (samo lokalni/keširani putevi — bez mrežnih zahteva u runtime):
 * 1. Upload (hasCustomLogo + manifest ili standardna putanja)
 * 2. logoUrl iz podataka
 * 3. Keširano otkrivanje (logo-manifest)
 */
export function resolveBrandLogoSrc(brand: BrandLogoInput): string | null {
  const entry = manifest[brand.slug];

  if (brand.hasCustomLogo) {
    if (entry?.source === "upload") return entry.path;
    return `/logos/${brand.slug}.png`;
  }

  if (entry?.source === "upload") return entry.path;

  if (brand.logoUrl?.trim()) return brand.logoUrl.trim();

  if (entry && (entry.source === "discovered" || entry.source === "url")) {
    return entry.path;
  }

  return null;
}

export function hasBrandLogo(brand: BrandLogoInput): boolean {
  return resolveBrandLogoSrc(brand) !== null;
}
