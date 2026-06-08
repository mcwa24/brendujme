import type { Retailer } from "@/types";
import { brands as staticBrands } from "@/lib/data/brands";
import { fashionRetailers } from "@/lib/data/fashion-retailers";
import { fashionSportRetailers } from "@/lib/data/fashion-sport-retailers";
import {
  countModniScrapedBrands,
  isModniBrandSlug,
  uniqueModniScrapedBrandSlugs,
} from "@/lib/data/modni-retailer-brands";
import { IMPORTED_RETAILER_SLUGS, sortImportedRetailers } from "@/lib/data/imported-retailers";

const catalogBySlug = new Map(staticBrands.map((b) => [b.slug, b]));

function catalogBrandSlugs(
  retailerSlug: string,
  fallbackSlugs: string[] = []
): string[] {
  const fromScrape = uniqueModniScrapedBrandSlugs(retailerSlug, catalogBySlug);
  if (fromScrape.length) return fromScrape;
  return fallbackSlugs.filter((s) => isModniBrandSlug(s));
}

function catalogBrandCount(
  retailerSlug: string,
  fallbackSlugs: string[] = []
): number {
  const scrapedCount = countModniScrapedBrands(retailerSlug, catalogBySlug);
  if (scrapedCount) return scrapedCount;
  return catalogBrandSlugs(retailerSlug, fallbackSlugs).length;
}

/** Samo stvarno uvezeni retail partneri (fallback bez Supabase) */
const importedRetailers: Retailer[] = [
  {
    slug: "buzz-sneakers",
    name: "Buzz Sneakers",
    description:
      "Sneaker i lifestyle mreža — Nike, Adidas, New Balance, Puma, Converse i dr. u radnjama širom Srbije.",
    city: "Beograd",
    brandCount: catalogBrandCount("buzz-sneakers"),
    brandSlugs: catalogBrandSlugs("buzz-sneakers"),
  },
  {
    slug: "office-shoes",
    name: "Office Shoes",
    description:
      "Vodeća mreža prodavnica obuće u Srbiji — Timberland, Calvin Klein, New Balance, Dr. Martens, Skechers i dr.",
    city: "Beograd",
    brandCount: catalogBrandCount("office-shoes"),
    brandSlugs: catalogBrandSlugs("office-shoes"),
  },
  {
    slug: "sport-time",
    name: "Sport Time",
    description:
      "Ovlašćeni Nike partner u Srbiji — zvanične Nike prodavnice prema nike.com/retail/directory/serbia.",
    city: "Beograd",
    brandCount: catalogBrandCount("sport-time", ["nike"]),
    brandSlugs: catalogBrandSlugs("sport-time", ["nike"]),
  },
  {
    slug: "djak-sport",
    name: "Đak Sport",
    description:
      "Najveći multibrend lanac sportske opreme u Srbiji — Nike, Adidas, Puma, Reebok, Hummel, New Balance i dr.",
    city: "Beograd",
    brandCount: catalogBrandCount("djak-sport"),
    brandSlugs: catalogBrandSlugs("djak-sport"),
  },
  {
    slug: "sport-vision",
    name: "Sport Vision",
    description:
      "Multibrend lanac sportske opreme u Srbiji — Nike, Adidas, Puma, The North Face, Columbia, Salomon i dr.",
    city: "Beograd",
    brandCount: catalogBrandCount("sport-vision"),
    brandSlugs: catalogBrandSlugs("sport-vision"),
  },
  {
    slug: "planeta-sport",
    name: "Planeta Sport",
    description:
      "Multibrend lanac sportske opreme u Srbiji — Nike, Adidas, Puma, Reebok, Columbia, Skechers i dr.",
    city: "Beograd",
    brandCount: catalogBrandCount("planeta-sport"),
    brandSlugs: catalogBrandSlugs("planeta-sport"),
  },
  {
    slug: "urban-shop",
    name: "Urban Shop",
    description:
      "Urban i streetwear prodavnica — Fred Perry, Dr. Martens, Superdry, Salomon i dr. u Beogradu i Novom Sadu.",
    city: "Beograd",
    brandCount: catalogBrandCount("urban-shop"),
    brandSlugs: catalogBrandSlugs("urban-shop"),
  },
  {
    slug: "n-sport",
    name: "N Sport",
    description:
      "Najveća mreža sportskih i modnih prodavnica u Srbiji — Nike, Puma, Adidas, Timberland, Tommy Hilfiger i dr. u 100+ lokacija.",
    city: "Beograd",
    brandCount: catalogBrandCount("n-sport"),
    brandSlugs: catalogBrandSlugs("n-sport"),
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
