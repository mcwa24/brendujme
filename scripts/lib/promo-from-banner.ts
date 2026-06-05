import {
  extractDateRange,
  extractDiscountPercent,
  extractH1,
  htmlToText,
  type ExtractedPromotion,
} from "./promo-extract";
import {
  extractPromoBannerCandidates,
  titleFromBannerCandidate,
  type PromoBannerCandidate,
} from "./promo-banners";
import { extractPromotionFromBannerImage } from "./promo-vision";

export interface BannerExtractedPromotion extends ExtractedPromotion {
  sourceUrl: string;
  bannerImageUrl?: string;
}

const HERO_IMAGE_NAME =
  /akcij|popust|sale|flajer|promo|banner|baner|vikend|rasprodaj|owlcarouselslider/i;

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function isHeroBannerImage(imageUrl: string): boolean {
  const file = imageUrl.split("/").pop() ?? "";
  return HERO_IMAGE_NAME.test(file);
}

function isShortOnlinePromoSlug(url: string): boolean {
  return /online-akcij|vikend-akcij/i.test(new URL(url).pathname);
}

function isPromoLandingPath(url: string): boolean {
  return /\/promo|rasprodaj|akcij/i.test(new URL(url).pathname);
}

function maxDiscountFromListingHtml(html: string): number | null {
  const values = [...html.matchAll(/<span>-(\d{1,2})%<\/span>/gi)].map((m) =>
    Number(m[1])
  );
  const valid = values.filter((n) => n >= 5 && n <= 90);
  return valid.length ? Math.max(...valid) : null;
}

function landingSlugKey(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts.slice(-2).join("/") || parts.join("/");
}

function formatPromoTitle(title: string, landingUrl: string): string {
  const t = title.trim();
  if (/online\s+akcij/i.test(t) || /online-akcij/i.test(landingUrl)) {
    return "Online akcija";
  }
  if (/vikend\s+akcij/i.test(t)) return "Vikend akcija";
  if (/^promo\s+srb$/i.test(t) || /promo-srb/i.test(landingUrl)) {
    return "Sezonska akcija";
  }
  if (/\/rasprodaj\//i.test(landingUrl)) return "Rasprodaja";
  if (/^promo\b/i.test(t)) return "Akcija";
  return t;
}

function formatDateRangeShort(startDate: string, endDate: string): string {
  const fmt = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString("sr-Latn-RS", {
      day: "numeric",
      month: "numeric",
    });
  if (startDate === endDate) return fmt(startDate);
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

function buildShortDescription(
  discount: number | null,
  scope: string | null,
  startDate: string,
  endDate: string
): string {
  return [
    discount ? `Do ${discount}% popusta` : null,
    scope ? `Važi za: ${scope}` : null,
    formatDateRangeShort(startDate, endDate),
  ]
    .filter(Boolean)
    .join(" · ");
}

async function buildFromBannerCandidate(
  candidate: PromoBannerCandidate,
  retailerName: string,
  fetchPage: (url: string) => Promise<string | null>
): Promise<BannerExtractedPromotion | null> {
  const vision = await extractPromotionFromBannerImage(
    candidate.imageUrl,
    retailerName,
    candidate.landingUrl
  );
  if (vision?.hasPromotion && vision.startDate && vision.endDate) {
    const landingHtml = await fetchPage(candidate.landingUrl);
    const title = landingHtml
      ? extractH1(landingHtml) ?? vision.title
      : vision.title;
    return {
      ...vision,
      title,
      sourceUrl: candidate.landingUrl,
      bannerImageUrl: candidate.imageUrl,
    };
  }

  if (!isHeroBannerImage(candidate.imageUrl)) return null;

  const landingHtml = await fetchPage(candidate.landingUrl);
  const landingHead = landingHtml ? htmlToText(landingHtml).slice(0, 900) : "";
  const title =
    (landingHtml ? extractH1(landingHtml) : null) ??
    titleFromBannerCandidate(candidate);

  const promoLike =
    /akcij|popust|sale|vikend|rasprodaj|online|promo/i.test(title) ||
    isPromoLandingPath(candidate.landingUrl);
  if (!promoLike) return null;

  let startDate = candidate.imageDate;
  let endDate: string | null = null;

  const parsed = extractDateRange(landingHead);
  if (parsed.startDate) startDate = parsed.startDate;
  if (parsed.endDate) endDate = parsed.endDate;

  const today = new Date().toISOString().slice(0, 10);
  if (!startDate) startDate = today;
  if (!endDate && isShortOnlinePromoSlug(candidate.landingUrl)) {
    endDate = addDays(startDate, 2);
  }
  if (!endDate && isPromoLandingPath(candidate.landingUrl)) {
    endDate = addDays(startDate, 21);
  }
  if (!endDate) return null;

  const discountPercent =
    (landingHtml ? maxDiscountFromListingHtml(landingHtml) : null) ??
    extractDiscountPercent(landingHead);

  const scope =
    /izdvoj/i.test(landingHead) || /online-akcij/i.test(candidate.landingUrl)
      ? "izdvojena ponuda"
      : /\/rasprodaj/i.test(candidate.landingUrl)
        ? "rasprodaja"
        : isPromoLandingPath(candidate.landingUrl)
          ? "izabrani brendovi i artikli"
          : null;

  const formattedTitle = formatPromoTitle(title, candidate.landingUrl);

  return {
    hasPromotion: true,
    title: formattedTitle,
    description: landingHead.slice(0, 800) || `${formattedTitle} — Fashion&Friends.`,
    shortDescription: buildShortDescription(
      discountPercent,
      scope,
      startDate,
      endDate
    ),
    campaignType: /rasprodaj/i.test(candidate.landingUrl) ? "clearance" : "sale",
    startDate,
    endDate,
    discountPercent,
    scope,
    confidence: candidate.imageDate && endDate ? "high" : "medium",
    sourceUrl: candidate.landingUrl,
    bannerImageUrl: candidate.imageUrl,
  };
}

export async function extractPromotionsFromPageBanners(
  html: string,
  pageUrl: string,
  retailerName: string,
  fetchPage: (url: string) => Promise<string | null>
): Promise<BannerExtractedPromotion[]> {
  const candidates = extractPromoBannerCandidates(html, pageUrl);
  if (!candidates.length) return [];

  const byCampaign = new Map<string, BannerExtractedPromotion>();

  for (const candidate of candidates) {
    const built = await buildFromBannerCandidate(
      candidate,
      retailerName,
      fetchPage
    );
    if (!built?.hasPromotion || !built.startDate || !built.endDate) continue;
    if (built.confidence === "low") continue;

    const key = landingSlugKey(built.sourceUrl);
    const existing = byCampaign.get(key);
    if (
      !existing ||
      (built.confidence === "high" && existing.confidence !== "high") ||
      (built.bannerImageUrl && isHeroBannerImage(built.bannerImageUrl) &&
        existing.bannerImageUrl &&
        !isHeroBannerImage(existing.bannerImageUrl))
    ) {
      byCampaign.set(key, built);
    }
  }

  return [...byCampaign.values()];
}
