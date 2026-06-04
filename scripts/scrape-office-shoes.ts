/**
 * Skida brendove i prodavnice sa officeshoes.rs
 * npm run scrape:office
 * → src/lib/data/office-shoes-scraped.json
 */

import fs from "fs";
import path from "path";
import { bilbordSlugFromOfficeBrand } from "../src/lib/data/office-brand-slugs";

const BASE = "https://www.officeshoes.rs";
const OUT = path.join(process.cwd(), "src/lib/data/office-shoes-scraped.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export interface OfficeBrandScraped {
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface OfficeStoreScraped {
  path: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  citySlug: string;
  phone: string | null;
  email: string | null;
  shoppingCenterSlug: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface OfficeShoesScraped {
  scrapedAt: string;
  sourceUrl: string;
  brands: OfficeBrandScraped[];
  stores: OfficeStoreScraped[];
}

const MALL_PATTERNS: { pattern: RegExp; slug: string }[] = [
  { pattern: /u[sš][cć]e/i, slug: "usce" },
  { pattern: /delta city/i, slug: "delta-city" },
  { pattern: /delta planet/i, slug: "delta-city" },
  { pattern: /galerija/i, slug: "galerija" },
  { pattern: /big fashion|big-fashion/i, slug: "big-fashion" },
  { pattern: /big shopping/i, slug: "big-fashion" },
  { pattern: /stadion/i, slug: "stadion" },
  { pattern: /mercator/i, slug: "mercator" },
  { pattern: /stop shop/i, slug: "zlatibor" },
  { pattern: /tc big|tc-big|tc bi[gG]/i, slug: "promenada" },
  { pattern: /ada mall/i, slug: "galerija" },
  { pattern: /immo outlet/i, slug: "big-fashion" },
];

function cityFromPostal(postal: string, title: string): { city: string; citySlug: string } {
  const prefix = postal.slice(0, 2);
  const map: Record<string, { city: string; citySlug: string }> = {
    "11": { city: "Beograd", citySlug: "beograd" },
    "21": { city: "Novi Sad", citySlug: "novi-sad" },
    "18": { city: "Niš", citySlug: "nis" },
    "34": { city: "Kragujevac", citySlug: "kragujevac" },
    "24": { city: "Subotica", citySlug: "subotica" },
    "15": { city: "Šabac", citySlug: "sabac" },
  };
  if (map[prefix]) return map[prefix];

  if (/kragujevac/i.test(title))
    return { city: "Kragujevac", citySlug: "kragujevac" };
  if (/novi sad|trg slobode/i.test(title))
    return { city: "Novi Sad", citySlug: "novi-sad" };
  if (/ni[sš]|obrenovi/i.test(title)) return { city: "Niš", citySlug: "nis" };

  return { city: "Beograd", citySlug: "beograd" };
}

function inferMallSlug(title: string): string | null {
  for (const { pattern, slug } of MALL_PATTERNS) {
    if (pattern.test(title)) return slug;
  }
  return null;
}

function parseBrands(html: string): OfficeBrandScraped[] {
  const names = new Set<string>();
  for (const m of html.matchAll(/rel="brand:([^"]+);"/g)) {
    names.add(m[1].trim());
  }

  const logoByName = new Map<string, string>();
  for (const m of html.matchAll(
    /src="(https:\/\/cdn\.officeshoes\.ws\/product_images\/brandlogos\/[^"]+)"/g
  )) {
    const url = m[1];
    const file = decodeURIComponent(url.split("/").pop() ?? "");
    const baseName = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");
    logoByName.set(baseName.toLowerCase(), url);
  }

  function findLogo(brandName: string): string | null {
    const key = brandName.toLowerCase();
    if (logoByName.has(key)) return logoByName.get(key)!;
    for (const [k, v] of logoByName) {
      if (k === key || k.replace(/\s+/g, "") === key.replace(/\s+/g, "")) return v;
    }
    return null;
  }

  return [...names]
    .sort((a, b) => a.localeCompare(b, "sr"))
    .map((name) => ({
      name,
      slug: bilbordSlugFromOfficeBrand(name),
      logoUrl: findLogo(name),
    }));
}

function parseStorePaths(html: string): string[] {
  return [
    ...new Set(
      [...html.matchAll(/href="\/(prodavnica_obuce[^"]+)"/g)].map((m) => m[1])
    ),
  ];
}

function parseStoreDetail(html: string, storePath: string): OfficeStoreScraped | null {
  const name = html.match(/<h1 itemprop="name">([^<]+)/)?.[1]?.trim();
  const addressLocality =
    html.match(/<span itemprop="addressLocality">([^<]+)/)?.[1]?.trim() ?? "";
  const postalCode =
    html.match(/<span itemprop="postalCode">([^<]+)/)?.[1]?.trim() ?? "";
  if (!name) return null;

  const phone =
    html.match(/itemprop="telephone">\s*([^<]+)/)?.[1]?.trim() ?? null;
  const email =
    html.match(/itemprop="email" href="mailto:([^"]+)"/)?.[1]?.trim() ?? null;

  const { city, citySlug } = cityFromPostal(postalCode, name);
  const mall = inferMallSlug(name);

  let lat: number | null = null;
  let lng: number | null = null;
  const embed = html.match(/google\.com\/maps\/embed\?pb=[^"]+/)?.[0];
  if (embed) {
    const latM = embed.match(/!3d(-?\d+\.\d+)/);
    const lngM = embed.match(/!2d(-?\d+\.\d+)/);
    if (latM) lat = parseFloat(latM[1]);
    if (lngM) lng = parseFloat(lngM[1]);
  }

  return {
    path: storePath,
    name,
    address: addressLocality,
    postalCode,
    city,
    citySlug,
    phone,
    email,
    shoppingCenterSlug: mall,
    latitude: lat,
    longitude: lng,
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
  console.log("Učitavam /brands…");
  const brandsHtml = await fetchHtml("brands");
  if (!brandsHtml) throw new Error("Ne mogu učitati /brands");

  const brands = parseBrands(brandsHtml);
  console.log(`  ${brands.length} brendova`);

  console.log("Učitavam /prodavnice…");
  const storesHtml = await fetchHtml("prodavnice");
  if (!storesHtml) throw new Error("Ne mogu učitati /prodavnice");

  const paths = parseStorePaths(storesHtml);
  console.log(`  ${paths.length} prodavnica`);

  const stores: OfficeStoreScraped[] = [];
  for (const storePath of paths) {
    const html = await fetchHtml(storePath);
    if (!html) {
      console.warn(`  ✗ ${storePath}`);
      continue;
    }
    const store = parseStoreDetail(html, storePath);
    if (store) {
      stores.push(store);
      console.log(`  ✓ ${store.name}`);
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  const payload: OfficeShoesScraped = {
    scrapedAt: new Date().toISOString(),
    sourceUrl: `${BASE}/brands`,
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
