import { brands } from "@/lib/data/brands";
import { retailers } from "@/lib/data/retailers";
import { shoppingCenters } from "@/lib/data/shopping-centers";
import { getCategoryName } from "@/lib/data/categories";
import type { SearchResult } from "@/types";

export function searchAll(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const brand of brands) {
    if (
      brand.name.toLowerCase().includes(q) ||
      brand.slug.includes(q) ||
      getCategoryName(brand.category).toLowerCase().includes(q)
    ) {
      results.push({
        type: "brand",
        slug: brand.slug,
        title: brand.name,
        subtitle: `${getCategoryName(brand.category)} · ${brand.availabilityCount} lokacija`,
        href: `/brands/${brand.slug}`,
      });
    }
  }

  for (const retailer of retailers) {
    if (
      retailer.name.toLowerCase().includes(q) ||
      retailer.city.toLowerCase().includes(q)
    ) {
      results.push({
        type: "retailer",
        slug: retailer.slug,
        title: retailer.name,
        subtitle: `${retailer.city} · ${retailer.brandCount} brendova`,
        href: `/retailers/${retailer.slug}`,
      });
    }
  }

  for (const center of shoppingCenters) {
    if (
      center.name.toLowerCase().includes(q) ||
      center.city.toLowerCase().includes(q)
    ) {
      results.push({
        type: "shopping-center",
        slug: center.slug,
        title: center.name,
        subtitle: `${center.city} · ${center.brandCount} brendova`,
        href: `/shopping-centers/${center.slug}`,
      });
    }
  }

  return results.slice(0, 12);
}
