/**
 * Upload lokalne slike u Supabase bucket Photos.
 * npm run assets:upload
 */

import fs from "fs";
import path from "path";
import { brands } from "../src/lib/data/brands";
import logoManifest from "../src/lib/data/logo-manifest.json";
import { shoppingCenterImages } from "../src/lib/data/shopping-center-images";
import type { LogoManifest } from "../src/types";
import { STORAGE_BUCKET } from "../src/lib/supabase/env";
import { createSupabaseAdminClient } from "../src/lib/supabase/server";
import { isSupabaseSeedConfigured } from "../src/lib/supabase/env";

const ROOT = process.cwd();
const BRAND_CACHE = path.join(ROOT, "public/logos/cache");
const BRAND_UPLOAD = path.join(ROOT, "public/logos");
const SC_DIR = path.join(ROOT, "public/shopping-centers");

function contentType(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "image/png";
}

async function uploadFile(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  localPath: string,
  storagePath: string
) {
  const body = fs.readFileSync(localPath);
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, body, {
    upsert: true,
    contentType: contentType(localPath),
  });
  if (error) throw new Error(`${storagePath}: ${error.message}`);
}

async function main() {
  if (!isSupabaseSeedConfigured()) {
    console.error("Postavi SUPABASE_SERVICE_ROLE_KEY u .env.local");
    process.exit(1);
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) process.exit(1);

  let ok = 0;
  let skip = 0;

  console.log("Tržni centri → Photos/shopping-centers/…");
  for (const [slug, meta] of Object.entries(shoppingCenterImages)) {
    const rel = meta.src.replace(/^\//, "");
    const localPath = path.join(ROOT, "public", rel);
    if (!fs.existsSync(localPath)) {
      console.warn(`  ✗ ${slug}: nema ${localPath}`);
      skip++;
      continue;
    }
    const storagePath = `shopping-centers/${path.basename(localPath)}`;
    await uploadFile(supabase, localPath, storagePath);
    console.log(`  ✓ ${slug}`);
    ok++;
  }

  const manifest = logoManifest as LogoManifest;

  console.log("\nBrendovi → Photos/brands/…");
  for (const brand of brands) {
    const manifestPath = manifest[brand.slug]?.path?.replace(/^\//, "");
    const candidates = [
      manifestPath ? path.join(ROOT, "public", manifestPath) : "",
      path.join(BRAND_CACHE, `${brand.slug}.png`),
      path.join(BRAND_CACHE, `${brand.slug}.jpg`),
      path.join(BRAND_UPLOAD, `${brand.slug}.png`),
    ].filter(Boolean);
    const localPath = candidates.find((p) => fs.existsSync(p));
    if (!localPath) {
      skip++;
      continue;
    }
    const ext = path.extname(localPath).toLowerCase() || ".png";
    await uploadFile(supabase, localPath, `brands/${brand.slug}${ext}`);
    console.log(`  ✓ ${brand.slug}`);
    ok++;
  }

  console.log(`\nUpload završen: ${ok} fajlova, ${skip} preskočeno (nema lokalnog logoa).`);
  console.log("Proveri bucket Photos u Supabase → Storage.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
