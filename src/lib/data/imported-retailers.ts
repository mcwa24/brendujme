/** Retaileri uvezeni sa zvaničnih sajtova (ne mock seed) */
export const IMPORTED_RETAILER_SLUGS = [
  "buzz-sneakers",
  "office-shoes",
  "sport-time",
] as const;

export type ImportedRetailerSlug = (typeof IMPORTED_RETAILER_SLUGS)[number];

export function isImportedRetailerSlug(slug: string): slug is ImportedRetailerSlug {
  return (IMPORTED_RETAILER_SLUGS as readonly string[]).includes(slug);
}

export function sortImportedRetailers<T extends { slug: string }>(items: T[]): T[] {
  const order = new Map(IMPORTED_RETAILER_SLUGS.map((s, i) => [s, i]));
  return [...items].sort(
    (a, b) => (order.get(a.slug as ImportedRetailerSlug) ?? 99) - (order.get(b.slug as ImportedRetailerSlug) ?? 99)
  );
}
