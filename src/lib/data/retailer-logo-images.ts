/**
 * Zvanični logotipi prodavaca — preuzeti skriptom `npm run logos:retailers`
 * Fajlovi: public/logos/retailers/{slug}.{png|svg|jpg}
 */

export interface RetailerLogoImage {
  src: string;
  sourceUrl: string;
  alt: string;
}

/** FCO ikona — lista prodavaca i stranica `/retailers/fashion-company` */
export const retailerPageLogoImages: Record<string, RetailerLogoImage> = {
  "fashion-company": {
    src: "/logos/retailers/fashion-company-icon.png",
    sourceUrl: "bundled:FCO-icon-za-web",
    alt: "Fashion Company",
  },
  "fashion-friends": {
    src: "/logos/retailers/fashion-friends.png",
    sourceUrl: "bundled:fashion-and-friends-logo",
    alt: "Fashion&Friends",
  },
  lpp: {
    src: "/logos/retailers/lpp.png",
    sourceUrl: "bundled:lpp-logo",
    alt: "LPP",
  },
  tike: {
    src: "/logos/retailers/tike.png",
    sourceUrl: "bundled:tike-logo-black",
    alt: "Tike",
  },
};

/** Pun logo — naslovi sekcija na stranicama brenda */
export const retailerLogoImages: Record<string, RetailerLogoImage> = {
  "fashion-company": {
    src: "/logos/retailers/fashion-company-full.png",
    sourceUrl: "bundled:fashion-company-full",
    alt: "Fashion Company",
  },
  "fashion-friends": {
    src: "/logos/retailers/fashion-friends.png",
    sourceUrl: "bundled:fashion-and-friends-logo",
    alt: "Fashion&Friends",
  },
  lpp: {
    src: "/logos/retailers/lpp.png",
    sourceUrl: "bundled:lpp-logo",
    alt: "LPP",
  },
  "buzz-sneakers": {
    src: "/logos/retailers/buzz-sneakers.png",
    sourceUrl: "https://www.buzzsneakers.rs/files/images/buzz/buzz_logo.png",
    alt: "Buzz Sneakers",
  },
  "office-shoes": {
    src: "/logos/retailers/office-shoes.svg",
    sourceUrl: "https://www.officeshoes.rs/assets/img/logo-officeshoes-b.svg",
    alt: "Office Shoes",
  },
  "sport-time": {
    src: "/logos/retailers/sport-time.jpg",
    sourceUrl: "https://static.nike.com/a/images/f_auto,cs_srgb/h_80,w_80/9a524f39-69e3-4dac-b229-8cacca2408f6/image.png",
    alt: "Sport Time",
  },
  "djak-sport": {
    src: "/logos/retailers/djak-sport.png",
    sourceUrl:
      "https://www.djaksport.com/static/version1780489353/frontend/Djak/default/sr_Latn_RS/images/logosmall.png",
    alt: "Đak Sport",
  },
  "sport-vision": {
    src: "/logos/retailers/sport-vision-2026.png",
    sourceUrl: "bundled:sport-vision-logo-2026",
    alt: "Sport Vision",
  },
  "planeta-sport": {
    src: "/logos/retailers/planeta-sport.svg",
    sourceUrl:
      "https://planetasport.rs/static/version1779922508/frontend/PlanetasportV2/default/sr_Latn_RS/images/logo.svg",
    alt: "Planeta Sport",
  },
  inditex: {
    src: "/logos/retailers/inditex.svg",
    sourceUrl:
      "https://www.inditex.com/itxcomweb/_next/static/media/logo_big.0nk5izeu-d548.svg",
    alt: "Inditex",
  },
  tike: {
    src: "/logos/retailers/tike.png",
    sourceUrl: "bundled:tike-logo-black",
    alt: "Tike",
  },
  "urban-shop": {
    src: "/logos/retailers/urban-shop.png",
    sourceUrl: "bundled:urban-shop-logo",
    alt: "Urban Shop",
  },
  "n-sport": {
    src: "/logos/retailers/n-sport.png",
    sourceUrl: "bundled:n-sport-logo",
    alt: "N Sport",
  },
};

export function getRetailerLogoImage(slug: string): RetailerLogoImage | undefined {
  return retailerLogoImages[slug];
}

export function getRetailerPageLogoImage(slug: string): RetailerLogoImage | undefined {
  return retailerPageLogoImages[slug] ?? retailerLogoImages[slug];
}

const BUNDLED_SLUGS = new Set([
  ...Object.keys(retailerLogoImages),
  ...Object.keys(retailerPageLogoImages),
]);

export function hasBundledRetailerLogo(slug: string): boolean {
  return BUNDLED_SLUGS.has(slug);
}
