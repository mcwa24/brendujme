/**
 * Učitava postojeće mock podatke u Supabase.
 * 1. Pokreni SQL: supabase/migrations/001_initial_schema.sql
 * 2. .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 3. npm run db:seed
 */

import { brands } from "../src/lib/data/brands";
import { categories } from "../src/lib/data/categories";
import { fashionCompanyStores } from "../src/lib/data/fashion-company";
import { bilbordSlugFromBrandName } from "../src/lib/data/ff-brand-slugs";
import { newsArticles } from "../src/lib/data/news";
import { retailers } from "../src/lib/data/retailers";
import { shoppingCenters } from "../src/lib/data/shopping-centers";
import { shoppingCenterImages } from "../src/lib/data/shopping-center-images";
import { createSupabaseAdminClient } from "../src/lib/supabase/server";
import { storagePaths } from "../src/lib/supabase/storage";
import { isSupabaseSeedConfigured } from "../src/lib/supabase/env";

const PRODUCT_SEGMENTS = [
  { slug: "obuca", name: "Obuća", category_slug: "fashion", sort_order: 1 },
  { slug: "odeca", name: "Odeća", category_slug: "fashion", sort_order: 2 },
  { slug: "aksesoari", name: "Aksesoari", category_slug: "fashion", sort_order: 3 },
  { slug: "denim", name: "Denim", category_slug: "fashion", sort_order: 4 },
  { slug: "kozmetika", name: "Kozmetika", category_slug: "beauty", sort_order: 5 },
  { slug: "sportska-oprema", name: "Sportska oprema", category_slug: "sports", sort_order: 6 },
];

const FOOTWEAR_SLUGS = new Set([
  "timberland",
  "camper",
  "steve-madden",
  "premiata",
  "dekker",
  "flower-mountain",
  "bata",
  "new-balance",
  "mou",
  "ugg",
  "levis",
]);

async function main() {
  if (!isSupabaseSeedConfigured()) {
    console.error(
      "Postavi NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY u .env.local"
    );
    process.exit(1);
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) process.exit(1);

  console.log("Seeding categories…");
  await supabase.from("categories").upsert(
    categories.map((c, i) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      sort_order: i,
    }))
  );

  console.log("Seeding product_segments…");
  await supabase.from("product_segments").upsert(PRODUCT_SEGMENTS);

  console.log("Seeding retailers…");
  await supabase.from("retailers").upsert(
    retailers.map((r) => ({
      slug: r.slug,
      name: r.name,
      description: r.description,
      city: r.city,
      brand_count: r.brandCount,
      logo_storage_path: storagePaths.retailerLogo(r.slug),
    }))
  );

  console.log("Seeding shopping_centers…");
  await supabase.from("shopping_centers").upsert(
    shoppingCenters.map((sc) => ({
      slug: sc.slug,
      name: sc.name,
      city: sc.city,
      brand_count: sc.brandCount,
      description: sc.description,
      logo_storage_path: shoppingCenterImages[sc.slug]
        ? `shopping-centers/${sc.slug}.${shoppingCenterImages[sc.slug].src.split(".").pop()}`
        : storagePaths.shoppingCenterLogo(sc.slug),
    }))
  );

  console.log(`Seeding ${brands.length} brands…`);
  for (const brand of brands) {
    const { error } = await supabase.from("brands").upsert({
      slug: brand.slug,
      name: brand.name,
      category_slug: brand.category,
      country: brand.country,
      website: brand.website,
      description: brand.description,
      price_segment: brand.priceSegment,
      availability_count: brand.availabilityCount,
      featured: brand.featured ?? false,
      popular: brand.popular ?? false,
      logo_url: brand.logoUrl ?? null,
      logo_storage_path: storagePaths.brandLogo(brand.slug),
    });
    if (error) console.error(`  brand ${brand.slug}:`, error.message);
  }

  console.log("Seeding brand relations…");
  const locationRows = brands.flatMap((brand) =>
    brand.locations.map((loc, i) => ({
      brand_slug: brand.slug,
      store_name: loc.storeName,
      retailer_slug: loc.retailerSlug || null,
      address: loc.address,
      city: loc.city,
      sort_order: i,
    }))
  );
  await supabase
    .from("brand_locations")
    .delete()
    .in("brand_slug", brands.map((b) => b.slug));
  const { error: locErr } = await supabase.from("brand_locations").insert(locationRows);
  if (locErr) console.error("brand_locations:", locErr.message);

  const centerRows = brands.flatMap((brand) =>
    brand.shoppingCenterSlugs.map((shopping_center_slug) => ({
      brand_slug: brand.slug,
      shopping_center_slug,
    }))
  );
  await supabase.from("brand_shopping_centers").upsert(centerRows);

  const relatedRows = brands.flatMap((brand) =>
    brand.relatedBrandSlugs.map((related_slug) => ({
      brand_slug: brand.slug,
      related_slug,
    }))
  );
  await supabase.from("brand_related").upsert(relatedRows);

  const retailerBrandRows = retailers.flatMap((r) =>
    r.brandSlugs.map((brand_slug) => ({ retailer_slug: r.slug, brand_slug }))
  );
  await supabase.from("retailer_brands").upsert(retailerBrandRows);

  const segmentRows = brands
    .filter((b) => FOOTWEAR_SLUGS.has(b.slug))
    .map((b) => ({ brand_slug: b.slug, segment_slug: "obuca" }));
  await supabase.from("brand_segments").upsert(segmentRows);

  console.log("Seeding news…");
  for (const article of newsArticles) {
    await supabase.from("news_articles").upsert({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      published_at: article.publishedAt,
      category: article.category,
      featured: article.featured ?? false,
      image_label: article.imageLabel,
      image_storage_path: storagePaths.newsImage(article.slug),
    });
    if (article.brandSlugs?.length) {
      await supabase.from("news_article_brands").upsert(
        article.brandSlugs.map((brand_slug) => ({
          article_slug: article.slug,
          brand_slug,
        }))
      );
    }
  }

  console.log("Seeding FC stores…");
  await supabase.from("fc_stores").upsert(
    fashionCompanyStores.map((s) => ({
      id: s.id,
      store_name: s.storeName,
      brand_name: s.brandName,
      brand_slug: s.brandSlug ?? bilbordSlugFromBrandName(s.brandName) ?? null,
      city_code: s.city,
      city_label: s.cityLabel,
      address: s.address,
      shopping_center: s.shoppingCenter ?? null,
      shopping_center_slug: s.shoppingCenterSlug ?? null,
      source: s.source,
    }))
  );

  console.log("Done. Proveri tabele u Supabase Dashboard.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
