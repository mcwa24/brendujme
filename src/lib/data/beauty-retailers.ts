import scraped from "./beauty-retail-serbia-scraped.json";
import type { Retailer } from "@/types";
import type { RetailerStore } from "@/types";

const MALL_NAMES: Record<string, string> = {
  usce: "Ušće",
  "delta-city": "Delta City",
  galerija: "Galerija",
  "big-fashion": "BIG Fashion",
  promenada: "Promenada",
  stadion: "Stadion",
  rajiceva: "Rajićeva",
  "kragujevac-plaza": "Plaza Kragujevac",
};

function storesForRetailer(slug: string): RetailerStore[] {
  return scraped.stores
    .filter((s) => s.retailerSlug === slug)
    .map((s, i) => ({
      id: `${slug}-${s.brandSlug}-${i}`,
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

export const beautyRetailers: Retailer[] = [
  {
    slug: "sephora",
    name: "Sephora",
    description: "LVMH parfimerija — kozmetika, parfemi i usluge lepote u vodećim tržnim centrima Srbije.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["sephora"],
  },
  {
    slug: "dm",
    name: "dm drogerie markt",
    description: "Najveća drogerijska mreža u Evropi — 130+ prodajnih mesta u 37 gradova u Srbiji.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["dm"],
  },
  {
    slug: "lilly",
    name: "Lilly Drogerie",
    description: "Najpopularniji domaći lanac drogerija i apoteka — 185+ lokacija širom Srbije.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["lilly"],
  },
  {
    slug: "jasmin",
    name: "Jasmin",
    description: "Parfimerije luksuznih brendova — 30+ prodavnica u Beogradu i regionu.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["jasmin"],
  },
];

export function getBeautyRetailerStores(slug: string): RetailerStore[] {
  return storesForRetailer(slug);
}
