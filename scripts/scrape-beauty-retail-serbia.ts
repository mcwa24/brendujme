/**
 * Beauty / drogerija u Srbiji — Sephora, DM, Lilly, Jasmin, Alexandar Cosmetics
 * npm run scrape:beauty
 *
 * Jasmin: jasmin.rs/prodavnice (HTML). Ostalo: kurirani podaci + fallback JSON.
 */

import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "src/lib/data/beauty-retail-serbia-scraped.json");
const FALLBACK = path.join(process.cwd(), "scripts/beauty-retail-serbia-fallback.json");

export interface BeautyStoreScraped {
  brandSlug: string;
  name: string;
  address: string;
  city: string;
  citySlug: string;
  shoppingCenterSlug: string | null;
  retailerSlug: string;
  storeUrl: string;
}

const BRANDS = ["sephora", "dm", "lilly", "jasmin", "alexandar-cosmetics"] as const;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const MALL_PATTERNS: { pattern: RegExp; slug: string }[] = [
  { pattern: /u[sš][cć]e/i, slug: "usce" },
  { pattern: /delta|belville|gagarina/i, slug: "delta-city" },
  { pattern: /promenada|novi sad/i, slug: "promenada" },
  { pattern: /galerija|vilsona|ada mall/i, slug: "galerija" },
  { pattern: /big fashion|višnjič|visnjick|rakovica/i, slug: "big-fashion" },
  { pattern: /stadion|zaplanjska/i, slug: "stadion" },
  { pattern: /knez mihailova|rajićeva|rajiceva/i, slug: "rajiceva" },
  { pattern: /kragujevac|plaza/i, slug: "kragujevac-plaza" },
];

function inferMall(text: string): string | null {
  for (const { pattern, slug } of MALL_PATTERNS) {
    if (pattern.test(text)) return slug;
  }
  return null;
}

async function scrapeJasmin(): Promise<BeautyStoreScraped[]> {
  const url = "https://www.jasmin.rs/prodavnice";
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; brendujme/1.0)" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) return [];
  const html = await res.text();
  const stores: BeautyStoreScraped[] = [];
  const blockRe =
    /<h[23][^>]*>([^<]+)<\/h[23]>[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null) {
    const name = m[1].replace(/Jasmin\s*/i, "Jasmin ").trim();
    const address = m[2].trim();
    if (!address || address.length < 5) continue;
    const cityMatch = address.match(/,\s*([^,]+)$/);
    const city = cityMatch ? cityMatch[1].trim() : "Beograd";
    const blob = `${name} ${address}`;
    stores.push({
      brandSlug: "jasmin",
      name: name.startsWith("Jasmin") ? name : `Jasmin ${name}`,
      address,
      city,
      citySlug: slugify(city),
      shoppingCenterSlug: inferMall(blob),
      retailerSlug: "jasmin",
      storeUrl: url,
    });
  }
  return stores;
}

function loadFallback(): { stores: BeautyStoreScraped[]; sourceNote: string } {
  const pathToUse = fs.existsSync(FALLBACK) ? FALLBACK : OUT;
  const raw = JSON.parse(fs.readFileSync(pathToUse, "utf8")) as {
    stores: BeautyStoreScraped[];
    sourceNote?: string;
  };
  return {
    stores: raw.stores,
    sourceNote:
      raw.sourceNote ??
      "Kurirano: Sephora TC; DM/Lilly uzorak; Jasmin; Alexandar distributeri",
  };
}

async function main() {
  let stores: BeautyStoreScraped[] = [];
  let sourceNote =
    "Sephora/TC; DM dm.rs (130+); Lilly (185+); Jasmin jasmin.rs; Alexandar distributeri";

  const jasminScraped = await scrapeJasmin();
  const fallback = loadFallback();

  if (jasminScraped.length >= 10) {
    const nonJasmin = fallback.stores.filter((s) => s.brandSlug !== "jasmin");
    stores = [...nonJasmin, ...jasminScraped];
    sourceNote = `${fallback.sourceNote}; Jasmin osvežen sa jasmin.rs (${jasminScraped.length})`;
    console.log(`Jasmin: ${jasminScraped.length} lokacija sa sajta`);
  } else {
    stores = fallback.stores;
    console.warn(
      jasminScraped.length > 0
        ? `Jasmin scrape premalo (${jasminScraped.length}) — koristim fallback`
        : "Jasmin scrape nije uspeo — koristim fallback JSON"
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
    console.log(`Kreiran backup: ${FALLBACK}`);
  }

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`\nUkupno ${stores.length} lokacija → ${OUT}`);
  for (const b of BRANDS) {
    const n = stores.filter((s) => s.brandSlug === b).length;
    console.log(`  ${b}: ${n}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
