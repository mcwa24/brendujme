/**
 * Hero baneri / karuseli — link + slika (tekst akcije je često samo na slici).
 */

export interface PromoBannerCandidate {
  landingUrl: string;
  imageUrl: string;
  alt: string | null;
  /** YYYY-MM-DD iz putanje slike /files/images/YYYY/M/D/ */
  imageDate: string | null;
}

const PROMO_HREF =
  /akcij|popust|sale|flajer|rasprodaj|outlet|black-friday|sniženj/i;
const PROMO_IMG = /akcij|popust|sale|flajer|rasprodaj|promo|banner/i;

function resolveUrl(href: string, base: string): string | null {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

function parseImagePathDate(src: string): string | null {
  const m = src.match(/\/images\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//i);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function humanizeSlug(url: string): string {
  try {
    const slug = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
    if (!slug) return "Akcija";
    return slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "Akcija";
  }
}

export function extractPromoBannerCandidates(
  html: string,
  pageUrl: string
): PromoBannerCandidate[] {
  const found: PromoBannerCandidate[] = [];
  const seen = new Set<string>();

  const anchorBlocks = html.matchAll(
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  );

  for (const block of anchorBlocks) {
    const href = block[1];
    const inner = block[2];
    if (!PROMO_HREF.test(href) && !PROMO_HREF.test(inner)) continue;

    const imgMatch = inner.match(
      /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/i
    );
    if (!imgMatch) continue;

    const landingUrl = resolveUrl(href, pageUrl);
    const imageUrl = resolveUrl(imgMatch[1], pageUrl);
    if (!landingUrl || !imageUrl) continue;

    const key = `${landingUrl}|${imageUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const promoImage = PROMO_IMG.test(imageUrl);
    const promoLanding = PROMO_IMG.test(landingUrl);
    if (!promoImage && !promoLanding) continue;
    if (promoLanding && !promoImage) continue;

    found.push({
      landingUrl,
      imageUrl,
      alt: imgMatch[2]?.trim() || null,
      imageDate: parseImagePathDate(imageUrl),
    });
  }

  if (found.length) return found;

  const soloImages = html.matchAll(
    /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/gi
  );
  for (const img of soloImages) {
    const imageUrl = resolveUrl(img[1], pageUrl);
    if (!imageUrl || !PROMO_IMG.test(imageUrl)) continue;
    const key = imageUrl;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({
      landingUrl: pageUrl,
      imageUrl,
      alt: img[2]?.trim() || null,
      imageDate: parseImagePathDate(imageUrl),
    });
  }

  return found;
}

export function titleFromBannerCandidate(candidate: PromoBannerCandidate): string {
  if (candidate.alt && candidate.alt.length > 2) return candidate.alt;
  return humanizeSlug(candidate.landingUrl);
}
