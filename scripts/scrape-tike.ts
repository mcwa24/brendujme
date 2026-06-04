/**
 * Tike.rs — brendovi i prodavnica
 * https://www.tike.rs/brendovi
 * https://www.tike.rs/radnje/1-tike
 * npm run scrape:tike
 */

import fs from "fs";
import path from "path";
import {
  bilbordSlugFromTikeBrand,
  displayNameFromTike,
} from "../src/lib/data/tike-brand-slugs";

const BASE = "https://www.tike.rs";
const OUT = path.join(process.cwd(), "src/lib/data/tike-scraped.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export interface TikeBrandScraped {
  tikeSlug: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productUrl: string;
}

export interface TikeStoreScraped {
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

export interface TikeScraped {
  scrapedAt: string;
  sourceUrl: string;
  brandsUrl: string;
  storesUrl: string;
  retailerSlug: string;
  retailerName: string;
  brands: TikeBrandScraped[];
  stores: TikeStoreScraped[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseBrands(html: string): TikeBrandScraped[] {
  const start = html.indexOf("nbtmp-brand-list");
  const chunk = html.slice(start >= 0 ? start : 0, (start >= 0 ? start : 0) + 200_000);
  const seen = new Set<string>();
  const brands: TikeBrandScraped[] = [];

  const re =
    /<a\s+href="https:\/\/www\.tike\.rs\/proizvodi\/([^"]+)"[^>]*title="([^"]+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/gi;

  let m: RegExpExecArray | null;
  while ((m = re.exec(chunk))) {
    const tikeSlug = m[1];
    if (seen.has(tikeSlug)) continue;
    seen.add(tikeSlug);

    const slug = bilbordSlugFromTikeBrand(tikeSlug, m[2]);
    if (!slug) continue;

    brands.push({
      tikeSlug,
      name: displayNameFromTike(m[2]),
      slug,
      logoUrl: m[3],
      productUrl: `${BASE}/proizvodi/${tikeSlug}`,
    });
  }

  return brands.sort((a, b) => a.name.localeCompare(b.name, "sr"));
}

function parseStoreDetail(html: string, storePath: string): TikeStoreScraped | null {
  const name =
    html.match(/data-title="([^"]+)"/)?.[1]?.trim() ??
    html.match(/<h1[^>]*>\s*([^<]+)/i)?.[1]?.trim() ??
    "Tike Shop";

  const geoBlock = html.match(
    /data-lat="([^"]+)"[\s\S]*?data-lng="([^"]+)"/i
  );
  const lat = parseFloat(geoBlock?.[1] ?? "");
  const lng = parseFloat(geoBlock?.[2] ?? "");

  const address =
    html.match(/bi-geo-alt[\s\S]*?<p[^>]*>\s*([^<]+)/i)?.[1]?.trim() ??
    html.match(/adresa:\s*<p>([^<]+)/i)?.[1]?.trim() ??
    "Kralja Petra 24";

  const city = address.includes("Beograd") ? "Beograd" : "Beograd";
  const phone =
    html.match(/href="tel:([^"]+)"/i)?.[1]?.replace(/\s/g, " ")?.trim() ??
    html.match(/bi-telephone[\s\S]*?<p[^>]*>\s*([^<]+)/i)?.[1]?.trim() ??
    null;
  const email =
    html.match(/mailto:([^"]+)/i)?.[1]?.trim() ??
    html.match(/bi-envelope[\s\S]*?<p[^>]*>\s*([^<]+)/i)?.[1]?.trim() ??
    null;

  const street = address.replace(/,?\s*\d{5}\s*Beograd/i, "").trim();

  return {
    path: storePath,
    name: name.includes("Tike") ? name : "Tike Shop",
    address: street || "Kralja Petra 24",
    city,
    citySlug: slugify(city),
    phone,
    email,
    shoppingCenterSlug: null,
    latitude: Number.isFinite(lat) ? lat : null,
    longitude: Number.isFinite(lng) ? lng : null,
    storeUrl: `${BASE}/radnje/${storePath}`,
  };
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
  console.log("Učitavam /brendovi…");
  const brandsHtml = await fetchHtml("brendovi");
  if (!brandsHtml) throw new Error("Ne mogu učitati /brendovi");

  const brands = parseBrands(brandsHtml);
  console.log(`  ${brands.length} brenda (mapirano u katalog)`);

  console.log("Učitavam /radnje/1-tike…");
  const storeHtml = await fetchHtml("radnje/1-tike");
  if (!storeHtml) throw new Error("Ne mogu učitati prodavnicu");

  const store = parseStoreDetail(storeHtml, "1-tike");
  if (!store) throw new Error("Parsiranje prodavnice nije uspelo");

  console.log(`  ✓ ${store.name} — ${store.address}, ${store.city}`);

  const payload: TikeScraped = {
    scrapedAt: new Date().toISOString(),
    sourceUrl: `${BASE}/brendovi`,
    brandsUrl: `${BASE}/brendovi`,
    storesUrl: `${BASE}/radnje/1-tike`,
    retailerSlug: "tike",
    retailerName: "Tike",
    brands,
    stores: [store],
  };

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`\nSačuvano: ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
