import { buzzSneakersMeta } from "@/lib/data/buzz-sneakers";
import { tikeMeta } from "@/lib/data/tike";
import { fashionCompanyMeta } from "@/lib/data/fashion-company";
import { fashionAndFriendsMeta } from "@/lib/data/fashion-and-friends";
import { IMPORTED_RETAILER_EXTERNAL } from "@/lib/data/imported-retailers";
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

const CATALOG_META: Record<string, RetailerCatalogMeta> = {
  "fashion-company": {
    brandCount: fashionCompanyMeta.brandCount,
    storeCount: scrapedFs.stores.filter((s) => s.retailerSlug === "fashion-company").length,
    lastSynced: syncedFromIso(scrapedFs.scrapedAt),
    sourceUrl: fashionCompanyMeta.brandsUrl,
    sourceLabel: "fashioncompany.rs",
    website: fashionCompanyMeta.website,
    websiteLabel: "fashioncompany.rs",
  },
  "fashion-friends": {
    brandCount: fashionAndFriendsMeta.brandCount,
    storeCount: scrapedFs.stores.filter((s) => s.retailerSlug === "fashion-friends").length,
    lastSynced: syncedFromIso(scrapedFs.scrapedAt),
    sourceUrl: "https://www.fashionandfriends.com/rs/brendovi/",
    sourceLabel: "fashionandfriends.com",
    website: IMPORTED_RETAILER_EXTERNAL["fashion-friends"].website,
    websiteLabel: IMPORTED_RETAILER_EXTERNAL["fashion-friends"].websiteLabel,
  },
  tike: {
    brandCount: tikeMeta.brandCount,
    storeCount: tikeMeta.storeCount,
    lastSynced: syncedFromIso(tikeMeta.scrapedAt),
    sourceUrl: tikeMeta.brandsUrl,
    sourceLabel: "tike.rs/brendovi",
    website: IMPORTED_RETAILER_EXTERNAL.tike.website,
    websiteLabel: IMPORTED_RETAILER_EXTERNAL.tike.websiteLabel,
  },
  "buzz-sneakers": {
    brandCount: buzzSneakersMeta.brandCount,
    storeCount: buzzSneakersMeta.storeCount,
    lastSynced: syncedFromIso(buzzSneakersMeta.scrapedAt),
    sourceUrl: buzzSneakersMeta.brandsUrl,
    sourceLabel: "buzzsneakers.rs",
    website: IMPORTED_RETAILER_EXTERNAL["buzz-sneakers"].website,
    websiteLabel: IMPORTED_RETAILER_EXTERNAL["buzz-sneakers"].websiteLabel,
  },
  "office-shoes": {
    brandCount: officeShoesMeta.brandCount,
    storeCount: officeShoesMeta.storeCount,
    lastSynced: syncedFromIso(officeShoesMeta.scrapedAt),
    sourceUrl: officeShoesMeta.brandsUrl,
    sourceLabel: "officeshoes.rs",
    website: IMPORTED_RETAILER_EXTERNAL["office-shoes"].website,
    websiteLabel: IMPORTED_RETAILER_EXTERNAL["office-shoes"].websiteLabel,
  },
  "sport-time": {
    brandCount: 1,
    storeCount: nikeSerbiaMeta.storeCount,
    lastSynced: syncedFromIso(nikeSerbiaMeta.scrapedAt),
    sourceUrl: nikeSerbiaMeta.directoryUrl,
    sourceLabel: "nike.com",
    website: IMPORTED_RETAILER_EXTERNAL["sport-time"].website,
    websiteLabel: IMPORTED_RETAILER_EXTERNAL["sport-time"].websiteLabel,
  },
  "djak-sport": {
    brandCount: djakSportMeta.brandCount,
    storeCount: djakSportMeta.storeCount,
    lastSynced: syncedFromIso(djakSportMeta.scrapedAt),
    sourceUrl: djakSportMeta.brandsUrl,
    sourceLabel: "djaksport.com",
    website: IMPORTED_RETAILER_EXTERNAL["djak-sport"].website,
    websiteLabel: IMPORTED_RETAILER_EXTERNAL["djak-sport"].websiteLabel,
  },
  "sport-vision": {
    brandCount: sportVisionMeta.brandCount,
    storeCount: sportVisionMeta.storeCount,
    lastSynced: syncedFromIso(sportVisionMeta.scrapedAt),
    sourceUrl: sportVisionMeta.brandsUrl,
    sourceLabel: "sportvision.rs",
    website: IMPORTED_RETAILER_EXTERNAL["sport-vision"].website,
    websiteLabel: IMPORTED_RETAILER_EXTERNAL["sport-vision"].websiteLabel,
  },
  "planeta-sport": {
    brandCount: planetaSportMeta.brandCount,
    storeCount: planetaSportMeta.storeCount,
    lastSynced: syncedFromIso(planetaSportMeta.scrapedAt),
    sourceUrl: planetaSportMeta.brandsUrl,
    sourceLabel: "planetasport.rs",
    website: IMPORTED_RETAILER_EXTERNAL["planeta-sport"].website,
    websiteLabel: IMPORTED_RETAILER_EXTERNAL["planeta-sport"].websiteLabel,
  },
  inditex: {
    brandCount: 6,
    storeCount: scrapedFashion.stores.filter((s) => s.retailerSlug === "inditex").length,
    lastSynced: syncedFromIso(scrapedFashion.scrapedAt),
    sourceUrl: "https://www.zara.com/rs/",
    sourceLabel: "inditex.com",
    website: IMPORTED_RETAILER_EXTERNAL.inditex.website,
    websiteLabel: IMPORTED_RETAILER_EXTERNAL.inditex.websiteLabel,
  },
  lpp: {
    brandCount: 5,
    storeCount: scrapedFashion.stores.filter((s) => s.retailerSlug === "lpp").length,
    lastSynced: syncedFromIso(scrapedFashion.scrapedAt),
    sourceUrl: "https://www.reserved.com/rs/sr/storelocator",
    sourceLabel: "lpp.com",
    website: IMPORTED_RETAILER_EXTERNAL.lpp.website,
    websiteLabel: IMPORTED_RETAILER_EXTERNAL.lpp.websiteLabel,
  },
};

export function getRetailerCatalogMeta(slug: string): RetailerCatalogMeta | null {
  return CATALOG_META[slug] ?? null;
}
