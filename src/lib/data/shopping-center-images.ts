/**
 * Zvanični logotipi tržnih centara — preuzeti sa zvaničnih sajtova (jun 2026).
 * Fajlovi: public/shopping-centers/{slug}.{png|jpg}
 */

export interface ShoppingCenterImage {
  src: string;
  sourceUrl: string;
  alt: string;
}

export const shoppingCenterImages: Record<string, ShoppingCenterImage> = {
  usce: {
    src: "/shopping-centers/usce.png",
    sourceUrl:
      "https://usceshoppingcenter.rs/wp-content/uploads/2017/03/Logo-usce.png",
    alt: "Ušće Shopping Center",
  },
  galerija: {
    src: "/shopping-centers/galerija.png",
    sourceUrl: "https://www.galerijabelgrade.com/android-chrome-512x512.png",
    alt: "Galerija Beograd",
  },
  "delta-city": {
    src: "/shopping-centers/delta-city.jpg",
    sourceUrl: "https://www.deltacity.rs/wp-content/uploads/2024/12/delta-logo.jpg",
    alt: "Delta City",
  },
  "big-fashion": {
    src: "/shopping-centers/big-fashion.png",
    sourceUrl:
      "https://www.bigcenters.rs/beograd/wp-content/uploads/sites/3/2022/02/big-fashion-logo.png",
    alt: "BIG Fashion Park Beograd",
  },
  promenada: {
    src: "/shopping-centers/promenada.png",
    sourceUrl:
      "https://www.bigcenters.rs/novi-sad/wp-content/uploads/sites/4/2022/03/BIG-logo-01.png",
    alt: "BIG FASHION Novi Sad (bivša Promenada)",
  },
  mercator: {
    src: "/shopping-centers/mercator.png",
    sourceUrl:
      "https://mercatorcentar.rs/wp-content/themes/mercator/img/mercator_logo.png",
    alt: "Mercator Centar Niš",
  },
  stadion: {
    src: "/shopping-centers/stadion.png",
    sourceUrl:
      "https://stadionshoppingcenter.rs/wp-content/themes/Stadion/images/stadion-logo.png",
    alt: "Stadion Shopping Center",
  },
  "kragujevac-plaza": {
    src: "/shopping-centers/kragujevac-plaza.png",
    sourceUrl:
      "https://www.bigcenters.rs/kragujevac/wp-content/uploads/sites/7/2022/03/big-fashion-logo-1.png",
    alt: "BIG FASHION Kragujevac (bivša Plaza)",
  },
  zlatibor: {
    src: "/shopping-centers/zlatibor.png",
    sourceUrl:
      "https://cdn.cpi-europe.com/uploads/production/602b986b5851a4f31d39b6b0/stopshop_logo_rgb_v1.png",
    alt: "Stop Shop Zlatibor",
  },
  rajiceva: {
    src: "/shopping-centers/rajiceva.jpg",
    sourceUrl:
      "https://www.rajicevashoppingcenter.rs/wp-content/uploads/2022/11/rajiceva-logo-crn.jpg",
    alt: "Rajićeva Shopping Center",
  },
};

export function getShoppingCenterImage(
  slug: string
): ShoppingCenterImage | undefined {
  return shoppingCenterImages[slug];
}

export function hasShoppingCenterImage(slug: string): boolean {
  return slug in shoppingCenterImages;
}
