/**
 * Buzz Sneakers — brendovi i radnje u Srbiji
 * https://www.buzzsneakers.rs/brendovi
 * https://www.buzzsneakers.rs/radnje
 * npm run scrape:buzz
 */

import fs from "fs";
import path from "path";
import {
  bilbordSlugFromBuzzBrand,
  displayNameFromBuzz,
} from "../src/lib/data/buzz-brand-slugs";

const BASE = "https://www.buzzsneakers.rs";
const OUT = path.join(process.cwd(), "src/lib/data/buzz-sneakers-scraped.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export interface BuzzBrandScraped {
  buzzSlug: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productUrl: string;
}

export interface BuzzStoreScraped {
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

export interface BuzzSneakersScraped {
  scrapedAt: string;
  sourceUrl: string;
  brandsUrl: string;
  storesUrl: string;
  retailerSlug: string;
  retailerName: string;
  brands: BuzzBrandScraped[];
  stores: BuzzStoreScraped[];
}

const MALL_PATTERNS: { pattern: RegExp; slug: string }[] = [
  { pattern: /u[sš][cć]e/i, slug: "usce" },
  { pattern: /delta/i, slug: "delta-city" },
  { pattern: /promenada|ns-centar/i, slug: "promenada" },
  { pattern: /\bbw\b|galerija|vilsona/i, slug: "galerija" },
  { pattern: /ada mall/i, slug: "galerija" },
  { pattern: /big.*novi sad|big-novi|sentandrejski/i, slug: "promenada" },
  { pattern: /big.*kragujevac|kragujevac/i, slug: "kragujevac-plaza" },
  { pattern: /big.*(bg|beograd)|višnjič/i, slug: "big-fashion" },
  { pattern: /big.*sabac|big.*čačak|big-cacak/i, slug: "big-fashion" },
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
  if (l.includes("inđija") || l.includes("indjija"))
    return { city: "Inđija", citySlug: "indjija" };

  return { city: label.trim(), citySlug: slugify(label) };
}

function inferMallSlug(name: string, path: string): string | null {
  const hay = `${name} ${path}`;
  for (const { pattern, slug } of MALL_PATTERNS) {
    if (pattern.test(hay)) return slug;
  }
  return null;
}

function parseBrands(html: string): BuzzBrandScraped[] {
  const start = html.indexOf("brands-static");
  const chunk = html.slice(start, start + 120_000);
  const seen = new Set<string>();
  const brands: BuzzBrandScraped[] = [];

  const re =
    /<a\s+href="https:\/\/www\.buzzsneakers\.rs\/proizvodi\/([^"]+)"[^>]*title="([^"]+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/gi;

  let m: RegExpExecArray | null;
  while ((m = re.exec(chunk))) {
    const buzzSlug = m[1];
    if (seen.has(buzzSlug)) continue;
    seen.add(buzzSlug);

    const slug = bilbordSlugFromBuzzBrand(buzzSlug, m[2]);
    if (!slug) continue;

    brands.push({
      buzzSlug,
      name: displayNameFromBuzz(m[2]),
      slug,
      logoUrl: m[3],
      productUrl: `${BASE}/proizvodi/${buzzSlug}`,
    });
  }

  return brands.sort((a, b) => a.name.localeCompare(b.name, "sr"));
}

function parseStorePaths(html: string): string[] {
  return [
    ...new Set(
      [...html.matchAll(/href="https:\/\/www\.buzzsneakers\.rs\/radnje\/(\d+-[^"]+)"/g)].map(
        (x) => x[1]
      )
    ),
  ];
}

function parseStoreDetail(html: string, storePath: string): BuzzStoreScraped | null {
  const name = html.match(/<h1[^>]*>\s*([^<]+)/i)?.[1]?.trim();
  if (!name) return null;

  const email = html.match(/mailto:([^"]+)/i)?.[1]?.trim() ?? null;
  const phone =
    html.match(/href="tel:([^"]+)"/i)?.[1]?.replace(/\s/g, "") ??
    [...html.matchAll(/>(0\d{2}[\s/-]?\d{3,}[\s-]?\d{3,})</g)].map((x) => x[1])[0] ??
    null;

  const lat = parseFloat(html.match(/data-lat="([^"]+)"/)?.[1] ?? "");
  const lng = parseFloat(html.match(/data-lng="([^"]+)"/)?.[1] ?? "");

  const adresaIdx = html.indexOf("Adresa");
  const slice = html.slice(adresaIdx, adresaIdx + 2000);
  const lines = [...slice.matchAll(/>\s*([^<\n]{3,90}?)\s*</g)]
    .map((x) => x[1].trim())
    .filter(
      (t) =>
        t &&
        !/^(Adresa|Kontakt|Radno|BDS|DOO|RS\.|Ponedeljak|Utorak|Sreda|Četvrtak|Petak|Subota|Nedelja)/i.test(
          t
        ) &&
        !/^\d{1,2}:\d{2}/.test(t)
    );

  const cityLine = lines[0] ?? "Beograd";
  const streetLine = lines[1] ?? "";
  const { city, citySlug } = cityFromLabel(cityLine);

  return {
    path: storePath,
    name,
    address: streetLine,
    city,
    citySlug,
    phone,
    email,
    shoppingCenterSlug: inferMallSlug(name, storePath),
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
  console.log(`  ${brands.length} brendova`);

  console.log("Učitavam /radnje…");
  const storesHtml = await fetchHtml("radnje");
  if (!storesHtml) throw new Error("Ne mogu učitati /radnje");

  const paths = parseStorePaths(storesHtml);
  console.log(`  ${paths.length} radnji`);

  const stores: BuzzStoreScraped[] = [];
  for (const storePath of paths) {
    const html = await fetchHtml(`radnje/${storePath}`);
    if (!html) {
      console.warn(`  ✗ ${storePath}`);
      continue;
    }
    const store = parseStoreDetail(html, storePath);
    if (store) {
      stores.push(store);
      console.log(`  ✓ ${store.name} — ${store.address}, ${store.city}`);
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  const payload: BuzzSneakersScraped = {
    scrapedAt: new Date().toISOString(),
    sourceUrl: `${BASE}/brendovi`,
    brandsUrl: `${BASE}/brendovi`,
    storesUrl: `${BASE}/radnje`,
    retailerSlug: "buzz-sneakers",
    retailerName: "Buzz Sneakers",
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
