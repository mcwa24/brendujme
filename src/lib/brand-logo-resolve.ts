import logoManifest from "@/lib/data/logo-manifest.json";
import { getStoragePublicUrl, isSupabaseStorageUrl } from "@/lib/supabase/storage";
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
 * Prioritet: lokalni keš / manifest → logoUrl (ne-Storage) → Supabase Storage
 */
export function resolveBrandLogoSrc(brand: BrandLogoInput): string | null {
  const entry = manifest[brand.slug];

  if (brand.hasCustomLogo) {
    if (entry?.path) return entry.path;
    return `/logos/${brand.slug}.png`;
  }

  if (entry?.path) return entry.path;

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
