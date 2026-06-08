import scraped from "@/lib/data/retailer-promotions-scraped.json";
import { fashionCompanyRetailer } from "@/lib/data/fashion-company";
import {
  getRetailerWebsiteUrl,
  IMPORTED_RETAILER_EXTERNAL,
  normalizeRetailerSlug,
} from "@/lib/data/imported-retailers";
import { isSerbiaMarketUrl } from "@/lib/data/retailer-serbia-urls";
import {
  getPrimaryRetailerForPromoGroup,
  getRetailerPromoGroupId,
  isPromoGroupMember,
  isSingleBannerPromoGroup,
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

function resolveRetailerForPromo(slug: string) {
  if (slug === "fashion-company") return fashionCompanyRetailer;
  return retailers.find((r) => r.slug === slug);
}

function mapScrapedToHome(row: ScrapedPromotionRow): HomePromotion | null {
  if (!isSerbiaMarketUrl(row.sourceUrl)) return null;

  const normalizedSlug = normalizeRetailerSlug(row.retailerSlug);
  const groupId = getRetailerPromoGroupId(normalizedSlug);
  const displaySlug = getPrimaryRetailerForPromoGroup(groupId);
  const retailer = resolveRetailerForPromo(displaySlug);
  const external =
    IMPORTED_RETAILER_EXTERNAL[
      displaySlug as keyof typeof IMPORTED_RETAILER_EXTERNAL
    ];
  const sourceUrl =
    row.sourceUrl || external?.website || `/retailers/${displaySlug}`;

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
    sourceUrl,
    retailerWebsiteUrl: getRetailerWebsiteUrl(displaySlug, sourceUrl),
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

/** Ključ za deduplikaciju home banera (grupa + kampanja). */
export function getHomePromoDedupeKey(item: {
  retailerSlug: string;
  slug?: string;
  sourceUrl?: string;
  title?: string;
}): string {
  const retailerSlug = normalizeRetailerSlug(item.retailerSlug);
  const groupId = getRetailerPromoGroupId(retailerSlug);
  if (isSingleBannerPromoGroup(groupId)) {
    return `single:${groupId}`;
  }
  const campaignKey = promotionCampaignKey(item);
  if (isPromoGroupMember(retailerSlug)) {
    return `${groupId}:${campaignKey}`;
  }
  return `${retailerSlug}:${campaignKey}`;
}

/**
 * Emperor: jedan baner po grupi. Inače više paralelnih akcija po prodavcu.
 */
export function dedupePromotionsForHome<
  T extends { retailerSlug: string; slug?: string; sourceUrl?: string; title?: string },
>(items: T[], scoreFn: (item: T) => number): T[] {
  const best = new Map<string, T>();

  for (const item of items) {
    const key = getHomePromoDedupeKey(item);
    const existing = best.get(key);
    if (!existing || scoreFn(item) > scoreFn(existing)) {
      best.set(key, item);
    }
  }

  return [...best.values()];
}

/** @deprecated Koristi dedupePromotionsForHome */
export function dedupePromotionsByGroup<T extends { retailerSlug: string }>(
  items: T[],
  scoreFn: (item: T) => number
): T[] {
  return dedupePromotionsForHome(items, scoreFn);
}

function mapScrapedRows(rows: ScrapedPromotionRow[]): HomePromotion[] {
  return rows
    .map(mapScrapedToHome)
    .filter((row): row is HomePromotion => Boolean(row));
}

export function getStaticPromotions(): HomePromotion[] {
  const rows = (scraped.promotions ?? []) as ScrapedPromotionRow[];
  return mapScrapedRows(rows);
}

export function getActiveHomePromotionsFromStatic(
  today = promotionTodayIso()
): HomePromotion[] {
  const rows = (scraped.promotions ?? []) as ScrapedPromotionRow[];
  const active = rows.filter((row) =>
    isPromotionActive(row.startDate, row.endDate, today)
  );

  return mapScrapedRows(
    dedupePromotionsForHome(active, promotionScore).sort(
      (a, b) => promotionScore(b) - promotionScore(a)
    )
  );
}

/** Preostali dani akcije (0 = poslednji dan važenja). */
export function promotionDaysUntilEnd(
  endDate: string,
  today = promotionTodayIso()
): number {
  const end = new Date(`${endDate}T12:00:00`).getTime();
  const start = new Date(`${today}T12:00:00`).getTime();
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

function dayWord(count: number): string {
  const n = Math.abs(count);
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return "dana";
  if (mod10 === 1) return "dan";
  return "dana";
}

export function formatPromotionExpiryUrgency(
  endDate: string,
  today = promotionTodayIso()
): string {
  const days = promotionDaysUntilEnd(endDate, today);
  if (days === 0) return "Poslednji dan";
  if (days === 1) return "Ističe sutra";
  return `Ističe za ${days} ${dayWord(days)}`;
}

/** Akcija koja najpre ističe među aktivnim ponudama. */
export function pickExpiringSoonPromotion(
  promotions: HomePromotion[]
): HomePromotion | null {
  if (!promotions.length) return null;

  return [...promotions].sort((a, b) => {
    const byEnd = a.endDate.localeCompare(b.endDate);
    if (byEnd !== 0) return byEnd;
    return a.startDate.localeCompare(b.startDate);
  })[0];
}
