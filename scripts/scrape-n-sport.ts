/**
 * N Sport — brendovi i prodavnice
 * https://www.n-sport.net/brands/
 * https://www.n-sport.net/gde-kupiti.html
 * npm run scrape:nsport
 */

import fs from "fs";
import path from "path";
import { brands as staticBrands } from "../src/lib/data/brands";
import { bilbordSlugFromNSportBrand } from "../src/lib/data/n-sport-brand-slugs";
import { filterModniScrapedEntries } from "../src/lib/data/modni-retailer-brands";
import { normalizeScrapedDisplayText } from "../src/lib/format/display-text";

const BASE = "https://www.n-sport.net";
const OUT = path.join(process.cwd(), "src/lib/data/n-sport-scraped.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export interface NSportBrandScraped {
  nsSlug: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productUrl: string;
}

export interface NSportStoreScraped {
  path: string;
  name: string;
  address: string;
  city: string;
  citySlug: string;
  phone: string | null;
  email: string | null;
  shoppingCenterSlug: string | null;
  latitude: number | null;
  longitude: number | null;
  storeUrl: string;
}

export interface NSportScraped {
  scrapedAt: string;
  sourceUrl: string;
  brandsUrl: string;
  storesUrl: string;
  retailerSlug: string;
  retailerName: string;
  /** Bez opreme / rekvizita (Wilson, Spalding…) */
  modniBrandCount: number;
  brands: NSportBrandScraped[];
  stores: NSportStoreScraped[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/<br\s*\/?>/gi, ", ")
    .trim();
}

function detectMall(address: string): string | null {
  const a = address.toLowerCase();
  if (a.includes("delta city")) return "delta-city";
  if (a.includes("ušće") || a.includes("usce")) return "usce";
  if (a.includes("galerija")) return "galerija";
  if (a.includes(" big") || a.includes("tc big")) return "big-fashion";
  if (a.includes("promenada")) return "promenada";
  if (a.includes("rajićeva") || a.includes("rajiceva")) return "rajiceva";
  if (a.includes("stadion")) return "stadion";
  return null;
}

function parseBrands(html: string): NSportBrandScraped[] {
  const seenSlug = new Set<string>();
  const brands: NSportBrandScraped[] = [];

  const re =
    /<a class="brand-item" href="https:\/\/www\.n-sport\.net\/brands\/([^"]+)\.html">\s*<div class="brand-title">([^<]+)<\/div>/gi;

  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const nsSlug = m[1];
    const name = decodeHtml(m[2]);
    const slug = bilbordSlugFromNSportBrand(name);
    if (seenSlug.has(slug)) continue;
    seenSlug.add(slug);

    brands.push({
      nsSlug,
      name,
      slug,
      logoUrl: `${BASE}/UserFiles/brands/${encodeURIComponent(name.replace(/&/g, "&"))}.svg`,
      productUrl: `${BASE}/brands/${nsSlug}.html`,
    });
  }

  return brands.sort((a, b) => a.name.localeCompare(b.name, "sr"));
}

interface RawShop {
  shop_id: string;
  code: string;
  latitude: string;
  longitude: string;
  city_id: string;
  address: string;
  phone: string;
  email: string;
  name: string;
  enabled: string;
  type: string;
}

function parseStores(html: string): NSportStoreScraped[] {
  const match = html.match(/var\s+shops\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) throw new Error("shops JSON nije pronađen na gde-kupiti.html");

  const shops = JSON.parse(match[1]) as RawShop[];
  const stores: NSportStoreScraped[] = [];
  const seenPath = new Set<string>();

  for (const shop of shops) {
    if (shop.enabled !== "1" || shop.type !== "maloprodaja") continue;

    const city = shop.city_id?.trim() || "Srbija";
    const citySlug = slugify(city);
    const address = decodeHtml(shop.address).replace(/^[^,]+,\s*/, "");
    const path = slugify(`${shop.code}-${citySlug}-${address}`).slice(0, 80);
    if (seenPath.has(path)) continue;
    seenPath.add(path);

    const lat = parseFloat(shop.latitude);
    const lng = parseFloat(shop.longitude);
    const phone = shop.phone?.split("|")[0]?.trim() || null;

    stores.push({
      path,
      name: normalizeScrapedDisplayText(shop.name?.trim() || "N Sport"),
      address: address || decodeHtml(shop.address),
      city,
      citySlug,
      phone,
      email: shop.email?.trim() || null,
      shoppingCenterSlug: detectMall(decodeHtml(shop.address)),
      latitude: Number.isFinite(lat) ? lat : null,
      longitude: Number.isFinite(lng) ? lng : null,
      storeUrl: `${BASE}/gde-kupiti.html`,
    });
  }

  return stores.sort((a, b) =>
    a.city.localeCompare(b.city, "sr") || a.address.localeCompare(b.address, "sr")
  );
}

async function fetchHtml(url: string): Promise<string | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(30_000),
  });
  if (res.status !== 200) return null;
  return res.text();
}

async function main() {
  console.log("Učitavam /brands/…");
  const brandsHtml = await fetchHtml(`${BASE}/brands/`);
  if (!brandsHtml) throw new Error("Ne mogu učitati /brands/");

  const brands = parseBrands(brandsHtml);
  console.log(`  ${brands.length} brenda`);

  console.log("Učitavam /gde-kupiti.html…");
  const storesHtml = await fetchHtml(`${BASE}/gde-kupiti.html`);
  if (!storesHtml) throw new Error("Ne mogu učitati prodavnice");

  const stores = parseStores(storesHtml);
  console.log(`  ${stores.length} radnji`);

  const catalogBySlug = new Map(staticBrands.map((b) => [b.slug, b]));
  const modniBrandCount = filterModniScrapedEntries(
    brands.map((b) => ({
      slug: b.slug,
      name: b.name,
      logoUrl: b.logoUrl,
      productUrl: b.productUrl,
    })),
    "n-sport",
    catalogBySlug
  ).length;

  const payload: NSportScraped = {
    scrapedAt: new Date().toISOString(),
    sourceUrl: `${BASE}/brands/`,
    brandsUrl: `${BASE}/brands/`,
    storesUrl: `${BASE}/gde-kupiti.html`,
    retailerSlug: "n-sport",
    retailerName: "N Sport",
    modniBrandCount,
    brands,
    stores,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`\nSačuvano: ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
