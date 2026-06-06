import {
  getBrandRetailerOfferings,
  type OfferingSlug,
} from "@/lib/data/brand-offerings";
import { getBrandCountry } from "@/lib/data/brand-countries";
import type { Brand, RetailLocation } from "@/types";

export function enrichRetailLocations(
  brandSlug: string,
  locations: RetailLocation[]
): RetailLocation[] {
  return locations.map((loc) => ({
    ...loc,
    offerings: getBrandRetailerOfferings(brandSlug, loc.retailerSlug),
  }));
}

export function enrichBrand(brand: Brand): Brand {
  const country = brand.country?.trim() || getBrandCountry(brand.slug) || "";
  return {
    ...brand,
    country,
    locations: enrichRetailLocations(brand.slug, brand.locations),
  };
}

export function filterLocationsByOfferings(
  locations: RetailLocation[],
  selected: OfferingSlug | "all"
): RetailLocation[] {
  if (selected === "all") return locations;
  return locations.filter((loc) => loc.offerings?.includes(selected));
}
