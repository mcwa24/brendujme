import { unstable_cache } from "next/cache";

/** ISR TTL za katalog (brendovi, prodavci, tržni centri, prodavnice). */
export const CATALOG_REVALIDATE_SECONDS = 3600;

export function catalogCache<T>(
  keyParts: string[],
  factory: () => Promise<T>,
  tags: string[]
): Promise<T> {
  return unstable_cache(factory, keyParts, {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags,
  })();
}
