import buzzScraped from "./buzz-sneakers-scraped.json";
import djakScraped from "./djak-sport-scraped.json";
import sportVisionScraped from "./sport-vision-scraped.json";
import planetaScraped from "./planeta-sport-scraped.json";
import fsScraped from "./fashion-sport-serbia-scraped.json";
import fashionScraped from "./fast-fashion-serbia-scraped.json";
import officeScraped from "./office-shoes-scraped.json";
import nikeScraped from "./nike-serbia-scraped.json";
import tikeScraped from "./tike-scraped.json";
import type { RetailerStore } from "@/types";

interface ScrapedStore {
  path?: string;
  slug?: string;
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
  const storeKey = store.path ?? store.slug ?? store.name;
  const mallSlug = store.shoppingCenterSlug ?? null;
  return {
    id: `${retailerSlug}-${storeKey}`,
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

const STATIC_STORES: Record<string, RetailerStore[]> = {
  "buzz-sneakers": buzzScraped.stores.map((s) =>
    mapStore(s as ScrapedStore, "buzz-sneakers")
  ),
  "office-shoes": officeScraped.stores.map((s) =>
    mapStore(s as ScrapedStore, "office-shoes")
  ),
  "sport-time": nikeScraped.stores.map((s) =>
    mapStore(s as ScrapedStore, "sport-time")
  ),
  "djak-sport": djakScraped.stores.map((s) =>
    mapStore(s as ScrapedStore, "djak-sport")
  ),
  "sport-vision": sportVisionScraped.stores.map((s) =>
    mapStore(s as ScrapedStore, "sport-vision")
  ),
  "planeta-sport": planetaScraped.stores.map((s) =>
    mapStore(s as ScrapedStore, "planeta-sport")
  ),
  inditex: fashionScraped.stores
    .filter((s) => s.retailerSlug === "inditex")
    .map((s, i) => ({
      id: `inditex-${s.brandSlug}-${i}`,
      name: s.name,
      address: s.address,
      city: s.city,
      phone: null,
      email: null,
      shoppingCenterSlug: s.shoppingCenterSlug,
      shoppingCenterName: s.shoppingCenterSlug
        ? (MALL_NAMES[s.shoppingCenterSlug] ?? null)
        : null,
      storeUrl: s.storeUrl,
    })),
  lpp: fashionScraped.stores
    .filter((s) => s.retailerSlug === "lpp")
    .map((s, i) => ({
      id: `lpp-${s.brandSlug}-${i}`,
      name: s.name,
      address: s.address,
      city: s.city,
      phone: null,
      email: null,
      shoppingCenterSlug: s.shoppingCenterSlug,
      shoppingCenterName: s.shoppingCenterSlug
        ? (MALL_NAMES[s.shoppingCenterSlug] ?? null)
        : null,
      storeUrl: s.storeUrl,
    })),
  "fashion-friends": mapFsStores("fashion-friends"),
  "extra-sports": mapFsStores("extra-sports"),
  tike: tikeScraped.stores.map((s) =>
    mapStore(
      {
        slug: s.path,
        name: s.name,
        address: s.address,
        city: s.city,
        phone: s.phone,
        email: s.email,
        storeUrl: s.storeUrl,
      },
      "tike"
    )
  ),
  "run-n-more": mapFsStores("run-n-more"),
  "fashion-company": mapFsStores("fashion-company"),
};

function mapFsStores(retailerSlug: string): RetailerStore[] {
  return fsScraped.stores
    .filter((s) => s.retailerSlug === retailerSlug)
    .map((s, i) => ({
      id: `${retailerSlug}-${i}`,
      name: s.name,
      address: s.address,
      city: s.city,
      phone: null,
      email: null,
      shoppingCenterSlug: s.shoppingCenterSlug,
      shoppingCenterName: s.shoppingCenterSlug
        ? (MALL_NAMES[s.shoppingCenterSlug] ?? null)
        : null,
      storeUrl: s.storeUrl,
    }));
}

export function getStaticRetailerStores(retailerSlug: string): RetailerStore[] {
  return STATIC_STORES[retailerSlug] ?? [];
}
