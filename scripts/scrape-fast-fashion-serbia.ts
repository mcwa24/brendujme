/**
 * Fast fashion brendovi u Srbiji — LPP lokatori + ručno dopunjeni Inditex/H&M/Mango/New Yorker
 * npm run scrape:fashion
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const OUT = path.join(process.cwd(), "src/lib/data/fast-fashion-serbia-scraped.json");

const LPP_BRANDS = [
  { slug: "reserved", url: "https://www.reserved.com/rs/sr/storelocator", prefix: "RESERVED" },
  { slug: "sinsay", url: "https://www.sinsay.com/rs/sr/storelocator", prefix: "SINSAY" },
  { slug: "mohito", url: "https://www.mohito.com/rs/sr/storelocator", prefix: "MOHITO" },
  { slug: "cropp", url: "https://www.cropp.com/rs/sr/storelocator", prefix: "CROPP" },
  { slug: "house", url: "https://www.housebrand.com/rs/sr/storelocator", prefix: "HOUSE" },
] as const;

export interface FashionStoreScraped {
  brandSlug: string;
  name: string;
  address: string;
  city: string;
  citySlug: string;
  postalCode: string;
  shoppingCenterSlug: string | null;
  retailerSlug: string;
  latitude: number | null;
  longitude: number | null;
  storeUrl: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseZipCity(zipCity: string): { postalCode: string; city: string; citySlug: string } {
  const m = zipCity.match(/^(\d{5})\s+(.+)$/);
  if (!m) return { postalCode: "", city: zipCity, citySlug: slugify(zipCity) };
  const raw = m[2].replace(/^Beograd-/, "").replace(/^Novi Sad/i, "Novi Sad");
  const city = raw.includes("Beograd") ? "Beograd" : raw.split("-")[0]?.trim() || raw;
  return { postalCode: m[1], city, citySlug: slugify(city) };
}

const MALL_PATTERNS: { pattern: RegExp; slug: string }[] = [
  { pattern: /u[sš][cć]e/i, slug: "usce" },
  { pattern: /delta/i, slug: "delta-city" },
  { pattern: /promenada|novi sad/i, slug: "promenada" },
  { pattern: /galerija|bw|vilsona|beogradanka/i, slug: "galerija" },
  { pattern: /big fashion|big rakovica|višnjič|visnjick/i, slug: "big-fashion" },
  { pattern: /stadion|zaplanjska/i, slug: "stadion" },
  { pattern: /ada mall/i, slug: "galerija" },
  { pattern: /kragujevac/i, slug: "kragujevac-plaza" },
  { pattern: /niš|nis/i, slug: "delta-city" },
  { pattern: /zrenjanin/i, slug: "big-fashion" },
  { pattern: /subotica/i, slug: "promenada" },
];

function inferMall(name: string): string | null {
  for (const { pattern, slug } of MALL_PATTERNS) {
    if (pattern.test(name)) return slug;
  }
  return null;
}

async function acceptCookies(page: import("playwright").Page) {
  for (const label of ["Prihvati", "Prihvatam", "Slažem se", "Pročitao"]) {
    const btn = page.getByRole("button", { name: new RegExp(label, "i") }).first();
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.click().catch(() => {});
      await page.waitForTimeout(500);
      return;
    }
  }
}

async function scrapeLppStores(
  page: import("playwright").Page,
  brandSlug: string,
  prefix: string,
  url: string
): Promise<FashionStoreScraped[]> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForTimeout(3000);
  await acceptCookies(page);
  await page.waitForTimeout(4000);

  const lines = (await page.locator("body").innerText())
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const stores: FashionStoreScraped[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.toUpperCase().startsWith(prefix)) continue;
    if (/club|#|program|poslovi|novinar/i.test(line)) continue;

    const zipCity = lines[i + 1] ?? "";
    if (!/^\d{5}/.test(zipCity)) continue;

    const key = `${line}|${zipCity}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const { postalCode, city, citySlug } = parseZipCity(zipCity);
    const mall = inferMall(line);
    const address = line.replace(new RegExp(`^${prefix}\\s*`, "i"), "").trim() || line;

    stores.push({
      brandSlug,
      name: line,
      address,
      city,
      citySlug,
      postalCode,
      shoppingCenterSlug: mall,
      retailerSlug: "lpp",
      latitude: null,
      longitude: null,
      storeUrl: url,
    });
  }

  return stores;
}

/** Inditex, H&M, Mango, New Yorker — kurirano (TC sajtovi, planplus, zvanični lokatori) */
function curatedInditexAndOthers(): FashionStoreScraped[] {
  const inditex = "inditex";
  const entries: Omit<FashionStoreScraped, "brandSlug" | "latitude" | "longitude">[] = [
    // Zara
    { name: "Zara Ušće", address: "Bulevar Mihajla Pupina 4", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "usce", retailerSlug: inditex, storeUrl: "https://www.zara.com/rs/" },
    { name: "Zara Galerija", address: "Bulevar Vudroa Vilsona 12", city: "Beograd", citySlug: "beograd", postalCode: "11000", shoppingCenterSlug: "galerija", retailerSlug: inditex, storeUrl: "https://www.zara.com/rs/" },
    { name: "Zara BIG Fashion", address: "Višnjička 84", city: "Beograd", citySlug: "beograd", postalCode: "11000", shoppingCenterSlug: "big-fashion", retailerSlug: inditex, storeUrl: "https://www.zara.com/rs/" },
    { name: "Zara Promenada", address: "Sentandrejski put 11", city: "Novi Sad", citySlug: "novi-sad", postalCode: "21131", shoppingCenterSlug: "promenada", retailerSlug: inditex, storeUrl: "https://www.zara.com/rs/" },
    { name: "Zara Delta City", address: "Jurija Gagarina 16", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "delta-city", retailerSlug: inditex, storeUrl: "https://www.zara.com/rs/" },
    // Massimo Dutti
    { name: "Massimo Dutti Ušće", address: "Bulevar Mihajla Pupina 4", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "usce", retailerSlug: inditex, storeUrl: "https://www.massimodutti.com/rs/" },
    { name: "Massimo Dutti Galerija", address: "Bulevar Vudroa Vilsona 12", city: "Beograd", citySlug: "beograd", postalCode: "11000", shoppingCenterSlug: "galerija", retailerSlug: inditex, storeUrl: "https://www.massimodutti.com/rs/" },
    // Pull&Bear
    { name: "Pull&Bear Ušće", address: "Bulevar Mihajla Pupina 4", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "usce", retailerSlug: inditex, storeUrl: "https://www.pullandbear.com/rs/" },
    { name: "Pull&Bear BIG Fashion", address: "Višnjička 84", city: "Beograd", citySlug: "beograd", postalCode: "11000", shoppingCenterSlug: "big-fashion", retailerSlug: inditex, storeUrl: "https://www.pullandbear.com/rs/" },
    { name: "Pull&Bear Delta City", address: "Jurija Gagarina 16", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "delta-city", retailerSlug: inditex, storeUrl: "https://www.pullandbear.com/rs/" },
    { name: "Pull&Bear Promenada", address: "Sentandrejski put 11", city: "Novi Sad", citySlug: "novi-sad", postalCode: "21131", shoppingCenterSlug: "promenada", retailerSlug: inditex, storeUrl: "https://www.pullandbear.com/rs/" },
    // Bershka
    { name: "Bershka Ušće", address: "Bulevar Mihajla Pupina 4", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "usce", retailerSlug: inditex, storeUrl: "https://www.bershka.com/rs/" },
    { name: "Bershka BIG Fashion", address: "Višnjička 84", city: "Beograd", citySlug: "beograd", postalCode: "11000", shoppingCenterSlug: "big-fashion", retailerSlug: inditex, storeUrl: "https://www.bershka.com/rs/" },
    { name: "Bershka Delta City", address: "Jurija Gagarina 16", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "delta-city", retailerSlug: inditex, storeUrl: "https://www.bershka.com/rs/" },
    // Stradivarius
    { name: "Stradivarius Ušće", address: "Bulevar Mihajla Pupina 4", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "usce", retailerSlug: inditex, storeUrl: "https://www.stradivarius.com/rs/" },
    { name: "Stradivarius BIG Fashion", address: "Višnjička 84", city: "Beograd", citySlug: "beograd", postalCode: "11000", shoppingCenterSlug: "big-fashion", retailerSlug: inditex, storeUrl: "https://www.stradivarius.com/rs/" },
    { name: "Stradivarius Promenada", address: "Sentandrejski put 11", city: "Novi Sad", citySlug: "novi-sad", postalCode: "21131", shoppingCenterSlug: "promenada", retailerSlug: inditex, storeUrl: "https://www.stradivarius.com/rs/" },
    { name: "Stradivarius Delta City", address: "Jurija Gagarina 16", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "delta-city", retailerSlug: inditex, storeUrl: "https://www.stradivarius.com/rs/" },
    // Oysho
    { name: "Oysho Ušće", address: "Bulevar Mihajla Pupina 4", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "usce", retailerSlug: inditex, storeUrl: "https://www.oysho.com/rs/" },
    { name: "Oysho Galerija", address: "Bulevar Vudroa Vilsona 12", city: "Beograd", citySlug: "beograd", postalCode: "11000", shoppingCenterSlug: "galerija", retailerSlug: inditex, storeUrl: "https://www.oysho.com/rs/" },
    { name: "Oysho Promenada", address: "Sentandrejski put 11", city: "Novi Sad", citySlug: "novi-sad", postalCode: "21131", shoppingCenterSlug: "promenada", retailerSlug: inditex, storeUrl: "https://www.oysho.com/rs/" },
    // H&M
    { name: "H&M Delta City", address: "Jurija Gagarina 16", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "delta-city", retailerSlug: "h-and-m", storeUrl: "https://www.hm.com/rs_sr/" },
    { name: "H&M Galerija", address: "Bulevar Vudroa Vilsona 12", city: "Beograd", citySlug: "beograd", postalCode: "11000", shoppingCenterSlug: "galerija", retailerSlug: "h-and-m", storeUrl: "https://www.hm.com/rs_sr/" },
    { name: "H&M Promenada", address: "Sentandrejski put 11", city: "Novi Sad", citySlug: "novi-sad", postalCode: "21131", shoppingCenterSlug: "promenada", retailerSlug: "h-and-m", storeUrl: "https://www.hm.com/rs_sr/" },
    { name: "H&M Trg kralja Milana", address: "Trg kralja Milana 2", city: "Niš", citySlug: "nis", postalCode: "18000", shoppingCenterSlug: null, retailerSlug: "h-and-m", storeUrl: "https://www.hm.com/rs_sr/" },
    { name: "H&M Zrenjanin", address: "Bagljaš zapad 5", city: "Zrenjanin", citySlug: "zrenjanin", postalCode: "23000", shoppingCenterSlug: "big-fashion", retailerSlug: "h-and-m", storeUrl: "https://www.hm.com/rs_sr/" },
    { name: "H&M Subotica", address: "Segedinski put 88", city: "Subotica", citySlug: "subotica", postalCode: "24000", shoppingCenterSlug: null, retailerSlug: "h-and-m", storeUrl: "https://www.hm.com/rs_sr/" },
    { name: "H&M Pančevo", address: "Vojvode Stepe Stepanovića bb", city: "Pančevo", citySlug: "pancevo", postalCode: "26000", shoppingCenterSlug: null, retailerSlug: "h-and-m", storeUrl: "https://www.hm.com/rs_sr/" },
    // Mango
    { name: "Mango Galerija", address: "Bulevar Vudroa Vilsona 12", city: "Beograd", citySlug: "beograd", postalCode: "11000", shoppingCenterSlug: "galerija", retailerSlug: "mango-retail", storeUrl: "https://shop.mango.com/rs" },
    { name: "Mango Ušće", address: "Bulevar Mihajla Pupina 4", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "usce", retailerSlug: "mango-retail", storeUrl: "https://shop.mango.com/rs" },
    { name: "Mango Promenada", address: "Sentandrejski put 11", city: "Novi Sad", citySlug: "novi-sad", postalCode: "21131", shoppingCenterSlug: "promenada", retailerSlug: "mango-retail", storeUrl: "https://shop.mango.com/rs" },
    // New Yorker
    { name: "New Yorker Galerija", address: "Bulevar Vudroa Vilsona 14", city: "Beograd", citySlug: "beograd", postalCode: "11000", shoppingCenterSlug: "galerija", retailerSlug: "new-yorker", storeUrl: "https://www.newyorker.de/rs/" },
    { name: "New Yorker Ušće", address: "Bulevar Mihajla Pupina 4", city: "Beograd", citySlug: "beograd", postalCode: "11070", shoppingCenterSlug: "usce", retailerSlug: "new-yorker", storeUrl: "https://www.newyorker.de/rs/" },
    { name: "New Yorker Ruzveltova", address: "Ruzveltova 33", city: "Beograd", citySlug: "beograd", postalCode: "11120", shoppingCenterSlug: null, retailerSlug: "new-yorker", storeUrl: "https://www.newyorker.de/rs/" },
    { name: "New Yorker Belville", address: "Jurija Gagarina 16", city: "Beograd", citySlug: "beograd", postalCode: "11073", shoppingCenterSlug: "delta-city", retailerSlug: "new-yorker", storeUrl: "https://www.newyorker.de/rs/" },
    { name: "New Yorker Stadion", address: "Zaplanjska 32", city: "Beograd", citySlug: "beograd", postalCode: "11010", shoppingCenterSlug: "stadion", retailerSlug: "new-yorker", storeUrl: "https://www.newyorker.de/rs/" },
    { name: "New Yorker Rakovica", address: "Patrijarha Dimitrija 14", city: "Beograd", citySlug: "beograd", postalCode: "11090", shoppingCenterSlug: null, retailerSlug: "new-yorker", storeUrl: "https://www.newyorker.de/rs/" },
    { name: "New Yorker BIG Novi Sad", address: "Sentandrejski put 11", city: "Novi Sad", citySlug: "novi-sad", postalCode: "21131", shoppingCenterSlug: "promenada", retailerSlug: "new-yorker", storeUrl: "https://www.newyorker.de/rs/" },
    { name: "New Yorker Zrenjanin", address: "Bagljaš zapad 5", city: "Zrenjanin", citySlug: "zrenjanin", postalCode: "23000", shoppingCenterSlug: "big-fashion", retailerSlug: "new-yorker", storeUrl: "https://www.newyorker.de/rs/" },
  ];

  const brandMap: Record<string, string> = {
    Zara: "zara",
    "Massimo Dutti": "massimo-dutti",
    "Pull&Bear": "pull-and-bear",
    Bershka: "bershka",
    Stradivarius: "stradivarius",
    Oysho: "oysho",
    "H&M": "h-and-m",
    Mango: "mango",
    "New Yorker": "new-yorker",
  };

  return entries.map((e) => {
    const brandSlug =
      Object.entries(brandMap).find(([k]) => e.name.startsWith(k))?.[1] ?? "unknown";
    return { ...e, brandSlug, latitude: null as number | null, longitude: null };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const lppStores: FashionStoreScraped[] = [];

  for (const b of LPP_BRANDS) {
    console.log(`LPP ${b.slug}…`);
    const stores = await scrapeLppStores(page, b.slug, b.prefix, b.url);
    lppStores.push(...stores);
    console.log(`  ${stores.length} lokacija`);
  }

  await browser.close();

  if (lppStores.length === 0) {
    const fallbackPath = path.join(process.cwd(), "scripts/fast-fashion-lpp-fallback.json");
    if (fs.existsSync(fallbackPath)) {
      console.warn("  LPP lokatori prazni — koristim scripts/fast-fashion-lpp-fallback.json");
      const raw = JSON.parse(fs.readFileSync(fallbackPath, "utf8")) as Omit<
        FashionStoreScraped,
        "retailerSlug" | "latitude" | "longitude" | "storeUrl"
      >[];
      for (const s of raw) {
        lppStores.push({
          ...s,
          retailerSlug: "lpp",
          latitude: null,
          longitude: null,
          storeUrl: `https://www.${s.brandSlug === "house" ? "housebrand" : s.brandSlug}.com/rs/sr/storelocator`,
        });
      }
    }
  }

  const curated = curatedInditexAndOthers();
  const allStores = [...lppStores, ...curated];

  const brandSlugs = [
    "zara",
    "massimo-dutti",
    "pull-and-bear",
    "bershka",
    "stradivarius",
    "oysho",
    "reserved",
    "mohito",
    "sinsay",
    "cropp",
    "house",
    "h-and-m",
    "mango",
    "new-yorker",
  ];

  const payload = {
    scrapedAt: new Date().toISOString(),
    sourceNote:
      "LPP: zvanični store locator (reserved, sinsay, mohito, cropp, house). Inditex/H&M/Mango/New Yorker: TC i mediji.",
    brands: brandSlugs,
    stores: allStores,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`\nUkupno ${allStores.length} lokacija → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
