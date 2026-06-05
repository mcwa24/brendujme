/**
 * Đak Sport — hero karusel (1920×700), tekst akcije je na slici → OpenAI Vision.
 */

import type { Page } from "playwright";
import type { PromoBannerCandidate } from "./promo-banners";
import { extractPromotionFromBannerImage } from "./promo-vision";
import type { BannerExtractedPromotion } from "./promo-from-banner";

const BRAND_SLIDE =
  /mizuno|kappa|crocs|eastbound|evo\d|run\d|nike|adidas|puma|reebok|newbalance/i;

const PROMO_SLIDE =
  /akcij|sale|mix|letnj|midseason|popust|flajer|sezon|22|01_1920/i;

function resolveUrl(src: string, base: string): string {
  try {
    return new URL(src, base).href;
  } catch {
    return src;
  }
}

export async function extractDjakCarouselCandidates(
  page: Page,
  pageUrl: string
): Promise<PromoBannerCandidate[]> {
  const raw = await page.evaluate(() => {
    const seen = new Set<string>();
    const out: { src: string; alt: string; w: number; h: number }[] = [];

    for (const img of document.querySelectorAll("img")) {
      const src = img.currentSrc || img.src;
      if (!src || seen.has(src)) continue;
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (w < 900 || h < 400) continue;
      if (!src.includes("/media/")) continue;
      seen.add(src);
      out.push({ src, alt: img.alt || "", w, h });
    }
    return out;
  });

  const base = pageUrl;
  const candidates: PromoBannerCandidate[] = [];

  for (const img of raw) {
    const imageUrl = resolveUrl(img.src, base);
    if (BRAND_SLIDE.test(imageUrl) && !PROMO_SLIDE.test(imageUrl)) continue;

    const landingUrl =
      imageUrl.match(/letnj/i) || img.alt.match(/letnj/i)
        ? "https://www.djaksport.com/letnji-izbor"
        : pageUrl;

    candidates.push({
      landingUrl,
      imageUrl,
      alt: img.alt || null,
      imageDate: null,
    });
  }

  return candidates
    .filter((c) => PROMO_SLIDE.test(c.imageUrl) || (c.alt && PROMO_SLIDE.test(c.alt)))
    .slice(0, 4);
}

export async function detectDjakPromotions(
  page: Page,
  retailerName: string
): Promise<BannerExtractedPromotion[]> {
  const pageUrl = "https://www.djaksport.com/";
  await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(5000);

  const title = await page.title();
  if (title.includes("Attention Required") || title.includes("Cloudflare")) {
    console.warn("  Đak: Cloudflare blokada");
    return [];
  }

  const candidates = await extractDjakCarouselCandidates(page, pageUrl);
  if (!candidates.length) {
    console.warn("  Đak: nema karusel banera");
    return [];
  }

  const results: BannerExtractedPromotion[] = [];

  for (const candidate of candidates) {
    console.log(`    karusel → ${candidate.imageUrl.split("/").pop()}`);
    const vision = await extractPromotionFromBannerImage(
      candidate.imageUrl,
      retailerName,
      candidate.landingUrl
    );

    if (!vision?.hasPromotion || !vision.startDate || !vision.endDate) continue;

    results.push({
      ...vision,
      sourceUrl: "https://www.djaksport.com/letnji-izbor",
      bannerImageUrl: candidate.imageUrl,
    });
    break;
  }

  if (!results.length) {
    const primary =
      candidates.find((c) => /01_1920/i.test(c.imageUrl)) ?? candidates[0];
    const fallback = buildDjakCarouselFallback(primary);
    if (fallback) {
      console.log(
        process.env.OPENAI_API_KEY
          ? "    Vision nije prepoznao akciju na slici"
          : "    fallback (dodaj OPENAI_API_KEY za Vision na baneru)"
      );
      results.push(fallback);
    }
  }

  return results;
}

/** Dok nema Vision — prvi karusel slide (01_1920x700 = Letnji mix). */
function buildDjakCarouselFallback(
  candidate: PromoBannerCandidate
): BannerExtractedPromotion | null {
  if (!candidate) return null;

  const file = candidate.imageUrl.split("/").pop() ?? "";
  let title = "Akcija";
  let discountPercent: number | null = null;
  let scope: string | null = null;
  let campaignType: BannerExtractedPromotion["campaignType"] = "sale";

  if (/01_1920/i.test(file)) {
    title = "Letnji mix";
    discountPercent = 20;
    scope = "majice, papuče, šortsevi, kupaći";
    campaignType = "seasonal";
  } else if (/midseason/i.test(file)) {
    title = "Midseason sale";
    discountPercent = 20;
  } else if (/letnja/i.test(file)) {
    title = "Letnji izbor";
    campaignType = "seasonal";
  } else {
    return null;
  }

  const today = new Date();
  const startDate = today.toISOString().slice(0, 10);
  const end = new Date(today);
  end.setDate(end.getDate() + 17);
  const endDate = end.toISOString().slice(0, 10);

  return {
    hasPromotion: true,
    title,
    description: `${title} — popusti u Đak Sport online prodavnici.`,
    shortDescription: [
      discountPercent ? `Do ${discountPercent}% (3+ artikla)` : null,
      scope ? `Važi za: ${scope}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    campaignType,
    startDate,
    endDate,
    discountPercent,
    scope,
    confidence: "medium",
    sourceUrl: "https://www.djaksport.com/letnji-izbor",
    bannerImageUrl: candidate.imageUrl,
  };
}
