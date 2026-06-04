import { brands } from "@/lib/data/brands";
import { retailers } from "@/lib/data/retailers";
import { shoppingCenters } from "@/lib/data/shopping-centers";
import { fashionCompanyStores } from "@/lib/data/fashion-company";
import { getCategoryName } from "@/lib/data/categories";
import { getRetailerCatalogMeta } from "@/lib/data/retailer-catalog-meta";
import { formatBrandCount, formatLocationCount } from "@/lib/format/sr-plural";
import type { SearchResult } from "@/types";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function searchAll(query: string): SearchResult[] {
  const q = normalize(query.trim());
  if (!q) return [];

  const results: SearchResult[] = [];
  const seen = new Set<string>();

  const add = (result: SearchResult) => {
    const key = `${result.type}-${result.slug}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(result);
  };

  for (const brand of brands) {
    if (
      normalize(brand.name).includes(q) ||
      brand.slug.includes(q) ||
      normalize(getCategoryName(brand.category)).includes(q)
    ) {
      add({
        type: "brand",
        slug: brand.slug,
        title: brand.name,
        subtitle: `${getCategoryName(brand.category)} · ${formatLocationCount(brand.availabilityCount)}`,
        href: `/brands/${brand.slug}`,
      });
    }
  }

  for (const retailer of retailers) {
    if (
      normalize(retailer.name).includes(q) ||
      normalize(retailer.city).includes(q) ||
      normalize(retailer.description).includes(q)
    ) {
      const meta = getRetailerCatalogMeta(retailer.slug);
      const brandLine = meta
        ? formatBrandCount(meta.brandCount)
        : formatBrandCount(retailer.brandCount);
      add({
        type: "retailer",
        slug: retailer.slug,
        title: retailer.name,
        subtitle: `${retailer.city} · ${brandLine}`,
        href: `/retailers/${retailer.slug}`,
      });
    }
  }

  for (const center of shoppingCenters) {
    if (
      normalize(center.name).includes(q) ||
      normalize(center.city).includes(q) ||
      normalize(center.description).includes(q)
    ) {
      add({
        type: "shopping-center",
        slug: center.slug,
        title: center.name,
        subtitle: `${center.city} · ${formatBrandCount(center.brandCount)}`,
        href: `/shopping-centers/${center.slug}`,
      });
    }
  }

  for (const store of fashionCompanyStores) {
    if (
      normalize(store.brandName).includes(q) ||
      normalize(store.storeName).includes(q) ||
      normalize(store.address).includes(q) ||
      normalize(store.cityLabel).includes(q) ||
      (store.shoppingCenter && normalize(store.shoppingCenter).includes(q))
    ) {
      if (store.brandSlug) {
        add({
          type: "brand",
          slug: store.brandSlug,
          title: store.brandName,
          subtitle: `Fashion Company · ${store.cityLabel}`,
          href: `/brands/${store.brandSlug}`,
        });
      }
    }
  }

  return results.slice(0, 16);
}
