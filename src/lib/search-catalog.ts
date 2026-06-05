import { resolveBrandLogoSrc } from "@/lib/brand-logo-resolve";
import { fashionCompanyStores } from "@/lib/data/fashion-company";
import { fashionAndFriendsMeta } from "@/lib/data/fashion-and-friends";
import { getShoppingCenterImage } from "@/lib/data/shopping-center-images";
import { resolveRetailerLogoSrc } from "@/lib/retailer-logo-resolve";
import { getStoragePublicUrl } from "@/lib/supabase/storage";
import {
  formatOfferingsLabel,
  getBrandRetailerOfferings,
  matchOfferingsForIntent,
  OFFERING_GROUP_ORDER,
  OFFERING_LABELS,
  offeringsOverlap,
  retailerSellsBrandForOfferings,
} from "@/lib/data/brand-offerings";
import { parseSearchIntent } from "@/lib/search-intent";
import { getRetailerCatalogMeta } from "@/lib/data/retailer-catalog-meta";
import { formatBrandCount, formatLocationCount } from "@/lib/format/sr-plural";
import type { Brand, BrandOfferingSlug, Retailer, SearchResult, ShoppingCenter } from "@/types";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function searchImageForBrand(brand: Brand): string | undefined {
  return resolveBrandLogoSrc(brand) ?? undefined;
}

function searchImageForRetailer(retailer: Retailer): string | undefined {
  return resolveRetailerLogoSrc(retailer) ?? undefined;
}

function searchImageForCenter(center: ShoppingCenter): string | undefined {
  const local = getShoppingCenterImage(center.slug);
  return (
    local?.src ||
    center.logoUrl?.trim() ||
    getStoragePublicUrl(center.logoStoragePath) ||
    undefined
  );
}

function collectBrandOfferingTypes(
  brandSlug: string,
  retailers: Retailer[]
): BrandOfferingSlug[] {
  const found = new Set<BrandOfferingSlug>();
  for (const r of retailers) {
    if (!r.brandSlugs.includes(brandSlug)) continue;
    for (const o of getBrandRetailerOfferings(brandSlug, r.slug)) {
      found.add(o);
    }
  }
  return OFFERING_GROUP_ORDER.filter((o) => found.has(o));
}

function sortResults(results: SearchResult[]): SearchResult[] {
  const typeOrder: Record<SearchResult["type"], number> = {
    brand: 0,
    retailer: 1,
    "shopping-center": 2,
  };
  return [...results].sort((a, b) => {
    const ta = typeOrder[a.type] - typeOrder[b.type];
    if (ta !== 0) return ta;
    if (a.offeringGroup && b.offeringGroup) {
      const ga =
        OFFERING_GROUP_ORDER.indexOf(a.offeringGroup) -
        OFFERING_GROUP_ORDER.indexOf(b.offeringGroup);
      if (ga !== 0) return ga;
    }
    return a.title.localeCompare(b.title, "sr");
  });
}

export function buildSearchResults(
  query: string,
  brands: Brand[],
  retailers: Retailer[],
  shoppingCenters: ShoppingCenter[]
): SearchResult[] {
  const q = normalize(query.trim());
  if (!q) return [];

  const intent = parseSearchIntent(query, brands);
  const coreQ = intent.coreText || q;

  const results: SearchResult[] = [];
  const seen = new Set<string>();
  const seenBrandSlugs = new Set<string>();

  const add = (result: SearchResult) => {
    if (result.type === "brand") {
      if (seenBrandSlugs.has(result.slug)) return;
      seenBrandSlugs.add(result.slug);
      results.push(result);
      return;
    }

    const key = result.offeringGroup
      ? `${result.type}-${result.slug}-${result.offeringGroup}`
      : `${result.type}-${result.slug}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(result);
  };

  for (const brand of brands) {
    const nameMatch =
      normalize(brand.name).includes(coreQ) ||
      coreQ.includes(normalize(brand.name)) ||
      brand.slug.includes(coreQ.replace(/\s/g, "-"));

    const brandIntentMatch = intent.brandSlug === brand.slug;

    if (brandIntentMatch || (nameMatch && !intent.brandSlug)) {
      if (intent.offerings?.length) {
        const hasRetailer = retailers.some(
          (r) =>
            r.brandSlugs.includes(brand.slug) &&
            retailerSellsBrandForOfferings(brand.slug, r.slug, intent.offerings)
        );
        if (!hasRetailer && brand.locations.length === 0) continue;
      }

      let hint = "";
      if (intent.offerings?.length) {
        hint = formatOfferingsLabel(intent.offerings);
      } else if (brandIntentMatch) {
        const types = collectBrandOfferingTypes(brand.slug, retailers);
        if (types.length > 0) {
          hint = `${types.map((t) => OFFERING_LABELS[t]).join(" · ")} — sužite: patike ili majica`;
        }
      }

      const subtitle = hint
        ? `${hint} · ${formatLocationCount(brand.availabilityCount)}`
        : formatLocationCount(brand.availabilityCount);

      add({
        type: "brand",
        slug: brand.slug,
        title: brand.name,
        subtitle,
        href: `/brands/${brand.slug}`,
        imageUrl: searchImageForBrand(brand),
      });
    }
  }

  for (const retailer of retailers) {
    if (intent.brandSlug && retailer.brandSlugs.includes(intent.brandSlug)) {
      const brand = brands.find((b) => b.slug === intent.brandSlug);
      const available = getBrandRetailerOfferings(intent.brandSlug, retailer.slug);

      if (!retailerSellsBrandForOfferings(intent.brandSlug, retailer.slug, intent.offerings)) {
        continue;
      }

      const matched = matchOfferingsForIntent(intent.offerings, available);
      const groups =
        intent.offerings?.length && matched.length
          ? matched
          : intent.offerings?.length
            ? []
            : available;

      for (const offering of groups) {
        add({
          type: "retailer",
          slug: retailer.slug,
          title: retailer.name,
          subtitle: [
            brand?.name ?? intent.brandSlug,
            OFFERING_LABELS[offering],
            retailer.name,
          ].join(" · "),
          href: `/retailers/${retailer.slug}`,
          offeringGroup: offering,
          imageUrl: searchImageForRetailer(retailer),
        });
      }
      continue;
    }

    let matched = false;
    let subtitleParts: string[] = [retailer.city];

    if (!intent.brandSlug) {
      const direct =
        normalize(retailer.name).includes(coreQ) ||
        normalize(retailer.city).includes(coreQ) ||
        normalize(retailer.description).includes(coreQ);

      if (direct) {
        if (intent.offerings?.length) {
          const sellsAny = retailer.brandSlugs.some((bs) =>
            retailerSellsBrandForOfferings(bs, retailer.slug, intent.offerings)
          );
          if (!sellsAny) continue;
        }
        matched = true;
        const meta = getRetailerCatalogMeta(retailer.slug);
        subtitleParts.push(
          meta ? formatBrandCount(meta.brandCount) : formatBrandCount(retailer.brandCount)
        );
      }
    }

    if (!matched && !intent.brandSlug && coreQ.length >= 2) {
      for (const brandSlug of retailer.brandSlugs) {
        const brand = brands.find((b) => b.slug === brandSlug);
        if (!brand) continue;
        const bn = normalize(brand.name);
        if (!coreQ.includes(bn) && !bn.includes(coreQ)) continue;
        if (
          !retailerSellsBrandForOfferings(brandSlug, retailer.slug, intent.offerings)
        ) {
          continue;
        }
        matched = true;
        const offerings = matchOfferingsForIntent(
          intent.offerings,
          getBrandRetailerOfferings(brandSlug, retailer.slug)
        );
        subtitleParts = [
          brand.name,
          formatOfferingsLabel(
            offerings.length ? offerings : getBrandRetailerOfferings(brandSlug, retailer.slug)
          ),
          retailer.name,
        ];
        break;
      }
    }

    if (matched) {
      add({
        type: "retailer",
        slug: retailer.slug,
        title: retailer.name,
        subtitle: subtitleParts.filter(Boolean).join(" · "),
        href: `/retailers/${retailer.slug}`,
        imageUrl: searchImageForRetailer(retailer),
      });
    }
  }

  for (const center of shoppingCenters) {
    if (
      normalize(center.name).includes(coreQ) ||
      normalize(center.city).includes(coreQ) ||
      normalize(center.description).includes(coreQ)
    ) {
      add({
        type: "shopping-center",
        slug: center.slug,
        title: center.name,
        subtitle: `${center.city} · ${formatBrandCount(center.brandCount)}`,
        href: `/shopping-centers/${center.slug}`,
        imageUrl: searchImageForCenter(center),
      });
    }
  }

  if (
    (coreQ.includes("fashion") && coreQ.includes("friend")) ||
    coreQ.replace(/\s/g, "") === "fashionandfriends" ||
    coreQ === "ff"
  ) {
    const fcRetailer = retailers.find((r) => r.slug === "fashion-company");
    add({
      type: "retailer",
      slug: "fashion-company",
      title: "Fashion&Friends",
      subtitle: `${formatBrandCount(fashionAndFriendsMeta.brandCount)} · Fashion Company`,
      href: "/retailers/fashion-company",
      imageUrl: fcRetailer ? searchImageForRetailer(fcRetailer) : undefined,
    });
  }

  for (const store of fashionCompanyStores) {
    if (intent.offerings?.length && !offeringsOverlap(intent.offerings, ["apparel"])) {
      continue;
    }

    const brandNameMatch =
      normalize(store.brandName).includes(coreQ) ||
      coreQ.includes(normalize(store.brandName));
    const storeDetailMatch =
      normalize(store.storeName).includes(coreQ) ||
      normalize(store.address).includes(coreQ) ||
      normalize(store.cityLabel).includes(coreQ) ||
      (store.shoppingCenter && normalize(store.shoppingCenter).includes(coreQ));

    if (!storeDetailMatch && brandNameMatch) {
      continue;
    }

    if (!storeDetailMatch) continue;

    if (store.brandSlug && seenBrandSlugs.has(store.brandSlug)) {
      continue;
    }

    if (store.brandSlug) {
      if (
        intent.brandSlug &&
        store.brandSlug !== intent.brandSlug &&
        !retailerSellsBrandForOfferings(
          store.brandSlug,
          "fashion-company",
          intent.offerings
        )
      ) {
        continue;
      }
      const fcBrand = brands.find((b) => b.slug === store.brandSlug);
      add({
        type: "brand",
        slug: store.brandSlug,
        title: fcBrand?.name ?? store.brandName,
        subtitle: `${store.storeName} · Fashion Company · ${store.cityLabel}`,
        href: `/brands/${store.brandSlug}`,
        imageUrl: fcBrand ? searchImageForBrand(fcBrand) : undefined,
      });
    }
  }

  return sortResults(results).slice(0, 20);
}
