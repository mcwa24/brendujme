import buzzScraped from "@/lib/data/buzz-sneakers-scraped.json";
import djakScraped from "@/lib/data/djak-sport-scraped.json";
import scrapedFashion from "@/lib/data/fast-fashion-serbia-scraped.json";
import scrapedFs from "@/lib/data/fashion-sport-serbia-scraped.json";
import nikeScraped from "@/lib/data/nike-serbia-scraped.json";
import officeScraped from "@/lib/data/office-shoes-scraped.json";
import planetaScraped from "@/lib/data/planeta-sport-scraped.json";
import sportVisionScraped from "@/lib/data/sport-vision-scraped.json";
import tikeScraped from "@/lib/data/tike-scraped.json";
import { getRetailerCatalogMeta } from "@/lib/data/retailer-catalog-meta";

const CATALOG_RETAILER_SLUGS = [
  "fashion-company",
  "fashion-friends",
  "extra-sports",
  "tike",
  "run-n-more",
  "buzz-sneakers",
  "office-shoes",
  "sport-time",
  "djak-sport",
  "sport-vision",
  "planeta-sport",
  "inditex",
  "lpp",
] as const;

type StoreRow = { city?: string };

const ALL_STORE_ROWS: StoreRow[] = [
  ...scrapedFs.stores,
  ...scrapedFashion.stores,
  ...djakScraped.stores,
  ...buzzScraped.stores,
  ...officeScraped.stores,
  ...planetaScraped.stores,
  ...sportVisionScraped.stores,
  ...tikeScraped.stores,
  ...nikeScraped.stores,
];

/** Ukupan broj prodajnih lokacija iz sinhronizovanih retailer kataloga. */
export function getCatalogStoreCount(): number {
  return CATALOG_RETAILER_SLUGS.reduce((total, slug) => {
    return total + (getRetailerCatalogMeta(slug)?.storeCount ?? 0);
  }, 0);
}

/** Jedinstveni gradovi iz scrape podataka prodavnica. */
export function getCatalogStoreCityCount(): number {
  const cities = new Set<string>();
  for (const store of ALL_STORE_ROWS) {
    const city = store.city?.trim();
    if (city) cities.add(city);
  }
  return cities.size;
}
