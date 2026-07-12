import { enrichRetailLocations } from "@/lib/data/enrich-brand";
import { normalizeScrapedDisplayText } from "@/lib/format/display-text";
import { getStaticBrandRetailerSlugs } from "@/lib/supabase/fetch-brand-retailers";
import { fetchBrandRetailerSlugs } from "@/lib/supabase/fetch-brand-retailers";
import { fetchRetailerStores } from "@/lib/supabase/fetch-retailer-stores";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Brand, RetailLocation } from "@/types";

function locationKey(loc: Pick<RetailLocation, "retailerSlug" | "address" | "city" | "storeName">): string {
  return `${loc.retailerSlug}|${loc.city}|${loc.address}|${loc.storeName}`;
}

function storeToLocation(
  store: { id: string; name: string; address: string; city: string },
  retailerSlug: string
): RetailLocation {
  return {
    id: store.id,
    storeName: normalizeScrapedDisplayText(store.name),
    retailerSlug,
    address: store.address,
    city: store.city,
  };
}

export async function expandBrandLocations(brand: Brand): Promise<Brand> {
  const retailerSlugs = isSupabaseConfigured()
    ? (await fetchBrandRetailerSlugs(brand.slug)) ?? getStaticBrandRetailerSlugs(brand.slug)
    : getStaticBrandRetailerSlugs(brand.slug);

  if (!retailerSlugs.length) {
    return {
      ...brand,
      availabilityCount: brand.locations.length || brand.availabilityCount,
    };
  }

  const seen = new Set<string>();
  const merged: RetailLocation[] = [];

  for (const loc of brand.locations) {
    const key = locationKey(loc);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(loc);
  }

  const storeBatches = await Promise.all(
    retailerSlugs.map((retailerSlug) => fetchRetailerStores(retailerSlug))
  );

  for (let i = 0; i < retailerSlugs.length; i++) {
    const retailerSlug = retailerSlugs[i]!;
    for (const store of storeBatches[i] ?? []) {
      const loc = storeToLocation(store, retailerSlug);
      const key = locationKey(loc);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(loc);
    }
  }

  const collator = new Intl.Collator("sr");
  merged.sort((a, b) => {
    const city = collator.compare(a.city, b.city);
    if (city !== 0) return city;
    return collator.compare(a.storeName, b.storeName);
  });

  const locations = enrichRetailLocations(brand.slug, merged);

  return {
    ...brand,
    locations,
    availabilityCount: locations.length || brand.availabilityCount,
  };
}
