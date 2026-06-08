/**
 * Inkrementalni import N Sport brendova i prodavnica.
 * npm run scrape:nsport && npm run db:seed:nsport
 */

import fs from "fs";
import path from "path";
import type { NSportScraped } from "./scrape-n-sport";
import { createSupabaseAdminClient } from "../src/lib/supabase/server";
import { isSupabaseSeedConfigured } from "../src/lib/supabase/env";
import { brands as staticBrands } from "../src/lib/data/brands";
import { getBrandCountry } from "../src/lib/data/brand-countries";
import { filterModniScrapedEntries } from "../src/lib/data/modni-retailer-brands";
import { storagePaths } from "../src/lib/supabase/storage";

const SCRAPED = path.join(process.cwd(), "src/lib/data/n-sport-scraped.json");
const RETAILER_SLUG = "n-sport";

function storeSlug(
  nsPath: string,
  citySlug: string,
  used: Set<string>
): string {
  const base = `${RETAILER_SLUG}-${nsPath}-${citySlug}`.slice(0, 150);
  let candidate = base;
  let n = 0;
  while (used.has(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  used.add(candidate);
  return candidate;
}

type IdMap = Map<string, string>;

async function loadIdMap(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  table: string
): Promise<IdMap> {
  const { data, error } = await supabase.from(table).select("id, slug");
  if (error) throw new Error(`${table}: ${error.message}`);
  return new Map((data ?? []).map((r) => [r.slug as string, r.id as string]));
}

async function main() {
  if (!isSupabaseSeedConfigured()) {
    console.error("Postavi NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY u .env.local");
    process.exit(1);
  }
  if (!fs.existsSync(SCRAPED)) {
    console.error("Nema n-sport-scraped.json. Prvo: npm run scrape:nsport");
    process.exit(1);
  }

  const scraped = JSON.parse(fs.readFileSync(SCRAPED, "utf8")) as NSportScraped;
  const supabase = createSupabaseAdminClient();
  if (!supabase) process.exit(1);
  const db = supabase;

  const catalogBySlug = new Map(staticBrands.map((b) => [b.slug, b]));
  const modniBrands = filterModniScrapedEntries(
    scraped.brands.map((b) => ({
      slug: b.slug,
      name: b.name,
      logoUrl: b.logoUrl,
      productUrl: b.productUrl,
    })),
    RETAILER_SLUG,
    catalogBySlug
  );

  console.log(`N Sport import (${scraped.scrapedAt})…`);
  console.log(`  modni brendovi: ${modniBrands.length} / ${scraped.brands.length} sa sajta`);

  const categoryIds = await loadIdMap(db, "categories");
  let cityIds = await loadIdMap(db, "cities");
  let brandIds = await loadIdMap(db, "brands");
  let retailerIds = await loadIdMap(db, "retailers");

  const fashionCat =
    categoryIds.get("fashion") ??
    categoryIds.get("footwear") ??
    categoryIds.get("sports") ??
    [...categoryIds.values()][0];
  if (!fashionCat) throw new Error("Nema kategorija u bazi");

  for (const { citySlug, city } of [
    ...new Set(scraped.stores.map((s) => `${s.citySlug}|${s.city}`)),
  ].map((k) => {
    const [citySlug, city] = k.split("|");
    return { citySlug, city };
  })) {
    await db.from("cities").upsert(
      { slug: citySlug, name: city, region: city },
      { onConflict: "slug" }
    );
  }
  cityIds = await loadIdMap(db, "cities");

  const { error: retErr } = await db.from("retailers").upsert(
    {
      slug: RETAILER_SLUG,
      name: scraped.retailerName,
      description:
        "Najveća mreža sportskih i modnih prodavnica u Srbiji — Nike, Puma, Adidas, Timberland, Tommy Hilfiger i dr. u 100+ lokacija i na n-sport.net.",
      headquarters_city: "Beograd",
      headquarters_city_id: cityIds.get("beograd") ?? null,
      website: "https://www.n-sport.net/",
      status: "published",
      logo_storage_path: storagePaths.retailerLogo(RETAILER_SLUG),
    },
    { onConflict: "slug" }
  );
  if (retErr) throw new Error(retErr.message);
  retailerIds = await loadIdMap(db, "retailers");
  const retailerId = retailerIds.get(RETAILER_SLUG);
  if (!retailerId) throw new Error("retailer n-sport nije kreiran");

  console.log(`Brendovi (${modniBrands.length})…`);
  let brandsCreated = 0;
  let brandsSkipped = 0;

  for (const b of modniBrands) {
    if (brandIds.has(b.slug)) {
      brandsSkipped += 1;
      continue;
    }

    const scrapedBrand = scraped.brands.find((x) => x.slug === b.slug);
    const { error } = await db.from("brands").upsert(
      {
        slug: b.slug,
        name: b.name,
        category_id: fashionCat,
        country_of_origin: getBrandCountry(b.slug) ?? null,
        description: `${b.name} dostupan u N Sport prodavnicama i online shopu.`,
        short_description: `${b.name} u N Sport ponudi.`,
        price_segment: "mid",
        status: "published",
        logo_url: scrapedBrand?.logoUrl ?? null,
        logo_storage_path: storagePaths.brandLogo(b.slug),
        website: scrapedBrand?.productUrl ?? null,
      },
      { onConflict: "slug" }
    );
    if (error) console.warn(`  brand ${b.slug}:`, error.message);
    else brandsCreated += 1;
  }
  brandIds = await loadIdMap(db, "brands");
  console.log(`  novih: ${brandsCreated}, postojećih: ${brandsSkipped}`);

  const { data: existingStores } = await db
    .from("store_locations")
    .select("slug")
    .eq("retailer_id", retailerId);
  const usedStoreSlugs = new Set((existingStores ?? []).map((s) => s.slug as string));

  console.log(`Radnje (${scraped.stores.length})…`);
  const storeIds: string[] = [];

  for (const store of scraped.stores) {
    const slug = storeSlug(store.path, store.citySlug, usedStoreSlugs);
    const cityId = cityIds.get(store.citySlug) ?? null;

    const { data, error } = await db
      .from("store_locations")
      .upsert(
        {
          slug,
          retailer_id: retailerId,
          shopping_center_id: null,
          name: `${store.name} — ${store.city}`,
          city: store.city,
          city_id: cityId,
          address: store.address,
          phone: store.phone,
          latitude: store.latitude,
          longitude: store.longitude,
          publish_status: "published",
          status: "open",
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (error || !data) {
      console.warn(`  ✗ ${store.city}:`, error?.message);
      continue;
    }
    storeIds.push(data.id);
  }
  console.log(`  upisano: ${storeIds.length} radnji`);

  const uniqueBrandSlugs = [...new Set(modniBrands.map((b) => b.slug))];

  console.log("brand_retailers…");
  const brandRetailerRows = uniqueBrandSlugs
    .map((slug) => brandIds.get(slug))
    .filter((id): id is string => Boolean(id))
    .map((brand_id) => ({
      brand_id,
      retailer_id: retailerId,
      verified: true,
    }));

  if (brandRetailerRows.length) {
    const { error } = await db.from("brand_retailers").upsert(brandRetailerRows, {
      onConflict: "brand_id,retailer_id",
    });
    if (error) console.error("brand_retailers:", error.message);
  }

  console.log("\nGotovo.");
  console.log(`  modnih brendova: ${uniqueBrandSlugs.length}`);
  console.log(`  radnji: ${storeIds.length}`);

  console.log("\nOsvežavanje katalog keša…");
  try {
    const { execSync } = await import("child_process");
    execSync("npx tsx scripts/revalidate-catalog.ts", {
      stdio: "inherit",
      cwd: process.cwd(),
    });
  } catch {
    console.warn(
      "  ⚠ Revalidacija nije uspela — restartuj dev server ili pokreni: npx tsx scripts/revalidate-catalog.ts"
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
