/**
 * Pun seed mock podataka u produkcijsku šemu (UUID).
 * Zahteva: migracija 001_production_schema.sql + .env.local (SERVICE_ROLE)
 * npm run db:seed  (automatski pokreće data:prepare pre seed-a)
 */

import fs from "fs";
import path from "path";
import type { TikeScraped } from "./scrape-tike";
import { brands } from "../src/lib/data/brands";
import { categories } from "../src/lib/data/categories";
import { fashionCompanyStores } from "../src/lib/data/fashion-company";
import { bilbordSlugFromBrandName } from "../src/lib/data/ff-brand-slugs";
import {
  DEPRECATED_BRAND_SLUGS,
  DEPRECATED_RETAILER_SLUGS,
  isImportedRetailerSlug,
} from "../src/lib/data/imported-retailers";
import { newsArticles } from "../src/lib/data/news";
import { retailers } from "../src/lib/data/retailers";
import { shoppingCenters } from "../src/lib/data/shopping-centers";
import { shoppingCenterImages } from "../src/lib/data/shopping-center-images";
import { createSupabaseAdminClient } from "../src/lib/supabase/server";
import { storagePaths } from "../src/lib/supabase/storage";
import { isSupabaseSeedConfigured } from "../src/lib/supabase/env";
import { seedPromotionsFromScraped } from "./lib/seed-promotions";
import { loadScrapedBundles } from "./lib/seed-scraped-stores";

const retailersToSeed = retailers.filter((r) => isImportedRetailerSlug(r.slug));
const CITY_SLUG: Record<string, string> = {
  Beograd: "beograd",
  "Novi Beograd": "novi-beograd",
  "Novi Sad": "novi-sad",
  Niš: "nis",
  Kragujevac: "kragujevac",
  Zlatibor: "zlatibor",
};

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
  storeName: string,
  city: string,
  used: Set<string>
): string {
  let base = `${retailerSlug}-${slugify(storeName)}-${slugify(city)}`.slice(0, 150);
  let candidate = base;
  let n = 0;
  while (used.has(candidate)) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  used.add(candidate);
  return candidate;
}

function citySlugFromLabel(label: string): string {
  for (const [name, slug] of Object.entries(CITY_SLUG)) {
    if (label.includes(name)) return slug;
  }
  if (label.includes("NBG") || label.includes("Novi Beograd")) return "novi-beograd";
  if (label.includes("NS")) return "novi-sad";
  if (label.includes("NI")) return "nis";
  if (label.includes("KG")) return "kragujevac";
  return "beograd";
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

async function deleteAll(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  table: string,
  filterColumn: string
) {
  const { error } = await supabase.from(table).delete().not(filterColumn, "is", null);
  if (error) console.warn(`  clear ${table}:`, error.message);
}

async function unpublishDeprecated(
  db: NonNullable<ReturnType<typeof createSupabaseAdminClient>>
) {
  console.log("Arhiviranje uklonjenih partnera (home / tech / beauty)…");
  for (const slug of DEPRECATED_RETAILER_SLUGS) {
    const { error } = await db
      .from("retailers")
      .update({ status: "archived" })
      .eq("slug", slug);
    if (error) console.warn(`  retailer ${slug}:`, error.message);
  }
  for (const slug of DEPRECATED_BRAND_SLUGS) {
    const { error } = await db
      .from("brands")
      .update({ status: "archived" })
      .eq("slug", slug);
    if (error) console.warn(`  brand ${slug}:`, error.message);
  }
}

async function clearRelations(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>
) {
  await deleteAll(supabase, "article_brands", "article_id");
  await deleteAll(supabase, "article_retailers", "article_id");
  await deleteAll(supabase, "article_shopping_centers", "article_id");
  await deleteAll(supabase, "brand_locations", "brand_id");
  await deleteAll(supabase, "brand_retailers", "brand_id");
  await deleteAll(supabase, "brand_related", "brand_id");
  await deleteAll(supabase, "brand_shopping_center_presence", "brand_id");
  await deleteAll(supabase, "campaign_targets", "campaign_id");
  await deleteAll(supabase, "store_locations", "retailer_id");
  await deleteAll(supabase, "seo_metadata", "entity_id");
  await deleteAll(supabase, "articles", "slug");
  await deleteAll(supabase, "campaigns", "slug");
}

async function main() {
  if (!isSupabaseSeedConfigured()) {
    console.error("Postavi NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY u .env.local");
    process.exit(1);
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) process.exit(1);
  const db = supabase;

  const brandSlugs = new Set(brands.map((b) => b.slug));

  await unpublishDeprecated(db);

  console.log("Čišćenje relacija…");
  await clearRelations(db);

  console.log("Kategorije…");
  const { error: catErr } = await db.from("categories").upsert(
    categories.map((c, i) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      sort_order: i,
      status: "published",
    })),
    { onConflict: "slug" }
  );
  if (catErr) throw new Error(catErr.message);

  const scrapedBundles = loadScrapedBundles(
    path.join(process.cwd(), "src/lib/data")
  );

  const extraCities = [
    ...new Set([
      ...retailersToSeed.map((r) => r.city),
      ...shoppingCenters.map((s) => s.city),
      ...brands.flatMap((b) => b.locations.map((l) => l.city)),
      ...fashionCompanyStores.map((s) => s.cityLabel.split("(")[0].trim()),
      ...scrapedBundles.flatMap((b) => b.stores.map((s) => s.city)),
    ]),
  ];
  for (const name of extraCities) {
    const slug =
      CITY_SLUG[name] ??
      slugify(name);
    await db.from("cities").upsert(
      { name, slug, region: name },
      { onConflict: "slug" }
    );
  }

  const categoryIds = await loadIdMap(db, "categories");
  const cityIds = await loadIdMap(db, "cities");

  console.log(`Retaileri (${retailersToSeed.length})…`);
  const { error: retErr } = await db.from("retailers").upsert(
    retailersToSeed.map((r) => ({
      slug: r.slug,
      name: r.name,
      description: r.description,
      headquarters_city: r.city,
      headquarters_city_id: cityIds.get(CITY_SLUG[r.city] ?? slugify(r.city)) ?? null,
      status: "published",
      logo_storage_path: storagePaths.retailerLogo(r.slug),
    })),
    { onConflict: "slug" }
  );
  if (retErr) throw new Error(retErr.message);

  console.log("Tržni centri…");
  const { error: scErr } = await db.from("shopping_centers").upsert(
    shoppingCenters.map((sc) => {
      const img = shoppingCenterImages[sc.slug];
      const ext = img?.src.split(".").pop() ?? "png";
      return {
        slug: sc.slug,
        name: sc.name,
        city: sc.city,
        address: sc.address,
        latitude: sc.latitude ?? null,
        longitude: sc.longitude ?? null,
        city_id: cityIds.get(CITY_SLUG[sc.city] ?? slugify(sc.city)) ?? null,
        description: sc.description,
        short_description: sc.description.slice(0, 300),
        status: "published",
        logo_storage_path: img
          ? `shopping-centers/${sc.slug}.${ext}`
          : storagePaths.shoppingCenterLogo(sc.slug),
      };
    }),
    { onConflict: "slug" }
  );
  if (scErr) throw new Error(scErr.message);

  console.log(`Brendovi (${brands.length})…`);
  for (const brand of brands) {
    const categoryId = categoryIds.get(brand.category);
    if (!categoryId) {
      console.warn(`  preskačem ${brand.slug}: nepoznata kategorija ${brand.category}`);
      continue;
    }
    const { error } = await db.from("brands").upsert(
      {
        slug: brand.slug,
        name: brand.name,
        category_id: categoryId,
        country_of_origin: brand.country,
        website: brand.website,
        description: brand.description,
        short_description: brand.description.slice(0, 300),
        price_segment: brand.priceSegment,
        is_featured: brand.featured ?? false,
        is_popular: brand.popular ?? false,
        status: "published",
        logo_url: brand.logoUrl ?? null,
        logo_storage_path: storagePaths.brandLogo(brand.slug),
      },
      { onConflict: "slug" }
    );
    if (error) console.error(`  brand ${brand.slug}:`, error.message);
  }

  const tikeScrapedPath = path.join(process.cwd(), "src/lib/data/tike-scraped.json");
  if (fs.existsSync(tikeScrapedPath)) {
    const tikeData = JSON.parse(
      fs.readFileSync(tikeScrapedPath, "utf8")
    ) as TikeScraped;
    const sportsCat =
      categoryIds.get("sports") ??
      categoryIds.get("footwear") ??
      [...categoryIds.values()][0];
    console.log(`Tike brendovi iz scrape (${tikeData.brands.length})…`);
    let tikeNew = 0;
    for (const b of tikeData.brands) {
      if (!sportsCat) break;
      const { error } = await db.from("brands").upsert(
        {
          slug: b.slug,
          name: b.name,
          category_id: sportsCat,
          description: `${b.name} u ponudi Tike prodavnice (tike.rs).`,
          short_description: `${b.name} · Tike`,
          price_segment: "mid",
          status: "published",
          logo_url: b.logoUrl,
          logo_storage_path: storagePaths.brandLogo(b.slug),
          website: b.productUrl,
        },
        { onConflict: "slug", ignoreDuplicates: false }
      );
      if (!error) tikeNew += 1;
    }
    console.log(`  upsert Tike katalog: ${tikeNew} redova`);
  }

  const retailerIds = await loadIdMap(db, "retailers");
  const mallIds = await loadIdMap(db, "shopping_centers");
  const brandIds = await loadIdMap(db, "brands");

  console.log("Prodajna mesta…");
  const usedStoreSlugs = new Set<string>();
  const storeIdByKey = new Map<string, string>();

  function storeKey(
    retailerSlug: string,
    storeName: string,
    city: string,
    address: string
  ) {
    return `${retailerSlug}|${slugify(storeName)}|${slugify(city)}|${slugify(address)}`;
  }

  async function ensureStore(
    retailerSlug: string,
    storeName: string,
    city: string,
    address: string,
    mallSlug?: string | null
  ): Promise<string | null> {
    const retailerId = retailerIds.get(retailerSlug);
    if (!retailerId) return null;

    const key = storeKey(retailerSlug, storeName, city, address);
    const existing = storeIdByKey.get(key);
    if (existing) return existing;

    const slug = storeSlug(retailerSlug, storeName, city, usedStoreSlugs);
    const cityId = cityIds.get(CITY_SLUG[city] ?? slugify(city)) ?? null;
    const mallId = mallSlug ? mallIds.get(mallSlug) ?? null : null;

    const { data, error } = await db
      .from("store_locations")
      .upsert(
        {
          slug,
          retailer_id: retailerId,
          shopping_center_id: mallId,
          name: storeName,
          city,
          city_id: cityId,
          address,
          publish_status: "published",
          status: "open",
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (error || !data) {
      console.warn(`  store ${slug}:`, error?.message);
      return null;
    }
    storeIdByKey.set(key, data.id);
    return data.id;
  }

  function resolveCityName(cityLabel: string): string {
    for (const name of Object.keys(CITY_SLUG)) {
      if (cityLabel.includes(name)) return name;
    }
    if (cityLabel.includes("NBG")) return "Novi Beograd";
    if (cityLabel.includes("NS")) return "Novi Sad";
    if (cityLabel.includes("NI")) return "Niš";
    if (cityLabel.includes("KG")) return "Kragujevac";
    return "Beograd";
  }

  for (const brand of brands) {
    for (const loc of brand.locations) {
      const mallSlug =
        brand.shoppingCenterSlugs.find((ms) => {
          const label = ms.replace(/-/g, " ");
          return (
            loc.storeName.toLowerCase().includes(label) ||
            loc.address.toLowerCase().includes(label)
          );
        }) ?? null;
      await ensureStore(
        loc.retailerSlug,
        loc.storeName,
        loc.city,
        loc.address,
        mallSlug
      );
    }
  }

  for (const store of fashionCompanyStores) {
    const brandSlug =
      store.brandSlug ?? bilbordSlugFromBrandName(store.brandName);
    if (!brandSlug || !brandSlugs.has(brandSlug)) continue;

    await ensureStore(
      "fashion-company",
      store.storeName,
      resolveCityName(store.cityLabel),
      store.address,
      store.shoppingCenterSlug ?? null
    );
  }

  console.log("Prodajna mesta iz scraped JSON…");
  let scrapedStoreCount = 0;
  for (const bundle of scrapedBundles) {
    for (const store of bundle.stores) {
      if (!isImportedRetailerSlug(store.retailerSlug)) continue;
      const id = await ensureStore(
        store.retailerSlug,
        store.name,
        store.city,
        store.address,
        store.shoppingCenterSlug ?? null
      );
      if (id) scrapedStoreCount += 1;
    }
    console.log(`  ${bundle.file}: ${bundle.stores.length} redova`);
  }
  console.log(`  upsert-ovano scraped lokacija: ${scrapedStoreCount}`);

  console.log("brand_retailers…");
  const brandRetailerPairs = new Set<string>();
  const addBrandRetailer = (brandSlug: string, retailerSlug: string) => {
    if (!brandIds.has(brandSlug) || !retailerIds.has(retailerSlug)) return;
    brandRetailerPairs.add(`${brandSlug}:${retailerSlug}`);
  };

  for (const r of retailersToSeed) {
    for (const brandSlug of r.brandSlugs) addBrandRetailer(brandSlug, r.slug);
  }
  for (const bundle of scrapedBundles) {
    for (const store of bundle.stores) {
      if (store.brandSlug === store.retailerSlug) {
        addBrandRetailer(store.brandSlug, store.retailerSlug);
      }
    }
  }
  for (const brand of brands) {
    for (const loc of brand.locations) {
      if (loc.retailerSlug) addBrandRetailer(brand.slug, loc.retailerSlug);
    }
  }

  const brandRetailerRows = [...brandRetailerPairs].map((key) => {
    const [brandSlug, retailerSlug] = key.split(":");
    return {
      brand_id: brandIds.get(brandSlug)!,
      retailer_id: retailerIds.get(retailerSlug)!,
      verified: true,
    };
  });
  if (brandRetailerRows.length) {
    const { error } = await db.from("brand_retailers").upsert(brandRetailerRows, {
      onConflict: "brand_id,retailer_id",
    });
    if (error) console.error("brand_retailers:", error.message);
  }

  console.log("brand_locations…");
  const brandLocationRows: { brand_id: string; store_location_id: string; verified: boolean }[] =
    [];

  for (const brand of brands) {
    const brandId = brandIds.get(brand.slug);
    if (!brandId) continue;

    for (const loc of brand.locations) {
      const storeId =
        storeIdByKey.get(
          storeKey(loc.retailerSlug, loc.storeName, loc.city, loc.address)
        ) ??
        (await ensureStore(
          loc.retailerSlug,
          loc.storeName,
          loc.city,
          loc.address,
          null
        ));
      if (storeId) {
        brandLocationRows.push({
          brand_id: brandId,
          store_location_id: storeId,
          verified: true,
        });
      }
    }
  }

  for (const bundle of scrapedBundles) {
    for (const store of bundle.stores) {
      const brandId = brandIds.get(store.brandSlug);
      if (!brandId) continue;
      const storeId = storeIdByKey.get(
        storeKey(store.retailerSlug, store.name, store.city, store.address)
      );
      if (storeId) {
        brandLocationRows.push({
          brand_id: brandId,
          store_location_id: storeId,
          verified: true,
        });
      }
    }
  }

  for (const store of fashionCompanyStores) {
    const brandSlug =
      store.brandSlug ?? bilbordSlugFromBrandName(store.brandName);
    const brandId = brandSlug ? brandIds.get(brandSlug) : undefined;
    if (!brandId) continue;

    const storeId =
      storeIdByKey.get(
        storeKey(
          "fashion-company",
          store.storeName,
          resolveCityName(store.cityLabel),
          store.address
        )
      ) ??
      (await ensureStore(
        "fashion-company",
        store.storeName,
        resolveCityName(store.cityLabel),
        store.address,
        store.shoppingCenterSlug ?? null
      ));
    if (storeId) {
      brandLocationRows.push({
        brand_id: brandId,
        store_location_id: storeId,
        verified: true,
      });
    }
  }

  console.log("brand_locations iz brand_retailers × prodavnice…");
  const { data: allStores } = await db
    .from("store_locations")
    .select("id, retailer_id, retailers ( slug )");
  for (const key of brandRetailerPairs) {
    const [brandSlug, retailerSlug] = key.split(":");
    const brandId = brandIds.get(brandSlug);
    const retailerId = retailerIds.get(retailerSlug);
    if (!brandId || !retailerId) continue;
    for (const row of allStores ?? []) {
      if (row.retailer_id !== retailerId) continue;
      brandLocationRows.push({
        brand_id: brandId,
        store_location_id: row.id as string,
        verified: true,
      });
    }
  }

  const uniqueBrandLoc = new Map<string, (typeof brandLocationRows)[0]>();
  for (const row of brandLocationRows) {
    uniqueBrandLoc.set(`${row.brand_id}:${row.store_location_id}`, row);
  }
  if (uniqueBrandLoc.size) {
    const { error } = await db
      .from("brand_locations")
      .upsert([...uniqueBrandLoc.values()], {
        onConflict: "brand_id,store_location_id",
      });
    if (error) console.error("brand_locations:", error.message);
  }

  console.log("brand_related…");
  const relatedRows: { brand_id: string; related_brand_id: string; sort_order: number }[] =
    [];
  for (const brand of brands) {
    const brandId = brandIds.get(brand.slug);
    if (!brandId) continue;
    brand.relatedBrandSlugs.forEach((relatedSlug, i) => {
      const relatedId = brandIds.get(relatedSlug);
      if (relatedId) {
        relatedRows.push({
          brand_id: brandId,
          related_brand_id: relatedId,
          sort_order: i,
        });
      }
    });
  }
  if (relatedRows.length) {
    await db.from("brand_related").upsert(relatedRows, {
      onConflict: "brand_id,related_brand_id",
    });
  }

  console.log("brand_shopping_center_presence…");
  const presenceRows: {
    brand_id: string;
    shopping_center_id: string;
    store_count: number;
  }[] = [];
  for (const brand of brands) {
    const brandId = brandIds.get(brand.slug);
    if (!brandId) continue;
    for (const mallSlug of brand.shoppingCenterSlugs) {
      const mallId = mallIds.get(mallSlug);
      if (mallId) {
        presenceRows.push({
          brand_id: brandId,
          shopping_center_id: mallId,
          store_count: 1,
        });
      }
    }
  }
  for (const center of shoppingCenters) {
    const mallId = mallIds.get(center.slug);
    if (!mallId) continue;
    for (const brandSlug of center.brandSlugs) {
      const brandId = brandIds.get(brandSlug);
      if (!brandId) continue;
      const key = `${brandId}:${mallId}`;
      if (!presenceRows.some((r) => `${r.brand_id}:${r.shopping_center_id}` === key)) {
        presenceRows.push({
          brand_id: brandId,
          shopping_center_id: mallId,
          store_count: 1,
        });
      }
    }
  }
  if (presenceRows.length) {
    await db.from("brand_shopping_center_presence").upsert(presenceRows, {
      onConflict: "brand_id,shopping_center_id",
    });
  }

  console.log(`Vesti (${newsArticles.length})…`);

  for (const article of newsArticles) {
    const content = `<!-- news-category:${article.category} -->\n${article.content}`;
    const { data: row, error } = await db
      .from("articles")
      .upsert(
        {
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          content,
          published_at: `${article.publishedAt}T12:00:00Z`,
          status: "published",
          is_featured: article.featured ?? false,
          featured_image_storage_path: storagePaths.newsImage(article.slug),
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (error || !row) {
      console.error(`  article ${article.slug}:`, error?.message);
      continue;
    }

    if (article.brandSlugs?.length) {
      const links = article.brandSlugs
        .filter((s) => brandIds.has(s))
        .map((brandSlug) => ({
          article_id: row.id,
          brand_id: brandIds.get(brandSlug)!,
        }));
      if (links.length) {
        await db.from("article_brands").upsert(links, {
          onConflict: "article_id,brand_id",
        });
      }
    }
  }

  console.log("SEO metadata (uzorak)…");
  const seoRows: {
    entity_type: string;
    entity_id: string;
    meta_title: string;
    meta_description: string;
    canonical_path: string;
  }[] = [];

  for (const brand of brands.slice(0, 60)) {
    const id = brandIds.get(brand.slug);
    if (!id) continue;
    seoRows.push({
      entity_type: "brand",
      entity_id: id,
      meta_title: `${brand.name} | Bilbord Brands`,
      meta_description: brand.description.slice(0, 155),
      canonical_path: `/brands/${brand.slug}`,
    });
  }
  if (seoRows.length) {
    await db.from("seo_metadata").upsert(seoRows, {
      onConflict: "entity_type,entity_id",
    });
  }

  console.log("Akcije / kampanje…");
  const promoCount = await seedPromotionsFromScraped(db, retailerIds);
  console.log(`  upsert kampanja: ${promoCount}`);

  const { count: brandCount } = await db
    .from("brands")
    .select("*", { count: "exact", head: true });
  const { count: storeCount } = await db
    .from("store_locations")
    .select("*", { count: "exact", head: true });

  console.log(`Gotovo. Brendova: ${brandCount ?? "?"}, prodajnih mesta: ${storeCount ?? "?"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
