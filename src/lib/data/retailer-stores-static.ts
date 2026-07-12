import buzzScraped from "./buzz-sneakers-scraped.json";
import djakScraped from "./djak-sport-scraped.json";
import sportVisionScraped from "./sport-vision-scraped.json";
import planetaScraped from "./planeta-sport-scraped.json";
import fsScraped from "./fashion-sport-serbia-scraped.json";
import fashionScraped from "./fast-fashion-serbia-scraped.json";
import officeScraped from "./office-shoes-scraped.json";
import nikeScraped from "./nike-serbia-scraped.json";
import tikeScraped from "./tike-scraped.json";
import nSportScraped from "./n-sport-scraped.json";
import urbanShopScraped from "./urban-shop-scraped.json";
import { isPublishedShoppingCenterSlug } from "@/lib/data/shopping-centers";
import { normalizeScrapedDisplayText } from "@/lib/format/display-text";
import type { RetailerStore } from "@/types";

interface ScrapedStore {
  path?: string;
  slug?: string;
  name: string;
  address: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
  rajiceva: "Rajićeva",
  mercator: "Mercator",
  "kragujevac-plaza": "Plaza Kragujevac",
  zlatibor: "Stop Shop Zlatibor",
};

function mapStore(store: ScrapedStore, retailerSlug: string): RetailerStore {
  const storeKey = store.path ?? store.slug ?? store.name;
  const rawMallSlug = store.shoppingCenterSlug ?? null;
  const mallSlug =
    rawMallSlug && isPublishedShoppingCenterSlug(rawMallSlug)
      ? rawMallSlug
      : null;
  return {
    id: `${retailerSlug}-${storeKey}`,
    name: normalizeScrapedDisplayText(store.name),
    address: store.address,
    city: store.city,
    phone: store.phone ?? null,
    email: store.email ?? null,
    latitude: store.latitude ?? null,
    longitude: store.longitude ?? null,
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
  "urban-shop": urbanShopScraped.stores.map((s) =>
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
      "urban-shop"
    )
  ),
  "n-sport": nSportScraped.stores.map((s) =>
    mapStore(
      {
        slug: s.path,
        name: s.name,
        address: s.address,
        city: s.city,
        phone: s.phone,
        email: s.email,
        shoppingCenterSlug: s.shoppingCenterSlug,
        latitude: s.latitude,
        longitude: s.longitude,
        storeUrl: s.storeUrl,
      },
      "n-sport"
    )
  ),
  "fashion-company": mapFashionCompanyStores(),
};

function isFashionAndFriendsStoreName(name: string): boolean {
  return /fashion\s*&\s*friends/i.test(name);
}

function fashionCompanyStoreKey(store: {
  name: string;
  address: string;
  city: string;
}): string {
  if (isFashionAndFriendsStoreName(store.name)) {
    return `ff:${store.address.toLowerCase()}|${store.city.toLowerCase()}`;
  }
  return `store:${store.name.toLowerCase()}|${store.address.toLowerCase()}|${store.city.toLowerCase()}`;
}

function mapFashionCompanyStores(): RetailerStore[] {
  const seen = new Set<string>();
  const stores: RetailerStore[] = [];

  const fcStores = fsScraped.stores.filter(
    (s) =>
      s.retailerSlug === "fashion-company" ||
      s.retailerSlug === "fashion-friends"
  );

  const sorted = [...fcStores].sort((a, b) => {
    const aFf = a.retailerSlug === "fashion-friends" ? 0 : 1;
    const bFf = b.retailerSlug === "fashion-friends" ? 0 : 1;
    return aFf - bFf;
  });

  for (const s of sorted) {
    const key = fashionCompanyStoreKey(s);
    if (seen.has(key)) continue;
    seen.add(key);

    stores.push({
      id: `fashion-company-${stores.length}`,
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
    });
  }

  return stores;
}

export function getStaticRetailerStores(retailerSlug: string): RetailerStore[] {
  return STATIC_STORES[retailerSlug] ?? [];
}

export function getStaticRetailerStoreSlugs(): string[] {
  return Object.keys(STATIC_STORES).sort((a, b) => a.localeCompare(b, "sr"));
}

export function getAllStaticStoreCityRows(): { city?: string }[] {
  return Object.values(STATIC_STORES).flat();
}
