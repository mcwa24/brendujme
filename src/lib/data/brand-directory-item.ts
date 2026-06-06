import type { Brand } from "@/types";

/** Minimalni payload za /brands listing — bez lokacija i dugih opisa. */
export type BrandDirectoryItem = Pick<
  Brand,
  | "slug"
  | "name"
  | "country"
  | "priceSegment"
  | "availabilityCount"
  | "category"
  | "website"
  | "logoUrl"
  | "logoStoragePath"
  | "hasCustomLogo"
>;

export function toBrandDirectoryItem(brand: Brand): BrandDirectoryItem {
  return {
    slug: brand.slug,
    name: brand.name,
    country: brand.country,
    priceSegment: brand.priceSegment,
    availabilityCount: brand.availabilityCount,
    category: brand.category,
    website: brand.website,
    logoUrl: brand.logoUrl,
    logoStoragePath: brand.logoStoragePath,
    hasCustomLogo: brand.hasCustomLogo,
  };
}
