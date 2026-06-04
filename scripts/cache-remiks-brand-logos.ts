/**
 * Preuzima zvanične logoe brendova sa Remiks stranica (/brendovi/{slug}/).
 * Izvor: media/amasty/shopby/option_images/*.jpg
 *
 * npm run logos:remiks
 * npm run assets:upload   # opciono u Supabase Photos
 */

import fs from "fs";
import path from "path";
import { brands } from "../src/lib/data/brands";
import type { LogoManifest } from "../src/types";

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, "public/logos/cache");
const MANIFEST_PATH = path.join(ROOT, "src/lib/data/logo-manifest.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const REMIKS_SLUG_ALIASES: Record<string, string[]> = {
  "scotch-and-soda": ["scotch-soda", "scotch_and_soda"],
  "h-and-m": ["hm", "h-m"],
  boss: ["hugo-boss", "hugo_boss"],
  hugo: ["hugo-boss", "hugo"],
  levis: ["levi-s", "levis-1"],
  "north-face": ["the-north-face", "north_face"],
  "new-balance": ["new_balance", "New_Balance_1"],
  "under-armour": ["under_armour"],
  "massimo-dutti": ["massimo_dutti"],
  "pull-and-bear": ["pull_and_bear"],
  "tory-burch": ["tory_burch"],
  "armani-exchange": ["armani_exchange"],
  "steve-madden": ["steve_madden"],
  "patrizia-pepe": ["patrizia_pepe"],
  "miss-sixty": ["miss_sixty"],
  "liu-jo": ["liu_jo"],
  "cesare-paciotti": ["cesare_paciotti"],
  "karl-lagerfeld": ["karl_lagerfeld"],
  "love-moschino": ["love_moschino"],
  "moschino-jeans": ["moschino_jeans"],
  "flower-mountain": ["flower_mountain"],
  "dolce-vita": ["dolce_vita"],
  "saint-barth": ["saint_barth"],
  "lyle-scott": ["lyle_scott", "lyle_and_scott"],
  "antony-morato": ["antony_morato"],
  "tommy-hilfiger": ["tommy_hilfiger"],
  "calvin-klein": ["calvin_klein"],
};

function remiksSlugCandidates(slug: string): string[] {
  const base = [slug, slug.replace(/-/g, "_")];
  const extra = REMIKS_SLUG_ALIASES[slug] ?? [];
  return [...new Set([...base, ...extra])];
}

const OPTION_IMAGE_BASE =
  "https://remiks.com/media/amasty/shopby/option_images/";

function extractRemiksLogoUrl(html: string): string | null {
  const match = html.match(
    /https:\/\/remiks\.com\/media\/amasty\/shopby\/option_images\/[^"'\s>]+\.(?:png|jpg|jpeg|webp|svg)/i
  );
  return match?.[0] ?? null;
}

function directLogoCandidates(bilbordSlug: string): string[] {
  const parts = bilbordSlug.split("-");
  const titled = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
  const titledSpaced = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("_");
  const names = [
    bilbordSlug,
    bilbordSlug.replace(/-/g, "_"),
    titled,
    titledSpaced,
    `${titled}_1`,
    `${titledSpaced}_1`,
  ];
  if (bilbordSlug === "nike") names.push("Nike_1", "Nike");
  if (bilbordSlug === "guess") names.push("Guess");
  if (bilbordSlug === "adidas") names.push("adidas", "Adidas");
  if (bilbordSlug === "boss" || bilbordSlug === "hugo")
    names.push("hugo_boss", "Hugo_Boss", "BOSS");
  if (bilbordSlug === "levis") names.push("Levis", "levis", "Levi's");
  if (bilbordSlug === "h-and-m") names.push("H_M", "HM", "h_m");

  const urls: string[] = [];
  for (const name of [...new Set(names)]) {
    for (const ext of ["jpg", "png", "webp", "jpeg"]) {
      urls.push(`${OPTION_IMAGE_BASE}${name}.${ext}`);
    }
  }
  return urls;
}

const PLACEHOLDER_SIZES = new Set([3252, 8205]);

async function probeDirectLogo(url: string): Promise<boolean> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) return false;
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("image")) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.length > 800 && !PLACEHOLDER_SIZES.has(buf.length);
}

async function fetchBrandPage(slug: string, attempt = 0): Promise<string | null> {
  const res = await fetch(`https://remiks.com/brendovi/${slug}/`, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(20_000),
  });
  if (res.status === 403 && attempt < 3) {
    await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    return fetchBrandPage(slug, attempt + 1);
  }
  if (res.status !== 200) return null;
  return res.text();
}

async function downloadLogo(
  url: string,
  bilbordSlug: string
): Promise<{ saved: boolean; publicPath?: string }> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) return { saved: false };

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) return { saved: false };

  const ext = path.extname(new URL(url).pathname).toLowerCase() || ".jpg";
  const fileName = `${bilbordSlug}${ext === ".jpeg" ? ".jpg" : ext}`;
  const diskPath = path.join(CACHE_DIR, fileName);
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(diskPath, buf);

  return { saved: true, publicPath: `/logos/cache/${fileName}` };
}

async function resolveRemiksLogoUrl(bilbordSlug: string): Promise<string | null> {
  for (const remiksSlug of remiksSlugCandidates(bilbordSlug)) {
    const html = await fetchBrandPage(remiksSlug);
    if (!html) continue;
    const url = extractRemiksLogoUrl(html);
    if (url) return url;
  }

  for (const url of directLogoCandidates(bilbordSlug)) {
    if (await probeDirectLogo(url)) return url;
  }
  return null;
}

async function main() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

  const manifest: LogoManifest = fs.existsSync(MANIFEST_PATH)
    ? (JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as LogoManifest)
    : {};

  let ok = 0;
  let skip = 0;
  let fail = 0;

  console.log(`Remiks logoi — ${brands.length} brendova…\n`);

  for (const brand of brands) {
    const existing = manifest[brand.slug];

    const logoUrl = await resolveRemiksLogoUrl(brand.slug);
    if (!logoUrl) {
      const existingDisk = existing?.path?.startsWith("/")
        ? path.join(ROOT, "public", existing.path.slice(1))
        : null;
      if (existingDisk && fs.existsSync(existingDisk)) {
        console.log(`  — ${brand.slug} (zadržan postojeći)`);
        skip++;
      } else {
        console.log(`  ✗ ${brand.slug} (nema na Remiksu)`);
        fail++;
      }
      await new Promise((r) => setTimeout(r, 350));
      continue;
    }

    const result = await downloadLogo(logoUrl, brand.slug);
    if (!result.saved || !result.publicPath) {
      console.log(`  ✗ ${brand.slug} (download fail)`);
      fail++;
      continue;
    }

    manifest[brand.slug] = {
      path: result.publicPath,
      source: "url",
    };
    console.log(`  ✓ ${brand.slug} ← ${logoUrl}`);
    ok++;

    await new Promise((r) => setTimeout(r, 350));
  }

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`\nGotovo: ${ok} novih/ažuriranih, ${skip} zadržano, ${fail} bez logoa.`);
  console.log("Sledeće: npm run assets:upload");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
