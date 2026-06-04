/**
 * Office Shoes — brendovi i prodavnice (generisano scrape:office)
 * Izvor: https://www.officeshoes.rs/brands
 */

import scraped from "./office-shoes-scraped.json";

export const officeShoesMeta = {
  website: "https://www.officeshoes.rs",
  brandsUrl: "https://www.officeshoes.rs/brands",
  storesUrl: "https://www.officeshoes.rs/prodavnice",
  retailerSlug: "office-shoes",
  scrapedAt: scraped.scrapedAt,
  brandCount: scraped.brands.length,
  storeCount: scraped.stores.length,
};

export const officeShoesBrands = scraped.brands;
export const officeShoesStores = scraped.stores;
