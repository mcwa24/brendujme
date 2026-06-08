/**
 * Urbanshop.rs — brendovi i prodavnice
 * https://www.urbanshop.rs/brands
 * https://www.urbanshop.rs/info/prodavnice-beograd-i-novi-sad
 * npm run scrape:urbanshop
 * Novi prodavac: vidi .cursor/rules/new-retailer.mdc
 */

import fs from "fs";
import path from "path";
import { bilbordSlugFromUrbanShopBrand } from "../src/lib/data/urban-shop-brand-slugs";

const BASE = "https://www.urbanshop.rs";
const OUT = path.join(process.cwd(), "src/lib/data/urban-shop-scraped.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export interface UrbanShopBrandScraped {
  urbanSlug: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productUrl: string;
}

export interface UrbanShopStoreScraped {
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

export interface UrbanShopScraped {
  scrapedAt: string;
  sourceUrl: string;
  brandsUrl: string;
  storesUrl: string;
  retailerSlug: string;
  retailerName: string;
  brands: UrbanShopBrandScraped[];
  stores: UrbanShopStoreScraped[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseBrands(html: string): UrbanShopBrandScraped[] {
  const logoByUrbanSlug = new Map<string, string>();
  for (const m of html.matchAll(
    /href="https:\/\/www\.urbanshop\.rs\/catalog\/brand\/([^"]+)"[^>]*title="([^"]+)"[\s\S]*?data-src="(https:\/\/c\.cdnmp\.net\/[^"]+)"/gi
  )) {
    logoByUrbanSlug.set(m[1], m[3]);
  }

  const seen = new Set<string>();
  const brands: UrbanShopBrandScraped[] = [];

  const re =
    /<li class="brand-letters__brand"><a href="\/catalog\/brand\/([^"]+)">([^<]+)<\/a><\/li>/gi;

  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const urbanSlug = m[1];
    const name = m[2].trim();
    if (seen.has(urbanSlug)) continue;
    seen.add(urbanSlug);

    brands.push({
      urbanSlug,
      name,
      slug: bilbordSlugFromUrbanShopBrand(name),
      logoUrl: logoByUrbanSlug.get(urbanSlug) ?? null,
      productUrl: `${BASE}/catalog/brand/${urbanSlug}`,
    });
  }

  return brands.sort((a, b) => a.name.localeCompare(b.name, "sr"));
}

function parseMapCoords(iframeSrc: string): { lat: number | null; lng: number | null } {
  const lat = parseFloat(iframeSrc.match(/!3d(-?\d+\.\d+)/)?.[1] ?? "");
  const lng = parseFloat(iframeSrc.match(/!2d(-?\d+\.\d+)/)?.[1] ?? "");
  return {
    latitude: Number.isFinite(lat) ? lat : null,
    longitude: Number.isFinite(lng) ? lng : null,
  };
}

function parseStores(html: string): UrbanShopStoreScraped[] {
  const stores: UrbanShopStoreScraped[] = [];
  const content = html.match(/page__static-content[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/)?.[0] ?? html;

  const beogradBlock = content.match(
    /Urban Shop - Beograd[\s\S]*?maps\/embed\?pb=([^"]+)"[\s\S]*?Makedonska 30 \/ Dečanska 5[\s\S]*?Tel\s*:\s*([^<\n]+)[\s\S]*?mailto:([^"]+)/i
  );
  if (beogradBlock) {
    const coords = parseMapCoords(`!${beogradBlock[1]}`);
    stores.push({
      path: "beograd-euro-centar",
      name: "Urban Shop Beograd",
      address: "Makedonska 30 / Dečanska 5, Euro Centar",
      city: "Beograd",
      citySlug: "beograd",
      phone: beogradBlock[2].trim(),
      email: beogradBlock[3].trim(),
      shoppingCenterSlug: null,
      latitude: coords.latitude,
      longitude: coords.longitude,
      storeUrl: `${BASE}/info/prodavnice-beograd-i-novi-sad`,
    });
  }

  const noviSadBlock = content.match(
    /Urban Shop - Novi Sad[\s\S]*?maps\/embed\?pb=([^"]+)"[\s\S]*?Pozorišni trg 4[\s\S]*?Tel\s*:\s*([^<\n]+)[\s\S]*?mailto:([^"]+)/i
  );
  if (noviSadBlock) {
    const coords = parseMapCoords(`!${noviSadBlock[1]}`);
    stores.push({
      path: "novi-sad-pozorisni-trg",
      name: "Urban Shop Novi Sad",
      address: "Pozorišni trg 4",
      city: "Novi Sad",
      citySlug: "novi-sad",
      phone: noviSadBlock[2].trim(),
      email: noviSadBlock[3].trim(),
      shoppingCenterSlug: null,
      latitude: coords.latitude,
      longitude: coords.longitude,
      storeUrl: `${BASE}/info/prodavnice-beograd-i-novi-sad`,
    });
  }

  return stores;
}

async function fetchHtml(urlPath: string): Promise<string | null> {
  const res = await fetch(`${BASE}/${urlPath}`, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(25_000),
  });
  if (res.status !== 200) return null;
  return res.text();
}

async function main() {
  console.log("Učitavam /brands…");
  const brandsHtml = await fetchHtml("brands");
  if (!brandsHtml) throw new Error("Ne mogu učitati /brands");

  const brands = parseBrands(brandsHtml);
  console.log(`  ${brands.length} brenda`);

  console.log("Učitavam prodavnice…");
  const storesHtml = await fetchHtml("info/prodavnice-beograd-i-novi-sad");
  if (!storesHtml) throw new Error("Ne mogu učitati stranicu prodavnica");

  const stores = parseStores(storesHtml);
  for (const store of stores) {
    console.log(`  ✓ ${store.name} — ${store.address}, ${store.city}`);
  }

  const payload: UrbanShopScraped = {
    scrapedAt: new Date().toISOString(),
    sourceUrl: `${BASE}/brands`,
    brandsUrl: `${BASE}/brands`,
    storesUrl: `${BASE}/info/prodavnice-beograd-i-novi-sad`,
    retailerSlug: "urban-shop",
    retailerName: "Urban Shop",
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
