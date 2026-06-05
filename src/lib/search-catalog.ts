import { fashionCompanyStores } from "@/lib/data/fashion-company";
import { fashionAndFriendsMeta } from "@/lib/data/fashion-and-friends";
import { getCategoryName } from "@/lib/data/categories";
import {
  formatOfferingsLabel,
  getBrandRetailerOfferings,
  matchOfferingsForIntent,
  OFFERING_GROUP_ORDER,
  OFFERING_LABELS,
  offeringsOverlap,
  retailerPrimaryCategory,
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

  const add = (result: SearchResult) => {
    const key = result.offeringGroup
      ? `${result.type}-${result.slug}-${result.offeringGroup}`
      : `${result.type}-${result.slug}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push(result);
  };

  for (const brand of brands) {
    if (
      intent.categorySlug &&
      !intent.brandSlug &&
      brand.category !== intent.categorySlug
    ) {
      continue;
    }

    const nameMatch =
      normalize(brand.name).includes(coreQ) ||
      coreQ.includes(normalize(brand.name)) ||
      brand.slug.includes(coreQ.replace(/\s/g, "-"));

    const brandIntentMatch = intent.brandSlug === brand.slug;

    const categoryMatch =
      !intent.brandSlug &&
      intent.categorySlug &&
      brand.category === intent.categorySlug;

    if (brandIntentMatch || (nameMatch && !intent.brandSlug) || categoryMatch) {
      if (intent.offerings?.length) {
        const hasRetailer = retailers.some(
          (r) =>
            r.brandSlugs.includes(brand.slug) &&
            retailerSellsBrandForOfferings(brand.slug, r.slug, intent.offerings)
        );
        if (!hasRetailer && brand.locations.length === 0) continue;
      }

      let hint: string;
      if (intent.offerings?.length) {
        hint = formatOfferingsLabel(intent.offerings);
      } else if (brandIntentMatch) {
        const types = collectBrandOfferingTypes(brand.slug, retailers);
        hint =
          types.length > 0
            ? `${types.map((t) => OFFERING_LABELS[t]).join(" · ")} — sužite: patike ili majica`
            : getCategoryName(brand.category);
      } else {
        hint = getCategoryName(brand.category);
      }

      add({
        type: "brand",
        slug: brand.slug,
        title: brand.name,
        subtitle: `${hint} · ${formatLocationCount(brand.availabilityCount)}`,
        href: `/brands/${brand.slug}`,
      });
    }
  }

  for (const retailer of retailers) {
    if (
      intent.categorySlug &&
      retailerPrimaryCategory(retailer.slug) !== intent.categorySlug
    ) {
      if (!intent.brandSlug || !retailer.brandSlugs.includes(intent.brandSlug)) {
        continue;
      }
    }

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
      });
    }
  }

  if (
    (coreQ.includes("fashion") && coreQ.includes("friend")) ||
    coreQ.replace(/\s/g, "") === "fashionandfriends" ||
    coreQ === "ff"
  ) {
    add({
      type: "retailer",
      slug: "fashion-company",
      title: "Fashion&Friends",
      subtitle: `${formatBrandCount(fashionAndFriendsMeta.brandCount)} · Fashion Company`,
      href: "/retailers/fashion-company",
    });
  }

  for (const store of fashionCompanyStores) {
    if (intent.offerings?.length && !offeringsOverlap(intent.offerings, ["apparel"])) {
      continue;
    }
    if (
      normalize(store.brandName).includes(coreQ) ||
      normalize(store.storeName).includes(coreQ) ||
      normalize(store.address).includes(coreQ) ||
      normalize(store.cityLabel).includes(coreQ) ||
      (store.shoppingCenter && normalize(store.shoppingCenter).includes(coreQ))
    ) {
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
        add({
          type: "brand",
          slug: store.brandSlug,
          title: store.brandName,
          subtitle: `Odeća i moda · Fashion Company · ${store.cityLabel}`,
          href: `/brands/${store.brandSlug}`,
          offeringGroup: "apparel",
        });
      }
    }
  }

  return sortResults(results).slice(0, 20);
}
