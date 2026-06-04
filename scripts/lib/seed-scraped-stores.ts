import fs from "fs";
import path from "path";

export interface ScrapedStoreRow {
  brandSlug: string;
  name: string;
  address: string;
  city: string;
  shoppingCenterSlug?: string | null;
  retailerSlug: string;
}

export interface ScrapedBundle {
  file: string;
  stores: ScrapedStoreRow[];
}

const SCRAPED_FILES = [
  "fashion-sport-serbia-scraped.json",
  "tike-scraped.json",
  "buzz-sneakers-scraped.json",
  "office-shoes-scraped.json",
  "sport-vision-scraped.json",
  "planeta-sport-scraped.json",
  "djak-sport-scraped.json",
  "nike-serbia-scraped.json",
  "fast-fashion-serbia-scraped.json",
] as const;

function normalizeStoreRow(
  raw: Record<string, unknown>,
  defaultRetailer?: string
): ScrapedStoreRow | null {
  const retailerSlug =
    (typeof raw.retailerSlug === "string" && raw.retailerSlug) || defaultRetailer;
  const name = typeof raw.name === "string" ? raw.name : "";
  const address = typeof raw.address === "string" ? raw.address : "";
  const city = typeof raw.city === "string" ? raw.city : "";
  if (!retailerSlug || !name || !address || !city) return null;
  const brandSlug =
    (typeof raw.brandSlug === "string" && raw.brandSlug) || retailerSlug;
  return {
    brandSlug,
    name,
    address,
    city,
    shoppingCenterSlug:
      typeof raw.shoppingCenterSlug === "string" ? raw.shoppingCenterSlug : null,
    retailerSlug,
  };
}

export function loadScrapedBundles(dataDir: string): ScrapedBundle[] {
  const bundles: ScrapedBundle[] = [];
  for (const file of SCRAPED_FILES) {
    const full = path.join(dataDir, file);
    if (!fs.existsSync(full)) continue;
    const raw = JSON.parse(fs.readFileSync(full, "utf8")) as {
      stores?: Record<string, unknown>[];
      retailerSlug?: string;
    };
    if (!raw.stores?.length) continue;
    const stores = raw.stores
      .map((row) => normalizeStoreRow(row, raw.retailerSlug))
      .filter((s): s is ScrapedStoreRow => Boolean(s));
    if (!stores.length) continue;
    bundles.push({ file, stores });
  }
  return bundles;
}
