import type { ImportedRetailerSlug } from "@/lib/data/imported-retailers";

/**
 * Prodavci koji dele istu platformu / matičnu kompaniju.
 * emperor: jedan baner na home (Sport Vision / Buzz / Office dele shop)
 */
const PROMO_GROUP_BY_RETAILER: Partial<Record<ImportedRetailerSlug, string>> = {
  "sport-vision": "emperor",
};

/** Grupe gde na home ide najviše jedan baner ukupno (ne po kampanji). */
const SINGLE_BANNER_PROMO_GROUPS = new Set(["emperor"]);

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

/** Član promo grupe (npr. Fashion Company pod F&F platformom). */
export function isPromoGroupMember(retailerSlug: string): boolean {
  return getRetailerPromoGroupId(retailerSlug) !== retailerSlug;
}

/** Emperor i sl. — na home najviše jedan baner za celu grupu. */
export function isSingleBannerPromoGroup(groupId: string): boolean {
  return SINGLE_BANNER_PROMO_GROUPS.has(groupId);
}

/** @deprecated Koristi isSingleBannerPromoGroup */
export function isSharedPromoGroup(retailerSlug: string): boolean {
  return isSingleBannerPromoGroup(getRetailerPromoGroupId(retailerSlug));
}
