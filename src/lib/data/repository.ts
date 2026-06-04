import { cache } from "react";
import { brands as staticBrands, getBrandBySlug as getStaticBrandBySlug } from "@/lib/data/brands";
import { enrichBrand } from "@/lib/data/enrich-brand";
import { categories as staticCategories } from "@/lib/data/categories";
import { newsArticles as staticNews } from "@/lib/data/news";
import { fashionCompanyRetailer } from "@/lib/data/fashion-company";
import { getRetailerCatalogMeta } from "@/lib/data/retailer-catalog-meta";
import { retailers as staticRetailers } from "@/lib/data/retailers";
import {
  isImportedRetailerSlug,
  sortImportedRetailers,
} from "@/lib/data/imported-retailers";
import { shoppingCenters as staticShoppingCenters } from "@/lib/data/shopping-centers";
import {
  fetchAllBrandsFromSupabase,
  fetchBrandBySlugFromSupabase,
} from "@/lib/supabase/fetch-brands";
import {
  fetchCategoriesFromSupabase,
  fetchNewsFromSupabase,
  fetchRetailersFromSupabase,
  fetchShoppingCentersFromSupabase,
} from "@/lib/supabase/fetch-catalog";
import { fetchRetailerStores } from "@/lib/supabase/fetch-retailer-stores";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  Brand,
  Category,
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

export const getAllBrands = cache(async (): Promise<Brand[]> => {
  if (isSupabaseConfigured()) {
    const fromDb = await fetchAllBrandsFromSupabase();
    if (fromDb?.length) {
      return mergeBySlug(fromDb, staticBrands)
        .map(enrichBrand)
        .sort((a, b) => a.name.localeCompare(b.name, "sr"));
    }
  }
  return staticBrands.map(enrichBrand);
});

export const getBrandBySlug = cache(async (slug: string): Promise<Brand | undefined> => {
  if (isSupabaseConfigured()) {
    const fromDb = await fetchBrandBySlugFromSupabase(slug);
    if (fromDb) return enrichBrand(fromDb);
  }
  const staticBrand = getStaticBrandBySlug(slug);
  return staticBrand ? enrichBrand(staticBrand) : undefined;
});

export const getFeaturedBrands = cache(async () => {
  const all = await getAllBrands();
  return all.filter((b) => b.featured);
});

export const getPopularBrands = cache(async () => {
  const all = await getAllBrands();
  return all.filter((b) => b.popular);
});

export const getBrandsByCategory = cache(async (category: string) => {
  const all = await getAllBrands();
  return all.filter((b) => b.category === category);
});

export async function getRelatedBrands(brand: Brand): Promise<Brand[]> {
  const all = await getAllBrands();
  const bySlug = new Map(all.map((b) => [b.slug, b]));
  return brand.relatedBrandSlugs
    .map((slug) => bySlug.get(slug))
    .filter((b): b is Brand => Boolean(b));
}

export const getAllCategories = cache(async (): Promise<Category[]> => {
  if (isSupabaseConfigured()) {
    const fromDb = await fetchCategoriesFromSupabase();
    if (fromDb?.length) return fromDb;
  }
  return staticCategories;
});

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const all = await getAllCategories();
  return all.find((c) => c.slug === slug);
}

export async function getCategoryName(slug: string): Promise<string> {
  const cat = await getCategoryBySlug(slug);
  return cat?.name ?? slug;
}

const staticImportedRetailers = sortImportedRetailers(
  staticRetailers.filter((r) => isImportedRetailerSlug(r.slug))
);

export const getAllRetailers = cache(async (): Promise<Retailer[]> => {
  let list: Retailer[];
  if (isSupabaseConfigured()) {
    const fromDb = await fetchRetailersFromSupabase();
    list = fromDb?.length
      ? sortImportedRetailers(mergeBySlug(fromDb, staticImportedRetailers))
      : staticImportedRetailers;
  } else {
    list = staticImportedRetailers;
  }
  const withoutFashionCompany = list.filter((r) => r.slug !== "fashion-company");
  return applyCatalogCounts([fashionCompanyRetailer, ...withoutFashionCompany]);
});

function applyCatalogCounts(retailers: Retailer[]): Retailer[] {
  return retailers.map((r) => {
    const meta = getRetailerCatalogMeta(r.slug);
    if (!meta) return r;
    return { ...r, brandCount: meta.brandCount };
  });
}

export async function getRetailerBySlug(slug: string): Promise<Retailer | undefined> {
  if (slug === "fashion-company") return fashionCompanyRetailer;
  const all = await getAllRetailers();
  return all.find((r) => r.slug === slug);
}

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

export const getAllShoppingCenters = cache(async (): Promise<ShoppingCenter[]> => {
  if (isSupabaseConfigured()) {
    const fromDb = await fetchShoppingCentersFromSupabase();
    if (fromDb?.length) return enrichShoppingCentersFromStatic(fromDb);
  }
  return staticShoppingCenters;
});

export async function getShoppingCenterBySlug(
  slug: string
): Promise<ShoppingCenter | undefined> {
  const all = await getAllShoppingCenters();
  return all.find((s) => s.slug === slug);
}

export const getAllNews = cache(async (): Promise<NewsArticle[]> => {
  if (isSupabaseConfigured()) {
    const fromDb = await fetchNewsFromSupabase();
    if (fromDb?.length) return fromDb;
  }
  return staticNews;
});

export async function getNewsBySlug(slug: string): Promise<NewsArticle | undefined> {
  const all = await getAllNews();
  return all.find((n) => n.slug === slug);
}

export async function getFeaturedNews(): Promise<NewsArticle | undefined> {
  const all = await getAllNews();
  return all.find((n) => n.featured);
}

export async function getLatestNews(limit = 6): Promise<NewsArticle[]> {
  const all = await getAllNews();
  return all.slice(0, limit);
}

export async function getNewsByBrand(brandSlug: string): Promise<NewsArticle[]> {
  const all = await getAllNews();
  return all.filter((n) => n.brandSlugs?.includes(brandSlug));
}
