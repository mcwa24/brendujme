/**
 * Šta koji prodavac nudi za dati brend (patike vs odeća).
 * Buzz = Nike patike, ne garderoba; Fashion Company = odeća brendova, ne sneaker shop.
 */

import type { BrandOfferingSlug, CategorySlug } from "@/types";

export type OfferingSlug = BrandOfferingSlug;

export const OFFERING_LABELS: Record<BrandOfferingSlug, string> = {
  footwear: "Patike i obuća",
  apparel: "Odeća i moda",
  sportswear: "Sportska odeća",
  accessories: "Dodaci i oprema",
};

/** Podrazumevani fokus prodavca (ako nema posebnog pravila za brend) */
export const RETAILER_OFFERING_FOCUS: Record<string, OfferingSlug[]> = {
  "buzz-sneakers": ["footwear"],
  "office-shoes": ["footwear"],
  "sport-time": ["footwear"],
  tike: ["footwear"],
  "fashion-company": ["apparel"],
  "fashion-friends": ["apparel"],
  inditex: ["apparel"],
  lpp: ["apparel"],
  "sport-vision": ["footwear", "sportswear"],
  "planeta-sport": ["footwear", "sportswear"],
  "djak-sport": ["footwear", "sportswear"],
};

/** Uži skup po brendu + prodavcu (nadjašnja RETAILER_OFFERING_FOCUS) */
const BRAND_AT_RETAILER: Record<string, Record<string, OfferingSlug[]>> = {
  nike: {
    "buzz-sneakers": ["footwear"],
    "office-shoes": ["footwear"],
    "sport-time": ["footwear"],
    tike: ["footwear"],
    "sport-vision": ["footwear", "sportswear"],
    "planeta-sport": ["footwear", "sportswear"],
    "djak-sport": ["footwear", "sportswear"],
    "fashion-company": ["sportswear"],
    "fashion-friends": ["sportswear"],
  },
  adidas: {
    "buzz-sneakers": ["footwear"],
    "sport-vision": ["footwear", "sportswear"],
    "planeta-sport": ["footwear", "sportswear"],
    "djak-sport": ["footwear", "sportswear"],
    "fashion-friends": ["sportswear", "apparel"],
    "fashion-company": ["sportswear", "apparel"],
  },
  puma: {
    "buzz-sneakers": ["footwear"],
    "sport-vision": ["footwear", "sportswear"],
    "planeta-sport": ["footwear", "sportswear"],
  },
  "new-balance": {
    "office-shoes": ["footwear"],
    "buzz-sneakers": ["footwear"],
    "sport-vision": ["footwear"],
  },
  converse: {
    "buzz-sneakers": ["footwear"],
    "office-shoes": ["footwear"],
    "sport-vision": ["footwear"],
  },
  vans: {
    "buzz-sneakers": ["footwear"],
    "sport-vision": ["footwear"],
  },
  jordan: {
    tike: ["footwear"],
    "sport-vision": ["footwear"],
    "planeta-sport": ["footwear"],
  },
  asics: { tike: ["footwear"] },
  saucony: { tike: ["footwear"] },
  reebok: { tike: ["footwear"] },
  birkenstock: { tike: ["footwear"] },
  crocs: { tike: ["footwear"] },
  hoka: { tike: ["footwear"] },
  salomon: { tike: ["footwear"] },
  havaianas: { tike: ["footwear"] },
  "new-era": { tike: ["accessories"] },
  sprayground: { tike: ["accessories"] },
  "crep-protect": { tike: ["accessories"] },
  "goorin-bros": { tike: ["accessories"] },
  stanley: { tike: ["accessories"] },
  stance: { tike: ["accessories"] },
  diesel: {
    "fashion-company": ["apparel"],
    "fashion-friends": ["apparel"],
  },
  levis: {
    "fashion-company": ["apparel"],
    "fashion-friends": ["apparel"],
  },
};

export function getBrandRetailerOfferings(
  brandSlug: string,
  retailerSlug: string
): OfferingSlug[] {
  const specific = BRAND_AT_RETAILER[brandSlug]?.[retailerSlug];
  if (specific?.length) return specific;
  const fallback = RETAILER_OFFERING_FOCUS[retailerSlug];
  if (fallback?.length) return fallback;
  return ["sportswear"];
}

/** Tražena odeća (majica, garderoba) uključuje i sportsku odeću u multibrend radnjama */
function expandWantedOfferings(wanted: OfferingSlug[]): OfferingSlug[] {
  const expanded = new Set(wanted);
  if (wanted.includes("apparel")) expanded.add("sportswear");
  if (wanted.includes("sportswear")) expanded.add("apparel");
  return [...expanded];
}

export function offeringsOverlap(
  wanted: OfferingSlug[] | undefined,
  available: OfferingSlug[]
): boolean {
  if (!wanted?.length) return true;
  const expanded = expandWantedOfferings(wanted);
  return expanded.some((w) => available.includes(w));
}

export const OFFERING_GROUP_ORDER: OfferingSlug[] = [
  "footwear",
  "sportswear",
  "apparel",
  "accessories",
];

/** Koje ponude prodavca odgovaraju traženim rečima (npr. majica → i sportska odeća) */
export function matchOfferingsForIntent(
  wanted: OfferingSlug[] | undefined,
  available: OfferingSlug[]
): OfferingSlug[] {
  if (!wanted?.length) return available;
  const expanded = expandWantedOfferings(wanted);
  return available.filter((o) => expanded.includes(o));
}

export function formatOfferingsLabel(offerings: OfferingSlug[]): string {
  if (!offerings.length) return "Opšta ponuda";
  return offerings.map((o) => OFFERING_LABELS[o]).join(" · ");
}

/** Retailer je relevantan za brend samo ako ima bar jednu traženu kategoriju ponude */
export function retailerSellsBrandForOfferings(
  brandSlug: string,
  retailerSlug: string,
  wantedOfferings?: OfferingSlug[]
): boolean {
  const available = getBrandRetailerOfferings(brandSlug, retailerSlug);
  return offeringsOverlap(wantedOfferings, available);
}

export function retailerPrimaryCategory(retailerSlug: string): CategorySlug {
  const focus = RETAILER_OFFERING_FOCUS[retailerSlug];
  if (focus?.includes("apparel") && !focus.includes("footwear")) return "fashion";
  if (focus?.includes("footwear") && !focus?.includes("apparel")) return "sports";
  return "sports";
}
