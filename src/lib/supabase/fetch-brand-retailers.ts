import { retailers as staticRetailers } from "@/lib/data/retailers";
import { createSupabaseReadClient } from "@/lib/supabase/read-client";

export async function fetchBrandRetailerSlugs(
  brandSlug: string
): Promise<string[] | null> {
  const supabase = createSupabaseReadClient();
  if (!supabase) return null;

  const { data: brand, error: brandErr } = await supabase
    .from("brands")
    .select("id")
    .eq("slug", brandSlug)
    .eq("status", "published")
    .maybeSingle();

  if (brandErr || !brand) return null;

  const { data: links, error } = await supabase
    .from("brand_retailers")
    .select("retailers ( slug )")
    .eq("brand_id", brand.id);

  if (error || !links?.length) return [];

  const slugs = new Set<string>();
  for (const row of links) {
    const r = row.retailers as { slug?: string } | { slug?: string }[] | null;
    const retailer = Array.isArray(r) ? r[0] : r;
    if (retailer?.slug) slugs.add(retailer.slug);
  }
  return [...slugs];
}

export function getStaticBrandRetailerSlugs(brandSlug: string): string[] {
  return staticRetailers
    .filter((r) => r.brandSlugs.includes(brandSlug))
    .map((r) => r.slug);
}
