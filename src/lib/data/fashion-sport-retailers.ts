import scraped from "./fashion-sport-serbia-scraped.json";
import {
  fashionAndFriendsBrands,
} from "@/lib/data/fashion-and-friends";
import { brands as staticBrands } from "@/lib/data/brands";
import { uniqueModniCatalogBrandSlugs } from "@/lib/data/modni-retailer-brands";
import type { Retailer } from "@/types";
import type { RetailerStore } from "@/types";

const catalogBySlug = new Map(staticBrands.map((b) => [b.slug, b]));
const tikeCatalogSlugs = uniqueModniCatalogBrandSlugs("tike", catalogBySlug);

const fashionFriendsBrandSlugs = [
  ...new Set(
    fashionAndFriendsBrands
      .map((b) => b.bilbordSlug)
      .filter((s): s is string => Boolean(s && catalogBySlug.has(s)))
  ),
].sort((a, b) => a.localeCompare(b, "sr"));

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
};

function storesForRetailer(slug: string): RetailerStore[] {
  return scraped.stores
    .filter((s) => s.retailerSlug === slug)
    .map((s, i) => ({
      id: `${slug}-${i}`,
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

/** Novi fashion/sport partneri (FC već u repository; sport lanci u importedRetailers) */
export const fashionSportRetailers: Retailer[] = [
  {
    slug: "fashion-friends",
    name: "Fashion&Friends",
    description:
      "Multibrand koncept Fashion Company — Diesel, Replay, Guess, Superdry, Liu Jo i dr. u Ušću, Rajićevoj, Galeriji i regionu.",
    city: "Beograd",
    brandCount: fashionFriendsBrandSlugs.length,
    brandSlugs: fashionFriendsBrandSlugs,
  },
  {
    slug: "tike",
    name: "Tike",
    description:
      "Sneaker temple u centru Beograda — Nike, Jordan, Adidas, New Balance i dr. prema zvaničnom katalogu na tike.rs.",
    city: "Beograd",
    brandCount: tikeCatalogSlugs.length,
    brandSlugs: tikeCatalogSlugs,
  },
];

export function getFashionSportRetailerStores(slug: string): RetailerStore[] {
  return storesForRetailer(slug);
}
