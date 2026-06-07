/**
 * @deprecated Ručni unos logoa — ne koristiti. Koristi scripts/install-brand-logo.py
 *
 * npm run logos:sync-official  → isključeno u package.json
 */

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { brands } from "../src/lib/data/brands";
import { BRAND_OFFICIAL_WEBSITES } from "../src/lib/data/ff-directory-brands";
import type { LogoManifest } from "../src/types";

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, "public/logos/cache");
const MANIFEST_PATH = path.join(ROOT, "src/lib/data/logo-manifest.json");
const VALIDATE = path.join(ROOT, "scripts/lib/validate-logo.py");

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const PROTECTED = new Set(["manual", "upload"]);
const force = process.argv.includes("--force");

/** Poznati zvanični URL-ovi kad sajt ne otkrije logo u HTML-u (samo provereni linkovi). */
const KNOWN_OFFICIAL_LOGO_URLS: Record<string, string> = {
  mou: "https://cdn.shopify.com/s/files/1/0642/6932/0423/files/Mou-Logo.png",
  arket: "https://www.arket.com/static_assets/images/logo.png",
  "cesare-paciotti": "https://static.cdnlogo.com/logos/c/90/cesare-paciotti.svg",
  "lyle-scott":
    "https://www.lyleandscott.com/cdn/shop/files/L_S_LOGO-03_72e31967-d5f2-4d41-953b-3b8afab93afd.png?v=1704302755&width=400",
};

const REJECT_URL = /(?:blanco|logo-white|logo_white|ffffff|\/flags\/|flag\.svg|sticker-icons|vans\.eu|meganav|otw-)/i;

type Candidate = { url: string; score: number };

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}

function extractAttr(tag: string, attr: string): string | null {
  const re = new RegExp(`${attr}=["']([^"']+)["']`, "i");
  return tag.match(re)?.[1] ?? null;
}

function scoreUrl(url: string, hints: { logoHint?: boolean; inHeader?: boolean }, siteHost: string): number {
  const u = url.toLowerCase();
  let score = 0;
  if (u.endsWith(".svg")) score += 40;
  else if (u.endsWith(".png") || u.endsWith(".webp")) score += 25;
  else if (u.endsWith(".jpg") || u.endsWith(".jpeg")) score += 10;
  if (u.includes("logo")) score += 35;
  if (u.includes("brand")) score += 15;
  if (u.includes("favicon") || u.includes("/icon") || u.includes("sprite")) score -= 60;
  if (u.includes("banner") || u.includes("hero") || u.includes("slider")) score -= 30;
  if (u.includes("/flags/") || u.includes("flag.svg") || u.includes("sticker-icons")) score -= 80;
  if (u.includes("blanco") || u.includes("logo-white") || u.includes("logo_white")) score -= 80;
  if (u.includes("white") || u.includes("ffffff")) score -= 25;
  if (u.includes("vans.eu") || u.includes("meganav") || u.includes("otw-")) score -= 100;
  if (u.includes("ogimage") || u.includes("og-image")) score -= 15;
  if (hints.logoHint) score += 25;
  if (hints.inHeader) score += 15;

  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const site = siteHost.replace(/^www\./, "");
    const siteRoot = site.split(".").slice(-2).join(".");
    if (host.includes(siteRoot.split(".")[0]!) || host.endsWith(siteRoot)) score += 30;
    else if (!host.includes("cdn.shopify") && !host.includes("demandware")) score -= 25;
  } catch {
    /* ignore */
  }
  return score;
}

function discoverCandidates(html: string, siteUrl: string): Candidate[] {
  const found: Candidate[] = [];
  const siteHost = new URL(siteUrl).hostname;
  const push = (url: string, hints: { logoHint?: boolean; inHeader?: boolean } = {}) => {
    if (!url || url.startsWith("data:")) return;
    const resolved = resolveUrl(url, siteUrl);
    found.push({ url: resolved, score: scoreUrl(resolved, hints, siteHost) });
  };

  // JSON-LD logo
  const ldBlocks =
    html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ??
    [];
  for (const block of ldBlocks) {
    const inner = block.replace(/<\/?script[^>]*>/gi, "").trim();
    try {
      const data = JSON.parse(inner) as unknown;
      const visit = (node: unknown) => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) {
          node.forEach(visit);
          return;
        }
        const obj = node as Record<string, unknown>;
        if (typeof obj.logo === "string") push(obj.logo, { logoHint: true });
        if (obj.logo && typeof obj.logo === "object" && "url" in (obj.logo as object)) {
          push(String((obj.logo as { url: string }).url), { logoHint: true });
        }
        Object.values(obj).forEach(visit);
      };
      visit(data);
    } catch {
      /* ignore */
    }
  }

  const headerMatch = html.match(/<header[\s\S]*?<\/header>/i)?.[0] ?? html.slice(0, 25_000);

  for (const tag of headerMatch.match(/<img[^>]+>/gi) ?? []) {
    const src = extractAttr(tag, "src") ?? extractAttr(tag, "data-src");
    if (!src) continue;
    const cls = (extractAttr(tag, "class") ?? "").toLowerCase();
    const alt = (extractAttr(tag, "alt") ?? "").toLowerCase();
    const id = (extractAttr(tag, "id") ?? "").toLowerCase();
    const logoHint = [cls, alt, id, src].some((s) => s.includes("logo"));
    push(src, { logoHint, inHeader: true });
  }

  for (const tag of html.match(/<img[^>]+>/gi) ?? []) {
    const src = extractAttr(tag, "src") ?? extractAttr(tag, "data-src");
    if (!src) continue;
    const cls = (extractAttr(tag, "class") ?? "").toLowerCase();
    const alt = (extractAttr(tag, "alt") ?? "").toLowerCase();
    if (!cls.includes("logo") && !alt.includes("logo") && !src.toLowerCase().includes("logo")) {
      continue;
    }
    push(src, { logoHint: true });
  }

  for (const m of html.match(/https:\/\/cdn\.shopify\.com[^"'\s)]+/gi) ?? []) {
    if (/logo/i.test(m) && !REJECT_URL.test(m)) push(m, { logoHint: true });
  }

  for (const m of html.match(/\/cdn\/shop\/files\/[^"'\s)]+\.(?:png|svg|webp)/gi) ?? []) {
    if (/logo/i.test(m) && !REJECT_URL.test(m)) push(m, { logoHint: true, inHeader: true });
  }

  for (const m of html.match(/https?:\/\/[^"'\s)]+\.svg/gi) ?? []) {
    if (/logo|brand/i.test(m) && !REJECT_URL.test(m)) push(m, { logoHint: true });
  }

  const ogTags = html.match(/<meta[^>]+>/gi) ?? [];
  for (const tag of ogTags) {
    const prop =
      extractAttr(tag, "property")?.toLowerCase() ??
      extractAttr(tag, "name")?.toLowerCase() ??
      "";
    if (prop === "og:image" || prop === "twitter:image") {
      const content = extractAttr(tag, "content");
      if (content && /logo|brand/i.test(content)) push(content, { logoHint: true });
    }
  }

  const byUrl = new Map<string, Candidate>();
  for (const c of found) {
    const prev = byUrl.get(c.url);
    if (!prev || c.score > prev.score) byUrl.set(c.url, c);
  }
  return [...byUrl.values()].sort((a, b) => b.score - a.score);
}

function extFromUrl(url: string, contentType: string): string {
  const fromPath = path.extname(new URL(url).pathname).toLowerCase();
  if ([".svg", ".png", ".webp", ".jpg", ".jpeg"].includes(fromPath)) {
    return fromPath === ".jpeg" ? ".jpg" : fromPath;
  }
  if (contentType.includes("svg")) return ".svg";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";
  return ".png";
}

async function fetchLogo(url: string): Promise<{ buf: Buffer; ext: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "image/*,*/*" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (type.includes("text/html")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 200) return null;
    return { buf, ext: extFromUrl(url, type) };
  } catch {
    return null;
  }
}

function validateFile(filePath: string): boolean {
  try {
    execFileSync("python3", [VALIDATE, filePath], { stdio: ["ignore", "pipe", "pipe"] });
    return true;
  } catch {
    return false;
  }
}

function isRetailerListingUrl(url: string): boolean {
  return /fashionandfriends\.com\/rs\/brendovi/i.test(url);
}

function officialWebsite(slug: string, fallback: string): string | null {
  const url = BRAND_OFFICIAL_WEBSITES[slug] ?? fallback;
  if (!url?.trim()) return null;
  if (isRetailerListingUrl(url)) return BRAND_OFFICIAL_WEBSITES[slug] ?? null;
  return url;
}

async function discoverFromSite(website: string, slug: string): Promise<string[]> {
  const known = KNOWN_OFFICIAL_LOGO_URLS[slug];
  if (known) return [known];

  const pageRes = await fetch(website, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    signal: AbortSignal.timeout(20_000),
    redirect: "follow",
  }).catch(() => null);

  if (!pageRes?.ok) return [];

  const html = await pageRes.text();
  return discoverCandidates(html, pageRes.url)
    .filter((c) => c.score >= 25 && !REJECT_URL.test(c.url))
    .slice(0, 8)
    .map((c) => c.url);
}

function loadManifest(): LogoManifest {
  if (!fs.existsSync(MANIFEST_PATH)) return {};
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as LogoManifest;
}

function saveManifest(manifest: LogoManifest) {
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function syncBrand(
  slug: string,
  website: string,
  manifest: LogoManifest
): Promise<"ok" | "skip" | "fail"> {
  const logoUrls = await discoverFromSite(website, slug);
  if (logoUrls.length === 0) return "fail";

  for (const logoUrl of logoUrls) {
    const fetched = await fetchLogo(logoUrl);
    if (!fetched) continue;

    const dest = path.join(CACHE_DIR, `${slug}${fetched.ext}`);
    fs.writeFileSync(dest, fetched.buf);

    if (!validateFile(dest)) {
      fs.unlinkSync(dest);
      continue;
    }

    for (const ext of [".png", ".svg", ".jpg", ".webp"]) {
      if (ext === fetched.ext) continue;
      const old = path.join(CACHE_DIR, `${slug}${ext}`);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    manifest[slug] = {
      path: `/logos/cache/${slug}${fetched.ext}`,
      source: "official",
      remoteUrl: logoUrl,
      fetchedAt: new Date().toISOString(),
    };
    return "ok";
  }

  return "fail";
}

async function main() {
  ensureDir(CACHE_DIR);
  const manifest = loadManifest();

  let ok = 0;
  let skip = 0;
  let fail = 0;

  console.log(`Zvanični logoi — ${brands.length} brendova${force ? " (--force)" : ""}\n`);

  for (const brand of brands) {
    const existing = manifest[brand.slug];
    if (existing && PROTECTED.has(existing.source) && !force) {
      console.log(`  — ${brand.slug} (manual/upload, preskočeno)`);
      skip++;
      continue;
    }

    const website = officialWebsite(brand.slug, brand.website);
    if (!website) {
      console.log(`  ✗ ${brand.slug} (nema zvaničnog sajta)`);
      fail++;
      continue;
    }

    const result = await syncBrand(brand.slug, website, manifest);
    if (result === "ok") {
      console.log(`  ✓ ${brand.slug} ← ${manifest[brand.slug]?.remoteUrl}`);
      ok++;
    } else if (result === "skip") {
      skip++;
    } else {
      console.log(`  ✗ ${brand.slug} (nije pronađen logo na ${website})`);
      fail++;
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  saveManifest(manifest);
  console.log(`\nGotovo: ${ok} ažurirano, ${skip} preskočeno, ${fail} bez logoa.`);
  console.log("Pokreni ponovo za osvežavanje kad brend promeni logo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
