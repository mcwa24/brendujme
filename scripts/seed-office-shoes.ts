/**
 * Inkrementalni import Office Shoes brendova i prodavnica (bez brisanja ostalih podataka).
 * Zahteva: scrape:office → office-shoes-scraped.json + .env.local
 * npm run db:seed:office
 */

import fs from "fs";
import path from "path";
import type { OfficeShoesScraped } from "./scrape-office-shoes";
import { createSupabaseAdminClient } from "../src/lib/supabase/server";
import { isSupabaseSeedConfigured } from "../src/lib/supabase/env";
import { storagePaths } from "../src/lib/supabase/storage";

const SCRAPED = path.join(process.cwd(), "src/lib/data/office-shoes-scraped.json");
const RETAILER_SLUG = "office-shoes";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function storeSlug(name: string, citySlug: string, used: Set<string>): string {
  let base = `${RETAILER_SLUG}-${slugify(name)}-${citySlug}`.slice(0, 150);
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
    console.error("Nema scraped JSON. Prvo: npm run scrape:office");
    process.exit(1);
  }

  const scraped = JSON.parse(fs.readFileSync(SCRAPED, "utf8")) as OfficeShoesScraped;
  const supabase = createSupabaseAdminClient();
  if (!supabase) process.exit(1);
  const db = supabase;

  console.log(`Office Shoes import (${scraped.scrapedAt})…`);

  const categoryIds = await loadIdMap(db, "categories");
  let cityIds = await loadIdMap(db, "cities");
  const mallIds = await loadIdMap(db, "shopping_centers");
  let brandIds = await loadIdMap(db, "brands");
  let retailerIds = await loadIdMap(db, "retailers");

  const footwearCat =
    categoryIds.get("footwear") ?? categoryIds.get("fashion") ?? [...categoryIds.values()][0];
  if (!footwearCat) throw new Error("Nema kategorija u bazi");

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
      name: "Office Shoes",
      description:
        "Vodeća mreža prodavnica obuće u Srbiji — Timberland, Calvin Klein, New Balance, Dr. Martens, Skechers i 40+ brendova.",
      headquarters_city: "Beograd",
      headquarters_city_id: cityIds.get("beograd") ?? null,
      website: "https://www.officeshoes.rs",
      status: "published",
      logo_storage_path: storagePaths.retailerLogo(RETAILER_SLUG),
    },
    { onConflict: "slug" }
  );
  if (retErr) throw new Error(retErr.message);
  retailerIds = await loadIdMap(db, "retailers");
  const retailerId = retailerIds.get(RETAILER_SLUG);
  if (!retailerId) throw new Error("retailer office-shoes nije kreiran");

  console.log(`Brendovi (${scraped.brands.length})…`);
  let brandsCreated = 0;
  for (const b of scraped.brands) {
    if (brandIds.has(b.slug)) continue;

    const { error } = await db.from("brands").upsert(
      {
        slug: b.slug,
        name: b.name,
        category_id: footwearCat,
        description: `${b.name} dostupan u Office Shoes prodavnicama u Srbiji.`,
        short_description: `${b.name} u Office Shoes mreži.`,
        price_segment: "mid",
        status: "published",
        logo_url: b.logoUrl,
        logo_storage_path: storagePaths.brandLogo(b.slug),
        website: "https://www.officeshoes.rs",
      },
      { onConflict: "slug" }
    );
    if (error) console.warn(`  brand ${b.slug}:`, error.message);
    else brandsCreated += 1;
  }
  brandIds = await loadIdMap(db, "brands");
  console.log(`  novih brendova: ${brandsCreated}`);

  const { data: existingStores } = await db
    .from("store_locations")
    .select("slug")
    .eq("retailer_id", retailerId);
  const usedStoreSlugs = new Set((existingStores ?? []).map((s) => s.slug as string));

  console.log(`Prodavnice (${scraped.stores.length})…`);
  const storeIds: string[] = [];
  for (const store of scraped.stores) {
    const slug = storeSlug(store.name, store.citySlug, usedStoreSlugs);
    const cityId = cityIds.get(store.citySlug) ?? null;
    const mallId = store.shoppingCenterSlug
      ? mallIds.get(store.shoppingCenterSlug) ?? null
      : null;

    const row = {
      slug,
      retailer_id: retailerId,
      shopping_center_id: mallId,
      name: store.name,
      city: store.city,
      city_id: cityId,
      address: store.address,
      phone: store.phone,
      latitude: store.latitude,
      longitude: store.longitude,
      publish_status: "published",
      status: "open",
    };

    const { data, error } = await db
      .from("store_locations")
      .upsert(row, { onConflict: "slug" })
      .select("id")
      .single();

    if (error || !data) {
      console.warn(`  store ${slug}:`, error?.message);
      continue;
    }
    storeIds.push(data.id);
    console.log(`  ✓ ${store.name}`);
  }

  console.log("brand_retailers…");
  const uniqueBrandSlugs = [...new Set(scraped.brands.map((b) => b.slug))];
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
  const brandLocationRows: {
    brand_id: string;
    store_location_id: string;
    verified: boolean;
  }[] = [];

  const locationKeys = new Set<string>();
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

  console.log("\nGotovo.");
  console.log(`  brendova u Office: ${scraped.brands.length}`);
  console.log(`  prodavnica: ${storeIds.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
