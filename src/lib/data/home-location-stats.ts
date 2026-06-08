import { IMPORTED_RETAILER_SLUGS } from "@/lib/data/imported-retailers";
import { getAllStaticStoreCityRows } from "@/lib/data/retailer-stores-static";
import { getRetailerCatalogMeta } from "@/lib/data/retailer-catalog-meta";

/** Svi uvezeni prodavci + Fashion Company (poseban zapis) */
const CATALOG_RETAILER_SLUGS = [
  "fashion-company",
  ...IMPORTED_RETAILER_SLUGS,
] as const;

/** Ukupan broj prodajnih lokacija iz sinhronizovanih retailer kataloga. */
export function getCatalogStoreCount(): number {
  return CATALOG_RETAILER_SLUGS.reduce((total, slug) => {
    return total + (getRetailerCatalogMeta(slug)?.storeCount ?? 0);
  }, 0);
}

/** Jedinstveni gradovi iz statičkih scrape podataka prodavnica. */
export function getCatalogStoreCityCount(): number {
  const cities = new Set<string>();
  for (const store of getAllStaticStoreCityRows()) {
    const city = store.city?.trim();
    if (city) cities.add(city);
  }
  return cities.size;
}
