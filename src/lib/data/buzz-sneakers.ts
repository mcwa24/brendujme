/**
 * Buzz Sneakers — brendovi i radnje (generisano scrape:buzz)
 */

import scraped from "./buzz-sneakers-scraped.json";

export const buzzSneakersMeta = {
  website: "https://www.buzzsneakers.rs",
  brandsUrl: scraped.brandsUrl,
  storesUrl: scraped.storesUrl,
  retailerSlug: scraped.retailerSlug,
  scrapedAt: scraped.scrapedAt,
  brandCount: scraped.brands.length,
  storeCount: scraped.stores.length,
};

export const buzzSneakersBrands = scraped.brands;
export const buzzSneakersStores = scraped.stores;
