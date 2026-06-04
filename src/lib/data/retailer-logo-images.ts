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
};

/** Pun logo — naslovi sekcija na stranicama brendova */
export const retailerLogoImages: Record<string, RetailerLogoImage> = {
  "fashion-company": {
    src: "/logos/retailers/fashion-company-full.png",
    sourceUrl: "bundled:fashion-company-full",
    alt: "Fashion Company",
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
