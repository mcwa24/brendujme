import { brands } from "@/lib/data/brands";
import { retailers } from "@/lib/data/retailers";
import { shoppingCenters } from "@/lib/data/shopping-centers";
import { enrichBrand } from "@/lib/data/enrich-brand";
import { buildSearchResults } from "@/lib/search-catalog";
import type { SearchResult } from "@/types";

export function searchAll(query: string): SearchResult[] {
  return buildSearchResults(
    query,
    brands.map(enrichBrand),
    retailers,
    shoppingCenters
  );
}
