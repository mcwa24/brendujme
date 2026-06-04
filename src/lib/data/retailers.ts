import type { Retailer } from "@/types";
import { fashionRetailers } from "@/lib/data/fashion-retailers";
import { fashionSportRetailers } from "@/lib/data/fashion-sport-retailers";
import { IMPORTED_RETAILER_SLUGS, sortImportedRetailers } from "@/lib/data/imported-retailers";

/** Samo stvarno uvezeni retail partneri (fallback bez Supabase) */
const importedRetailers: Retailer[] = [
  {
    slug: "buzz-sneakers",
    name: "Buzz Sneakers",
    description:
      "Sneaker i lifestyle mreža — Nike, Adidas, New Balance, Puma, Converse i 35+ brenda u radnjama širom Srbije.",
    city: "Beograd",
    brandCount: 38,
    brandSlugs: ["nike", "adidas", "new-balance", "puma", "converse", "vans"],
  },
  {
    slug: "office-shoes",
    name: "Office Shoes",
    description:
      "Vodeća mreža prodavnica obuće u Srbiji — Timberland, Calvin Klein, New Balance, Dr. Martens, Skechers i 40+ brenda.",
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
  {
    slug: "djak-sport",
    name: "Đak Sport",
    description:
      "Najveći multibrend lanac sportske opreme u Srbiji — Nike, Adidas, Puma, Reebok, Hummel, New Balance i 160+ brenda u mreži prodavnica.",
    city: "Beograd",
    brandCount: 168,
    brandSlugs: [
      "nike",
      "adidas",
      "puma",
      "reebok",
      "converse",
      "new-balance",
      "under-armour",
      "north-face",
      "columbia",
      "timberland",
      "hummel",
      "lacoste",
      "guess",
      "calvin-klein",
    ],
  },
  {
    slug: "sport-vision",
    name: "Sport Vision",
    description:
      "Multibrend lanac sportske opreme u Srbiji — Nike, Adidas, Puma, The North Face, Columbia, Salomon i 55+ brenda u mreži prodavnica.",
    city: "Beograd",
    brandCount: 58,
    brandSlugs: [
      "nike",
      "adidas",
      "puma",
      "reebok",
      "converse",
      "new-balance",
      "under-armour",
      "north-face",
      "columbia",
      "timberland",
      "salomon",
      "asics",
    ],
  },
  {
    slug: "planeta-sport",
    name: "Planeta Sport",
    description:
      "Multibrend lanac sportske opreme u Srbiji — Nike, Adidas, Puma, Reebok, Columbia, Skechers i 85+ brenda u mreži prodavnica.",
    city: "Beograd",
    brandCount: 88,
    brandSlugs: [
      "nike",
      "adidas",
      "puma",
      "reebok",
      "converse",
      "new-balance",
      "under-armour",
      "columbia",
      "skechers",
      "jordan",
      "saucony",
    ],
  },
];

export const retailers: Retailer[] = sortImportedRetailers([
  ...importedRetailers,
  ...fashionSportRetailers,
  ...fashionRetailers,
]);

export { IMPORTED_RETAILER_SLUGS };

export function getRetailerBySlug(slug: string): Retailer | undefined {
  return retailers.find((r) => r.slug === slug);
}
