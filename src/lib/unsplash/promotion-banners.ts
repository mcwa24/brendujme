import { unstable_cache } from "next/cache";
import {
  RETAILER_OFFERING_FOCUS,
  type OfferingSlug,
} from "@/lib/data/brand-offerings";
import { getUnsplashAccessKey, isUnsplashConfigured } from "@/lib/unsplash/env";
import type { HomePromotion } from "@/types";

export interface PromotionBannerImage {
  imageUrl: string;
  photographerName?: string;
  photographerUsername?: string;
  unsplashPageUrl?: string;
}

/** Still life / studijski kadar na obojenoj pozadini — ne prodavnica */
const STUDIO_QUERY_SUFFIX =
  "product photography studio still life colored background";

const SCOPE_UNSPLASH_TERMS: Array<{ test: RegExp; term: string }> = [
  { test: /majic/, term: "t-shirt" },
  { test: /papuč/, term: "sandals" },
  { test: /šorts|sorts/, term: "shorts" },
  { test: /kupać|kupac/, term: "swimwear" },
  { test: /patik/, term: "sneakers" },
  { test: /jakn|prsluk/, term: "jacket" },
  { test: /dukser|hoodie/, term: "hoodie" },
  { test: /pantalon/, term: "pants" },
  { test: /trener/, term: "tracksuit" },
  { test: /helank|legging/, term: "leggings" },
  { test: /kopačk/, term: "football boots" },
  { test: /odeć/, term: "clothing" },
];

const OFFERING_UNSPLASH: Record<OfferingSlug, string> = {
  footwear: "sneakers",
  sportswear: "sportswear",
  apparel: "fashion apparel",
  accessories: "sport accessories",
};

const FALLBACK_STUDIO: PromotionBannerImage = {
  imageUrl:
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1200&q=80",
  photographerName: "Unsplash",
  unsplashPageUrl: "https://unsplash.com",
};

type UnsplashPhoto = {
  urls?: { regular?: string; full?: string };
  links?: { html?: string };
  user?: { name?: string; username?: string };
  alt_description?: string | null;
  description?: string | null;
};

function buildStudioQuery(productTerms: string[]): string {
  const products = [...new Set(productTerms.map((t) => t.trim()).filter(Boolean))];
  return [...products, STUDIO_QUERY_SUFFIX].join(" ");
}

/** Stavke iz scope / „Važi za:“ */
export function extractPromotionScopeItems(promo: HomePromotion): string[] {
  let raw = promo.scope?.trim();

  if (!raw && promo.shortDescription) {
    const match = promo.shortDescription.match(/važi za:\s*([^·]+)/i);
    if (match) raw = match[1].trim();
  }

  if (!raw) return [];

  return raw
    .split(/[,;]/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

export function unsplashQueryFromPromotionScope(
  promo: HomePromotion
): string | null {
  const items = extractPromotionScopeItems(promo);
  if (!items.length) return null;

  const terms: string[] = [];
  for (const item of items) {
    for (const { test, term } of SCOPE_UNSPLASH_TERMS) {
      if (test.test(item) && !terms.includes(term)) {
        terms.push(term);
      }
    }
  }

  if (!terms.length) return null;

  const seasonal =
    promo.campaignType === "seasonal" || /letnj/i.test(promo.title)
      ? "summer"
      : "";

  return buildStudioQuery([seasonal, ...terms].filter(Boolean));
}

export function unsplashQueryFromRetailerOfferings(
  retailerSlug: string
): string {
  const offerings =
    RETAILER_OFFERING_FOCUS[retailerSlug] ?? (["sportswear"] as OfferingSlug[]);
  const terms = offerings.map((o) => OFFERING_UNSPLASH[o]);
  return buildStudioQuery(terms);
}

function unsplashQueryForPromotion(promo: HomePromotion): string {
  const fromScope = unsplashQueryFromPromotionScope(promo);
  if (fromScope) return fromScope;

  return unsplashQueryFromRetailerOfferings(promo.retailerSlug);
}

function isLikelyShopPhoto(photo: UnsplashPhoto): boolean {
  const text = `${photo.alt_description ?? ""} ${photo.description ?? ""}`.toLowerCase();
  return /\b(shop|store|retail|mall|boutique|interior|window display|aisle)\b/.test(
    text
  );
}

async function searchUnsplashBanner(
  query: string
): Promise<PromotionBannerImage | null> {
  const accessKey = getUnsplashAccessKey();
  if (!accessKey) return null;

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("per_page", "15");
  url.searchParams.set("content_filter", "high");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      "Accept-Version": "v1",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;

  const json = (await response.json()) as { results?: UnsplashPhoto[] };
  const photo =
    json.results?.find(
      (item) =>
        (item.urls?.regular || item.urls?.full) && !isLikelyShopPhoto(item)
    ) ?? json.results?.find((item) => item.urls?.regular || item.urls?.full);

  if (!photo) return null;

  const imageUrl = photo.urls?.regular ?? photo.urls?.full;
  if (!imageUrl) return null;

  return {
    imageUrl,
    photographerName: photo.user?.name?.trim(),
    photographerUsername: photo.user?.username?.trim(),
    unsplashPageUrl: photo.links?.html?.trim(),
  };
}

async function resolveBannerForPromotion(
  promo: HomePromotion
): Promise<PromotionBannerImage> {
  if (isUnsplashConfigured()) {
    const query = unsplashQueryForPromotion(promo);
    const fromApi = await searchUnsplashBanner(query);
    if (fromApi) return fromApi;
  }

  return FALLBACK_STUDIO;
}

async function fetchPromotionBannersUncached(
  promotions: HomePromotion[]
): Promise<PromotionBannerImage[]> {
  return Promise.all(promotions.map((promo) => resolveBannerForPromotion(promo)));
}

function cacheKeyForPromotions(promotions: HomePromotion[]): string {
  return promotions
    .map(
      (p) =>
        `${p.retailerSlug}:${p.slug}:${p.scope ?? ""}:${p.shortDescription ?? ""}`
    )
    .join("|");
}

export async function getPromotionBannerImages(
  promotions: HomePromotion[]
): Promise<PromotionBannerImage[]> {
  if (!promotions.length) return [];

  const key = cacheKeyForPromotions(promotions);
  return unstable_cache(
    async () => fetchPromotionBannersUncached(promotions),
    ["promotion-banner-images-v3", key],
    { revalidate: 86400, tags: ["unsplash-promo-banners"] }
  )();
}
