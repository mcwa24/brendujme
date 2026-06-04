import { getAllBrands, getAllRetailers, getAllShoppingCenters } from "@/lib/data/repository";
import { buildSearchResults } from "@/lib/search-catalog";
import type { SearchResult } from "@/types";

export async function searchAllAsync(query: string): Promise<SearchResult[]> {
  const [brands, retailers, shoppingCenters] = await Promise.all([
    getAllBrands(),
    getAllRetailers(),
    getAllShoppingCenters(),
  ]);

  return buildSearchResults(query, brands, retailers, shoppingCenters);
}
