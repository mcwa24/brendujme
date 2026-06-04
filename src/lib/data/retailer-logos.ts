import {
  getRetailerLogoImage,
  hasBundledRetailerLogo,
} from "@/lib/data/retailer-logo-images";
import { storagePaths } from "@/lib/supabase/storage";

/** Udaljeni URL samo za prodavce bez lokalnog keša */
export function getRetailerLogoRemoteUrl(slug: string): string | undefined {
  if (hasBundledRetailerLogo(slug)) return undefined;
  const url = getRetailerLogoImage(slug)?.sourceUrl;
  if (!url || url.startsWith("bundled:")) return undefined;
  return url;
}

export function retailerLogoStoragePath(slug: string): string {
  return storagePaths.retailerLogo(slug);
}
