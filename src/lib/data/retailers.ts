import type { Retailer } from "@/types";
import { IMPORTED_RETAILER_SLUGS, sortImportedRetailers } from "@/lib/data/imported-retailers";

/** Samo stvarno uvezeni retail partneri (fallback bez Supabase) */
const importedRetailers: Retailer[] = [
  {
    slug: "buzz-sneakers",
    name: "Buzz Sneakers",
    description:
      "Sneaker i lifestyle mreža — Nike, Adidas, New Balance, Puma, Converse i 35+ brendova u radnjama širom Srbije.",
    city: "Beograd",
    brandCount: 38,
    brandSlugs: ["nike", "adidas", "new-balance", "puma", "converse", "vans"],
  },
  {
    slug: "office-shoes",
    name: "Office Shoes",
    description:
      "Vodeća mreža prodavnica obuće u Srbiji — Timberland, Calvin Klein, New Balance, Dr. Martens, Skechers i 40+ brendova.",
    city: "Beograd",
    brandCount: 43,
    brandSlugs: [
      "timberland",
      "calvin-klein",
      "new-balance",
      "converse",
      "skechers",
      "dr-martens",
      "puma",
      "vans",
    ],
  },
  {
    slug: "sport-time",
    name: "Sport Time",
    description:
      "Ovlašćeni Nike partner u Srbiji — zvanične Nike prodavnice prema nike.com/retail/directory/serbia.",
    city: "Beograd",
    brandCount: 1,
    brandSlugs: ["nike"],
  },
];

export const retailers: Retailer[] = sortImportedRetailers(importedRetailers);

export { IMPORTED_RETAILER_SLUGS };

export function getRetailerBySlug(slug: string): Retailer | undefined {
  return retailers.find((r) => r.slug === slug);
}
