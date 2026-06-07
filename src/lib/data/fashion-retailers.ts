/**
 * Fashion retaileri u Srbiji (Inditex, LPP) — agregirane lokacije iz fast-fashion scrape
 */

import scraped from "./fast-fashion-serbia-scraped.json";
import { brands as staticBrands } from "@/lib/data/brands";
import type { Retailer } from "@/types";
import type { RetailerStore } from "@/types";

const catalogBySlug = new Map(staticBrands.map((b) => [b.slug, b]));

function catalogSlugs(slugs: string[]): string[] {
  return slugs.filter((s) => catalogBySlug.has(s));
}

const MALL_NAMES: Record<string, string> = {
  usce: "Ušće",
  "delta-city": "Delta City",
  galerija: "Galerija",
  "big-fashion": "BIG Fashion",
  promenada: "Promenada",
  stadion: "Stadion",
  rajiceva: "Rajićeva",
};

function storesForRetailer(retailerSlug: string): RetailerStore[] {
  return scraped.stores
    .filter((s) => s.retailerSlug === retailerSlug)
    .map((s, i) => ({
      id: `${retailerSlug}-${s.brandSlug}-${i}`,
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

export const fashionRetailers: Retailer[] = [
  {
    slug: "inditex",
    name: "Inditex (Srbija)",
    description:
      "Zara, Massimo Dutti, Pull&Bear, Bershka, Stradivarius i Oysho — zvanične Inditex prodavnice u tržnim centrima širom Srbije.",
    city: "Beograd",
    brandCount: catalogSlugs(["zara", "massimo-dutti", "pull-and-bear", "bershka", "stradivarius", "oysho"]).length,
    brandSlugs: catalogSlugs(["zara", "massimo-dutti", "pull-and-bear", "bershka", "stradivarius", "oysho"]),
  },
  {
    slug: "lpp",
    name: "LPP (Srbija)",
    description:
      "Reserved, Mohito, Sinsay, Cropp i House — poljska LPP grupa prisutna u Srbiji od 2017.",
    city: "Beograd",
    brandCount: catalogSlugs(["reserved", "mohito", "sinsay", "cropp", "house"]).length,
    brandSlugs: catalogSlugs(["reserved", "mohito", "sinsay", "cropp", "house"]),
  },
];

export function getFashionRetailerStores(slug: string): RetailerStore[] {
  return storesForRetailer(slug);
}
