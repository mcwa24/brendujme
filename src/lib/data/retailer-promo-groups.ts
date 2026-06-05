import type { ImportedRetailerSlug } from "@/lib/data/imported-retailers";

/**
 * Prodavci koji dele istu platformu / matičnu kompaniju — jedan baner po grupi.
 * Sport Vision i Run'n More koriste isti web shop engine (nb / Emperor grupa).
 */
const PROMO_GROUP_BY_RETAILER: Partial<Record<ImportedRetailerSlug, string>> = {
  "sport-vision": "emperor",
  "run-n-more": "emperor",
};

/** Koji slug predstavlja grupu na home baneru */
const GROUP_PRIMARY_RETAILER: Record<string, ImportedRetailerSlug> = {
  emperor: "sport-vision",
};

export function getRetailerPromoGroupId(retailerSlug: string): string {
  return (
    PROMO_GROUP_BY_RETAILER[retailerSlug as ImportedRetailerSlug] ?? retailerSlug
  );
}

export function getPrimaryRetailerForPromoGroup(groupId: string): string {
  return GROUP_PRIMARY_RETAILER[groupId] ?? groupId;
}

export function isPrimaryPromoRetailer(retailerSlug: string): boolean {
  const groupId = getRetailerPromoGroupId(retailerSlug);
  return getPrimaryRetailerForPromoGroup(groupId) === retailerSlug;
}
