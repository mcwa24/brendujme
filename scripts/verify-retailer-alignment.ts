/**
 * Provera usklađenosti prodavaca — katalog, sajt, cron akcija.
 * npx tsx scripts/verify-retailer-alignment.ts
 */

import { brands } from "../src/lib/data/brands";
import { RETAILER_OFFERING_FOCUS } from "../src/lib/data/brand-offerings";
import { fashionCompanyRetailer } from "../src/lib/data/fashion-company";
import {
  IMPORTED_RETAILER_SLUGS,
  DEPRECATED_RETAILER_SLUGS,
} from "../src/lib/data/imported-retailers";
import { uniqueModniCatalogBrandSlugs } from "../src/lib/data/modni-retailer-brands";
import {
  getScrapedBrandsForRetailer,
  getScrapedRetailerSlugs,
} from "../src/lib/data/retailer-scraped-brands";
import {
  getRetailerCatalogMeta,
  getRetailerCatalogMetaSlugs,
} from "../src/lib/data/retailer-catalog-meta";
import { retailerLogoImages } from "../src/lib/data/retailer-logo-images";
import { RETAILER_PROMO_SOURCES } from "../src/lib/data/retailer-promo-sources";
import { getStaticRetailerStoreSlugs } from "../src/lib/data/retailer-stores-static";
import { retailers } from "../src/lib/data/retailers";

const catalog = new Map(brands.map((b) => [b.slug, b]));
const allRetailers = [...retailers, fashionCompanyRetailer];

let errors = 0;

function fail(msg: string) {
  console.error(`✗ ${msg}`);
  errors += 1;
}

function ok(msg: string) {
  console.log(`✓ ${msg}`);
}

console.log("=== Slug pokrivenost ===\n");

const retailerSlugs = new Set(allRetailers.map((r) => r.slug));
for (const slug of IMPORTED_RETAILER_SLUGS) {
  if (!retailerSlugs.has(slug)) fail(`IMPORTED ${slug} nema u static retailers`);
  else ok(`${slug} u static catalog`);
}

for (const slug of DEPRECATED_RETAILER_SLUGS) {
  if (retailerSlugs.has(slug)) fail(`Deprecated ${slug} još u static catalog`);
}

console.log("\n=== brandCount = Bilbord katalog ===\n");

for (const r of allRetailers) {
  const scraped = getScrapedBrandsForRetailer(r.slug);
  const expectedSlugs = scraped?.length
    ? uniqueModniCatalogBrandSlugs(r.slug, catalog)
    : r.brandSlugs.filter((s) => catalog.has(s));

  if (r.brandCount !== expectedSlugs.length) {
    fail(`${r.slug}: brandCount ${r.brandCount} ≠ katalog ${expectedSlugs.length}`);
  } else if (r.brandSlugs.length !== expectedSlugs.length) {
    fail(`${r.slug}: brandSlugs ${r.brandSlugs.length} ≠ katalog ${expectedSlugs.length}`);
  } else {
    ok(`${r.slug}: ${r.brandCount} modnih brendova u katalogu`);
  }
}

console.log("\n=== Site integracija (scraped prodavci) ===\n");

const promoSlugs = new Set(RETAILER_PROMO_SOURCES.map((s) => s.retailerSlug));
const catalogMetaSlugs = new Set(getRetailerCatalogMetaSlugs());
const staticStoreSlugs = new Set(getStaticRetailerStoreSlugs());
const importedSet = new Set<string>(IMPORTED_RETAILER_SLUGS);

for (const slug of getScrapedRetailerSlugs()) {
  if (!importedSet.has(slug)) {
    fail(`${slug} u scrape ali nije u IMPORTED_RETAILER_SLUGS`);
    continue;
  }
  if (!retailerSlugs.has(slug)) {
    fail(`${slug} nema u static retailers`);
    continue;
  }
  if (!catalogMetaSlugs.has(slug)) {
    fail(`${slug} nema u retailer-catalog-meta.ts`);
    continue;
  }
  if (!RETAILER_OFFERING_FOCUS[slug]) {
    fail(`${slug} nema u brand-offerings RETAILER_OFFERING_FOCUS`);
    continue;
  }
  if (!retailerLogoImages[slug]) {
    fail(`${slug} nema u retailer-logo-images.ts`);
    continue;
  }
  if (!promoSlugs.has(slug)) {
    fail(`${slug} nije u RETAILER_PROMO_SOURCES (cron akcija)`);
    continue;
  }

  const storeCount = getRetailerCatalogMeta(slug)?.storeCount ?? 0;
  if (storeCount > 0 && !staticStoreSlugs.has(slug)) {
    fail(`${slug} ima ${storeCount} radnji ali nema u retailer-stores-static.ts`);
    continue;
  }

  ok(`${slug} integrisan na sajtu`);
}

console.log("\n=== Cron akcija (RETAILER_PROMO_SOURCES) ===\n");

for (const slug of IMPORTED_RETAILER_SLUGS) {
  const scraped = getScrapedBrandsForRetailer(slug);
  if (!scraped?.length) continue;
  if (!promoSlugs.has(slug)) {
    fail(`${slug} ima scrape katalog ali nije u RETAILER_PROMO_SOURCES`);
  } else {
    ok(`${slug} u dnevnoj detekciji akcija`);
  }
}

console.log(`\n=== Rezultat: ${errors} grešaka ===`);
process.exit(errors > 0 ? 1 : 0);
