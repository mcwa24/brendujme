import { buzzSneakersBrands } from "@/lib/data/buzz-sneakers";
import { djakSportBrands } from "@/lib/data/djak-sport";
import { officeShoesBrands } from "@/lib/data/office-shoes";
import { planetaSportBrands } from "@/lib/data/planeta-sport";
import { sportVisionBrands } from "@/lib/data/sport-vision";
import { tikeBrands } from "@/lib/data/tike";
import { urbanShopBrands } from "@/lib/data/urban-shop";
import type { Brand, PriceSegment } from "@/types";

export interface ScrapedRetailerBrandEntry {
  slug: string;
  name: string;
  logoUrl?: string | null;
  productUrl?: string;
}

export const SCRAPED_BY_RETAILER: Record<string, ScrapedRetailerBrandEntry[]> = {
  "buzz-sneakers": buzzSneakersBrands,
  "office-shoes": officeShoesBrands,
  "djak-sport": djakSportBrands,
  "sport-vision": sportVisionBrands,
  "planeta-sport": planetaSportBrands,
  tike: tikeBrands,
  "urban-shop": urbanShopBrands,
};

export function getScrapedBrandsForRetailer(
  retailerSlug: string
): ScrapedRetailerBrandEntry[] | undefined {
  return SCRAPED_BY_RETAILER[retailerSlug];
}

export function getScrapedRetailerSlugs(): string[] {
  return Object.keys(SCRAPED_BY_RETAILER).sort((a, b) => a.localeCompare(b, "sr"));
}

export function uniqueScrapedBrandSlugs(
  brands: ScrapedRetailerBrandEntry[]
): string[] {
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const brand of brands) {
    if (seen.has(brand.slug)) continue;
    seen.add(brand.slug);
    slugs.push(brand.slug);
  }
  return slugs.sort((a, b) => a.localeCompare(b, "sr"));
}

const STUB_DEFAULTS = {
  category: "footwear" as const,
  country: "",
  description: "",
  priceSegment: "mid" as PriceSegment,
  availabilityCount: 0,
  locations: [],
  shoppingCenterSlugs: [],
  relatedBrandSlugs: [],
};

export function scrapedBrandToStub(entry: ScrapedRetailerBrandEntry): Brand {
  return {
    slug: entry.slug,
    name: entry.name,
    website: entry.productUrl?.trim() ?? "",
    logoUrl: entry.logoUrl?.trim() || undefined,
    ...STUB_DEFAULTS,
  };
}
