import scraped from "@/lib/data/retailer-promotions-scraped.json";
import { IMPORTED_RETAILER_EXTERNAL } from "@/lib/data/imported-retailers";
import {
  getPrimaryRetailerForPromoGroup,
  getRetailerPromoGroupId,
} from "@/lib/data/retailer-promo-groups";
import { retailers } from "@/lib/data/retailers";
import type { HomePromotion, PromotionCampaignType } from "@/types";

export const HOME_PROMOTIONS_MAX = 3;

interface ScrapedPromotionRow {
  retailerSlug: string;
  retailerName: string;
  sourceUrl: string;
  title: string;
  description: string;
  shortDescription: string;
  campaignType: PromotionCampaignType;
  startDate: string;
  endDate: string;
  discountPercent: number | null;
  scope: string | null;
  confidence: "high" | "medium" | "low";
  bannerImageUrl?: string;
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

function isActiveOnDate(startDate: string, endDate: string, today: string): boolean {
  return startDate <= today && today <= endDate;
}

const confRank = { high: 0, medium: 1, low: 2 };

function promotionScore(row: ScrapedPromotionRow): number {
  let score = (3 - confRank[row.confidence]) * 100;
  if (row.discountPercent) score += row.discountPercent;
  const primary = getPrimaryRetailerForPromoGroup(
    getRetailerPromoGroupId(row.retailerSlug)
  );
  if (row.retailerSlug === primary) score += 50;
  return score;
}

function mapScrapedToHome(row: ScrapedPromotionRow): HomePromotion {
  const groupId = getRetailerPromoGroupId(row.retailerSlug);
  const displaySlug = getPrimaryRetailerForPromoGroup(groupId);
  const retailer = retailers.find((r) => r.slug === displaySlug);
  const external =
    IMPORTED_RETAILER_EXTERNAL[
      displaySlug as keyof typeof IMPORTED_RETAILER_EXTERNAL
    ];

  return {
    slug: `${displaySlug}-${slugify(row.title)}`,
    title: row.title,
    shortDescription: row.shortDescription,
    description: row.description,
    campaignType: row.campaignType,
    startDate: row.startDate,
    endDate: row.endDate,
    retailerSlug: displaySlug,
    retailerName: retailer?.name ?? row.retailerName,
    retailerLogoUrl: retailer?.logoUrl,
    sourceUrl:
      row.sourceUrl || external?.website || `/retailers/${displaySlug}`,
    href: `/retailers/${displaySlug}`,
    discountPercent: row.discountPercent,
    scope: row.scope,
    bannerImageUrl: row.bannerImageUrl,
  };
}

export function dedupePromotionsByGroup<T extends { retailerSlug: string }>(
  items: T[],
  scoreFn: (item: T) => number
): T[] {
  const best = new Map<string, T>();
  for (const item of items) {
    const groupId = getRetailerPromoGroupId(item.retailerSlug);
    const existing = best.get(groupId);
    if (!existing || scoreFn(item) > scoreFn(existing)) {
      best.set(groupId, item);
    }
  }
  return [...best.values()];
}

export function getStaticPromotions(): HomePromotion[] {
  const rows = (scraped.promotions ?? []) as ScrapedPromotionRow[];
  return rows.map(mapScrapedToHome);
}

export function getActiveHomePromotionsFromStatic(
  limit = HOME_PROMOTIONS_MAX,
  today = new Date().toISOString().slice(0, 10)
): HomePromotion[] {
  const rows = (scraped.promotions ?? []) as ScrapedPromotionRow[];
  const active = rows.filter((row) =>
    isActiveOnDate(row.startDate, row.endDate, today)
  );

  const deduped = dedupePromotionsByGroup(active, promotionScore);

  return deduped
    .sort((a, b) => promotionScore(b) - promotionScore(a))
    .slice(0, limit)
    .map(mapScrapedToHome);
}
