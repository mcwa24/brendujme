/**
 * Inkrementalni import Nike prodavnica u Srbiji (brend nike već postoji).
 * npm run scrape:nike && npm run db:seed:nike
 */

import fs from "fs";
import path from "path";
import type { NikeSerbiaScraped } from "./scrape-nike-serbia";
import { createSupabaseAdminClient } from "../src/lib/supabase/server";
import { isSupabaseSeedConfigured } from "../src/lib/supabase/env";
import { storagePaths } from "../src/lib/supabase/storage";

const SCRAPED = path.join(process.cwd(), "src/lib/data/nike-serbia-scraped.json");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function storeSlug(
  retailerSlug: string,
  nikeSlug: string,
  citySlug: string,
  used: Set<string>
): string {
  let base = `${retailerSlug}-${nikeSlug}-${citySlug}`.slice(0, 150);
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
    console.error("Nema nike-serbia-scraped.json. Prvo: npm run scrape:nike");
    process.exit(1);
  }

  const scraped = JSON.parse(fs.readFileSync(SCRAPED, "utf8")) as NikeSerbiaScraped;
  const supabase = createSupabaseAdminClient();
  if (!supabase) process.exit(1);
  const db = supabase;

  const { brandSlug, retailerSlug, retailerName } = scraped;
  console.log(`Nike Srbija import (${scraped.scrapedAt})…`);

  let cityIds = await loadIdMap(db, "cities");
  const mallIds = await loadIdMap(db, "shopping_centers");
  const brandIds = await loadIdMap(db, "brands");
  let retailerIds = await loadIdMap(db, "retailers");

  const brandId = brandIds.get(brandSlug);
  if (!brandId) {
    console.error(
      `Brend "${brandSlug}" nije u bazi. Pokreni npm run db:seed pre Nike importa.`
    );
    process.exit(1);
  }
  console.log(`  brend: ${brandSlug} (postojeći)`);

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
      slug: retailerSlug,
      name: retailerName,
      description:
        "Ovlašćeni Nike partner u Srbiji — zvanične Nike prodavnice prema nike.com/retail/directory/serbia.",
      headquarters_city: "Beograd",
      headquarters_city_id: cityIds.get("beograd") ?? null,
      website: "https://www.nike.com/retail/directory/serbia",
      status: "published",
      logo_storage_path: storagePaths.retailerLogo(retailerSlug),
    },
    { onConflict: "slug" }
  );
  if (retErr) throw new Error(retErr.message);
  retailerIds = await loadIdMap(db, "retailers");
  const retailerId = retailerIds.get(retailerSlug);
  if (!retailerId) throw new Error(`retailer ${retailerSlug} nije kreiran`);

  const { data: existingStores } = await db
    .from("store_locations")
    .select("slug")
    .eq("retailer_id", retailerId);
  const usedStoreSlugs = new Set((existingStores ?? []).map((s) => s.slug as string));

  console.log(`Prodavnice (${scraped.stores.length})…`);
  const storeIds: string[] = [];

  for (const store of scraped.stores) {
    const slug = storeSlug(retailerSlug, store.slug, store.citySlug, usedStoreSlugs);
    const cityId = cityIds.get(store.citySlug) ?? null;
    const mallId = store.shoppingCenterSlug
      ? mallIds.get(store.shoppingCenterSlug) ?? null
      : null;

    const { data, error } = await db
      .from("store_locations")
      .upsert(
        {
          slug,
          retailer_id: retailerId,
          shopping_center_id: mallId,
          name: store.name.replace(/\s*\(Partnered\)\s*/i, "").trim(),
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

  const { error: brErr } = await db.from("brand_retailers").upsert(
    {
      brand_id: brandId,
      retailer_id: retailerId,
      verified: true,
    },
    { onConflict: "brand_id,retailer_id" }
  );
  if (brErr) console.error("brand_retailers:", brErr.message);

  const locationKeys = new Set<string>();
  const brandLocationRows: {
    brand_id: string;
    store_location_id: string;
    verified: boolean;
  }[] = [];

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

  if (brandLocationRows.length) {
    const { error } = await db.from("brand_locations").upsert(brandLocationRows, {
      onConflict: "brand_id,store_location_id",
    });
    if (error) console.error("brand_locations:", error.message);
  }

  console.log("\nGotovo.");
  console.log(`  Nike lokacija: ${storeIds.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
