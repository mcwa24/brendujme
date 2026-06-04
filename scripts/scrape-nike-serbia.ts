/**
 * Nike prodavnice u Srbiji — https://www.nike.com/retail/directory/serbia
 * Izvor: api.nike.com/store/store_locations/v1 (address.country==SRB, bez Kosova)
 * npm run scrape:nike
 */

import fs from "fs";
import path from "path";

const SOURCE_URL = "https://www.nike.com/retail/directory/serbia";
const API =
  "https://api.nike.com/store/store_locations/v1?search=(address.country==SRB)&pageSize=50";
const OUT = path.join(process.cwd(), "src/lib/data/nike-serbia-scraped.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export interface NikeStoreScraped {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  citySlug: string;
  state: string;
  postalCode: string;
  phone: string | null;
  email: string | null;
  partnerName: string | null;
  storeConcept: string | null;
  shoppingCenterSlug: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  nikeUrl: string | null;
}

export interface NikeSerbiaScraped {
  scrapedAt: string;
  sourceUrl: string;
  brandSlug: string;
  brandName: string;
  retailerSlug: string;
  retailerName: string;
  stores: NikeStoreScraped[];
}

const MALL_PATTERNS: { pattern: RegExp; slug: string }[] = [
  { pattern: /u[sš][cć]e/i, slug: "usce" },
  { pattern: /promenada/i, slug: "promenada" },
  { pattern: /galerija/i, slug: "galerija" },
  { pattern: /ada mall/i, slug: "galerija" },
  { pattern: /delta planet/i, slug: "delta-city" },
  { pattern: /big fashion/i, slug: "kragujevac-plaza" },
  { pattern: /ava retail/i, slug: "big-fashion" },
];

interface NikeApiStore {
  id: string;
  slug: string;
  name: string;
  phone?: string;
  email?: string;
  partnerName?: string;
  storeConcept?: string;
  imageUrl?: string;
  coordinates?: { latitude?: number; longitude?: number };
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cityLabel(city: string): { city: string; citySlug: string } {
  const c = city.trim();
  const lower = c.toLowerCase();
  if (lower === "belgrade" || lower === "beograd") {
    return { city: "Beograd", citySlug: "beograd" };
  }
  if (lower === "novi sad") return { city: "Novi Sad", citySlug: "novi-sad" };
  if (lower === "nis" || lower === "niš") return { city: "Niš", citySlug: "nis" };
  if (lower === "kragujevac") return { city: "Kragujevac", citySlug: "kragujevac" };
  if (lower === "indija" || lower === "inđija") {
    return { city: "Inđija", citySlug: "indjija" };
  }
  return { city: c, citySlug: slugify(c) };
}

function inferMall(name: string): string | null {
  for (const { pattern, slug } of MALL_PATTERNS) {
    if (pattern.test(name)) return slug;
  }
  return null;
}

function isSerbiaProper(store: NikeApiStore): boolean {
  const state = store.address?.state?.toLowerCase() ?? "";
  return state !== "kosovo";
}

function mapStore(raw: NikeApiStore): NikeStoreScraped {
  const addr = raw.address ?? {};
  const address = [addr.address1, addr.address2].filter(Boolean).join(", ");
  const { city, citySlug } = cityLabel(addr.city ?? "Beograd");

  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    address,
    city,
    citySlug,
    state: addr.state ?? "",
    postalCode: addr.postalCode ?? "",
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    partnerName: raw.partnerName ?? null,
    storeConcept: raw.storeConcept ?? null,
    shoppingCenterSlug: inferMall(raw.name),
    latitude: raw.coordinates?.latitude ?? null,
    longitude: raw.coordinates?.longitude ?? null,
    imageUrl: raw.imageUrl ?? null,
    nikeUrl: `https://www.nike.com/retail/s/${raw.slug}`,
  };
}

async function main() {
  const res = await fetch(API, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Nike API ${res.status}`);

  const data = (await res.json()) as { objects?: NikeApiStore[] };
  const serbiaStores = (data.objects ?? []).filter(isSerbiaProper).map(mapStore);

  serbiaStores.sort((a, b) => a.name.localeCompare(b.name, "sr"));

  const payload: NikeSerbiaScraped = {
    scrapedAt: new Date().toISOString(),
    sourceUrl: SOURCE_URL,
    brandSlug: "nike",
    brandName: "Nike",
    retailerSlug: "sport-time",
    retailerName: "Sport Time",
    stores: serbiaStores,
  };

  fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Sačuvano ${serbiaStores.length} prodavnica → ${OUT}`);
  for (const s of serbiaStores) {
    console.log(`  ✓ ${s.name} (${s.city})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
