import logoManifest from "@/lib/data/logo-manifest.json";
import { getStoragePublicUrl, isSupabaseStorageUrl } from "@/lib/supabase/storage";
import type { BrandLogoInput, LogoManifest } from "@/types";

const manifest = logoManifest as LogoManifest;

function manifestPath(slug: string): string | undefined {
  const entry = manifest[slug];
  if (!entry) return undefined;
  if (typeof entry === "string") return entry;
  return entry.path;
}

/** Brendovi bez logotipa — samo typography placeholder */
const BRAND_LETTER_ONLY = new Set([
  "collegium",
  "dekker",
  "house",
  "kurt-geiger",
  "massimo-dutti",
]);

/** Typography placeholder umesto logotipa */
const BRAND_LETTER_OVERRIDE: Record<string, string> = {
  dekker: "D",
  house: "H",
  "kurt-geiger": "KG",
  "massimo-dutti": "MD",
};

/** Prvo slovo brenda za typography placeholder */
export function getBrandLetter(name: string, slug?: string): string {
  if (slug && BRAND_LETTER_OVERRIDE[slug]) {
    return BRAND_LETTER_OVERRIDE[slug];
  }
  const trimmed = name.trim();
  return trimmed.charAt(0).toUpperCase() || "?";
}

/** Hero typography fallback */
export function getBrandDisplayTitle(name: string): string {
  return name.toUpperCase();
}

/**
 * Prioritet: lokalni keš / manifest → logoUrl (ne-Storage) → Supabase Storage
 */
export function resolveBrandLogoSrc(brand: BrandLogoInput): string | null {
  if (BRAND_LETTER_ONLY.has(brand.slug)) return null;

  const cached = manifestPath(brand.slug);

  if (brand.hasCustomLogo) {
    if (cached) return cached;
    return `/logos/${brand.slug}.png`;
  }

  if (cached) return cached;

  const logoUrl = brand.logoUrl?.trim();
  if (logoUrl && !isSupabaseStorageUrl(logoUrl)) return logoUrl;

  const fromStorage = getStoragePublicUrl(brand.logoStoragePath);
  if (fromStorage) return fromStorage;

  if (logoUrl) return logoUrl;

  return null;
}

export function hasBrandLogo(brand: BrandLogoInput): boolean {
  return resolveBrandLogoSrc(brand) !== null;
}

/** Per-brand vizuelna skala (npr. kvadratni logoi u uniformnom okviru) */
const BRAND_LOGO_DISPLAY_SCALE: Record<string, number> = {
  rituals: 0.82,
  mou: 0.88,
};

export function getBrandLogoDisplayScale(slug: string): number {
  return BRAND_LOGO_DISPLAY_SCALE[slug] ?? 1;
}
