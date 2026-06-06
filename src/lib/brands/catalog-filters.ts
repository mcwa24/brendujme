import type { BrandDirectoryItem } from "@/lib/data/brand-directory-item";
import type { PriceSegment } from "@/types";

type BrandFilterInput = Pick<
  BrandDirectoryItem,
  "name" | "country" | "priceSegment" | "availabilityCount"
>;

export interface CountryFilterOption {
  value: string;
  label: string;
  count: number;
}

export interface PriceSegmentFilterOption {
  value: PriceSegment;
  label: string;
  count: number;
}

const UNKNOWN_COUNTRY = "Drugo";

const PRICE_SEGMENT_LABELS: Record<PriceSegment, string> = {
  budget: "Pristupačno",
  mid: "Srednji",
  premium: "Premium",
  luxury: "Luksuz",
};

export function getCountryFilterOptions(brands: BrandFilterInput[]): CountryFilterOption[] {
  const counts = new Map<string, number>();
  for (const brand of brands) {
    const key = brand.country?.trim() || UNKNOWN_COUNTRY;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "sr"));
}

export function getPriceSegmentFilterOptions(
  brands: BrandFilterInput[]
): PriceSegmentFilterOption[] {
  const counts = new Map<PriceSegment, number>();
  for (const brand of brands) {
    counts.set(brand.priceSegment, (counts.get(brand.priceSegment) ?? 0) + 1);
  }

  const order: PriceSegment[] = ["budget", "mid", "premium", "luxury"];
  return order
    .filter((value) => counts.has(value))
    .map((value) => ({
      value,
      label: PRICE_SEGMENT_LABELS[value],
      count: counts.get(value)!,
    }));
}

export function brandMatchesCountry(brand: BrandFilterInput, country: string): boolean {
  if (country === "Sve zemlje") return true;
  const brandCountry = brand.country?.trim() || UNKNOWN_COUNTRY;
  return brandCountry === country;
}

export function brandMatchesSearch(brand: BrandFilterInput, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return brand.name.toLowerCase().includes(q);
}
