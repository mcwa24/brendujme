/**
 * Preuzima Urban Shop logoe u public/logos/cache i (opciono) u Supabase Photos.
 * npm run logos:urbanshop
 */

import fs from "fs";
import path from "path";
import type { UrbanShopScraped } from "./scrape-urban-shop";
import type { LogoManifest } from "../src/types";
import { STORAGE_BUCKET, isSupabaseSeedConfigured } from "../src/lib/supabase/env";
import { createSupabaseAdminClient } from "../src/lib/supabase/server";
import { getStoragePublicUrl } from "../src/lib/supabase/storage";

const ROOT = process.cwd();
const SCRAPED = path.join(ROOT, "src/lib/data/urban-shop-scraped.json");
const CACHE_DIR = path.join(ROOT, "public/logos/cache");
const MANIFEST_PATH = path.join(ROOT, "src/lib/data/logo-manifest.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function extFromUrl(url: string): string {
  const m = url.match(/\.(jpe?g|png|webp|svg)(?:\?|$)/i);
  const ext = m?.[1]?.toLowerCase() ?? "jpg";
  return ext === "jpeg" ? "jpg" : ext;
}

function localLogoPath(slug: string, ext: string): string {
  return path.join(CACHE_DIR, `${slug}.${ext}`);
}

function manifestHasLocalLogo(slug: string, manifest: LogoManifest): boolean {
  const entry = manifest[slug];
  if (!entry?.path) return false;
  const rel = entry.path.replace(/^\//, "");
  const full = path.join(ROOT, "public", rel);
  return fs.existsSync(full);
}

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

function contentType(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "image/png";
}

async function main() {
  if (!fs.existsSync(SCRAPED)) {
    console.error("Nema urban-shop-scraped.json — prvo npm run scrape:urbanshop");
    process.exit(1);
  }

  const scraped = JSON.parse(fs.readFileSync(SCRAPED, "utf8")) as UrbanShopScraped;
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  let manifest: LogoManifest = {};
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as LogoManifest;
  }

  const downloaded: { slug: string; localPath: string; ext: string }[] = [];
  let skipped = 0;
  let failed = 0;

  console.log("Urban Shop brend logoi…\n");

  for (const brand of scraped.brands) {
    if (!brand.logoUrl) {
      skipped += 1;
      console.log(`  − ${brand.name}: nema logoUrl`);
      continue;
    }

    if (manifestHasLocalLogo(brand.slug, manifest)) {
      skipped += 1;
      console.log(`  ○ ${brand.name}: već u manifestu`);
      continue;
    }

    const ext = extFromUrl(brand.logoUrl);
    const dest = localLogoPath(brand.slug, ext);
    const ok = await download(brand.logoUrl, dest);
    if (!ok) {
      failed += 1;
      console.warn(`  ✗ ${brand.name}`);
      continue;
    }

    manifest[brand.slug] = {
      path: `/logos/cache/${brand.slug}.${ext}`,
      source: "url",
      remoteUrl: brand.logoUrl,
      fetchedAt: new Date().toISOString().slice(0, 10),
    };
    downloaded.push({ slug: brand.slug, localPath: dest, ext });
    console.log(`  ✓ ${brand.name} → ${brand.slug}.${ext}`);
  }

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`\nKeš: ${downloaded.length} novih, ${skipped} preskočeno, ${failed} grešaka`);

  const toUpload: { slug: string; localPath: string; ext: string }[] = [
    ...downloaded,
  ];

  for (const brand of scraped.brands) {
    if (toUpload.some((u) => u.slug === brand.slug)) continue;
    const entry = manifest[brand.slug];
    if (!entry?.path) continue;
    const rel = entry.path.replace(/^\//, "");
    const localPath = path.join(ROOT, "public", rel);
    if (!fs.existsSync(localPath)) continue;
    const ext = path.extname(localPath).slice(1) || "png";
    toUpload.push({ slug: brand.slug, localPath, ext });
  }

  if (!toUpload.length) {
    console.log("Nema logoa za upload.");
    return;
  }

  if (!isSupabaseSeedConfigured()) {
    console.log("\nSupabase nije konfigurisan — samo lokalni keš.");
    console.log("Za upload: postavi .env.local pa ponovo npm run logos:urbanshop");
    return;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) process.exit(1);

  console.log(`\nUpload → Supabase Photos/brands/… (${toUpload.length})`);

  for (const { slug, localPath, ext } of toUpload) {
    const storagePath = `brands/${slug}.${ext}`;
    const body = fs.readFileSync(localPath);
    const { error: upErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, body, {
        upsert: true,
        contentType: contentType(localPath),
      });
    if (upErr) {
      console.warn(`  ✗ upload ${slug}:`, upErr.message);
      continue;
    }

    const publicUrl = getStoragePublicUrl(storagePath);
    const { error: dbErr } = await supabase
      .from("brands")
      .update({
        logo_storage_path: storagePath,
        logo_url: publicUrl,
      })
      .eq("slug", slug);

    if (dbErr) {
      console.warn(`  ✗ brands.${slug}:`, dbErr.message);
      continue;
    }

    console.log(`  ✓ ${slug} → ${storagePath}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
