import {
  getRetailerWebsiteUrl,
  normalizeRetailerSlug,
} from "@/lib/data/imported-retailers";
import { isSerbiaMarketUrl } from "@/lib/data/retailer-serbia-urls";

/**
 * Poznate akcije čiji slug potiče od sourceUrl putanje (pre source_url kolone u DB).
 * slug = {retailerSlug}-{pathname-slug} npr. lpp-rs-sr ← reserved.com/rs/sr
 */
const CAMPAIGN_SOURCE_BY_SLUG: Record<string, string> = {
  "lpp-rs-sr": "https://www.reserved.com/rs/sr/",
};

export function resolveCampaignSourceUrl(
  campaignSlug: string,
  retailerSlug: string,
  storedSourceUrl?: string | null
): string {
  const stored = storedSourceUrl?.trim();
  if (stored && isSerbiaMarketUrl(stored)) return stored;

  const inferred = CAMPAIGN_SOURCE_BY_SLUG[campaignSlug];
  if (inferred && isSerbiaMarketUrl(inferred)) return inferred;

  return getRetailerWebsiteUrl(normalizeRetailerSlug(retailerSlug));
}

export function discountFromShortDescription(text: string | null | undefined): number | null {
  const m = text?.match(/-?(\d{1,2})\s*%/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 5 && n <= 90 ? n : null;
}
