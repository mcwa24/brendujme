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
  /akcij|popust|sale|flajer|rasprodaj|outlet|black-friday|sniženj|\/promo|promo-all/i;
const PROMO_IMG = /akcij|popust|sale|flajer|rasprodaj|promo|banner|baner/i;

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

function isPromoLandingUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return (
      /\/promo|akcij|popust|sale|flajer|rasprodaj|outlet|vikend/i.test(path) &&
      !/\/brendovi\//i.test(path)
    );
  } catch {
    return false;
  }
}

function pickImgSrc(attrs: string): string | null {
  const desktop = attrs.match(/data-src-desktop=["']([^"']+)["']/i)?.[1];
  const src = attrs.match(/\ssrc=["']([^"']+)["']/i)?.[1];
  const dataSrc = attrs.match(/data-src=["']([^"']+)["']/i)?.[1];
  return desktop ?? src ?? dataSrc ?? null;
}

/** Fashion&Friends / WeltPixel owl karusel */
function extractOwlCarouselBannerCandidates(
  html: string,
  pageUrl: string
): PromoBannerCandidate[] {
  const found: PromoBannerCandidate[] = [];
  const seen = new Set<string>();

  const blocks = html.matchAll(
    /<div[^>]*class=["'][^"']*banner-item[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<div class="content_slider"/gi
  );

  for (const block of blocks) {
    const inner = block[1];
    const href = inner.match(/<a[^>]+href=["']([^"']+)["']/i)?.[1];
    if (!href || !PROMO_HREF.test(href)) continue;

    const imgTag = inner.match(/<img[^>]+>/i)?.[0];
    if (!imgTag) continue;

    const rawSrc = pickImgSrc(imgTag);
    if (!rawSrc) continue;

    const landingUrl = resolveUrl(href, pageUrl);
    const imageUrl = resolveUrl(rawSrc, pageUrl);
    if (!landingUrl || !imageUrl) continue;

    const key = `${landingUrl}|${imageUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const alt = imgTag.match(/alt=["']([^"']*)["']/i)?.[1]?.trim() || null;

    found.push({
      landingUrl,
      imageUrl,
      alt,
      imageDate: parseImagePathDate(imageUrl),
    });
  }

  return found;
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

  for (const owl of extractOwlCarouselBannerCandidates(html, pageUrl)) {
    const key = `${owl.landingUrl}|${owl.imageUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push(owl);
  }

  const anchorBlocks = html.matchAll(
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  );

  for (const block of anchorBlocks) {
    const href = block[1];
    const inner = block[2];
    if (!PROMO_HREF.test(href) && !PROMO_HREF.test(inner)) continue;

    const imgMatch = inner.match(/<img[^>]+>/i);
    if (!imgMatch) continue;

    const rawSrc = pickImgSrc(imgMatch[0]);
    if (!rawSrc) continue;

    const landingUrl = resolveUrl(href, pageUrl);
    const imageUrl = resolveUrl(rawSrc, pageUrl);
    if (!landingUrl || !imageUrl) continue;

    const key = `${landingUrl}|${imageUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const promoImage = PROMO_IMG.test(imageUrl);
    const promoLanding = isPromoLandingUrl(landingUrl);
    if (!promoImage && !promoLanding) continue;
    if (promoLanding && !promoImage && !/owlcarouselslider|weltpixel|baner/i.test(imageUrl)) {
      continue;
    }

    found.push({
      landingUrl,
      imageUrl,
      alt: imgMatch[0].match(/alt=["']([^"']*)["']/i)?.[1]?.trim() || null,
      imageDate: parseImagePathDate(imageUrl),
    });
  }

  if (found.length) return found;

  const soloImages = html.matchAll(/<img[^>]+>/gi);
  for (const imgTag of soloImages) {
    const rawSrc = pickImgSrc(imgTag[0]);
    if (!rawSrc) continue;
    const imageUrl = resolveUrl(rawSrc, pageUrl);
    if (!imageUrl || !PROMO_IMG.test(imageUrl)) continue;
    const key = imageUrl;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({
      landingUrl: pageUrl,
      imageUrl,
      alt: imgTag[0].match(/alt=["']([^"']*)["']/i)?.[1]?.trim() || null,
      imageDate: parseImagePathDate(imageUrl),
    });
  }

  return found;
}

export function titleFromBannerCandidate(candidate: PromoBannerCandidate): string {
  if (candidate.alt && candidate.alt.length > 2) return candidate.alt;
  return humanizeSlug(candidate.landingUrl);
}
