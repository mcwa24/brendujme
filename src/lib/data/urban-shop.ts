/**
 * Urbanshop.rs — brendovi i prodavnice (generisano scrape:urbanshop)
 */

import scraped from "./urban-shop-scraped.json";

export const urbanShopMeta = {
  website: "https://www.urbanshop.rs/",
  brandsUrl: scraped.brandsUrl,
  storesUrl: scraped.storesUrl,
  retailerSlug: scraped.retailerSlug,
  scrapedAt: scraped.scrapedAt,
  brandCount: scraped.brands.length,
  storeCount: scraped.stores.length,
};

export const urbanShopBrands = scraped.brands;
export const urbanShopStores = scraped.stores;

export const urbanShopBrandSlugs = [
  ...new Set(scraped.brands.map((b) => b.slug)),
].sort((a, b) => a.localeCompare(b, "sr"));
