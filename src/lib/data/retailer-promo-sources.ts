import type { ImportedRetailerSlug } from "@/lib/data/imported-retailers";

export interface RetailerPromoSource {
  retailerSlug: ImportedRetailerSlug;
  /** Stranice gde se najčešće objavljuju akcije / flajeri */
  urls: string[];
}

/** Izvori za automatsko prepoznavanje akcija (cron: npm run promotions:detect) */
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
    retailerSlug: "extra-sports",
    urls: [
      "https://www.extrasports.com/SRB_rs/",
      "https://www.extrasports.com/SRB_rs/akcije",
    ],
  },
  {
    retailerSlug: "tike",
    urls: ["https://www.tike.rs/", "https://www.tike.rs/akcije"],
  },
  {
    retailerSlug: "run-n-more",
    urls: ["https://www.runnmore.com/"],
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
