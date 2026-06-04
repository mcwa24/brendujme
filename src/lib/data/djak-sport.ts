/**
 * Đak Sport — brendovi i lokacije (generisano scrape:djak)
 */

import scraped from "./djak-sport-scraped.json";

export const djakSportMeta = {
  website: "https://www.djaksport.com",
  brandsUrl: scraped.brandsUrl,
  storesUrl: scraped.storesUrl,
  retailerSlug: scraped.retailerSlug,
  scrapedAt: scraped.scrapedAt,
  brandCount: scraped.brands.length,
  storeCount: scraped.stores.length,
};

export const djakSportBrands = scraped.brands;
export const djakSportStores = scraped.stores;
