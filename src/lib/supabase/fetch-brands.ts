import { mapBrand } from "@/lib/supabase/mappers";
import { createSupabaseReadClient } from "@/lib/supabase/read-client";
import type {
  DbBrand,
  DbBrandLocationJoin,
  DbBrandMallPresence,
  DbBrandRelated,
} from "@/lib/supabase/types-db";
import type { Brand } from "@/types";

async function loadBrandRelations(
  supabase: NonNullable<ReturnType<typeof createSupabaseReadClient>>
) {
  const [locations, presence, related, allBrands] = await Promise.all([
    supabase.from("brand_locations").select(`
      brand_id,
      store_locations (
        id,
        name,
        address,
        city,
        retailers ( slug )
      )
    `),
    supabase.from("brand_shopping_center_presence").select(`
      brand_id,
      shopping_centers ( slug )
    `),
    supabase.from("brand_related").select("brand_id, related_brand_id"),
    supabase.from("brands").select("id, slug"),
  ]);

  const slugById = new Map(
    (allBrands.data ?? []).map((b) => [b.id as string, b.slug as string])
  );

  const locByBrandId = new Map<string, DbBrandLocationJoin[]>();
  for (const row of locations.data ?? []) {
    const join = row as DbBrandLocationJoin;
    const list = locByBrandId.get(join.brand_id) ?? [];
    list.push(join);
    locByBrandId.set(join.brand_id, list);
  }

  const mallsByBrandId = new Map<string, string[]>();
  for (const row of (presence.data ?? []) as DbBrandMallPresence[]) {
    const sc = row.shopping_centers;
    const slug = Array.isArray(sc) ? sc[0]?.slug : sc?.slug;
    if (!slug) continue;
    const list = mallsByBrandId.get(row.brand_id) ?? [];
    list.push(slug);
    mallsByBrandId.set(row.brand_id, list);
  }

  const relatedByBrandId = new Map<string, string[]>();
  for (const row of (related.data ?? []) as DbBrandRelated[]) {
    const relatedSlug = slugById.get(row.related_brand_id);
    if (!relatedSlug) continue;
    const list = relatedByBrandId.get(row.brand_id) ?? [];
    list.push(relatedSlug);
    relatedByBrandId.set(row.brand_id, list);
  }

  const idBySlug = new Map(
    (allBrands.data ?? []).map((b) => [b.slug as string, b.id as string])
  );

  return { locByBrandId, mallsByBrandId, relatedByBrandId, idBySlug };
}

function assembleBrands(
  rows: (DbBrand & { id: string })[],
  relations: Awaited<ReturnType<typeof loadBrandRelations>>
): Brand[] {
  return rows.map((row) =>
    mapBrand(row, {
      locations: relations.locByBrandId.get(row.id) ?? [],
      shoppingCenterSlugs: relations.mallsByBrandId.get(row.id) ?? [],
      relatedBrandSlugs: relations.relatedByBrandId.get(row.id) ?? [],
    })
  );
}

export async function fetchAllBrandsFromSupabase(): Promise<Brand[] | null> {
  const supabase = createSupabaseReadClient();
  if (!supabase) return null;

  const { data: brandRows, error } = await supabase
    .from("brands")
    .select("*, categories ( slug )")
    .eq("status", "published")
    .order("name");

  if (error || !brandRows?.length) return null;

  const relations = await loadBrandRelations(supabase);
  return assembleBrands(brandRows as (DbBrand & { id: string })[], relations);
}

export async function fetchBrandBySlugFromSupabase(
  slug: string
): Promise<Brand | null> {
  const supabase = createSupabaseReadClient();
  if (!supabase) return null;

  const { data: row, error } = await supabase
    .from("brands")
    .select("*, categories ( slug )")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !row) return null;

  const brandId = row.id as string;

  const [locations, presence, related] = await Promise.all([
    supabase
      .from("brand_locations")
      .select(`
        brand_id,
        store_locations (
          id,
          name,
          address,
          city,
          retailers ( slug )
        )
      `)
      .eq("brand_id", brandId),
    supabase
      .from("brand_shopping_center_presence")
      .select("brand_id, shopping_centers ( slug )")
      .eq("brand_id", brandId),
    supabase
      .from("brand_related")
      .select("related_brand_id")
      .eq("brand_id", brandId),
  ]);

  const relatedIds = (related.data ?? []).map(
    (r) => r.related_brand_id as string
  );
  let relatedSlugs: string[] = [];
  if (relatedIds.length) {
    const { data: relatedBrands } = await supabase
      .from("brands")
      .select("slug")
      .in("id", relatedIds);
    relatedSlugs = (relatedBrands ?? []).map((b) => b.slug as string);
  }

  const mallSlugs = ((presence.data ?? []) as DbBrandMallPresence[])
    .map((p) => {
      const sc = p.shopping_centers;
      return Array.isArray(sc) ? sc[0]?.slug : sc?.slug;
    })
    .filter((s): s is string => Boolean(s));

  return mapBrand(row as DbBrand, {
    locations: (locations.data ?? []) as DbBrandLocationJoin[],
    shoppingCenterSlugs: mallSlugs,
    relatedBrandSlugs: relatedSlugs,
  });
}
