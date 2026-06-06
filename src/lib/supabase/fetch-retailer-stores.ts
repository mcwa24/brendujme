import { catalogCache } from "@/lib/data/catalog-cache";
import { getStaticRetailerStores } from "@/lib/data/retailer-stores-static";
import { isImportedRetailerSlug } from "@/lib/data/imported-retailers";
import { createSupabaseReadClient } from "@/lib/supabase/read-client";
import type { RetailerStore } from "@/types";

const MALL_NAMES: Record<string, string> = {
  usce: "Ušće",
  "delta-city": "Delta City",
  galerija: "Galerija",
  "big-fashion": "BIG Fashion",
  promenada: "Promenada",
  stadion: "Stadion",
  mercator: "Mercator",
  "kragujevac-plaza": "Plaza Kragujevac",
  zlatibor: "Stop Shop Zlatibor",
};

export async function fetchRetailerStoresFromSupabase(
  retailerSlug: string
): Promise<RetailerStore[] | null> {
  const supabase = createSupabaseReadClient();
  if (!supabase) return null;

  const { data: retailer, error: retErr } = await supabase
    .from("retailers")
    .select("id")
    .eq("slug", retailerSlug)
    .eq("status", "published")
    .maybeSingle();

  if (retErr || !retailer) return null;

  const { data: stores, error } = await supabase
    .from("store_locations")
    .select(
      `
      id,
      slug,
      name,
      address,
      city,
      phone,
      latitude,
      longitude,
      shopping_centers ( slug, name )
    `
    )
    .eq("retailer_id", retailer.id)
    .eq("publish_status", "published")
    .order("city")
    .order("name");

  if (error || !stores?.length) return null;

  const staticByNameCity = new Map(
    getStaticRetailerStores(retailerSlug).map((s) => [`${s.name}|${s.city}`, s])
  );

  return stores.map((row) => {
    const mall = Array.isArray(row.shopping_centers)
      ? row.shopping_centers[0]
      : row.shopping_centers;
    const mallSlug = mall?.slug as string | undefined;
    const scraped = staticByNameCity.get(`${row.name}|${row.city}`);

    return {
      id: row.id as string,
      name: row.name as string,
      address: (row.address as string) || "",
      city: row.city as string,
      phone: (row.phone as string | null) ?? scraped?.phone ?? null,
      email: scraped?.email ?? null,
      latitude:
        row.latitude != null
          ? Number(row.latitude)
          : (scraped?.latitude ?? null),
      longitude:
        row.longitude != null
          ? Number(row.longitude)
          : (scraped?.longitude ?? null),
      shoppingCenterSlug: mallSlug ?? scraped?.shoppingCenterSlug ?? null,
      shoppingCenterName:
        (mall?.name as string | undefined) ??
        (mallSlug ? (MALL_NAMES[mallSlug] ?? null) : null) ??
        scraped?.shoppingCenterName ??
        null,
      storeUrl: scraped?.storeUrl ?? null,
    };
  });
}

async function fetchRetailerStoresUncached(
  retailerSlug: string
): Promise<RetailerStore[]> {
  if (!isImportedRetailerSlug(retailerSlug)) return [];

  const fromDb = await fetchRetailerStoresFromSupabase(retailerSlug);
  if (fromDb?.length) return fromDb;

  return getStaticRetailerStores(retailerSlug);
}

export function fetchRetailerStores(
  retailerSlug: string
): Promise<RetailerStore[]> {
  return catalogCache(
    ["retailer-stores", retailerSlug],
    () => fetchRetailerStoresUncached(retailerSlug),
    ["catalog", "retailer-stores", retailerSlug]
  );
}
