import { buzzSneakersMeta } from "@/lib/data/buzz-sneakers";
import { fashionCompanyMeta } from "@/lib/data/fashion-company";
import { IMPORTED_RETAILER_EXTERNAL } from "@/lib/data/imported-retailers";
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
    storeCount: fashionCompanyMeta.storeCount,
    lastSynced: fashionCompanyMeta.lastSynced,
    sourceUrl: fashionCompanyMeta.brandsUrl,
    sourceLabel: "fashioncompany.rs",
    website: fashionCompanyMeta.website,
    websiteLabel: "fashioncompany.rs",
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
};

export function getRetailerCatalogMeta(slug: string): RetailerCatalogMeta | null {
  return CATALOG_META[slug] ?? null;
}
