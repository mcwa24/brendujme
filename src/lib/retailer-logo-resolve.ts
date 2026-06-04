import {
  getRetailerLogoImage,
  getRetailerPageLogoImage,
  hasBundledRetailerLogo,
} from "@/lib/data/retailer-logo-images";
import {
  getRetailerLogoRemoteUrl,
  retailerLogoStoragePath,
} from "@/lib/data/retailer-logos";
import { getStoragePublicUrl, isSupabaseStorageUrl } from "@/lib/supabase/storage";

export interface RetailerLogoInput {
  slug: string;
  logoUrl?: string | null;
}

export function resolveRetailerLogoSrc(
  retailer: RetailerLogoInput,
  options?: { page?: boolean }
): string | null {
  const local = options?.page
    ? getRetailerPageLogoImage(retailer.slug)
    : getRetailerLogoImage(retailer.slug);
  if (local?.src) return local.src;

  // Nikad ne koristi Supabase/remote (npr. stari Kloe sa fashioncompany.rs)
  if (hasBundledRetailerLogo(retailer.slug)) return null;

  const logoUrl = retailer.logoUrl?.trim();
  if (logoUrl && !isSupabaseStorageUrl(logoUrl)) return logoUrl;

  const fromStorage = getStoragePublicUrl(retailerLogoStoragePath(retailer.slug));
  if (fromStorage) return fromStorage;

  if (logoUrl) return logoUrl;

  return getRetailerLogoRemoteUrl(retailer.slug) ?? null;
}

export function hasRetailerLogo(retailer: RetailerLogoInput): boolean {
  return resolveRetailerLogoSrc(retailer) !== null;
}
