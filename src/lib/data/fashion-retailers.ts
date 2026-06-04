/**
 * Fashion retaileri u Srbiji (Inditex, LPP) — agregirane lokacije iz fast-fashion scrape
 */

import scraped from "./fast-fashion-serbia-scraped.json";
import type { Retailer } from "@/types";
import type { RetailerStore } from "@/types";

const MALL_NAMES: Record<string, string> = {
  usce: "Ušće",
  "delta-city": "Delta City",
  galerija: "Galerija",
  "big-fashion": "BIG Fashion",
  promenada: "Promenada",
  stadion: "Stadion",
  rajiceva: "Rajiceva",
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
    brandCount: 6,
    brandSlugs: ["zara", "massimo-dutti", "pull-and-bear", "bershka", "stradivarius", "oysho"],
  },
  {
    slug: "lpp",
    name: "LPP (Srbija)",
    description:
      "Reserved, Mohito, Sinsay, Cropp i House — poljska LPP grupa sa 60+ prodavnica u Srbiji od 2017.",
    city: "Beograd",
    brandCount: 5,
    brandSlugs: ["reserved", "mohito", "sinsay", "cropp", "house"],
  },
];

export function getFashionRetailerStores(slug: string): RetailerStore[] {
  return storesForRetailer(slug);
}
