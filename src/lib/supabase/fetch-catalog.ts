import {
  IMPORTED_RETAILER_SLUGS,
  sortImportedRetailers,
} from "@/lib/data/imported-retailers";
import {
  mapCategory,
  mapNewsArticle,
  mapRetailer,
  mapShoppingCenter,
} from "@/lib/supabase/mappers";
import { filterPublishedShoppingCenters } from "@/lib/data/shopping-centers";
import { createSupabaseReadClient } from "@/lib/supabase/read-client";
import type {
  DbArticle,
  DbCategory,
  DbRetailer,
  DbShoppingCenter,
} from "@/lib/supabase/types-db";
import type { Category, NewsArticle, Retailer, ShoppingCenter } from "@/types";

export async function fetchCategoriesFromSupabase(): Promise<Category[] | null> {
  const supabase = createSupabaseReadClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("status", "published")
    .order("sort_order");

  if (error || !data?.length) return null;
  return (data as DbCategory[]).map(mapCategory);
}

export async function fetchRetailersFromSupabase(): Promise<Retailer[] | null> {
  const supabase = createSupabaseReadClient();
  if (!supabase) return null;

  const [{ data: retailers, error }, { data: links }] = await Promise.all([
    supabase
      .from("retailers")
      .select("*")
      .eq("status", "published")
      .in("slug", [...IMPORTED_RETAILER_SLUGS]),
    supabase.from("brand_retailers").select("brand_id, retailer_id"),
  ]);

  if (error || !retailers?.length) return null;

  const { data: brandRows } = await supabase.from("brands").select("id, slug");
  const slugById = new Map(
    (brandRows ?? []).map((b) => [b.id as string, b.slug as string])
  );

  const brandsByRetailerId = new Map<string, string[]>();
  for (const link of links ?? []) {
    const brandSlug = slugById.get(link.brand_id as string);
    if (!brandSlug) continue;
    const list = brandsByRetailerId.get(link.retailer_id as string) ?? [];
    list.push(brandSlug);
    brandsByRetailerId.set(link.retailer_id as string, list);
  }

  const retailerIdBySlug = new Map(
    retailers.map((r) => [r.slug as string, r.id as string])
  );

  const mapped = (retailers as DbRetailer[]).map((row) =>
    mapRetailer(
      row,
      brandsByRetailerId.get(retailerIdBySlug.get(row.slug) ?? "") ?? []
    )
  );
  return sortImportedRetailers(mapped);
}

export async function fetchShoppingCentersFromSupabase(): Promise<
  ShoppingCenter[] | null
> {
  const supabase = createSupabaseReadClient();
  if (!supabase) return null;

  const [{ data: centers, error }, { data: links }] = await Promise.all([
    supabase
      .from("shopping_centers")
      .select("*")
      .eq("status", "published")
      .order("name"),
    supabase
      .from("brand_shopping_center_presence")
      .select("brand_id, shopping_center_id"),
  ]);

  if (error || !centers?.length) return null;

  const { data: brandRows } = await supabase.from("brands").select("id, slug");
  const slugById = new Map(
    (brandRows ?? []).map((b) => [b.id as string, b.slug as string])
  );

  const brandsByMallId = new Map<string, string[]>();
  for (const link of links ?? []) {
    const brandSlug = slugById.get(link.brand_id as string);
    if (!brandSlug) continue;
    const list = brandsByMallId.get(link.shopping_center_id as string) ?? [];
    list.push(brandSlug);
    brandsByMallId.set(link.shopping_center_id as string, list);
  }

  const mallIdBySlug = new Map(
    centers.map((c) => [c.slug as string, c.id as string])
  );

  return filterPublishedShoppingCenters(
    (centers as DbShoppingCenter[]).map((row) =>
      mapShoppingCenter(
        row,
        brandsByMallId.get(mallIdBySlug.get(row.slug) ?? "") ?? []
      )
    )
  );
}

export async function fetchNewsFromSupabase(): Promise<NewsArticle[] | null> {
  const supabase = createSupabaseReadClient();
  if (!supabase) return null;

  const [{ data: articles, error }, { data: links }] = await Promise.all([
    supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase.from("article_brands").select("article_id, brand_id"),
  ]);

  if (error || !articles?.length) return null;

  const { data: brandRows } = await supabase.from("brands").select("id, slug");
  const slugById = new Map(
    (brandRows ?? []).map((b) => [b.id as string, b.slug as string])
  );

  const brandsByArticleId = new Map<string, string[]>();
  for (const link of links ?? []) {
    const brandSlug = slugById.get(link.brand_id as string);
    if (!brandSlug) continue;
    const list = brandsByArticleId.get(link.article_id as string) ?? [];
    list.push(brandSlug);
    brandsByArticleId.set(link.article_id as string, list);
  }

  const articleIdBySlug = new Map(
    articles.map((a) => [a.slug as string, a.id as string])
  );

  return (articles as DbArticle[]).map((row) =>
    mapNewsArticle(
      row,
      brandsByArticleId.get(articleIdBySlug.get(row.slug) ?? "") ?? []
    )
  );
}
