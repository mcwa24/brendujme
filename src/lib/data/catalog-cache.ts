import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

/** ISR TTL za katalog (brendovi, prodavci, tržni centri, prodavnice). */
export const CATALOG_REVALIDATE_SECONDS = 3600;

/**
 * Povećaj posle seed-a novog prodavca/brendova — `unstable_cache` ključevi uključuju ovu verziju.
 * Alternativa: POST /api/revalidate-catalog (poziva se iz seed skripti).
 */
export const CATALOG_CACHE_VERSION = "v14";

export const CATALOG_CACHE_TAGS = [
  "catalog",
  "brands",
  "retailers",
  "categories",
  "shopping-centers",
  "news",
  "promotions",
] as const;

const CATALOG_PATHS = ["/", "/brands", "/retailers", "/shopping-centers"] as const;

export function revalidateCatalogCache(): void {
  for (const tag of CATALOG_CACHE_TAGS) {
    revalidateTag(tag);
  }
  for (const path of CATALOG_PATHS) {
    revalidatePath(path);
  }
}

export function catalogCache<T>(
  keyParts: string[],
  factory: () => Promise<T>,
  tags: string[]
): Promise<T> {
  return unstable_cache(factory, [...keyParts, CATALOG_CACHE_VERSION], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags,
  })();
}
