import scraped from "@/lib/data/retailer-promotions-scraped.json";
import { IMPORTED_RETAILER_EXTERNAL } from "@/lib/data/imported-retailers";
import {
  getPrimaryRetailerForPromoGroup,
  getRetailerPromoGroupId,
  isSharedPromoGroup,
} from "@/lib/data/retailer-promo-groups";
import { retailers } from "@/lib/data/retailers";
import type { HomePromotion, PromotionCampaignType } from "@/types";

/** Datum u Europe/Belgrade — akcija važi ceo dan endDate, nestaje sledećeg dana. */
export function promotionTodayIso(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Belgrade",
  });
}

export function isPromotionActive(
  startDate: string,
  endDate: string,
  today = promotionTodayIso()
): boolean {
  return startDate <= today && today <= endDate;
}

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
    slug: `${displaySlug}-${slugify(promotionCampaignKey({ sourceUrl: row.sourceUrl, title: row.title }))}`,
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

export function promotionCampaignKey(item: {
  slug?: string;
  sourceUrl?: string;
  title?: string;
}): string {
  if (item.slug?.trim()) return item.slug.trim();
  if (item.sourceUrl?.trim()) {
    try {
      return new URL(item.sourceUrl).pathname.replace(/\/+$/, "") || "/";
    } catch {
      return item.sourceUrl;
    }
  }
  return item.title?.trim() ?? "campaign";
}

/**
 * Deljena grupa (Emperor): jedan baner. Inače više paralelnih akcija po prodavcu.
 */
export function dedupePromotionsForHome<
  T extends { retailerSlug: string; slug?: string; sourceUrl?: string; title?: string },
>(items: T[], scoreFn: (item: T) => number): T[] {
  const sharedGroupBest = new Map<string, T>();
  const campaignBest = new Map<string, T>();

  for (const item of items) {
    if (isSharedPromoGroup(item.retailerSlug)) {
      const groupId = getRetailerPromoGroupId(item.retailerSlug);
      const existing = sharedGroupBest.get(groupId);
      if (!existing || scoreFn(item) > scoreFn(existing)) {
        sharedGroupBest.set(groupId, item);
      }
      continue;
    }

    const key = `${item.retailerSlug}:${promotionCampaignKey(item)}`;
    const existing = campaignBest.get(key);
    if (!existing || scoreFn(item) > scoreFn(existing)) {
      campaignBest.set(key, item);
    }
  }

  return [...sharedGroupBest.values(), ...campaignBest.values()];
}

/** @deprecated Koristi dedupePromotionsForHome */
export function dedupePromotionsByGroup<T extends { retailerSlug: string }>(
  items: T[],
  scoreFn: (item: T) => number
): T[] {
  return dedupePromotionsForHome(items, scoreFn);
}

export function getStaticPromotions(): HomePromotion[] {
  const rows = (scraped.promotions ?? []) as ScrapedPromotionRow[];
  return rows.map(mapScrapedToHome);
}

export function getActiveHomePromotionsFromStatic(
  today = promotionTodayIso()
): HomePromotion[] {
  const rows = (scraped.promotions ?? []) as ScrapedPromotionRow[];
  const active = rows.filter((row) =>
    isPromotionActive(row.startDate, row.endDate, today)
  );

  return dedupePromotionsForHome(active, promotionScore)
    .sort((a, b) => promotionScore(b) - promotionScore(a))
    .map(mapScrapedToHome);
}
