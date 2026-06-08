import type { ImportedRetailerSlug } from "@/lib/data/imported-retailers";

export interface RetailerPromoSource {
  retailerSlug: ImportedRetailerSlug;
  /** Stranice gde se najčešće objavljuju akcije / flajeri */
  urls: string[];
}

/**
 * Izvori za automatsko prepoznavanje akcija (cron: npm run promotions:detect).
 * Svaki novi scraped prodavac MORA biti ovde — vidi .cursor/rules/new-retailer.mdc
 */
export const RETAILER_PROMO_SOURCES: RetailerPromoSource[] = [
  {
    retailerSlug: "buzz-sneakers",
    urls: [
      "https://www.buzzsneakers.rs/",
      "https://www.buzzsneakers.rs/akcije",
    ],
  },
  {
    retailerSlug: "office-shoes",
    urls: [
      "https://www.officeshoes.rs/",
      "https://www.officeshoes.rs/akcije",
    ],
  },
  {
    retailerSlug: "djak-sport",
    urls: ["https://www.djaksport.com/"],
  },
  {
    retailerSlug: "sport-vision",
    urls: [
      "https://www.sportvision.rs/",
      "https://www.sportvision.rs/akcije",
    ],
  },
  {
    retailerSlug: "planeta-sport",
    urls: [
      "https://planetasport.rs/",
      "https://planetasport.rs/akcije",
    ],
  },
  {
    retailerSlug: "fashion-friends",
    urls: [
      "https://www.fashionandfriends.com/rs/",
      "https://www.fashionandfriends.com/rs/akcije",
    ],
  },
  {
    retailerSlug: "fashion-company",
    urls: [
      "https://www.fashioncompany.rs/",
      "https://www.fashioncompany.rs/akcije",
    ],
  },
  {
    retailerSlug: "tike",
    urls: ["https://www.tike.rs/", "https://www.tike.rs/akcije"],
  },
  {
    retailerSlug: "urban-shop",
    urls: [
      "https://www.urbanshop.rs/",
      "https://www.urbanshop.rs/catalog/najnoviji-proizvodi",
    ],
  },
  {
    retailerSlug: "sport-time",
    urls: ["https://www.nike.com/rs/"],
  },
  {
    retailerSlug: "lpp",
    urls: ["https://www.reserved.com/rs/sr/"],
  },
];
