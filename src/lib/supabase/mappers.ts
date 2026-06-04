import { getStoragePublicUrl, isSupabaseStorageUrl } from "@/lib/supabase/storage";
import type {
  DbArticle,
  DbBrand,
  DbBrandLocationJoin,
  DbCategory,
  DbRetailer,
  DbShoppingCenter,
} from "@/lib/supabase/types-db";
import type {
  Brand,
  Category,
  CategorySlug,
  NewsArticle,
  PriceSegment,
  Retailer,
  ShoppingCenter,
} from "@/types";

function categorySlugFromRow(
  categories: DbBrand["categories"]
): CategorySlug {
  const row = Array.isArray(categories) ? categories[0] : categories;
  return (row?.slug ?? "fashion") as CategorySlug;
}

function retailerSlugFromJoin(
  retailers: { slug: string } | { slug: string }[] | null | undefined
): string {
  const row = Array.isArray(retailers) ? retailers[0] : retailers;
  return row?.slug ?? "";
}

export function parseNewsCategory(content: string): string {
  const match = content.match(/<!-- news-category:([^>]+) -->/);
  return match?.[1]?.trim() ?? "Vesti";
}

export function stripNewsCategoryMarker(content: string): string {
  return content.replace(/<!-- news-category:[^>]+ -->\n?/, "").trim();
}

export function mapCategory(row: DbCategory): Category {
  return {
    slug: row.slug as CategorySlug,
    name: row.name,
    description: row.description,
  };
}

export function mapBrand(
  row: DbBrand,
  relations: {
    locations: DbBrandLocationJoin[];
    shoppingCenterSlugs: string[];
    relatedBrandSlugs: string[];
    availabilityCount?: number;
  }
): Brand {
  const locationCount =
    relations.availabilityCount ??
    relations.locations.filter((l) => l.store_locations).length;

  const rawLogoUrl = row.logo_url?.trim();
  const logoUrl =
    rawLogoUrl && !isSupabaseStorageUrl(rawLogoUrl) ? rawLogoUrl : undefined;

  return {
    slug: row.slug,
    name: row.name,
    category: categorySlugFromRow(row.categories),
    country: row.country_of_origin,
    website: row.website,
    description: row.description,
    priceSegment: row.price_segment as PriceSegment,
    availabilityCount: locationCount || 1,
    featured: row.is_featured,
    popular: row.is_popular,
    logoUrl,
    logoStoragePath: row.logo_storage_path ?? undefined,
    locations: relations.locations.flatMap((loc) => {
      const stores = loc.store_locations;
      const list = Array.isArray(stores) ? stores : stores ? [stores] : [];
      return list.map((sl) => ({
        id: sl.id,
        storeName: sl.name,
        retailerSlug: retailerSlugFromJoin(sl.retailers),
        address: sl.address,
        city: sl.city,
      }));
    }),
    shoppingCenterSlugs: relations.shoppingCenterSlugs,
    relatedBrandSlugs: relations.relatedBrandSlugs,
  };
}

export function mapRetailer(
  row: DbRetailer,
  brandSlugs: string[]
): Retailer {
  const rawLogoUrl = row.logo_url?.trim();
  const logoUrl =
    rawLogoUrl && !isSupabaseStorageUrl(rawLogoUrl)
      ? rawLogoUrl
      : getStoragePublicUrl(row.logo_storage_path) ?? undefined;

  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    city: row.headquarters_city ?? "",
    brandCount: brandSlugs.length,
    brandSlugs,
    logoUrl,
  };
}

export function mapShoppingCenter(
  row: DbShoppingCenter,
  brandSlugs: string[]
): ShoppingCenter {
  const rawLogoUrl = row.logo_url?.trim();
  const logoUrl =
    rawLogoUrl && !isSupabaseStorageUrl(rawLogoUrl)
      ? rawLogoUrl
      : getStoragePublicUrl(row.logo_storage_path) ?? undefined;

  return {
    slug: row.slug,
    name: row.name,
    city: row.city,
    brandCount: brandSlugs.length,
    description: row.description,
    brandSlugs,
    logoUrl,
    logoStoragePath: row.logo_storage_path ?? undefined,
  };
}

export function mapNewsArticle(
  row: DbArticle,
  brandSlugs: string[]
): NewsArticle {
  const imageFromStorage = getStoragePublicUrl(row.featured_image_storage_path);
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: stripNewsCategoryMarker(row.content),
    publishedAt: row.published_at?.slice(0, 10) ?? "",
    category: parseNewsCategory(row.content),
    featured: row.is_featured,
    brandSlugs: brandSlugs.length ? brandSlugs : undefined,
    imageLabel: row.title,
    imageUrl: imageFromStorage ?? row.featured_image ?? undefined,
  };
}
