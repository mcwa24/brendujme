import scraped from "./tech-retail-serbia-scraped.json";
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
  mercator: "Mercator",
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

export const techRetailers: Retailer[] = [
  {
    slug: "gigatron",
    name: "Gigatron",
    description:
      "Najveći domaći lanac tehnike — 70+ prodavnica, Megastore i online shop gigatron.rs.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["gigatron"],
  },
  {
    slug: "tehnomanija",
    name: "Tehnomanija",
    description:
      "Mesto gde se kupuje tehnika — 80+ maloprodajnih objekata i vodeći online shop u Srbiji.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["tehnomanija"],
  },
  {
    slug: "bc-group",
    name: "BC Group",
    description:
      "BC Group Computers — online IT prodavnica (Big Bang), preuzimanje robe u Beogradu i širom Srbije.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["bc-group"],
  },
  {
    slug: "ct-shop",
    name: "CT Shop",
    description:
      "Comtrade maloprodaja tehnike — premium IT i elektronika u vodećim beogradskim tržnim centrima.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["ct-shop"],
  },
];

export function getTechRetailerStores(slug: string): RetailerStore[] {
  return storesForRetailer(slug);
}
