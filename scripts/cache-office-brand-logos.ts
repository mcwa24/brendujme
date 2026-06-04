/**
 * Preuzima Office Shoes logoe sa cdn.officeshoes.ws u public/logos/cache
 * npm run logos:office
 */

import fs from "fs";
import path from "path";
import type { OfficeShoesScraped } from "./scrape-office-shoes";
import type { LogoManifest } from "../src/types";

const ROOT = process.cwd();
const SCRAPED = path.join(ROOT, "src/lib/data/office-shoes-scraped.json");
const CACHE_DIR = path.join(ROOT, "public/logos/cache");
const MANIFEST_PATH = path.join(ROOT, "src/lib/data/logo-manifest.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function download(url: string, dest: string): Promise<boolean> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 200) return false;
  fs.writeFileSync(dest, buf);
  return true;
}

async function main() {
  if (!fs.existsSync(SCRAPED)) {
    console.error("Nema office-shoes-scraped.json — prvo npm run scrape:office");
    process.exit(1);
  }

  const scraped = JSON.parse(fs.readFileSync(SCRAPED, "utf8")) as OfficeShoesScraped;
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  let manifest: LogoManifest = {};
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as LogoManifest;
  }

  let updated = 0;
  let skipped = 0;

  for (const brand of scraped.brands) {
    if (!brand.logoUrl) {
      skipped += 1;
      continue;
    }

    const ext = brand.logoUrl.match(/\.(jpe?g|png|webp)$/i)?.[1]?.toLowerCase() ?? "jpg";
    const dest = path.join(CACHE_DIR, `${brand.slug}.${ext === "jpeg" ? "jpg" : ext}`);

    const ok = await download(brand.logoUrl, dest);
    if (ok) {
      manifest[brand.slug] = {
        path: `/logos/cache/${brand.slug}.${ext === "jpeg" ? "jpg" : ext}`,
        source: "url",
      };
      updated += 1;
      console.log(`  ✓ ${brand.name}`);
    } else {
      console.warn(`  ✗ ${brand.name}`);
    }
  }

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nAžurirano: ${updated}, bez URL-a: ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
