import { brands } from "@/lib/data/brands";
import { retailers } from "@/lib/data/retailers";
import { shoppingCenters } from "@/lib/data/shopping-centers";
import { enrichBrand } from "@/lib/data/enrich-brand";
import { buildSearchResults } from "@/lib/search-catalog";
import { sanitizeSearchQuery } from "@/lib/security/sanitize-search-query";
import type { SearchResult } from "@/types";

export function searchAll(query: string): SearchResult[] {
  const safeQuery = sanitizeSearchQuery(query);
  if (!safeQuery) return [];

  return buildSearchResults(
    safeQuery,
    brands.map(enrichBrand),
    retailers,
    shoppingCenters
  );
}
