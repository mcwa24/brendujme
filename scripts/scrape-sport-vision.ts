/**
 * Sport Vision — brendovi i radnje u Srbiji
 * https://www.sportvision.rs/brendovi
 * https://www.sportvision.rs/radnje
 * npm run scrape:sport-vision
 */

import fs from "fs";
import path from "path";
import {
  bilbordSlugFromSportVisionBrand,
  displayNameFromSportVision,
} from "../src/lib/data/sport-vision-brand-slugs";

const BASE = "https://www.sportvision.rs";
const OUT = path.join(process.cwd(), "src/lib/data/sport-vision-scraped.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export interface SportVisionBrandScraped {
  svSlug: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productUrl: string;
}

export interface SportVisionStoreScraped {
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

export interface SportVisionScraped {
  scrapedAt: string;
  sourceUrl: string;
  brandsUrl: string;
  storesUrl: string;
  retailerSlug: string;
  retailerName: string;
  brands: SportVisionBrandScraped[];
  stores: SportVisionStoreScraped[];
}

const MALL_PATTERNS: { pattern: RegExp; slug: string }[] = [
  { pattern: /u[sš][cć]e/i, slug: "usce" },
  { pattern: /delta/i, slug: "delta-city" },
  { pattern: /promenada|ns-centar/i, slug: "promenada" },
  { pattern: /\bbw\b|galerija|vilsona|megastore/i, slug: "galerija" },
  { pattern: /ada mall/i, slug: "galerija" },
  { pattern: /big.*novi sad|big-novi|sentandrejski/i, slug: "promenada" },
  { pattern: /big.*kragujevac|kragujevac/i, slug: "kragujevac-plaza" },
  { pattern: /big.*(bg|beograd)|višnjič|visnjick/i, slug: "big-fashion" },
  { pattern: /big.*sabac|big.*čačak|big-cacak|zrenjanin/i, slug: "big-fashion" },
  { pattern: /raji[cć]eva/i, slug: "rajiceva" },
  { pattern: /stadion|voždovac|vozdovac/i, slug: "stadion" },
  { pattern: /merkator|mercator/i, slug: "mercator" },
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
  const l = label.toLowerCase();
  if (l.includes("beograd")) return { city: "Beograd", citySlug: "beograd" };
  if (l.includes("novi sad")) return { city: "Novi Sad", citySlug: "novi-sad" };
  if (l.includes("niš") || l === "nis") return { city: "Niš", citySlug: "nis" };
  if (l.includes("kragujevac")) return { city: "Kragujevac", citySlug: "kragujevac" };
  if (l.includes("subotica")) return { city: "Subotica", citySlug: "subotica" };
  if (l.includes("zrenjanin")) return { city: "Zrenjanin", citySlug: "zrenjanin" };
  if (l.includes("šabac") || l.includes("sabac")) return { city: "Šabac", citySlug: "sabac" };
  if (l.includes("užice") || l.includes("uzice")) return { city: "Užice", citySlug: "uzice" };
  if (l.includes("leskovac")) return { city: "Leskovac", citySlug: "leskovac" };
  if (l.includes("čačak") || l.includes("cacak")) return { city: "Čačak", citySlug: "cacak" };
  if (l.includes("kraljevo")) return { city: "Kraljevo", citySlug: "kraljevo" };
  if (l.includes("kruševac") || l.includes("krusevac"))
    return { city: "Kruševac", citySlug: "krusevac" };
  if (l.includes("novi pazar")) return { city: "Novi Pazar", citySlug: "novi-pazar" };
  if (l.includes("pančevo") || l.includes("pancevo"))
    return { city: "Pančevo", citySlug: "pancevo" };
  if (l.includes("valjevo")) return { city: "Valjevo", citySlug: "valjevo" };
  if (l.includes("sombor")) return { city: "Sombor", citySlug: "sombor" };
  if (l.includes("vranje")) return { city: "Vranje", citySlug: "vranje" };
  if (l.includes("pirot")) return { city: "Pirot", citySlug: "pirot" };
  if (l.includes("bor")) return { city: "Bor", citySlug: "bor" };

  return { city: label.trim(), citySlug: slugify(label) };
}

function inferMallSlug(name: string, path: string): string | null {
  const hay = `${name} ${path}`;
  for (const { pattern, slug } of MALL_PATTERNS) {
    if (pattern.test(hay)) return slug;
  }
  return null;
}

function parseBrands(html: string): SportVisionBrandScraped[] {
  const start = html.indexOf("brands-static");
  const chunk = html.slice(start, start + 150_000);
  const seen = new Set<string>();
  const brands: SportVisionBrandScraped[] = [];

  const re =
    /<a\s+href="https:\/\/www\.sportvision\.rs\/proizvodi\/([^"]+)"[^>]*title="([^"]+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/gi;

  let m: RegExpExecArray | null;
  while ((m = re.exec(chunk))) {
    const svSlug = m[1];
    if (seen.has(svSlug)) continue;
    seen.add(svSlug);

    const slug = bilbordSlugFromSportVisionBrand(svSlug, m[2]);
    if (!slug) continue;

    brands.push({
      svSlug,
      name: displayNameFromSportVision(m[2]),
      slug,
      logoUrl: m[3],
      productUrl: `${BASE}/proizvodi/${svSlug}`,
    });
  }

  return brands.sort((a, b) => a.name.localeCompare(b.name, "sr"));
}

interface SvStoreJson {
  id: string;
  name?: string;
  publicName?: string;
  street?: string;
  cityName?: string | null;
  phone?: string;
  phoneContactPersonsTakeConsignment?: string;
  email?: string;
  coordinatesGoogleMap?: string;
  f_permalink?: string;
  permalink?: string;
  forMap?: string;
  status?: string;
}

function parseStoresFromJson(raw: { stores?: SvStoreJson[] }): SportVisionStoreScraped[] {
  const stores: SportVisionStoreScraped[] = [];

  for (const row of raw.stores ?? []) {
    if (row.forMap !== "1" || row.status !== "1") continue;

    const name = (row.publicName || row.name || "").trim();
    if (!name || name.length < 2) continue;

    const permalink = row.f_permalink || row.permalink || "";
    const pathMatch = permalink.match(/\/radnje\/([^/?#]+)/);
    const storePath = pathMatch?.[1] ?? `${row.id}-sport-vision-${slugify(name)}`;

    const cityLabel = (row.cityName || "").trim() || "Beograd";
    const { city, citySlug } = cityFromLabel(cityLabel);

    const coords = (row.coordinatesGoogleMap || "").split(",").map((s) => parseFloat(s.trim()));
    const lat = coords[0];
    const lng = coords[1];

    const phone =
      (row.phone || "").trim() ||
      (row.phoneContactPersonsTakeConsignment || "").trim() ||
      null;

    stores.push({
      path: storePath,
      name,
      address: (row.street || "").trim(),
      city,
      citySlug,
      phone,
      email: (row.email || "").trim() || null,
      shoppingCenterSlug: inferMallSlug(name, storePath),
      latitude: Number.isFinite(lat) ? lat : null,
      longitude: Number.isFinite(lng) ? lng : null,
      storeUrl: permalink.startsWith("http")
        ? permalink
        : `${BASE}/radnje/${storePath}`,
    });
  }

  return stores.sort((a, b) => a.city.localeCompare(b.city, "sr") || a.name.localeCompare(b.name, "sr"));
}

async function fetchText(urlPath: string): Promise<string | null> {
  const res = await fetch(`${BASE}/${urlPath}`, {
    headers: { "User-Agent": UA, Accept: "text/html,application/json" },
    signal: AbortSignal.timeout(25_000),
  });
  if (res.status !== 200) return null;
  return res.text();
}

async function main() {
  console.log("Učitavam /brendovi…");
  const brandsHtml = await fetchText("brendovi");
  if (!brandsHtml) throw new Error("Ne mogu učitati /brendovi");

  const brands = parseBrands(brandsHtml);
  console.log(`  ${brands.length} brenda`);

  console.log("Učitavam /radnje?type=json…");
  const storesJsonText = await fetchText("radnje?type=json&ver=1");
  if (!storesJsonText) throw new Error("Ne mogu učitati JSON radnji");

  const storesRaw = JSON.parse(storesJsonText) as { stores?: SvStoreJson[] };
  const stores = parseStoresFromJson(storesRaw);
  console.log(`  ${stores.length} radnji`);

  for (const store of stores) {
    console.log(`  ✓ ${store.name} — ${store.address}, ${store.city}`);
  }

  const payload: SportVisionScraped = {
    scrapedAt: new Date().toISOString(),
    sourceUrl: `${BASE}/brendovi`,
    brandsUrl: `${BASE}/brendovi`,
    storesUrl: `${BASE}/radnje`,
    retailerSlug: "sport-vision",
    retailerName: "Sport Vision",
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
