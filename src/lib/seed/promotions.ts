import fs from "fs";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface ScrapedPromotionRow {
  retailerSlug: string;
  title: string;
  description: string;
  shortDescription: string;
  campaignType: string;
  startDate: string;
  endDate: string;
}

export interface PromotionsScrapedFile {
  scrapedAt: string | null;
  promotions: ScrapedPromotionRow[];
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
  if (today < startDate) return "scheduled";
  if (today > endDate) return "ended";
  return "active";
}

export async function seedPromotionsFromScraped(
  db: SupabaseClient,
  retailerIdBySlug: Map<string, string>,
  filePath?: string
): Promise<{ count: number; error?: string }> {
  const resolved =
    filePath ??
    path.join(process.cwd(), "src/lib/data/retailer-promotions-scraped.json");

  if (!fs.existsSync(resolved)) {
    return { count: 0, error: "retailer-promotions-scraped.json ne postoji" };
  }

  const raw = JSON.parse(
    fs.readFileSync(resolved, "utf8")
  ) as PromotionsScrapedFile;

  if (!raw.promotions?.length) {
    return { count: 0, error: "JSON nema akcija" };
  }

  const today = new Date().toISOString().slice(0, 10);
  let count = 0;

  for (const promo of raw.promotions) {
    const retailerId = retailerIdBySlug.get(promo.retailerSlug);
    if (!retailerId) continue;

    const slug = `${promo.retailerSlug}-${slugify(promo.title)}`.slice(0, 150);
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

  return { count };
}

export async function loadRetailerIdBySlug(
  db: SupabaseClient
): Promise<Map<string, string>> {
  const { data, error } = await db.from("retailers").select("id, slug");
  if (error) throw new Error(error.message);
  return new Map((data ?? []).map((r) => [r.slug as string, r.id as string]));
}
