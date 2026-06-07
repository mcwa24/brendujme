import { brands } from "@/lib/data/brands";
import { DEPRECATED_BRAND_SLUGS } from "@/lib/data/imported-retailers";
import { retailers } from "@/lib/data/retailers";
import {
  filterPublishedShoppingCenters,
  shoppingCenters,
} from "@/lib/data/shopping-centers";
import { enrichBrand } from "@/lib/data/enrich-brand";
import { buildSearchResults } from "@/lib/search-catalog";
import { sanitizeSearchQuery } from "@/lib/security/sanitize-search-query";
import type { SearchResult } from "@/types";

const EXCLUDED_BRAND_SLUGS = new Set<string>(DEPRECATED_BRAND_SLUGS);

export function searchAll(query: string): SearchResult[] {
  const safeQuery = sanitizeSearchQuery(query);
  if (!safeQuery) return [];

  return buildSearchResults(
    safeQuery,
    brands
      .filter((b) => !EXCLUDED_BRAND_SLUGS.has(b.slug))
      .map(enrichBrand),
    retailers,
    filterPublishedShoppingCenters(shoppingCenters)
  );
}
