import type { CategorySlug, Brand } from "@/types";
import type { ScrapedRetailerBrandEntry } from "@/lib/data/retailer-scraped-brands";
import { getScrapedBrandsForRetailer } from "@/lib/data/retailer-scraped-brands";

/** Kategorije koje Bilbord tretira kao moda / sport / obuća */
export const MODNI_CATEGORY_SLUGS = new Set<CategorySlug>([
  "fashion",
  "sports",
  "footwear",
  "luxury",
  "lifestyle",
]);

/**
 * Igračke, rekviziti, oprema, suplementi — nisu modni brendovi na Bilbordu.
 * Ručno kurirano iz scrape kataloga (Đak, Planeta, Sport Vision, Buzz…).
 */
export const NON_MODNI_BRAND_SLUGS = new Set<string>([
  "ak-sport",
  "babolat",
  "bama",
  "boatilus",
  "body-sculpture",
  "briko",
  "butterfly",
  "crep-protect",
  "dfns",
  "enervit",
  "funko-pop",
  "gewo",
  "gri-sport",
  "hydrapak",
  "invento",
  "isostar",
  "joola",
  "jump-power",
  "labubu",
  "mikasa",
  "molten",
  "precision",
  "proball",
  "ring",
  "ring-sport",
  "rollerblade",
  "shoe-care",
  "shooter",
  "slazenger",
  "spalding",
  "spokey",
  "stanley",
  "ty",
  "wilson",
  "yvolution",
]);

const NON_MODNI_SLUG_PATTERN =
  /(?:^|-)(igrac|igracke|toys|funko|labubu|supplement|nutrition|rekvizit|loptica|lopta|ball)(?:-|$)/i;

export function isModniCategory(category: CategorySlug): boolean {
  return MODNI_CATEGORY_SLUGS.has(category);
}

export function isModniBrandSlug(slug: string): boolean {
  if (NON_MODNI_BRAND_SLUGS.has(slug)) return false;
  if (NON_MODNI_SLUG_PATTERN.test(slug)) return false;
  return true;
}

export function isModniBrand(brand: Brand): boolean {
  return isModniCategory(brand.category) && isModniBrandSlug(brand.slug);
}

/**
 * Izvor istine: zvaničan spisak brendova prodavca (scrape / direktorijum).
 * Katalog samo obogaćuje profil — ne sme skraćivati listu.
 * Isključujemo samo opremu / igračke / suplemente (NON_MODNI_BRAND_SLUGS).
 */
export function isModniScrapedEntry(
  entry: ScrapedRetailerBrandEntry,
  _retailerSlug: string,
  _catalogBrand?: Brand
): boolean {
  return isModniBrandSlug(entry.slug);
}

export function filterModniScrapedEntries(
  entries: ScrapedRetailerBrandEntry[],
  retailerSlug: string,
  catalogBySlug: Map<string, Brand>
): ScrapedRetailerBrandEntry[] {
  const seen = new Set<string>();
  const out: ScrapedRetailerBrandEntry[] = [];

  for (const entry of entries) {
    if (seen.has(entry.slug)) continue;
    const catalog = catalogBySlug.get(entry.slug);
    if (!isModniScrapedEntry(entry, retailerSlug, catalog)) continue;
    seen.add(entry.slug);
    out.push(entry);
  }

  return out;
}

export function filterModniBrands(brands: Brand[]): Brand[] {
  return brands.filter(isModniBrand);
}

export function countModniScrapedBrands(
  retailerSlug: string,
  catalogBySlug: Map<string, Brand>
): number {
  const scraped = getScrapedBrandsForRetailer(retailerSlug);
  if (!scraped?.length) return 0;
  return filterModniScrapedEntries(scraped, retailerSlug, catalogBySlug).length;
}

export function uniqueModniScrapedBrandSlugs(
  retailerSlug: string,
  catalogBySlug: Map<string, Brand>
): string[] {
  const scraped = getScrapedBrandsForRetailer(retailerSlug);
  if (!scraped?.length) return [];
  return filterModniScrapedEntries(scraped, retailerSlug, catalogBySlug).map(
    (b) => b.slug
  );
}

/** @deprecated Koristi uniqueModniScrapedBrandSlugs — pun scrape, ne presek sa katalogom */
export function uniqueModniCatalogBrandSlugs(
  retailerSlug: string,
  catalogBySlug: Map<string, Brand>
): string[] {
  return uniqueModniScrapedBrandSlugs(retailerSlug, catalogBySlug);
}

/** @deprecated Koristi countModniScrapedBrands */
export function countModniCatalogBrands(
  retailerSlug: string,
  catalogBySlug: Map<string, Brand>
): number {
  return countModniScrapedBrands(retailerSlug, catalogBySlug);
}
