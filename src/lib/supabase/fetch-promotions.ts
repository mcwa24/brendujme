import { promotionTodayIso } from "@/lib/data/promotions";
import { getRetailerWebsiteUrl } from "@/lib/data/imported-retailers";
import { createSupabaseReadClient } from "@/lib/supabase/read-client";
import type { HomePromotion, PromotionCampaignType } from "@/types";

type RetailerJoin = { slug: string; name: string; logo_url: string | null };

interface CampaignTargetRow {
  target_type: string;
  retailers: RetailerJoin | RetailerJoin[] | null;
}

interface CampaignRow {
  slug: string;
  title: string;
  description: string;
  short_description: string | null;
  campaign_type: PromotionCampaignType;
  start_date: string;
  end_date: string;
  campaign_targets: CampaignTargetRow[] | null;
}

export async function fetchActiveHomePromotionsFromSupabase(): Promise<
  HomePromotion[] | null
> {
  const supabase = createSupabaseReadClient();
  if (!supabase) return null;

  const today = promotionTodayIso();

  const { data, error } = await supabase
    .from("campaigns")
    .select(
      `
      slug,
      title,
      description,
      short_description,
      campaign_type,
      start_date,
      end_date,
      campaign_targets (
        target_type,
        retailers ( slug, name, logo_url )
      )
    `
    )
    .eq("status", "active")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("end_date", { ascending: true });

  if (error || !data?.length) return null;

  const mapped: HomePromotion[] = [];

  for (const row of data as unknown as CampaignRow[]) {
    const retailerTarget = (row.campaign_targets ?? []).find(
      (t) => t.target_type === "retailer" && t.retailers
    );
    const retailerRaw = retailerTarget?.retailers;
    const retailer = Array.isArray(retailerRaw) ? retailerRaw[0] : retailerRaw;
    if (!retailer) continue;

    const { slug: retailerSlug, name: retailerName, logo_url } = retailer;
    mapped.push({
      slug: row.slug,
      title: row.title,
      shortDescription:
        row.short_description?.trim() ||
        row.description.slice(0, 160),
      description: row.description,
      campaignType: row.campaign_type,
      startDate: row.start_date,
      endDate: row.end_date,
      retailerSlug,
      retailerName,
      retailerLogoUrl: logo_url ?? undefined,
      sourceUrl: getRetailerWebsiteUrl(retailerSlug),
      retailerWebsiteUrl: getRetailerWebsiteUrl(retailerSlug),
      href: `/retailers/${retailerSlug}`,
    });
  }

  return mapped.length ? mapped : null;
}
