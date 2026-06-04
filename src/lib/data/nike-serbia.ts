/**
 * Nike Srbija — zvanični retail directory
 * https://www.nike.com/retail/directory/serbia
 */

import scraped from "./nike-serbia-scraped.json";

export const nikeSerbiaMeta = {
  website: "https://www.nike.com",
  directoryUrl: scraped.sourceUrl,
  brandSlug: scraped.brandSlug,
  retailerSlug: scraped.retailerSlug,
  scrapedAt: scraped.scrapedAt,
  storeCount: scraped.stores.length,
};

export const nikeSerbiaStores = scraped.stores;
