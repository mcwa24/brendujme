import scraped from "./home-retail-serbia-scraped.json";
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
  mercator: "Merkator",
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

export const homeRetailers: Retailer[] = [
  {
    slug: "jysk",
    name: "JYSK",
    description:
      "Danski lanac za dom — posteljina, nameštaj i dekoracija u 50 prodavnica širom Srbije.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["jysk"],
  },
  {
    slug: "ikea",
    name: "IKEA",
    description:
      "Švedska robna kuća — kompletan asortiman za dom, Švedski restoran i IKEA Family u Beogradu.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["ikea"],
  },
  {
    slug: "forma-ideale",
    name: "Forma Ideale",
    description:
      "Domaći lider u nameštaju — 44 salona, proizvodnja u Kragujevcu i online prodaja.",
    city: "Kragujevac",
    brandCount: 1,
    brandSlugs: ["forma-ideale"],
  },
  {
    slug: "emmezeta",
    name: "Emmezeta",
    description:
      "Veliki prodajni centri nameštaja — Emmezeta i Merkury by Emmezeta u Beogradu, Novom Sadu i Nišu.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["emmezeta"],
  },
];

export function getHomeRetailerStores(slug: string): RetailerStore[] {
  return storesForRetailer(slug);
}
