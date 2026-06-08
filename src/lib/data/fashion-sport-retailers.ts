import scraped from "./fashion-sport-serbia-scraped.json";
import { brands as staticBrands } from "@/lib/data/brands";
import { uniqueModniScrapedBrandSlugs } from "@/lib/data/modni-retailer-brands";
import type { Retailer } from "@/types";
import type { RetailerStore } from "@/types";

const catalogBySlug = new Map(staticBrands.map((b) => [b.slug, b]));
const tikeBrandSlugs = uniqueModniScrapedBrandSlugs("tike", catalogBySlug);

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
    slug: "tike",
    name: "Tike",
    description:
      "Sneaker temple u centru Beograda — Nike, Jordan, Adidas, New Balance i dr. prema zvaničnom katalogu na tike.rs.",
    city: "Beograd",
    brandCount: tikeBrandSlugs.length,
    brandSlugs: tikeBrandSlugs,
  },
];

export function getFashionSportRetailerStores(slug: string): RetailerStore[] {
  return storesForRetailer(slug);
}
