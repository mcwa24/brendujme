import { NextRequest, NextResponse } from "next/server";
import { getPromotionExternalUrl } from "@/lib/data/retailer-serbia-urls";
import { getHomePromotions } from "@/lib/data/repository";
import {
  applyPublicApiCorsHeaders,
  resolvePublicApiCorsOrigin,
} from "@/lib/security/public-api-cors";
import type { HomePromotion, PromotionCampaignType } from "@/types";

export const runtime = "nodejs";
export const revalidate = 3600;

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 12;

const CAMPAIGN_LABELS: Record<PromotionCampaignType, string> = {
  sale: "Akcija",
  seasonal: "Sezonska akcija",
  black_friday: "Black Friday",
  clearance: "Rasprodaja",
  new_collection: "Nova kolekcija",
  collaboration: "Kolaboracija",
  other: "Ponuda",
};

function clampLimit(raw: string | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

function serializePromotion(promo: HomePromotion) {
  return {
    slug: promo.slug,
    title: promo.title,
    shortDescription: promo.shortDescription,
    campaignType: promo.campaignType,
    campaignLabel: CAMPAIGN_LABELS[promo.campaignType],
    startDate: promo.startDate,
    endDate: promo.endDate,
    retailerSlug: promo.retailerSlug,
    retailerName: promo.retailerName,
    discountPercent: promo.discountPercent ?? null,
    scope: promo.scope ?? null,
    externalUrl: getPromotionExternalUrl(promo),
    retailerHref: promo.href,
    bannerImageUrl: promo.bannerImageUrl ?? null,
  };
}

function jsonResponse(body: unknown, request: NextRequest, init?: ResponseInit) {
  const res = NextResponse.json(body, init);
  applyPublicApiCorsHeaders(res, request);
  res.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  return res;
}

export async function OPTIONS(request: NextRequest) {
  if (!resolvePublicApiCorsOrigin(request)) {
    return new NextResponse(null, { status: 204 });
  }
  const res = new NextResponse(null, { status: 204 });
  applyPublicApiCorsHeaders(res, request);
  return res;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = clampLimit(searchParams.get("limit"));

  try {
    const all = await getHomePromotions();
    const promotions = all.slice(0, limit).map(serializePromotion);
    return jsonResponse({ promotions }, request);
  } catch (err) {
    return jsonResponse(
      {
        error: err instanceof Error ? err.message : "Učitavanje akcija nije uspelo.",
        promotions: [],
      },
      request,
      { status: 500 },
    );
  }
}
