/** Istaknuti prodavci na početnoj — redosled prikaza */
export const HOME_POPULAR_RETAILER_SLUGS = [
  "buzz-sneakers",
  "tike",
  "sport-time",
] as const;

export type HomePopularRetailerSlug =
  (typeof HOME_POPULAR_RETAILER_SLUGS)[number];
