import buzzScraped from "./buzz-sneakers-scraped.json";
import officeScraped from "./office-shoes-scraped.json";
import nikeScraped from "./nike-serbia-scraped.json";
import type { ImportedRetailerSlug } from "./imported-retailers";
import type { RetailerStore } from "@/types";

interface ScrapedStore {
  path: string;
  name: string;
  address: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  shoppingCenterSlug?: string | null;
  storeUrl?: string | null;
  nikeUrl?: string | null;
}

const MALL_NAMES: Record<string, string> = {
  usce: "Ušće",
  "delta-city": "Delta City",
  galerija: "Galerija",
  "big-fashion": "BIG Fashion",
  promenada: "Promenada",
  stadion: "Stadion",
  mercator: "Mercator",
  "kragujevac-plaza": "Plaza Kragujevac",
  zlatibor: "Stop Shop Zlatibor",
};

function mapStore(store: ScrapedStore, retailerSlug: string): RetailerStore {
  const mallSlug = store.shoppingCenterSlug ?? null;
  return {
    id: `${retailerSlug}-${store.path}`,
    name: store.name,
    address: store.address,
    city: store.city,
    phone: store.phone ?? null,
    email: store.email ?? null,
    shoppingCenterSlug: mallSlug,
    shoppingCenterName: mallSlug ? (MALL_NAMES[mallSlug] ?? null) : null,
    storeUrl: store.storeUrl ?? store.nikeUrl ?? null,
  };
}

const STATIC_STORES: Partial<Record<ImportedRetailerSlug, RetailerStore[]>> = {
  "buzz-sneakers": buzzScraped.stores.map((s) =>
    mapStore(s as ScrapedStore, "buzz-sneakers")
  ),
  "office-shoes": officeScraped.stores.map((s) =>
    mapStore(s as ScrapedStore, "office-shoes")
  ),
  "sport-time": nikeScraped.stores.map((s) =>
    mapStore(s as ScrapedStore, "sport-time")
  ),
};

export function getStaticRetailerStores(retailerSlug: string): RetailerStore[] {
  return STATIC_STORES[retailerSlug as ImportedRetailerSlug] ?? [];
}
