import { catalogCache } from "@/lib/data/catalog-cache";
import { getAllBrands, getAllRetailers, getAllShoppingCenters } from "@/lib/data/repository";
import { buildSearchResults } from "@/lib/search-catalog";
import { sanitizeSearchQuery } from "@/lib/security/sanitize-search-query";
import type { Brand, Retailer, SearchResult, ShoppingCenter } from "@/types";

async function loadSearchCatalog(): Promise<{
  brands: Brand[];
  retailers: Retailer[];
  shoppingCenters: ShoppingCenter[];
}> {
  const [brands, retailers, shoppingCenters] = await Promise.all([
    getAllBrands(),
    getAllRetailers(),
    getAllShoppingCenters(),
  ]);
  return { brands, retailers, shoppingCenters };
}

const getSearchCatalog = () =>
  catalogCache(["search-catalog"], loadSearchCatalog, ["catalog", "search"]);

export async function searchAllAsync(query: string): Promise<SearchResult[]> {
  const safeQuery = sanitizeSearchQuery(query);
  if (!safeQuery) return [];

  const { brands, retailers, shoppingCenters } = await getSearchCatalog();
  return buildSearchResults(safeQuery, brands, retailers, shoppingCenters);
}
