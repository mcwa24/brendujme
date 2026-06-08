import {
  discountFromShortDescription,
  resolveCampaignSourceUrl,
} from "@/lib/data/campaign-source-url";
import { promotionTodayIso } from "@/lib/data/promotions";
import { fashionCompanyRetailer } from "@/lib/data/fashion-company";
import {
  getRetailerWebsiteUrl,
  normalizeRetailerSlug,
} from "@/lib/data/imported-retailers";
import {
  getPrimaryRetailerForPromoGroup,
  getRetailerPromoGroupId,
} from "@/lib/data/retailer-promo-groups";
import { retailers } from "@/lib/data/retailers";
import { isSerbiaMarketUrl } from "@/lib/data/retailer-serbia-urls";
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
  source_url?: string | null;
  banner_image?: string | null;
  discount_percent?: number | null;
  promo_scope?: string | null;
  campaign_targets: CampaignTargetRow[] | null;
}

const CAMPAIGN_SELECT_BASE = `
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
    `;

const CAMPAIGN_SELECT_EXTENDED = `
      slug,
      title,
      description,
      short_description,
      campaign_type,
      start_date,
      end_date,
      source_url,
      banner_image,
      discount_percent,
      promo_scope,
      campaign_targets (
        target_type,
        retailers ( slug, name, logo_url )
      )
    `;

export async function fetchActiveHomePromotionsFromSupabase(): Promise<
  HomePromotion[] | null
> {
  const supabase = createSupabaseReadClient();
  if (!supabase) return null;

  const today = promotionTodayIso();

  let data: CampaignRow[] | null = null;

  const extended = await supabase
    .from("campaigns")
    .select(CAMPAIGN_SELECT_EXTENDED)
    .eq("status", "active")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("end_date", { ascending: true });

  if (!extended.error && extended.data?.length) {
    data = extended.data as unknown as CampaignRow[];
  } else {
    const base = await supabase
      .from("campaigns")
      .select(CAMPAIGN_SELECT_BASE)
      .eq("status", "active")
      .lte("start_date", today)
      .gte("end_date", today)
      .order("end_date", { ascending: true });
    if (base.error || !base.data?.length) return null;
    data = base.data as unknown as CampaignRow[];
  }

  const mapped: HomePromotion[] = [];

  for (const row of data as unknown as CampaignRow[]) {
    const retailerTarget = (row.campaign_targets ?? []).find(
      (t) => t.target_type === "retailer" && t.retailers
    );
    const retailerRaw = retailerTarget?.retailers;
    const retailer = Array.isArray(retailerRaw) ? retailerRaw[0] : retailerRaw;
    if (!retailer) continue;

    const { slug: rawRetailerSlug, name: retailerName, logo_url } = retailer;
    const normalizedSlug = normalizeRetailerSlug(rawRetailerSlug);
    const retailerSlug = getPrimaryRetailerForPromoGroup(
      getRetailerPromoGroupId(normalizedSlug)
    );
    const displayRetailer =
      retailerSlug === "fashion-company"
        ? fashionCompanyRetailer
        : retailers.find((r) => r.slug === retailerSlug);

    const sourceUrl = resolveCampaignSourceUrl(
      row.slug,
      rawRetailerSlug,
      row.source_url
    );

    if (!isSerbiaMarketUrl(sourceUrl)) continue;

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
      retailerName: displayRetailer?.name ?? retailerName,
      retailerLogoUrl: displayRetailer?.logoUrl ?? logo_url ?? undefined,
      sourceUrl,
      retailerWebsiteUrl: getRetailerWebsiteUrl(retailerSlug, sourceUrl),
      href: `/retailers/${retailerSlug}`,
      discountPercent:
        row.discount_percent ??
        discountFromShortDescription(row.short_description),
      scope: row.promo_scope ?? undefined,
      bannerImageUrl: row.banner_image ?? undefined,
    });
  }

  return mapped.length ? mapped : null;
}
