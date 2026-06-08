import { brands as staticBrands } from "@/lib/data/brands";
import { buzzSneakersMeta } from "@/lib/data/buzz-sneakers";
import { countModniScrapedBrands } from "@/lib/data/modni-retailer-brands";
import { getScrapedBrandsForRetailer } from "@/lib/data/retailer-scraped-brands";
import { tikeMeta } from "@/lib/data/tike";
import { nSportMeta } from "@/lib/data/n-sport";
import { urbanShopMeta } from "@/lib/data/urban-shop";
import { fashionCompanyMeta } from "@/lib/data/fashion-company";
import {
  resolveRetailerPublicWebsite,
} from "@/lib/data/imported-retailers";
import { isSerbiaMarketUrl } from "@/lib/data/retailer-serbia-urls";
import { djakSportMeta } from "@/lib/data/djak-sport";
import scrapedFs from "@/lib/data/fashion-sport-serbia-scraped.json";
import scrapedFashion from "@/lib/data/fast-fashion-serbia-scraped.json";
import { planetaSportMeta } from "@/lib/data/planeta-sport";
import { sportVisionMeta } from "@/lib/data/sport-vision";
import { nikeSerbiaMeta } from "@/lib/data/nike-serbia";
import { officeShoesMeta } from "@/lib/data/office-shoes";

export interface RetailerCatalogMeta {
  brandCount: number;
  storeCount: number;
  lastSynced: string;
  sourceUrl: string;
  sourceLabel: string;
  website: string;
  websiteLabel: string;
}

function syncedFromIso(iso: string): string {
  return iso.slice(0, 10);
}

const catalogBySlug = new Map(staticBrands.map((b) => [b.slug, b]));

const CATALOG_META: Record<string, RetailerCatalogMeta> = {
  "fashion-company": {
    brandCount: fashionCompanyMeta.brandCount,
    storeCount: scrapedFs.stores.filter(
      (s) =>
        s.retailerSlug === "fashion-company" ||
        s.retailerSlug === "fashion-friends"
    ).length,
    lastSynced: syncedFromIso(scrapedFs.scrapedAt),
    sourceUrl: fashionCompanyMeta.brandsUrl,
    sourceLabel: "fashioncompany.rs",
    website: fashionCompanyMeta.website,
    websiteLabel: "fashioncompany.rs",
  },
  tike: {
    brandCount: tikeMeta.brandCount,
    storeCount: tikeMeta.storeCount,
    lastSynced: syncedFromIso(tikeMeta.scrapedAt),
    sourceUrl: tikeMeta.brandsUrl,
    sourceLabel: "tike.rs/brendovi",
    website: "https://www.tike.rs/",
    websiteLabel: "tike.rs",
  },
  "urban-shop": {
    brandCount: urbanShopMeta.brandCount,
    storeCount: urbanShopMeta.storeCount,
    lastSynced: syncedFromIso(urbanShopMeta.scrapedAt),
    sourceUrl: urbanShopMeta.brandsUrl,
    sourceLabel: "urbanshop.rs/brands",
    website: "https://www.urbanshop.rs/",
    websiteLabel: "urbanshop.rs",
  },
  "n-sport": {
    brandCount: nSportMeta.brandCount,
    storeCount: nSportMeta.storeCount,
    lastSynced: syncedFromIso(nSportMeta.scrapedAt),
    sourceUrl: nSportMeta.brandsUrl,
    sourceLabel: "n-sport.net/brands",
    website: "https://www.n-sport.net/",
    websiteLabel: "n-sport.net",
  },
  "buzz-sneakers": {
    brandCount: buzzSneakersMeta.brandCount,
    storeCount: buzzSneakersMeta.storeCount,
    lastSynced: syncedFromIso(buzzSneakersMeta.scrapedAt),
    sourceUrl: buzzSneakersMeta.brandsUrl,
    sourceLabel: "buzzsneakers.rs",
    website: "https://www.buzzsneakers.rs/",
    websiteLabel: "buzzsneakers.rs",
  },
  "office-shoes": {
    brandCount: officeShoesMeta.brandCount,
    storeCount: officeShoesMeta.storeCount,
    lastSynced: syncedFromIso(officeShoesMeta.scrapedAt),
    sourceUrl: officeShoesMeta.brandsUrl,
    sourceLabel: "officeshoes.rs",
    website: "https://www.officeshoes.rs/",
    websiteLabel: "officeshoes.rs",
  },
  "sport-time": {
    brandCount: 1,
    storeCount: nikeSerbiaMeta.storeCount,
    lastSynced: syncedFromIso(nikeSerbiaMeta.scrapedAt),
    sourceUrl: nikeSerbiaMeta.directoryUrl,
    sourceLabel: "nike.com/rs",
    website: "https://www.nike.com/rs/",
    websiteLabel: "nike.com/rs",
  },
  "djak-sport": {
    brandCount: djakSportMeta.brandCount,
    storeCount: djakSportMeta.storeCount,
    lastSynced: syncedFromIso(djakSportMeta.scrapedAt),
    sourceUrl: djakSportMeta.brandsUrl,
    sourceLabel: "djaksport.com",
    website: "https://www.djaksport.com/",
    websiteLabel: "djaksport.com",
  },
  "sport-vision": {
    brandCount: sportVisionMeta.brandCount,
    storeCount: sportVisionMeta.storeCount,
    lastSynced: syncedFromIso(sportVisionMeta.scrapedAt),
    sourceUrl: sportVisionMeta.brandsUrl,
    sourceLabel: "sportvision.rs",
    website: "https://www.sportvision.rs/",
    websiteLabel: "sportvision.rs",
  },
  "planeta-sport": {
    brandCount: planetaSportMeta.brandCount,
    storeCount: planetaSportMeta.storeCount,
    lastSynced: syncedFromIso(planetaSportMeta.scrapedAt),
    sourceUrl: planetaSportMeta.brandsUrl,
    sourceLabel: "planetasport.rs",
    website: "https://planetasport.rs/",
    websiteLabel: "planetasport.rs",
  },
  inditex: {
    brandCount: 6,
    storeCount: scrapedFashion.stores.filter((s) => s.retailerSlug === "inditex").length,
    lastSynced: syncedFromIso(scrapedFashion.scrapedAt),
    sourceUrl: "https://www.zara.com/rs/",
    sourceLabel: "zara.com/rs",
    website: "https://www.zara.com/rs/",
    websiteLabel: "zara.com/rs",
  },
  lpp: {
    brandCount: 5,
    storeCount: scrapedFashion.stores.filter((s) => s.retailerSlug === "lpp").length,
    lastSynced: syncedFromIso(scrapedFashion.scrapedAt),
    sourceUrl: "https://www.reserved.com/rs/sr/storelocator",
    sourceLabel: "reserved.com/rs",
    website: "https://www.reserved.com/rs/sr/",
    websiteLabel: "reserved.com/rs",
  },
};

function withResolvedWebsite(
  slug: string,
  meta: RetailerCatalogMeta
): RetailerCatalogMeta {
  const { url, label } = resolveRetailerPublicWebsite(slug);
  const sourceUrl = isSerbiaMarketUrl(meta.sourceUrl)
    ? meta.sourceUrl
    : url.startsWith("http")
      ? url
      : meta.sourceUrl;

  return {
    ...meta,
    website: url.startsWith("http") ? url : meta.website,
    websiteLabel: label,
    sourceUrl,
    sourceLabel: label,
  };
}

export function getRetailerCatalogMeta(slug: string): RetailerCatalogMeta | null {
  const meta = CATALOG_META[slug];
  if (!meta) return null;
  const scraped = getScrapedBrandsForRetailer(slug);
  const brandCount = scraped?.length
    ? countModniScrapedBrands(slug, catalogBySlug)
    : meta.brandCount;
  return withResolvedWebsite(slug, { ...meta, brandCount });
}

export function getRetailerCatalogMetaSlugs(): string[] {
  return Object.keys(CATALOG_META).sort((a, b) => a.localeCompare(b, "sr"));
}
