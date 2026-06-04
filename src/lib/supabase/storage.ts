import { STORAGE_BUCKET, getSupabaseUrl } from "@/lib/supabase/env";

export function isSupabaseStorageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const base = getSupabaseUrl();
  if (!base) return false;
  return url.startsWith(`${base}/storage/`);
}

/** Javni URL fajla u bucketu Photos */
export function getStoragePublicUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath?.trim()) return null;
  const base = getSupabaseUrl();
  if (!base) return null;
  const path = storagePath.replace(/^\//, "");
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

/** Preporučene putanje u bucketu Photos */
export const storagePaths = {
  brandLogo: (slug: string) => `brands/${slug}.png`,
  shoppingCenterLogo: (slug: string) => `shopping-centers/${slug}.png`,
  retailerLogo: (slug: string) => `retailers/${slug}.png`,
  newsImage: (slug: string) => `news/${slug}.jpg`,
} as const;
