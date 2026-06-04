/**
 * Home & Living u Srbiji — JYSK, IKEA, Forma Ideale, Emmezeta
 * npm run build:home
 *
 * Forma Ideale: formaideale.rs/api/locations (45 salona)
 * Ostalo: scripts/home-retail-serbia-fallback.json
 */

import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "src/lib/data/home-retail-serbia-scraped.json");
const FALLBACK = path.join(process.cwd(), "scripts/home-retail-serbia-fallback.json");

export interface HomeStoreScraped {
  brandSlug: string;
  name: string;
  address: string;
  city: string;
  citySlug: string;
  shoppingCenterSlug: string | null;
  retailerSlug: string;
  storeUrl: string;
}

const BRANDS = ["jysk", "ikea", "forma-ideale", "emmezeta"] as const;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const MALL_PATTERNS: { pattern: RegExp; slug: string }[] = [
  { pattern: /u[sš][cć]e|mihajla pupina/i, slug: "usce" },
  { pattern: /delta\s*park|delta city|nemanjića/i, slug: "delta-city" },
  { pattern: /promenada|sentandrejski/i, slug: "promenada" },
  { pattern: /galerija|vilsona/i, slug: "galerija" },
  { pattern: /big fashion|višnjič|visnjick|uralska/i, slug: "big-fashion" },
  { pattern: /stadion|zaplanjska|roda centar/i, slug: "stadion" },
  { pattern: /rajićeva|knez mihailova/i, slug: "rajiceva" },
  { pattern: /plaza|kragujevac.*delta/i, slug: "kragujevac-plaza" },
  { pattern: /merkur|rumenačka/i, slug: "mercator" },
];

function inferMall(text: string): string | null {
  for (const { pattern, slug } of MALL_PATTERNS) {
    if (slug && pattern.test(text)) return slug;
  }
  return null;
}

interface FormaLocationDoc {
  name: string;
  streetAddress: string;
  city: string;
  slug: string;
}

function isFormaRetailStore(doc: FormaLocationDoc): boolean {
  const n = doc.name.toLowerCase();
  if (n.includes("internet")) return false;
  if (doc.city.toLowerCase().includes("korisnička")) return false;
  if (n.includes("skladišni") || n.includes("skladisni")) return false;
  return true;
}

async function scrapeFormaIdeale(): Promise<HomeStoreScraped[]> {
  const url = "https://formaideale.rs/api/locations?limit=50";
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; brendujme/1.0)" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { docs?: FormaLocationDoc[] };
  const docs = (data.docs ?? []).filter(isFormaRetailStore);
  return docs.map((doc) => {
    const city = doc.city.trim();
    const blob = `${doc.name} ${doc.streetAddress} ${city}`;
    return {
      brandSlug: "forma-ideale",
      name: `Forma Ideale ${doc.name}`,
      address: doc.streetAddress,
      city,
      citySlug: slugify(city),
      shoppingCenterSlug: inferMall(blob),
      retailerSlug: "forma-ideale",
      storeUrl: `https://formaideale.rs/servis-za-kupce/prodajna-mreza#${doc.slug}`,
    };
  });
}

function loadFallback(): { stores: HomeStoreScraped[]; sourceNote: string } {
  const pathToUse = fs.existsSync(FALLBACK) ? FALLBACK : OUT;
  const raw = JSON.parse(fs.readFileSync(pathToUse, "utf8")) as {
    stores: HomeStoreScraped[];
    sourceNote?: string;
  };
  return {
    stores: raw.stores,
    sourceNote:
      raw.sourceNote ??
      "Kurirano: JYSK/IKEA/Emmezeta zvanični sajtovi; Forma Ideale API",
  };
}

async function main() {
  const fallback = loadFallback();
  const nonForma = fallback.stores.filter((s) => s.brandSlug !== "forma-ideale");
  let stores = [...nonForma];
  let sourceNote = fallback.sourceNote;

  const forma = await scrapeFormaIdeale();
  if (forma.length >= 35) {
    stores = [...stores, ...forma];
    sourceNote = `${fallback.sourceNote}; Forma Ideale API (${forma.length} salona)`;
    console.log(`Forma Ideale: ${forma.length} lokacija sa API-ja`);
  } else {
    console.warn(
      forma.length > 0
        ? `Forma Ideale API premalo (${forma.length}) — bez Forma lokacija`
        : "Forma Ideale API nije uspeo"
    );
  }

  const payload = {
    scrapedAt: new Date().toISOString(),
    sourceNote,
    brands: [...BRANDS],
    stores,
  };

  if (!fs.existsSync(FALLBACK) && fs.existsSync(OUT)) {
    fs.copyFileSync(OUT, FALLBACK);
    console.log(`Backup: ${FALLBACK}`);
  }

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`\nUkupno ${stores.length} lokacija → ${OUT}`);
  for (const b of BRANDS) {
    console.log(`  ${b}: ${stores.filter((s) => s.brandSlug === b).length}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
