/**
 * N Sport — brendovi i prodavnice (generisano scrape:nsport)
 */

import scraped from "./n-sport-scraped.json";

export const nSportMeta = {
  website: "https://www.n-sport.net/",
  brandsUrl: scraped.brandsUrl,
  storesUrl: scraped.storesUrl,
  retailerSlug: scraped.retailerSlug,
  scrapedAt: scraped.scrapedAt,
  brandCount: scraped.modniBrandCount,
  storeCount: scraped.stores.length,
};

export const nSportBrands = scraped.brands;
export const nSportStores = scraped.stores;
