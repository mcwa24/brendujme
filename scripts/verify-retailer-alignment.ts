/**
 * Provera usklađenosti prodavaca — brojevi = samo brendovi u Bilbord katalogu.
 * npx tsx scripts/verify-retailer-alignment.ts
 */

import { brands } from "../src/lib/data/brands";
import { fashionCompanyRetailer } from "../src/lib/data/fashion-company";
import { IMPORTED_RETAILER_SLUGS, DEPRECATED_RETAILER_SLUGS } from "../src/lib/data/imported-retailers";
import { uniqueModniCatalogBrandSlugs } from "../src/lib/data/modni-retailer-brands";
import { getScrapedBrandsForRetailer } from "../src/lib/data/retailer-scraped-brands";
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

console.log(`\n=== Rezultat: ${errors} grešaka ===`);
process.exit(errors > 0 ? 1 : 0);
