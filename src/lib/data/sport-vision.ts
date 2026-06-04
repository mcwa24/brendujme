/**
 * Sport Vision — brendovi i radnje (generisano scrape:sport-vision)
 */

import scraped from "./sport-vision-scraped.json";

export const sportVisionMeta = {
  website: "https://www.sportvision.rs",
  brandsUrl: scraped.brandsUrl,
  storesUrl: scraped.storesUrl,
  retailerSlug: scraped.retailerSlug,
  scrapedAt: scraped.scrapedAt,
  brandCount: scraped.brands.length,
  storeCount: scraped.stores.length,
};

export const sportVisionBrands = scraped.brands;
export const sportVisionStores = scraped.stores;
