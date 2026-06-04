/**
 * Tech retail u Srbiji — Gigatron, Tehnika (Tehnomedia), Tehnomanija, BC Group, CT Shop
 * npm run scrape:tech
 */

import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "src/lib/data/tech-retail-serbia-scraped.json");
const FALLBACK = path.join(process.cwd(), "scripts/tech-retail-serbia-fallback.json");

export interface TechStoreScraped {
  brandSlug: string;
  name: string;
  address: string;
  city: string;
  citySlug: string;
  shoppingCenterSlug: string | null;
  retailerSlug: string;
  storeUrl: string;
}

const BRANDS = ["tehnika", "gigatron", "tehnomanija", "bc-group", "ct-shop"] as const;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const MALL_PATTERNS: { pattern: RegExp; slug: string }[] = [
  { pattern: /u[sš][cć]e|pupina/i, slug: "usce" },
  { pattern: /delta|belville|gagarina/i, slug: "delta-city" },
  { pattern: /promenada|big fashion|big-novi|oslobođenja 119/i, slug: "promenada" },
  { pattern: /galerija|vilsona|bw|beogradanka/i, slug: "galerija" },
  { pattern: /big fashion|višnjič|visnjick|rakovica/i, slug: "big-fashion" },
  { pattern: /stadion|zaplanjska/i, slug: "stadion" },
  { pattern: /raji[cć]eva|knez mihailova/i, slug: "rajiceva" },
  { pattern: /mercator|bulevar umetnosti/i, slug: "mercator" },
  { pattern: /ada mall|radnička/i, slug: "galerija" },
  { pattern: /kragujevac|plaza|kraljice marije/i, slug: "kragujevac-plaza" },
  { pattern: /sava centar|milentija popovica/i, slug: "delta-city" },
  { pattern: /aviv park/i, slug: "big-fashion" },
];

function inferMall(text: string): string | null {
  for (const { pattern, slug } of MALL_PATTERNS) {
    if (pattern.test(text)) return slug;
  }
  return null;
}

function parseCity(cityPart: string): string {
  const c = cityPart.trim();
  if (/beograd/i.test(c)) return "Beograd";
  if (/novi sad/i.test(c)) return "Novi Sad";
  if (/niš|nis/i.test(c)) return "Niš";
  if (/kragujevac/i.test(c)) return "Kragujevac";
  if (/subotica/i.test(c)) return "Subotica";
  if (/čačak|cacak/i.test(c)) return "Čačak";
  if (/novi pazar/i.test(c)) return "Novi Pazar";
  if (/sremska mitrovica/i.test(c)) return "Sremska Mitrovica";
  if (/borca|borča/i.test(c)) return "Borča";
  if (/batajnica/i.test(c)) return "Beograd";
  return c.replace(/\s*\(.*\)$/, "").trim();
}

async function scrapeTehnomanija(): Promise<TechStoreScraped[]> {
  const url = "https://www.tehnomanija.rs/prodavnice";
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(35_000),
  });
  if (!res.ok) return [];
  const html = await res.text();
  const stores: TechStoreScraped[] = [];

  const patterns = [
    /<h2[^>]*>\s*([^<]+?)\s*<\/h2>/gi,
    /<h3[^>]*>\s*([^<]+?)\s*<\/h3>/gi,
    /##\s*([^<\n]+)/g,
  ];

  const seen = new Set<string>();
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const line = m[1].replace(/&nbsp;/g, " ").trim();
      if (!line.includes(" - ") || line.length < 8) continue;
      const [cityRaw, ...addrParts] = line.split(" - ");
      const address = addrParts.join(" - ").trim();
      const city = parseCity(cityRaw);
      const key = `${city}|${address}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const blob = `${line} ${address}`;
      stores.push({
        brandSlug: "tehnomanija",
        name: `Tehnomanija ${city}`,
        address,
        city,
        citySlug: slugify(city),
        shoppingCenterSlug: inferMall(blob),
        retailerSlug: "tehnomanija",
        storeUrl: url,
      });
    }
    if (stores.length >= 20) break;
  }
  return stores;
}

function loadFallback(): { stores: TechStoreScraped[]; sourceNote: string } {
  const pathToUse = fs.existsSync(FALLBACK) ? FALLBACK : OUT;
  const raw = JSON.parse(fs.readFileSync(pathToUse, "utf8")) as {
    stores: TechStoreScraped[];
    sourceNote?: string;
  };
  return {
    stores: raw.stores,
    sourceNote: raw.sourceNote ?? "Kurirano iz zvaničnih sajtova",
  };
}

async function main() {
  const fallback = loadFallback();
  let stores = [...fallback.stores];

  const tman = await scrapeTehnomanija();
  if (tman.length >= 30) {
    const other = stores.filter((s) => s.brandSlug !== "tehnomanija");
    stores = [...other, ...tman];
    console.log(`Tehnomanija: ${tman.length} lokacija sa sajta`);
  } else {
    console.warn(
      tman.length > 0
        ? `Tehnomanija scrape premalo (${tman.length}) — fallback`
        : "Tehnomanija scrape nije uspeo — fallback"
    );
  }

  const payload = {
    scrapedAt: new Date().toISOString(),
    sourceNote:
      "Gigatron gigatron.rs/prodavnice (70+); Tehnika/Tehnomedia tehnomedia.rs; Tehnomanija tehnomanija.rs/prodavnice (80+); BC Group bcgroup.rs; CT Shop ctshop.rs",
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
