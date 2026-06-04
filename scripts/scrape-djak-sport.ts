/**
 * Đak Sport — brendovi i lokacije u Srbiji
 * https://www.djaksport.com/brands
 * https://www.djaksport.com/lokacije
 * npm run scrape:djak
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import {
  bilbordSlugFromDjakBrand,
  displayNameFromDjak,
} from "../src/lib/data/djak-brand-slugs";

const BASE = "https://www.djaksport.com";
const OUT = path.join(process.cwd(), "src/lib/data/djak-sport-scraped.json");

const BRAND_PATH_EXCLUDE = new Set([
  "brands",
  "lokacije",
  "customer",
  "checkout",
  "wishlist",
  "loyalty",
  "status",
  "premium",
  "novo",
  "letnji-izbor",
  "muskarci",
  "zene",
  "deca",
  "oprema",
  "sport",
  "running-svet",
  "e-poklon-kartica",
  "catalog",
  "media",
  "static",
  "onama",
  "kontakt",
  "misija",
  "vrednosti",
  "karijera",
  "cesta-pitanja",
  "nacin-placanja",
  "isporuka",
  "zamena",
  "uputstvo-za-narucivanje",
  "popust-flajer",
  "sport-klub-kartica",
  "obavestenje-reklamacija",
  "obrasci-odredbe",
  "sigurnost-podataka",
  "sindikalna-prodaja",
  "radno-vreme-11-11",
  "smartweb",
  "graphql",
  "search",
  "privacy-policy-cookie-restriction-mode",
]);

/** Geo centri za Amasty locator (radius 500km) — pokriva celu Srbiju */
const GEO_CENTERS: [number, number][] = [
  [44.82, 20.46],
  [45.25, 19.84],
  [43.32, 21.9],
  [44.01, 20.9],
  [46.1, 19.67],
  [43.89, 20.35],
  [44.27, 19.36],
  [42.55, 21.9],
  [43.14, 22.59],
  [44.87, 20.33],
  [44.66, 20.93],
  [45.38, 20.38],
  [44.75, 19.69],
  [44.43, 19.22],
  [43.3, 20.81],
  [44.12, 21.09],
  [42.99, 22.08],
  [43.72, 20.69],
  [44.37, 20.82],
  [44.2, 21.55],
];

const MALL_PATTERNS: { pattern: RegExp; slug: string }[] = [
  { pattern: /u[sš][cć]e|arena.*beograd/i, slug: "usce" },
  { pattern: /delta|gagarina/i, slug: "delta-city" },
  { pattern: /galerija|vilsona|ada mall|bw\b/i, slug: "galerija" },
  { pattern: /raji[cć]eva|knez mihailova/i, slug: "rajiceva" },
  { pattern: /big fashion|tc big|big cee|big-novi|uralska|karaburma/i, slug: "big-fashion" },
  { pattern: /promenada|sentandrejski/i, slug: "promenada" },
  { pattern: /stadion|voždovac|vozdovac|zaplanjska/i, slug: "stadion" },
  { pattern: /merkator|mercator/i, slug: "mercator" },
  { pattern: /stop shop|zlatibor/i, slug: "zlatibor" },
  { pattern: /forum|obrenovi/i, slug: "mercator" },
  { pattern: /plaza|kragujevac.*big|krfska/i, slug: "kragujevac-plaza" },
  { pattern: /capitol/i, slug: "promenada" },
];

export interface DjakBrandScraped {
  djakSlug: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productUrl: string;
}

export interface DjakStoreScraped {
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
  storeUrl: string;
}

export interface DjakSportScraped {
  scrapedAt: string;
  sourceUrl: string;
  brandsUrl: string;
  storesUrl: string;
  retailerSlug: string;
  retailerName: string;
  brands: DjakBrandScraped[];
  stores: DjakStoreScraped[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cityFromLabel(city: string): { city: string; citySlug: string } {
  const c = city.trim();
  const slug = slugify(c);
  return { city: c, citySlug: slug || "srbija" };
}

function inferMallSlug(name: string, address: string): string | null {
  const hay = `${name} ${address}`;
  for (const { pattern, slug } of MALL_PATTERNS) {
    if (pattern.test(hay)) return slug;
  }
  return null;
}

function storePathFromUrl(storeUrl: string): string {
  try {
    const p = new URL(storeUrl).pathname;
    const m = p.match(/\/lokacije\/([^/]+)/i);
    return m ? decodeURIComponent(m[1]) : slugify(p);
  } catch {
    return slugify(storeUrl);
  }
}

async function scrapeBrands(page: import("playwright").Page): Promise<DjakBrandScraped[]> {
  await page.goto(`${BASE}/brands`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(3000);

  const raw = await page.evaluate((excludeList) => {
    const EXCLUDE = new Set(excludeList as string[]);
    const brands: {
      djakSlug: string;
      name: string;
      logoUrl: string | null;
      productUrl: string;
    }[] = [];

    document.querySelectorAll('a[href^="https://www.djaksport.com/"]').forEach((a) => {
      const href = (a as HTMLAnchorElement).href;
      let parts: string[];
      try {
        parts = new URL(href).pathname.replace(/^\/|\/$/g, "").split("/");
      } catch {
        return;
      }
      if (parts.length !== 1) return;
      const slug = parts[0];
      if (EXCLUDE.has(slug) || slug.includes(".")) return;
      const img = a.querySelector("img");
      const name = (
        a.getAttribute("title") ||
        a.textContent ||
        img?.getAttribute("alt") ||
        ""
      ).trim();
      if (!name || name.length > 80) return;
      brands.push({
        djakSlug: slug,
        name,
        logoUrl: img?.src ?? null,
        productUrl: href,
      });
    });

    const seen = new Set<string>();
    return brands.filter((b) => {
      if (seen.has(b.djakSlug)) return false;
      seen.add(b.djakSlug);
      return true;
    });
  }, [...BRAND_PATH_EXCLUDE]);

  const brands: DjakBrandScraped[] = [];
  for (const b of raw) {
    const slug = bilbordSlugFromDjakBrand(b.djakSlug, b.name);
    if (!slug) continue;
    brands.push({
      djakSlug: b.djakSlug,
      name: displayNameFromDjak(b.name),
      slug,
      logoUrl: b.logoUrl,
      productUrl: b.productUrl,
    });
  }

  brands.sort((a, b) => a.name.localeCompare(b.name, "sr"));
  return brands;
}

async function scrapeStores(page: import("playwright").Page): Promise<DjakStoreScraped[]> {
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(2000);
  await page.goto(`${BASE}/lokacije/`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForTimeout(8000);

  const browserFnSource = fs.readFileSync(
    path.join(process.cwd(), "scripts/djak-stores-eval.js"),
    "utf8"
  );
  // eslint-disable-next-line @typescript-eslint/no-implied-eval -- browser-only fn
  const browserFn = eval(browserFnSource) as (
    args: { centers: [number, number][]; ajaxUrl: string }
  ) => Promise<Record<string, unknown>[]>;
  const rawItems = (await page.evaluate(browserFn, {
    centers: GEO_CENTERS,
    ajaxUrl: `${BASE}/amlocator/index/ajax/`,
  })) as Record<string, unknown>[] | null;

  let items = Array.isArray(rawItems) ? rawItems : [];

  if (items.length === 0) {
    const fallbackPath = path.join(process.cwd(), "scripts/djak-stores-fallback.json");
    if (fs.existsSync(fallbackPath)) {
      console.warn(
        "  Playwright nije učitao lokacije (Cloudflare) — koristim scripts/djak-stores-fallback.json"
      );
      items = JSON.parse(fs.readFileSync(fallbackPath, "utf8")) as Record<
        string,
        unknown
      >[];
    } else {
      throw new Error(
        "Nije moguće učitati lokacije. Otvori /lokacije u browseru, izvozi fallback ili pokreni iz IDE browser sesije."
      );
    }
  }

  const stores: DjakStoreScraped[] = [];
  for (const it of items) {
    const name = String(it.name ?? "");
    const address = String(it.address ?? "");
    const cityLabel = String(it.city ?? "");
    const { city, citySlug } = cityFromLabel(cityLabel);
    const storeUrl = String(it.storeUrl ?? "");
    if (!name || !address) continue;

    stores.push({
      path: storePathFromUrl(storeUrl || name),
      name,
      address,
      postalCode: String(it.zip ?? ""),
      city,
      citySlug,
      phone: null,
      email: null,
      shoppingCenterSlug: inferMallSlug(name, address),
      latitude: it.lat != null ? Number(it.lat) : null,
      longitude: it.lng != null ? Number(it.lng) : null,
      storeUrl: storeUrl || `${BASE}/lokacije/`,
    });
  }

  stores.sort((a, b) => a.city.localeCompare(b.city, "sr") || a.name.localeCompare(b.name, "sr"));
  return stores;
}

async function main() {
  console.log("Đak Sport scrape (Playwright)…");

  const browser = await chromium.launch({
    channel: process.env.PW_CHROME_CHANNEL || "chromium",
    headless: process.env.PW_HEADED !== "1",
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    locale: "sr-Latn-RS",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    console.log("  brendovi…");
    const brands = await scrapeBrands(page);
    console.log(`    ${brands.length} brenda`);

    console.log("  lokacije…");
    const stores = await scrapeStores(page);
    console.log(`    ${stores.length} prodavnica`);

    const payload: DjakSportScraped = {
      scrapedAt: new Date().toISOString(),
      sourceUrl: `${BASE}/brands`,
      brandsUrl: `${BASE}/brands`,
      storesUrl: `${BASE}/lokacije`,
      retailerSlug: "djak-sport",
      retailerName: "Đak Sport",
      brands,
      stores,
    };

    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`Sačuvano: ${OUT}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
