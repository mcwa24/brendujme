/**
 * Planeta Sport — brendovi i lokali (generisano scrape:planeta)
 */

import scraped from "./planeta-sport-scraped.json";

export const planetaSportMeta = {
  website: "https://planetasport.rs",
  brandsUrl: scraped.brandsUrl,
  storesUrl: scraped.storesUrl,
  retailerSlug: scraped.retailerSlug,
  scrapedAt: scraped.scrapedAt,
  brandCount: scraped.brands.length,
  storeCount: scraped.stores.length,
};

export const planetaSportBrands = scraped.brands;
export const planetaSportStores = scraped.stores;
