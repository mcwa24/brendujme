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
