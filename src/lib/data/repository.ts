import { cache } from "react";
import { catalogCache } from "@/lib/data/catalog-cache";
import { brands as staticBrands, getBrandBySlug as getStaticBrandBySlug } from "@/lib/data/brands";
import { enrichBrand } from "@/lib/data/enrich-brand";
import {
  categories as staticCategories,
  FASHION_CATEGORY,
} from "@/lib/data/categories";
import { newsArticles as staticNews } from "@/lib/data/news";
import { fashionCompanyRetailer } from "@/lib/data/fashion-company";
import { getRetailerCatalogMeta } from "@/lib/data/retailer-catalog-meta";
import {
  getScrapedBrandsForRetailer,
  uniqueScrapedBrandSlugs,
} from "@/lib/data/retailer-scraped-brands";
import {
  filterModniBrands,
  filterModniScrapedEntries,
} from "@/lib/data/modni-retailer-brands";
import { retailers as staticRetailers } from "@/lib/data/retailers";
import {
  DEPRECATED_BRAND_SLUGS,
  isExcludedRetailerSlug,
  isImportedRetailerSlug,
  sortImportedRetailers,
} from "@/lib/data/imported-retailers";
import { shoppingCenters as staticShoppingCenters } from "@/lib/data/shopping-centers";
import { fetchAllBrandsFromSupabase } from "@/lib/supabase/fetch-brands";
import {
  dedupePromotionsForHome,
  getActiveHomePromotionsFromStatic,
} from "@/lib/data/promotions";
import {
  getPrimaryRetailerForPromoGroup,
  getRetailerPromoGroupId,
} from "@/lib/data/retailer-promo-groups";
import {
  fetchCategoriesFromSupabase,
  fetchNewsFromSupabase,
  fetchRetailersFromSupabase,
  fetchShoppingCentersFromSupabase,
} from "@/lib/supabase/fetch-catalog";
import { fetchActiveHomePromotionsFromSupabase } from "@/lib/supabase/fetch-promotions";
import {
  fetchAllGhostModaStilNews,
  fetchGhostModaStilNewsPage,
  fetchGhostNewsBySlug,
} from "@/lib/ghost/fetch-news";
import { isGhostConfigured } from "@/lib/ghost/env";
import type { NewsPageResult } from "@/lib/news/types";
import {
  getCatalogStoreCityCount,
  getCatalogStoreCount,
} from "@/lib/data/home-location-stats";
import { fetchRetailerStores } from "@/lib/supabase/fetch-retailer-stores";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  Brand,
  Category,
  HomePromotion,
  NewsArticle,
  Retailer,
  RetailerStore,
  ShoppingCenter,
} from "@/types";

export const getDataSource = cache(() =>
  isSupabaseConfigured() ? "supabase" as const : "static" as const
);

/** Uvezeni brendovi/retaileri iz JSON-a — dopunjuju Supabase dok seed ne uhvati sve slugove */
function mergeBySlug<T extends { slug: string }>(fromDb: T[], fromStatic: T[]): T[] {
  const seen = new Set(fromDb.map((item) => item.slug));
  const missing = fromStatic.filter((item) => !seen.has(item.slug));
  return missing.length ? [...fromDb, ...missing] : fromDb;
}

function dedupeBySlug<T extends { slug: string }>(items: T[]): T[] {
  const bySlug = new Map<string, T>();
  for (const item of items) {
    if (!bySlug.has(item.slug)) bySlug.set(item.slug, item);
  }
  return [...bySlug.values()];
}

/** DB dopunjava nazive/opise; redosled prati statičku listu (samo kategorije sa brendovima). */
function mergeCategoriesBySlug(fromDb: Category[], fromStatic: Category[]): Category[] {
  const dbBySlug = new Map(fromDb.map((c) => [c.slug, c]));
  return fromStatic.map((stat) => {
    const fromDbRow = dbBySlug.get(stat.slug);
    return fromDbRow ? { ...stat, ...fromDbRow } : stat;
  });
}

const DEPRECATED_BRAND_SLUG_SET = new Set<string>(DEPRECATED_BRAND_SLUGS);

function withoutDeprecatedBrands(brands: Brand[]): Brand[] {
  return brands.filter((b) => !DEPRECATED_BRAND_SLUG_SET.has(b.slug));
}

async function loadAllBrands(): Promise<Brand[]> {
  if (isSupabaseConfigured()) {
    const fromDb = await fetchAllBrandsFromSupabase();
    if (fromDb?.length) {
      return withoutDeprecatedBrands(
        dedupeBySlug(mergeBySlug(fromDb, staticBrands))
          .map(enrichBrand)
          .sort((a, b) => a.name.localeCompare(b.name, "sr"))
      );
    }
  }
  return withoutDeprecatedBrands(dedupeBySlug(staticBrands).map(enrichBrand));
}

export const getAllBrands = cache(async (): Promise<Brand[]> =>
  catalogCache(["all-brands"], loadAllBrands, ["catalog", "brands"])
);

export const getBrandBySlug = cache(async (slug: string): Promise<Brand | undefined> => {
  if (DEPRECATED_BRAND_SLUG_SET.has(slug)) return undefined;

  const all = await getAllBrands();
  const fromCatalog = all.find((b) => b.slug === slug);
  if (fromCatalog) return fromCatalog;

  const staticBrand = getStaticBrandBySlug(slug);
  if (!staticBrand || DEPRECATED_BRAND_SLUG_SET.has(slug)) return undefined;
  return enrichBrand(staticBrand);
});

export const getBrandsBySlugs = cache(async (slugs: string[]): Promise<Brand[]> => {
  if (!slugs.length) return [];
  const all = await getAllBrands();
  const bySlug = new Map(all.map((b) => [b.slug, b]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((b): b is Brand => Boolean(b));
});

export const getRetailerPageBrands = cache(
  async (retailerSlug: string): Promise<Brand[]> => {
    const scraped = getScrapedBrandsForRetailer(retailerSlug);
    const all = await getAllBrands();
    const bySlug = new Map(all.map((b) => [b.slug, b]));

    if (!scraped?.length) {
      const retailer = await getRetailerBySlug(retailerSlug);
      if (!retailer) return [];
      return sortBrandsByName(
        filterModniBrands(await getBrandsBySlugs(retailer.brandSlugs))
      );
    }

    const modniEntries = filterModniScrapedEntries(scraped, retailerSlug, bySlug);
    const brands: Brand[] = [];

    for (const entry of modniEntries) {
      const catalog = bySlug.get(entry.slug);
      if (catalog) brands.push(catalog);
    }

    return sortBrandsByName(brands);
  }
);

const FEATURED_EXCLUDED_RETAILERS = new Set([
  "fashion-company",
  "fashion-friends",
]);

const HOME_FEATURED_EXCLUDED_BRANDS = new Set(["house", "mohito"]);

function isAvailableOutsideFashionGroup(brand: Brand): boolean {
  return brand.locations.some(
    (loc) => !FEATURED_EXCLUDED_RETAILERS.has(loc.retailerSlug)
  );
}

export const HOME_FEATURED_BRANDS_LIMIT = 20;

function sortHomeFeaturedBrands(a: Brand, b: Brand): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.popular !== b.popular) return a.popular ? -1 : 1;
  return b.availabilityCount - a.availabilityCount;
}

export const getFeaturedBrands = cache(async () => {
  const all = await getAllBrands();
  return all
    .filter(isAvailableOutsideFashionGroup)
    .filter((b) => !HOME_FEATURED_EXCLUDED_BRANDS.has(b.slug))
    .sort(sortHomeFeaturedBrands)
    .slice(0, HOME_FEATURED_BRANDS_LIMIT);
});

export const getPopularBrands = cache(async () => {
  const all = await getAllBrands();
  return all.filter((b) => b.popular);
});

function sortBrandsByName(brands: Brand[]): Brand[] {
  return [...brands].sort((a, b) => a.name.localeCompare(b.name, "sr"));
}

export const getBrandsByCategory = cache(async (category: string) => {
  const all = await getAllBrands();
  return sortBrandsByName(all.filter((b) => b.category === category));
});

async function loadAllCategories(): Promise<Category[]> {
  if (isSupabaseConfigured()) {
    const fromDb = await fetchCategoriesFromSupabase();
    if (fromDb?.length) return mergeCategoriesBySlug(fromDb, staticCategories);
  }
  return staticCategories;
}

export const getAllCategories = cache(async (): Promise<Category[]> =>
  catalogCache(["all-categories"], loadAllCategories, ["catalog", "categories"])
);

/** Sve kategorije koje imaju bar jedan brend (uključujući fashion → Ostali brendovi). */
export const getPopulatedCategories = cache(async (): Promise<Category[]> => {
  const [categories, brands] = await Promise.all([getAllCategories(), getAllBrands()]);
  const slugsWithBrands = new Set(brands.map((b) => b.category));
  const list = categories.filter((c) => slugsWithBrands.has(c.slug));
  if (slugsWithBrands.has("fashion")) list.push(FASHION_CATEGORY);
  return list;
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | undefined> => {
  const all = await getPopulatedCategories();
  return all.find((c) => c.slug === slug);
});

export async function getCategoryName(slug: string): Promise<string> {
  const cat = await getCategoryBySlug(slug);
  return cat?.name ?? slug;
}

const staticImportedRetailers = sortImportedRetailers(
  staticRetailers.filter(
    (r) => isImportedRetailerSlug(r.slug) && !isExcludedRetailerSlug(r.slug)
  )
);

function withoutExcludedRetailers(retailers: Retailer[]): Retailer[] {
  return retailers.filter((r) => !isExcludedRetailerSlug(r.slug));
}

const staticRetailerBySlug = new Map(staticRetailers.map((r) => [r.slug, r]));

function applyStaticRetailerCopy(retailers: Retailer[]): Retailer[] {
  return retailers.map((r) => {
    const stat = staticRetailerBySlug.get(r.slug);
    if (!stat) return r;
    return { ...r, description: stat.description };
  });
}

async function loadAllRetailers(): Promise<Retailer[]> {
  let list: Retailer[];
  if (isSupabaseConfigured()) {
    const fromDb = await fetchRetailersFromSupabase();
    list = fromDb?.length
      ? sortImportedRetailers(
          withoutExcludedRetailers(mergeBySlug(fromDb, staticImportedRetailers))
        )
      : staticImportedRetailers;
  } else {
    list = staticImportedRetailers;
  }
  const withoutFashionCompany = list.filter((r) => r.slug !== "fashion-company");
  return sortRetailersByName(
    applyStaticRetailerCopy(
      await applyModniBrandCounts(
        withoutExcludedRetailers([
          fashionCompanyRetailer,
          ...withoutFashionCompany,
        ])
      )
    )
  );
}

export const getAllRetailers = cache(async (): Promise<Retailer[]> =>
  catalogCache(["all-retailers", "v7"], loadAllRetailers, ["catalog", "retailers"])
);

async function applyModniBrandCounts(retailers: Retailer[]): Promise<Retailer[]> {
  return Promise.all(
    retailers.map(async (r) => {
      if (!getScrapedBrandsForRetailer(r.slug)?.length) return r;
      const pageBrands = await getRetailerPageBrands(r.slug);
      return {
        ...r,
        brandCount: pageBrands.length,
        brandSlugs: pageBrands.map((b) => b.slug),
      };
    })
  );
}

function sortRetailersByName(retailers: Retailer[]): Retailer[] {
  const collator = new Intl.Collator("sr");
  return [...retailers].sort((a, b) => collator.compare(a.name, b.name));
}

export const getRetailerBySlug = cache(async (slug: string): Promise<Retailer | undefined> => {
  if (isExcludedRetailerSlug(slug)) return undefined;
  if (slug === "fashion-company") return fashionCompanyRetailer;
  const all = await getAllRetailers();
  return all.find((r) => r.slug === slug);
});

export const getRetailerStores = cache(
  async (retailerSlug: string): Promise<RetailerStore[]> => {
    return fetchRetailerStores(retailerSlug);
  }
);

function enrichShoppingCentersFromStatic(
  centers: ShoppingCenter[]
): ShoppingCenter[] {
  const staticBySlug = new Map(
    staticShoppingCenters.map((s) => [s.slug, s] as const)
  );
  return centers.map((center) => {
    const fallback = staticBySlug.get(center.slug);
    if (!fallback) return center;
    return {
      ...center,
      address: center.address || fallback.address,
      latitude: center.latitude ?? fallback.latitude,
      longitude: center.longitude ?? fallback.longitude,
    };
  });
}

async function loadAllShoppingCenters(): Promise<ShoppingCenter[]> {
  if (isSupabaseConfigured()) {
    const fromDb = await fetchShoppingCentersFromSupabase();
    if (fromDb?.length) return enrichShoppingCentersFromStatic(fromDb);
  }
  return staticShoppingCenters;
}

export const getAllShoppingCenters = cache(async (): Promise<ShoppingCenter[]> =>
  catalogCache(
    ["all-shopping-centers"],
    loadAllShoppingCenters,
    ["catalog", "shopping-centers"]
  )
);

export const getShoppingCenterBySlug = cache(
  async (slug: string): Promise<ShoppingCenter | undefined> => {
    const all = await getAllShoppingCenters();
    return all.find((s) => s.slug === slug);
  }
);

async function getAllNewsFallback(): Promise<NewsArticle[]> {
  if (isSupabaseConfigured()) {
    const fromDb = await fetchNewsFromSupabase();
    if (fromDb?.length) return fromDb;
  }
  return staticNews;
}

async function loadAllNews(): Promise<NewsArticle[]> {
  if (isGhostConfigured()) {
    const fromGhost = await fetchAllGhostModaStilNews();
    if (fromGhost.length) return fromGhost;
  }
  return getAllNewsFallback();
}

export const getAllNews = cache(async (): Promise<NewsArticle[]> =>
  catalogCache(["all-news"], loadAllNews, ["catalog", "news"])
);

export async function getNewsBySlug(
  slug: string
): Promise<NewsArticle | undefined> {
  if (isGhostConfigured()) {
    const fromGhost = await fetchGhostNewsBySlug(slug);
    if (fromGhost) return fromGhost;
  }
  const all = await getAllNewsFallback();
  return all.find((a) => a.slug === slug);
}

export async function getNewsPage(
  page: number,
  pageSize: number
): Promise<NewsPageResult> {
  if (isGhostConfigured()) {
    const fromGhost = await fetchGhostModaStilNewsPage(page, pageSize);
    if (fromGhost.articles.length || fromGhost.hasMore) return fromGhost;
  }
  const all = await getAllNewsFallback();
  const start = (page - 1) * pageSize;
  const articles = all.slice(start, start + pageSize);
  return {
    articles,
    page,
    pageSize,
    hasMore: start + pageSize < all.length,
    total: all.length,
  };
}

export async function getLatestNews(limit = 3): Promise<NewsArticle[]> {
  if (isGhostConfigured()) {
    const fromGhost = await fetchGhostModaStilNewsPage(1, limit);
    if (fromGhost.articles.length) return fromGhost.articles;
  }
  const all = await getAllNewsFallback();
  return all.slice(0, limit);
}

const BRAND_NEWS_LIMIT = 10;

export async function getNewsByBrand(brandSlug: string): Promise<NewsArticle[]> {
  const brand = await getBrandBySlug(brandSlug);
  if (!brand) return [];

  const { filterNewsByBrand } = await import("@/lib/news/match-brand");
  const all = await getAllNews();
  return filterNewsByBrand(all, brand).slice(0, BRAND_NEWS_LIMIT);
}

async function loadHomePromotions(): Promise<HomePromotion[]> {
  if (isSupabaseConfigured()) {
    const fromDb = await fetchActiveHomePromotionsFromSupabase();
    if (fromDb?.length) {
      const score = (p: HomePromotion) => {
        let s = p.discountPercent ?? 0;
        if (
          p.retailerSlug ===
          getPrimaryRetailerForPromoGroup(getRetailerPromoGroupId(p.retailerSlug))
        ) {
          s += 50;
        }
        return s;
      };
      return dedupePromotionsForHome(fromDb, score).sort(
        (a, b) => score(b) - score(a)
      );
    }
  }
  return getActiveHomePromotionsFromStatic();
}

export const getHomePromotions = cache(async (): Promise<HomePromotion[]> =>
  catalogCache(["home-promotions"], loadHomePromotions, ["catalog", "promotions"])
);

export interface HomeStats {
  brandCount: number;
  storeCount: number;
  cityCount: number;
}

export const getHomeStats = cache(async (): Promise<HomeStats> => {
  const brands = await getAllBrands();

  return {
    brandCount: brands.length,
    storeCount: getCatalogStoreCount(),
    cityCount: getCatalogStoreCityCount(),
  };
});
