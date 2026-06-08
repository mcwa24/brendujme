/**
 * Srpsko tržište za linkove prodavaca i akcija.
 * Akcije: samo SR. Stranica prodavca: SR shop, pa originalni sajt ako nema SR.
 */

const BLOCKED_HOSTS = new Set(["lpp.com", "inditex.com"]);

/** .com domeni srpskih lanaca bez /rs u putanji */
const SERBIAN_COM_HOSTS = new Set(["djaksport.com", "n-sport.net"]);

function hasSerbiaPath(path: string): boolean {
  return /\/rs(?:\/|_|$|-)/i.test(path) || path === "/rs";
}

export function isSerbiaMarketUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const path = parsed.pathname.toLowerCase();

    if (BLOCKED_HOSTS.has(host)) return false;

    if (host.endsWith(".rs")) return true;

    if (hasSerbiaPath(path)) return true;

    if (host === "nike.com" && !path.startsWith("/rs")) return false;

    if (SERBIAN_COM_HOSTS.has(host)) return true;

    return false;
  } catch {
    return false;
  }
}

export function assertSerbiaMarketUrl(url: string, label: string): void {
  if (!isSerbiaMarketUrl(url)) {
    throw new Error(`${label} nije srpski URL: ${url}`);
  }
}

export function getPromotionExternalUrl(promo: {
  sourceUrl: string;
  retailerWebsiteUrl: string;
  href: string;
}): string {
  if (promo.sourceUrl && isSerbiaMarketUrl(promo.sourceUrl)) return promo.sourceUrl;
  if (promo.retailerWebsiteUrl && isSerbiaMarketUrl(promo.retailerWebsiteUrl)) {
    return promo.retailerWebsiteUrl;
  }
  if (promo.retailerWebsiteUrl?.startsWith("http")) return promo.retailerWebsiteUrl;
  return promo.href;
}
