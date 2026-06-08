/**
 * Inkrementalni import Urban Shop brendova i prodavnica.
 * npm run scrape:urbanshop && npm run db:seed:urbanshop
 *
 * Novi prodavac: vidi .cursor/rules/new-retailer.mdc (uključujući RETAILER_PROMO_SOURCES).
 */

import fs from "fs";
import path from "path";
import type { UrbanShopScraped } from "./scrape-urban-shop";
import { createSupabaseAdminClient } from "../src/lib/supabase/server";
import { isSupabaseSeedConfigured } from "../src/lib/supabase/env";
import { getBrandCountry } from "../src/lib/data/brand-countries";
import { storagePaths } from "../src/lib/supabase/storage";

const SCRAPED = path.join(process.cwd(), "src/lib/data/urban-shop-scraped.json");
const RETAILER_SLUG = "urban-shop";

function storeSlug(
  urbanPath: string,
  citySlug: string,
  used: Set<string>
): string {
  const base = `${RETAILER_SLUG}-${urbanPath}-${citySlug}`.slice(0, 150);
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
    console.error("Nema urban-shop-scraped.json. Prvo: npm run scrape:urbanshop");
    process.exit(1);
  }

  const scraped = JSON.parse(fs.readFileSync(SCRAPED, "utf8")) as UrbanShopScraped;
  const supabase = createSupabaseAdminClient();
  if (!supabase) process.exit(1);
  const db = supabase;

  console.log(`Urban Shop import (${scraped.scrapedAt})…`);

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
        "Urban i streetwear prodavnica — Fred Perry, Dr. Martens, Superdry, Salomon i dr. u Beogradu i Novom Sadu, plus online shop na urbanshop.rs.",
      headquarters_city: "Beograd",
      headquarters_city_id: cityIds.get("beograd") ?? null,
      website: "https://www.urbanshop.rs/",
      status: "published",
      logo_storage_path: storagePaths.retailerLogo(RETAILER_SLUG),
    },
    { onConflict: "slug" }
  );
  if (retErr) throw new Error(retErr.message);
  retailerIds = await loadIdMap(db, "retailers");
  const retailerId = retailerIds.get(RETAILER_SLUG);
  if (!retailerId) throw new Error("retailer urban-shop nije kreiran");

  console.log(`Brendovi (${scraped.brands.length})…`);
  let brandsCreated = 0;
  let brandsSkipped = 0;

  for (const b of scraped.brands) {
    if (brandIds.has(b.slug)) {
      brandsSkipped += 1;
      continue;
    }

    const { error } = await db.from("brands").upsert(
      {
        slug: b.slug,
        name: b.name,
        category_id: fashionCat,
        country_of_origin: getBrandCountry(b.slug) ?? null,
        description: `${b.name} dostupan u Urban Shop prodavnicama i online shopu.`,
        short_description: `${b.name} u Urban Shop ponudi.`,
        price_segment: "mid",
        status: "published",
        logo_url: b.logoUrl,
        logo_storage_path: storagePaths.brandLogo(b.slug),
        website: b.productUrl,
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
          name: store.name,
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
      console.warn(`  ✗ ${store.name}:`, error?.message);
      continue;
    }
    storeIds.push(data.id);
    console.log(`  ✓ ${store.name}`);
  }

  const uniqueBrandSlugs = [...new Set(scraped.brands.map((b) => b.slug))];

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

  console.log("brand_locations…");
  const locationKeys = new Set<string>();
  const brandLocationRows: {
    brand_id: string;
    store_location_id: string;
    verified: boolean;
  }[] = [];

  for (const brandSlug of uniqueBrandSlugs) {
    const brandId = brandIds.get(brandSlug);
    if (!brandId) continue;
    for (const storeId of storeIds) {
      const key = `${brandId}:${storeId}`;
      if (locationKeys.has(key)) continue;
      locationKeys.add(key);
      brandLocationRows.push({
        brand_id: brandId,
        store_location_id: storeId,
        verified: true,
      });
    }
  }

  if (brandLocationRows.length) {
    const { error } = await db.from("brand_locations").upsert(brandLocationRows, {
      onConflict: "brand_id,store_location_id",
    });
    if (error) console.error("brand_locations:", error.message);
  }

  console.log("Uklanjanje brendova koji više nisu u ponudi…");
  const keptSlugs = new Set(uniqueBrandSlugs);
  const { data: currentLinks } = await db
    .from("brand_retailers")
    .select("brand_id, brands!inner(slug)")
    .eq("retailer_id", retailerId);

  const removedBrandIds: string[] = [];
  for (const row of currentLinks ?? []) {
    const slug = (row.brands as { slug: string })?.slug;
    if (slug && !keptSlugs.has(slug)) {
      removedBrandIds.push(row.brand_id as string);
    }
  }

  if (removedBrandIds.length) {
    await db
      .from("brand_retailers")
      .delete()
      .eq("retailer_id", retailerId)
      .in("brand_id", removedBrandIds);

    if (storeIds.length) {
      await db
        .from("brand_locations")
        .delete()
        .in("brand_id", removedBrandIds)
        .in("store_location_id", storeIds);
    }

    for (const brandId of removedBrandIds) {
      const { count } = await db
        .from("brand_retailers")
        .select("brand_id", { count: "exact", head: true })
        .eq("brand_id", brandId);
      if (count === 0) {
        const slug = [...brandIds.entries()].find(([, id]) => id === brandId)?.[0];
        await db.from("brands").update({ status: "draft" }).eq("id", brandId);
        if (slug) console.log(`  uklonjen: ${slug}`);
      }
    }
  }

  console.log("\nGotovo.");
  console.log(`  brenda: ${uniqueBrandSlugs.length}`);
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
