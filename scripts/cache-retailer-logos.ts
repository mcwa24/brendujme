/**
 * Kopira lokalne logotipe prodavaca u public/logos/retailers/
 * Pokretanje: npm run logos:retailers
 */

import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  retailerLogoImages,
  retailerPageLogoImages,
} from "../src/lib/data/retailer-logo-images";

const OUT_DIR = path.join(process.cwd(), "public/logos/retailers");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const SPORT_TIME_FALLBACK = path.join(process.cwd(), "public/logos/cache/nike.jpg");

const BUNDLED_FCO = path.join(
  process.cwd(),
  "assets/fashion-company/FCO-icon-za-web.png"
);
const BUNDLED_FCO_FALLBACK = path.join(
  process.cwd(),
  "../.cursor/projects/Users-ivanmarcetic-Library-Mobile-Documents-com-apple-CloudDocs-Projects-brendujme/assets/FCO-icon-za-web-24fafaea-963b-4532-ad85-94df2f92128d.png"
);
const BUNDLED_FULL = path.join(
  process.cwd(),
  "assets/fashion-company/fashion-company-full.png"
);
const BUNDLED_FULL_FALLBACK = path.join(
  process.cwd(),
  "../.cursor/projects/Users-ivanmarcetic-Library-Mobile-Documents-com-apple-CloudDocs-Projects-brendujme/assets/fashion-company-4049f25c-2509-420c-862d-562dddcd7332.png"
);

async function download(url: string, dest: string): Promise<boolean> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100) return false;
  const { writeFile } = await import("node:fs/promises");
  await writeFile(dest, buf);
  return true;
}

async function copyFirstExisting(
  sources: string[],
  dest: string
): Promise<boolean> {
  for (const src of sources) {
    try {
      await copyFile(src, dest);
      return true;
    } catch {
      /* try next */
    }
  }
  return false;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const fcIconDest = path.join(OUT_DIR, "fashion-company-icon.png");
  const fcFullDest = path.join(OUT_DIR, "fashion-company-full.png");

  if (
    await copyFirstExisting(
      [BUNDLED_FCO, BUNDLED_FCO_FALLBACK],
      fcIconDest
    )
  ) {
    console.log("✓ fashion-company-icon.png (FCO ikona)");
  } else {
    console.error("✗ Nedostaje FCO ikona u assets/");
  }

  if (
    await copyFirstExisting(
      [BUNDLED_FULL, BUNDLED_FULL_FALLBACK],
      fcFullDest
    )
  ) {
    console.log("✓ fashion-company-full.png (pun logo)");
  } else {
    console.error("✗ Nedostaje pun Fashion Company logo u assets/");
  }

  for (const [slug, meta] of Object.entries(retailerLogoImages)) {
    if (slug === "fashion-company") continue;

    const fileName = path.basename(meta.src);
    const dest = path.join(OUT_DIR, fileName);

    if (slug === "sport-time") {
      const nikeOk = await download(meta.sourceUrl, dest);
      if (nikeOk) {
        console.log(`✓ ${slug} → ${fileName} (Nike)`);
        continue;
      }
      try {
        await copyFile(SPORT_TIME_FALLBACK, dest);
        console.log(`✓ ${slug} → ${fileName} (kopija logos/cache/nike.jpg)`);
      } catch {
        console.error(`✗ ${slug}: preuzimanje i fallback nisu uspeli`);
      }
      continue;
    }

    const ok = await download(meta.sourceUrl, dest);
    if (ok) console.log(`✓ ${slug} → ${fileName}`);
    else console.error(`✗ ${slug}: HTTP fail — ${meta.sourceUrl}`);
  }

  for (const meta of Object.values(retailerPageLogoImages)) {
    if (meta.src.includes("fashion-company-icon")) continue;
    const fileName = path.basename(meta.src);
    const dest = path.join(OUT_DIR, fileName);
    const ok = await download(meta.sourceUrl, dest);
    if (ok) console.log(`✓ page → ${fileName}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
