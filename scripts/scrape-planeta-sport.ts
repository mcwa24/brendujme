/**
 * Planeta Sport — brendovi i lokali u Srbiji
 * https://planetasport.rs/brendovi/
 * https://planetasport.rs/lokali/
 * npm run scrape:planeta
 */

import fs from "fs";
import path from "path";
import {
  bilbordSlugFromPlanetaBrand,
  displayNameFromPlaneta,
} from "../src/lib/data/planeta-sport-brand-slugs";

const BASE = "https://planetasport.rs";
const OUT = path.join(process.cwd(), "src/lib/data/planeta-sport-scraped.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export interface PlanetaBrandScraped {
  psSlug: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productUrl: string;
}

export interface PlanetaStoreScraped {
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

export interface PlanetaSportScraped {
  scrapedAt: string;
  sourceUrl: string;
  brandsUrl: string;
  storesUrl: string;
  retailerSlug: string;
  retailerName: string;
  brands: PlanetaBrandScraped[];
  stores: PlanetaStoreScraped[];
}

const MALL_PATTERNS: { pattern: RegExp; slug: string }[] = [
  { pattern: /u[sš][cć]e/i, slug: "usce" },
  { pattern: /delta/i, slug: "delta-city" },
  { pattern: /promenada|ns-centar/i, slug: "promenada" },
  { pattern: /\bbw\b|galerija|vilsona|megastore/i, slug: "galerija" },
  { pattern: /ada mall|radnička 9/i, slug: "galerija" },
  { pattern: /big.*novi sad|big-novi|sentandrejski/i, slug: "promenada" },
  { pattern: /big.*kragujevac/i, slug: "kragujevac-plaza" },
  { pattern: /big.*(beograd|bg)|višnjič|visnjick/i, slug: "big-fashion" },
  { pattern: /raji[cć]eva/i, slug: "rajiceva" },
  { pattern: /stadion|voždovac|vozdovac/i, slug: "stadion" },
  { pattern: /merkator|mercator/i, slug: "mercator" },
  { pattern: /stop shop|zlatibor/i, slug: "zlatibor" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cityFromLabel(label: string): { city: string; citySlug: string } {
  const c = label.trim().replace(/^\s+/, "");
  if (!c) return { city: "Srbija", citySlug: "srbija" };
  return { city: c, citySlug: slugify(c) || "srbija" };
}

function inferMallSlug(name: string, address: string): string | null {
  const hay = `${name} ${address}`;
  for (const { pattern, slug } of MALL_PATTERNS) {
    if (pattern.test(hay)) return slug;
  }
  return null;
}

function parseBrands(html: string): PlanetaBrandScraped[] {
  const seen = new Set<string>();
  const brands: PlanetaBrandScraped[] = [];

  const linkRe = /href="https:\/\/planetasport\.rs\/brand\/([^"]+)"/g;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(html))) {
    const psSlug = m[1];
    if (seen.has(psSlug)) continue;
    seen.add(psSlug);

    const block = html.slice(m.index, m.index + 1200);
    const logo =
      block.match(/(?:src|data-src)="(https:\/\/planetasport\.rs\/media\/[^"]+)"/)?.[1] ??
      null;

    const slug = bilbordSlugFromPlanetaBrand(psSlug);
    brands.push({
      psSlug,
      name: displayNameFromPlaneta(psSlug),
      slug,
      logoUrl: logo,
      productUrl: `${BASE}/brand/${psSlug}`,
    });
  }

  return brands.sort((a, b) => a.name.localeCompare(b.name, "sr"));
}

function parseStores(html: string): PlanetaStoreScraped[] {
  const stores: PlanetaStoreScraped[] = [];
  const cityStarts: { city: string; idx: number }[] = [];

  const cityRe = /planeta-city-container" data-city="([^"]+)"/g;
  let cm: RegExpExecArray | null;
  while ((cm = cityRe.exec(html))) {
    cityStarts.push({ city: cm[1].trim(), idx: cm.index });
  }

  for (let i = 0; i < cityStarts.length; i++) {
    const chunk = html.slice(cityStarts[i].idx, cityStarts[i + 1]?.idx ?? html.length);
    const { city, citySlug } = cityFromLabel(cityStarts[i].city);

    const titleRe =
      /planeta-store--title" data-lat="([^"]+)" data-lng="([^"]+)" data-store="([^"]+)">\s*([^<]+?)\s*</g;
    let tm: RegExpExecArray | null;

    while ((tm = titleRe.exec(chunk))) {
      const storeId = tm[3];
      const streetTitle = tm[4].trim();
      const lat = parseFloat(tm[1]);
      const lng = parseFloat(tm[2]);

      const escapedId = storeId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const contentRe = new RegExp(
        `planeta-store--content ${escapedId}[^>]*>[\\s\\S]*?planeta-store--address">([^<]+)`
      );
      const addrMatch = contentRe.exec(chunk);
      const address = (addrMatch?.[1] ?? streetTitle).trim();

      const phoneSlice = chunk.slice(tm.index, tm.index + 2000);
      const phone =
        phoneSlice.match(/href="tel:([^"]+)"/)?.[1]?.replace(/\s/g, "") ?? null;

      const path = `${citySlug}-${storeId}-${slugify(address)}`.slice(0, 120);
      const name =
        address.length > 3 ? `Planeta Sport — ${address}` : `Planeta Sport ${city}`;

      stores.push({
        path,
        name,
        address,
        city,
        citySlug,
        phone,
        email: null,
        shoppingCenterSlug: inferMallSlug(name, address),
        latitude: Number.isFinite(lat) ? lat : null,
        longitude: Number.isFinite(lng) ? lng : null,
        storeUrl: `${BASE}/lokali/`,
      });
    }
  }

  return stores.sort(
    (a, b) => a.city.localeCompare(b.city, "sr") || a.address.localeCompare(b.address, "sr")
  );
}

async function fetchHtml(urlPath: string): Promise<string | null> {
  const res = await fetch(`${BASE}/${urlPath}`, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(30_000),
  });
  if (res.status !== 200) return null;
  return res.text();
}

async function main() {
  console.log("Učitavam /brendovi/…");
  const brandsHtml = await fetchHtml("brendovi/");
  if (!brandsHtml) throw new Error("Ne mogu učitati /brendovi/");

  const brands = parseBrands(brandsHtml);
  console.log(`  ${brands.length} brenda`);

  console.log("Učitavam /lokali/…");
  const storesHtml = await fetchHtml("lokali/");
  if (!storesHtml) throw new Error("Ne mogu učitati /lokali/");

  const stores = parseStores(storesHtml);
  console.log(`  ${stores.length} lokala`);

  for (const store of stores.slice(0, 5)) {
    console.log(`  ✓ ${store.name} — ${store.city}`);
  }
  if (stores.length > 5) console.log(`  … i još ${stores.length - 5}`);

  const payload: PlanetaSportScraped = {
    scrapedAt: new Date().toISOString(),
    sourceUrl: `${BASE}/brendovi/`,
    brandsUrl: `${BASE}/brendovi/`,
    storesUrl: `${BASE}/lokali/`,
    retailerSlug: "planeta-sport",
    retailerName: "Planeta Sport",
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
