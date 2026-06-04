/**
 * Offline logo discovery — pokrenite: npm run logos:cache
 * Ne izvršava se pri svakom page request-u.
 */
import fs from "fs";
import path from "path";
import { brands } from "../src/lib/data/brands";
import type { LogoManifest } from "../src/types";

const ROOT = process.cwd();
const UPLOAD_DIR = path.join(ROOT, "public/logos");
const CACHE_DIR = path.join(ROOT, "public/logos/cache");
const MANIFEST_PATH = path.join(ROOT, "src/lib/data/logo-manifest.json");

const USER_AGENT =
  "BilbordBrands/1.0 (logo cache; +https://bilbordbrands.rs)";

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
  const m = tag.match(re);
  return m?.[1] ?? null;
}

function discoverCandidates(html: string, siteUrl: string): string[] {
  const origin = new URL(siteUrl).origin;
  const found: string[] = [];

  const linkTags = html.match(/<link[^>]+>/gi) ?? [];
  for (const tag of linkTags) {
    const rel = extractAttr(tag, "rel")?.toLowerCase() ?? "";
    const href = extractAttr(tag, "href");
    if (!href) continue;
    if (
      rel.includes("apple-touch-icon") ||
      rel.includes("icon") ||
      rel.includes("shortcut icon")
    ) {
      found.push(resolveUrl(href, siteUrl));
    }
  }

  const ogTags = html.match(/<meta[^>]+>/gi) ?? [];
  for (const tag of ogTags) {
    const prop =
      extractAttr(tag, "property")?.toLowerCase() ??
      extractAttr(tag, "name")?.toLowerCase() ??
      "";
    if (prop === "og:image") {
      const content = extractAttr(tag, "content");
      if (content) found.push(resolveUrl(content, siteUrl));
    }
  }

  const svgMatch = html.match(
    /<img[^>]+src=["']([^"']+\.svg)["'][^>]*>/i
  );
  if (svgMatch?.[1]) found.push(resolveUrl(svgMatch[1], siteUrl));

  found.push(`${origin}/apple-touch-icon.png`);
  found.push(`${origin}/apple-touch-icon-precomposed.png`);
  found.push(`${origin}/favicon.ico`);

  return [...new Set(found)];
}

async function fetchBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (type.includes("text/html")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 64) return null;
    return buf;
  } catch {
    return null;
  }
}

async function discoverFromWebsite(website: string): Promise<Buffer | null> {
  const pageRes = await fetch(website, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);

  const candidates: string[] = [];
  if (pageRes?.ok) {
    const html = await pageRes.text();
    candidates.push(...discoverCandidates(html, website));
  } else {
    try {
      const origin = new URL(website).origin;
      candidates.push(`${origin}/favicon.ico`);
    } catch {
      return null;
    }
  }

  for (const url of candidates) {
    const buf = await fetchBuffer(url);
    if (buf) return buf;
  }
  return null;
}

function scanUploads(manifest: LogoManifest) {
  if (!fs.existsSync(UPLOAD_DIR)) return;
  for (const file of fs.readdirSync(UPLOAD_DIR)) {
    if (!file.endsWith(".png") || file.startsWith(".")) continue;
    const slug = file.replace(/\.png$/i, "");
    if (slug === "bilbord-logo") continue;
    manifest[slug] = { path: `/logos/${file}`, source: "upload" };
  }
}

async function main() {
  ensureDir(CACHE_DIR);
  const manifest: LogoManifest = {};

  scanUploads(manifest);
  console.log(`Upload scan: ${Object.keys(manifest).length} logoa`);

  for (const brand of brands) {
    if (manifest[brand.slug]) {
      console.log(`  skip ${brand.slug} (upload)`);
      continue;
    }

    if (brand.logoUrl?.trim()) {
      const buf = await fetchBuffer(brand.logoUrl.trim());
      if (buf) {
        const out = path.join(CACHE_DIR, `${brand.slug}.png`);
        fs.writeFileSync(out, buf);
        manifest[brand.slug] = {
          path: `/logos/cache/${brand.slug}.png`,
          source: "url",
        };
        console.log(`  ok ${brand.slug} (logoUrl)`);
        continue;
      }
    }

    if (!brand.website) continue;

    const buf = await discoverFromWebsite(brand.website);
    if (buf) {
      const out = path.join(CACHE_DIR, `${brand.slug}.png`);
      fs.writeFileSync(out, buf);
      manifest[brand.slug] = {
        path: `/logos/cache/${brand.slug}.png`,
        source: "discovered",
      };
      console.log(`  ok ${brand.slug} (discovered)`);
    } else {
      console.log(`  -- ${brand.slug} (placeholder)`);
    }
  }

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nManifest: ${Object.keys(manifest).length} brendova sa logom`);
}

main();
