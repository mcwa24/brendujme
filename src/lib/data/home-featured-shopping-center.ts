/** Istaknuti tržni centri na početnoj — redosled: levo → desno */
export const HOME_FEATURED_SHOPPING_CENTER_SLUGS = [
  "galerija",
  "rajiceva",
] as const;

export type HomeFeaturedShoppingCenterSlug =
  (typeof HOME_FEATURED_SHOPPING_CENTER_SLUGS)[number];
