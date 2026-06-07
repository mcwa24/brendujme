/**
 * Tike.rs — brendovi i prodavnica (generisano scrape:tike)
 */

import scraped from "./tike-scraped.json";

export const tikeMeta = {
  website: "https://www.tike.rs/",
  brandsUrl: scraped.brandsUrl,
  storesUrl: scraped.storesUrl,
  retailerSlug: scraped.retailerSlug,
  scrapedAt: scraped.scrapedAt,
  brandCount: scraped.brands.length,
  storeCount: scraped.stores.length,
};

export const tikeBrands = scraped.brands;
export const tikeStores = scraped.stores;

/** Jedinstveni slugovi iz scrape-a (modni filter u repository / retailers.ts) */
export const tikeBrandSlugs = [...new Set(scraped.brands.map((b) => b.slug))].sort(
  (a, b) => a.localeCompare(b, "sr")
);
