import { decodeHtmlEntities } from "@/lib/text/decode-html-entities";
import type { HomePromotion, PromotionCampaignType } from "@/types";

const CAMPAIGN_LABELS: Record<PromotionCampaignType, string> = {
  sale: "Akcija",
  seasonal: "Sezonska akcija",
  black_friday: "Black Friday",
  clearance: "Rasprodaja",
  new_collection: "Nova kolekcija",
  collaboration: "Kolaboracija",
  other: "Ponuda",
};

const EMBEDDED_DATE_SUFFIX =
  /\s*·\s*\d{1,2}\.\s*\d{1,2}\.?\s*[–\-]\s*\d{1,2}\.\s*(?:\d{1,2}|[a-zšđčćž]+)\.?\s*$/iu;

function isMostlyDateRange(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return /^[\d.\s–\-/]+$/u.test(trimmed) || /^\d{1,2}\.\s*\d{1,2}/.test(trimmed);
}

function stripEmbeddedPromoDate(text: string): string {
  return text.replace(EMBEDDED_DATE_SUFFIX, "").trim();
}

export function promotionCampaignLabel(
  campaignType: PromotionCampaignType
): string {
  return CAMPAIGN_LABELS[campaignType];
}

export function promotionDisplayTitle(promo: HomePromotion): string {
  return decodeHtmlEntities(promo.title);
}

export function promotionOfferLine(promo: HomePromotion): string {
  const scope = promo.scope?.trim();
  if (scope) return decodeHtmlEntities(stripEmbeddedPromoDate(scope));

  const short = promo.shortDescription?.trim();
  if (short && !isMostlyDateRange(short)) {
    return decodeHtmlEntities(stripEmbeddedPromoDate(short));
  }

  return CAMPAIGN_LABELS[promo.campaignType];
}
