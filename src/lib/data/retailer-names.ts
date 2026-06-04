import { IMPORTED_RETAILER_SLUGS } from "@/lib/data/imported-retailers";
import { retailers as staticRetailers } from "@/lib/data/retailers";

/** Slugovi sa internom stranicom `/retailers/[slug]` */
export const RETAILER_PAGE_SLUGS = new Set<string>([
  "fashion-company",
  ...IMPORTED_RETAILER_SLUGS,
]);

const FALLBACK_NAMES: Record<string, string> = {
  "fashion-company": "Fashion Company",
  "premium-mall": "Premium Mall",
  "department-store": "Department Store",
  "luxury-gallery": "Luxury Gallery",
  "sport-vision": "Sport Vision",
  "beauty-world": "Beauty World",
  "outlet-park": "Outlet Park",
  "city-fashion": "City Fashion",
  "footwear-plus": "Footwear Plus",
  "european-brands": "European Brands",
};

export function retailerHasPage(slug: string): boolean {
  return RETAILER_PAGE_SLUGS.has(slug);
}

export function getRetailerDisplayName(slug: string): string {
  const fromStatic = staticRetailers.find((r) => r.slug === slug);
  if (fromStatic) return fromStatic.name;
  if (FALLBACK_NAMES[slug]) return FALLBACK_NAMES[slug];
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function retailerPageHref(slug: string): string {
  return `/retailers/${slug}`;
}
