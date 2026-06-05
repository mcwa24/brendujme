/**
 * Skenira sajtove prodavaca i prepoznaje akcije (baneri + Vision + heuristika).
 * npm run promotions:detect
 */

import fs from "fs";
import path from "path";
import {
  getPrimaryRetailerForPromoGroup,
  getRetailerPromoGroupId,
} from "../src/lib/data/retailer-promo-groups";
import { HOME_PROMOTIONS_MAX } from "../src/lib/data/promotions";
import { RETAILER_PROMO_SOURCES } from "../src/lib/data/retailer-promo-sources";
import { retailers } from "../src/lib/data/retailers";
import { detectDjakPromotions } from "./lib/promo-djak";
import {
  closePromoBrowser,
  fetchPromoPage,
  openPromoBrowserPage,
  retailerNeedsBrowser,
} from "./lib/promo-fetch";
import { extractPromotionsFromPageBanners } from "./lib/promo-from-banner";
import {
  extractPromotionWithHeuristics,
  extractPromotionWithOpenAI,
  mergeExtractions,
  type DetectedCampaignType,
} from "./lib/promo-extract";

const OUT = path.join(
  process.cwd(),
  "src/lib/data/retailer-promotions-scraped.json"
);

export interface ScrapedRetailerPromotion {
  retailerSlug: string;
  retailerName: string;
  sourceUrl: string;
  detectedAt: string;
  title: string;
  description: string;
  shortDescription: string;
  campaignType: DetectedCampaignType;
  startDate: string;
  endDate: string;
  discountPercent: number | null;
  scope: string | null;
  confidence: "high" | "medium" | "low";
  bannerImageUrl?: string;
}

export interface RetailerPromotionsScrapedFile {
  scrapedAt: string;
  promotions: ScrapedRetailerPromotion[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function promotionKey(
  retailerSlug: string,
  title: string,
  sourceUrl: string
): string {
  return `${retailerSlug}:${slugify(title)}:${new URL(sourceUrl).pathname}`;
}

function pushPromotion(
  promotions: ScrapedRetailerPromotion[],
  seen: Set<string>,
  row: Omit<ScrapedRetailerPromotion, "detectedAt">,
  label: string
) {
  const key = promotionKey(row.retailerSlug, row.title, row.sourceUrl);
  if (seen.has(key)) return;
  seen.add(key);
  promotions.push({ ...row, detectedAt: new Date().toISOString() });
  console.log(
    `    ✓ [${label}] ${row.title} (${row.startDate} → ${row.endDate}, ${row.confidence}${row.discountPercent ? `, ${row.discountPercent}%` : ""})`
  );
}

async function main() {
  const retailerNameBySlug = new Map(
    retailers.map((r) => [r.slug, r.name])
  );
  const seen = new Set<string>();
  const promotions: ScrapedRetailerPromotion[] = [];
  const useAi = Boolean(process.env.OPENAI_API_KEY);

  console.log(
    useAi
      ? "Detekcija akcija (baneri + OpenAI Vision)…"
      : "Detekcija akcija — OPENAI_API_KEY nedostaje (Đak Vision neće raditi)"
  );

  const fetchPage = (url: string, retailerSlug?: string) =>
    fetchPromoPage(url, retailerSlug);

  try {
    for (const source of RETAILER_PROMO_SOURCES) {
      const retailerName =
        retailerNameBySlug.get(source.retailerSlug) ?? source.retailerSlug;
      console.log(`\n${retailerName} (${source.retailerSlug})`);

      if (source.retailerSlug === "djak-sport") {
        const page = await openPromoBrowserPage();
        try {
          const djakBanners = await detectDjakPromotions(page, retailerName);
          for (const banner of djakBanners) {
            pushPromotion(
              promotions,
              seen,
              {
                retailerSlug: source.retailerSlug,
                retailerName,
                sourceUrl: banner.sourceUrl,
                title: banner.title,
                description: banner.description,
                shortDescription: banner.shortDescription,
                campaignType: banner.campaignType,
                startDate: banner.startDate!,
                endDate: banner.endDate!,
                discountPercent: banner.discountPercent,
                scope: banner.scope,
                confidence: banner.confidence,
                bannerImageUrl: banner.bannerImageUrl,
              },
              "đak-vision"
            );
          }
        } finally {
          await page.close();
        }
        continue;
      }

      for (const url of source.urls) {
        console.log(`  → ${url}`);
        const html = await fetchPage(url, source.retailerSlug);
        if (!html) continue;

        const banners = await extractPromotionsFromPageBanners(
          html,
          url,
          retailerName,
          (u) => fetchPage(u, source.retailerSlug)
        );
        for (const banner of banners) {
          pushPromotion(
            promotions,
            seen,
            {
              retailerSlug: source.retailerSlug,
              retailerName,
              sourceUrl: banner.sourceUrl,
              title: banner.title,
              description: banner.description,
              shortDescription: banner.shortDescription,
              campaignType: banner.campaignType,
              startDate: banner.startDate!,
              endDate: banner.endDate!,
              discountPercent: banner.discountPercent,
              scope: banner.scope,
              confidence: banner.confidence,
              bannerImageUrl: banner.bannerImageUrl,
            },
            "banner"
          );
        }

        if (retailerNeedsBrowser(source.retailerSlug)) continue;

        const heuristic = extractPromotionWithHeuristics(html, url);
        const ai = useAi
          ? await extractPromotionWithOpenAI(html, url, retailerName)
          : null;
        const extracted = mergeExtractions(heuristic, ai);

        if (
          !extracted.hasPromotion ||
          !extracted.startDate ||
          !extracted.endDate ||
          extracted.confidence === "low"
        ) {
          if (!banners.length) console.log("    nema prepoznate akcije");
          continue;
        }

        pushPromotion(
          promotions,
          seen,
          {
            retailerSlug: source.retailerSlug,
            retailerName,
            sourceUrl: url,
            title: extracted.title,
            description: extracted.description,
            shortDescription: extracted.shortDescription,
            campaignType: extracted.campaignType,
            startDate: extracted.startDate,
            endDate: extracted.endDate,
            discountPercent: extracted.discountPercent,
            scope: extracted.scope,
            confidence: extracted.confidence,
          },
          "stranica"
        );
      }
    }
  } finally {
    await closePromoBrowser();
  }

  const confRank = { high: 0, medium: 1, low: 2 };
  const score = (p: ScrapedRetailerPromotion) => {
    let s = (3 - confRank[p.confidence]) * 100 + (p.discountPercent ?? 0);
    if (
      p.retailerSlug ===
      getPrimaryRetailerForPromoGroup(getRetailerPromoGroupId(p.retailerSlug))
    ) {
      s += 50;
    }
    return s;
  };

  const bestByGroup = new Map<string, ScrapedRetailerPromotion>();
  for (const promo of promotions) {
    const groupId = getRetailerPromoGroupId(promo.retailerSlug);
    const existing = bestByGroup.get(groupId);
    if (!existing || score(promo) > score(existing)) {
      bestByGroup.set(groupId, promo);
    }
  }
  const deduped = [...bestByGroup.values()]
    .sort((a, b) => score(b) - score(a))
    .slice(0, HOME_PROMOTIONS_MAX);

  const payload: RetailerPromotionsScrapedFile = {
    scrapedAt: new Date().toISOString(),
    promotions: deduped,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`\nSačuvano ${deduped.length} akcija → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
