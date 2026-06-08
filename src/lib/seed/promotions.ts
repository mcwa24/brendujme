import fs from "fs";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isPromotionActive,
  promotionCampaignKey,
  promotionTodayIso,
} from "@/lib/data/promotions";
import { isSerbiaMarketUrl } from "@/lib/data/retailer-serbia-urls";

export interface ScrapedPromotionRow {
  retailerSlug: string;
  title: string;
  description: string;
  shortDescription: string;
  campaignType: string;
  startDate: string;
  endDate: string;
  sourceUrl?: string;
  bannerImageUrl?: string;
  discountPercent?: number | null;
  scope?: string | null;
}

export interface PromotionsScrapedFile {
  scrapedAt: string | null;
  promotions: ScrapedPromotionRow[];
}

export interface PromotionSeedResult {
  count: number;
  expired: number;
  activated: number;
  error?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function campaignStatus(
  startDate: string,
  endDate: string,
  today: string
): "active" | "scheduled" | "ended" {
  if (!isPromotionActive(startDate, endDate, today) && today < startDate) {
    return "scheduled";
  }
  if (!isPromotionActive(startDate, endDate, today)) return "ended";
  return "active";
}

/** Istekle akcije → status ended (nestaju sa home sledećeg dana). */
export async function expireEndedCampaigns(
  db: SupabaseClient,
  today = promotionTodayIso()
): Promise<number> {
  const { data, error } = await db
    .from("campaigns")
    .update({ status: "ended" })
    .eq("status", "active")
    .lt("end_date", today)
    .select("id");

  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

/** Zakazane akcije čiji je početak stigao → active. */
export async function activateScheduledCampaigns(
  db: SupabaseClient,
  today = promotionTodayIso()
): Promise<number> {
  const { data, error } = await db
    .from("campaigns")
    .update({ status: "active" })
    .eq("status", "scheduled")
    .lte("start_date", today)
    .gte("end_date", today)
    .select("id");

  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

export async function syncPromotionLifecycle(
  db: SupabaseClient,
  today = promotionTodayIso()
): Promise<{ expired: number; activated: number }> {
  const expired = await expireEndedCampaigns(db, today);
  const activated = await activateScheduledCampaigns(db, today);
  return { expired, activated };
}

export async function seedPromotionsFromScraped(
  db: SupabaseClient,
  retailerIdBySlug: Map<string, string>,
  filePath?: string
): Promise<PromotionSeedResult> {
  const { expired, activated } = await syncPromotionLifecycle(db);

  const resolved =
    filePath ??
    path.join(process.cwd(), "src/lib/data/retailer-promotions-scraped.json");

  if (!fs.existsSync(resolved)) {
    return { count: 0, expired, activated, error: "retailer-promotions-scraped.json ne postoji" };
  }

  const raw = JSON.parse(
    fs.readFileSync(resolved, "utf8")
  ) as PromotionsScrapedFile;

  if (!raw.promotions?.length) {
    return { count: 0, expired, activated, error: "JSON nema akcija" };
  }

  const today = promotionTodayIso();
  let count = 0;

  for (const promo of raw.promotions) {
    if (!isPromotionActive(promo.startDate, promo.endDate, today)) continue;
    if (promo.sourceUrl && !isSerbiaMarketUrl(promo.sourceUrl)) continue;

    const retailerId = retailerIdBySlug.get(promo.retailerSlug);
    if (!retailerId) continue;

    const slug = `${promo.retailerSlug}-${slugify(
      promotionCampaignKey({
        sourceUrl: promo.sourceUrl,
        title: promo.title,
      })
    )}`.slice(0, 150);
    const status = campaignStatus(promo.startDate, promo.endDate, today);

    const { data: campaign, error: campErr } = await db
      .from("campaigns")
      .upsert(
        {
          slug,
          title: promo.title.slice(0, 240),
          description: promo.description.slice(0, 4000),
          short_description: promo.shortDescription.slice(0, 320),
          campaign_type: promo.campaignType,
          start_date: promo.startDate,
          end_date: promo.endDate,
          status,
          source_url: promo.sourceUrl?.slice(0, 2000) ?? null,
          banner_image: promo.bannerImageUrl?.slice(0, 2000) ?? null,
          discount_percent: promo.discountPercent ?? null,
          promo_scope: promo.scope?.slice(0, 320) ?? null,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (campErr || !campaign) continue;

    await db.from("campaign_targets").delete().eq("campaign_id", campaign.id);

    const { error: targetErr } = await db.from("campaign_targets").insert({
      campaign_id: campaign.id,
      target_type: "retailer",
      retailer_id: retailerId,
    });

    if (!targetErr) count += 1;
  }

  return { count, expired, activated };
}

export async function loadRetailerIdBySlug(
  db: SupabaseClient
): Promise<Map<string, string>> {
  const { data, error } = await db.from("retailers").select("id, slug");
  if (error) throw new Error(error.message);
  return new Map((data ?? []).map((r) => [r.slug as string, r.id as string]));
}
