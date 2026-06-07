import type { Brand } from "@/types";
import {
  FASHION_SPORT_BRAND_SLUGS,
  buildFashionSportBrands,
} from "@/lib/data/fashion-sport-brands";
import {
  buildFastFashionBrands,
  FAST_FASHION_BRAND_SLUGS,
} from "@/lib/data/fast-fashion-brands";
import { buildFashionAndFriendsDirectoryBrands } from "@/lib/data/ff-directory-brands";
import { DEPRECATED_BRAND_SLUGS } from "@/lib/data/imported-retailers";

const FAST_FASHION_SLUGS = new Set<string>(FAST_FASHION_BRAND_SLUGS);
const FASHION_SPORT_SLUGS = new Set<string>(FASHION_SPORT_BRAND_SLUGS);
const CURATED_SLUGS = new Set([...FAST_FASHION_SLUGS, ...FASHION_SPORT_SLUGS]);

const coreBrands: Brand[] = [
  {
    slug: "scotch-and-soda",
    name: "Scotch & Soda",
    category: "fashion",
    country: "Holandija",
    website: "https://www.scotch-soda.com",
    description:
      "Amsterdamski brend poznat po eclectic premium modi, artisan detaljima i savremenom evropskom stilu. U Srbiji je dostupan kroz select retail partnere i premium tržne centre.",
    priceSegment: "premium",
    availabilityCount: 12,
    featured: true,
    popular: true,
    locations: [
      {
        id: "1",
        storeName: "Fashion Company",
        retailerSlug: "fashion-company",
        address: "Knez Mihailova 42",
        city: "Beograd",
      },
      {
        id: "2",
        storeName: "Rajiceva Shopping Center",
        retailerSlug: "premium-mall",
        address: "Knez Mihailova 5",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["rajiceva", "usce"],
    relatedBrandSlugs: ["sandro", "maje", "cos"],
  },
  {
    slug: "cos",
    name: "COS",
    category: "fashion",
    country: "Švedska",
    website: "https://www.cos.com",
    description:
      "Minimalistički dizajn i arhitektonski pristup modi. COS privlači urbanu publiku koja ceni kvalitet i čistu estetiku.",
    priceSegment: "premium",
    availabilityCount: 8,
    featured: true,
    popular: false,
    locations: [
      {
        id: "6",
        storeName: "Fashion Company",
        retailerSlug: "fashion-company",
        address: "Ušće Shopping Center",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["usce", "promenada"],
    relatedBrandSlugs: ["arket", "scotch-and-soda", "sandro"],
  },
  {
    slug: "sandro",
    name: "Sandro",
    category: "luxury",
    country: "Francuska",
    website: "https://www.sandro-paris.com",
    description:
      "Pariški contemporary luxury brend sa prepoznatljivim Parisian chic estetikom i premium materijalima.",
    priceSegment: "luxury",
    availabilityCount: 6,
    featured: true,
    popular: false,
    locations: [
      {
        id: "7",
        storeName: "Luxury Gallery",
        retailerSlug: "luxury-gallery",
        address: "Rajiceva Shopping Center",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["rajiceva", "delta-city"],
    relatedBrandSlugs: ["maje", "scotch-and-soda", "tory-burch"],
  },
  {
    slug: "maje",
    name: "Maje",
    category: "luxury",
    country: "Francuska",
    website: "https://www.maje.com",
    description:
      "Feminina, elegantna moda sa francuskim šarmom. Maje je sinonim za accessible luxury u regionu.",
    priceSegment: "luxury",
    availabilityCount: 5,
    featured: true,
    popular: false,
    locations: [
      {
        id: "8",
        storeName: "Fashion Company",
        retailerSlug: "fashion-company",
        address: "Galerija Beograd",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["galerija", "rajiceva"],
    relatedBrandSlugs: ["sandro", "tory-burch", "coach"],
  },
  {
    slug: "nike",
    name: "Nike",
    category: "sports",
    country: "SAD",
    website: "https://www.nike.com",
    description:
      "Svetski lider u sportskoj modi i obući sa širokom mrežom prodavnica i partnera u Srbiji.",
    priceSegment: "mid",
    availabilityCount: 35,
    featured: true,
    popular: true,
    locations: [
      {
        id: "9",
        storeName: "Nike Ušće",
        retailerSlug: "sport-vision",
        address: "Bulevar Mihajla Pupina 4",
        city: "Beograd",
      },
      {
        id: "10",
        storeName: "Sport Vision Promenada",
        retailerSlug: "sport-vision",
        address: "Sentandrejski put 11",
        city: "Novi Sad",
      },
    ],
    shoppingCenterSlugs: ["usce", "promenada", "stadion"],
    relatedBrandSlugs: ["adidas", "puma", "under-armour"],
  },
  {
    slug: "adidas",
    name: "Adidas",
    category: "sports",
    country: "Nemačka",
    website: "https://www.adidas.com",
    description:
      "Ikonični sportski brend sa snažnim prisustvom u tržnim centrima i specijalizovanim sportskim prodavnicama.",
    priceSegment: "mid",
    availabilityCount: 32,
    featured: false,
    popular: true,
    locations: [
      {
        id: "11",
        storeName: "Adidas Originals",
        retailerSlug: "sport-vision",
        address: "Delta City",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["delta-city", "mercator", "stadion"],
    relatedBrandSlugs: ["nike", "puma", "new-balance"],
  },
  {
    slug: "rituals",
    name: "Rituals",
    category: "beauty",
    country: "Holandija",
    website: "https://www.rituals.com",
    description:
      "Premium body care i home fragrance brend sa spa-inspirisanim proizvodima i luksuznim pakovanjem.",
    priceSegment: "premium",
    availabilityCount: 18,
    featured: true,
    popular: true,
    locations: [
      {
        id: "12",
        storeName: "Rituals Galerija",
        retailerSlug: "beauty-world",
        address: "Bulevar Vojvode Bojovića",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["galerija", "promenada", "usce"],
    relatedBrandSlugs: ["mac", "clinique", "estee-lauder"],
  },
  {
    slug: "tommy-hilfiger",
    name: "Tommy Hilfiger",
    category: "fashion",
    country: "SAD",
    website: "https://www.tommy.com",
    description:
      "Američki preppy-luxury brend sa globalnom prepoznatljivošću i širokom distribucijom u Srbiji.",
    priceSegment: "premium",
    availabilityCount: 22,
    featured: false,
    popular: true,
    locations: [
      {
        id: "13",
        storeName: "Tommy Hilfiger Delta City",
        retailerSlug: "premium-mall",
        address: "Jurija Gagarina 16",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["delta-city", "big-fashion"],
    relatedBrandSlugs: ["calvin-klein", "lacoste", "polo-ralph-lauren"],
  },
  {
    slug: "calvin-klein",
    name: "Calvin Klein",
    category: "fashion",
    country: "SAD",
    website: "https://www.calvinklein.com",
    description:
      "Minimalistički američki brend poznat po underwear, denim i contemporary modi.",
    priceSegment: "premium",
    availabilityCount: 16,
    featured: false,
    popular: true,
    locations: [
      {
        id: "14",
        storeName: "Outlet Park",
        retailerSlug: "outlet-park",
        address: "BIG Fashion Park",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["big-fashion"],
    relatedBrandSlugs: ["tommy-hilfiger", "guess", "levis"],
  },
  {
    slug: "lacoste",
    name: "Lacoste",
    category: "fashion",
    country: "Francuska",
    website: "https://www.lacoste.com",
    description:
      "Francuski heritage brend sa ikoničnim krokodilom, poznat po polo majicama i sportskoj eleganciji.",
    priceSegment: "premium",
    availabilityCount: 11,
    featured: false,
    popular: false,
    locations: [
      {
        id: "15",
        storeName: "Premium Mall Stores",
        retailerSlug: "premium-mall",
        address: "Delta City",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["delta-city"],
    relatedBrandSlugs: ["polo-ralph-lauren", "tommy-hilfiger"],
  },
  {
    slug: "tory-burch",
    name: "Tory Burch",
    category: "luxury",
    country: "SAD",
    website: "https://www.toryburch.com",
    description:
      "Američki luxury lifestyle brend poznat po aksesoarima, obući i prepoznatljivom logo detalju.",
    priceSegment: "luxury",
    availabilityCount: 4,
    featured: false,
    popular: false,
    locations: [
      {
        id: "17",
        storeName: "Luxury Gallery",
        retailerSlug: "luxury-gallery",
        address: "Rajiceva Shopping Center",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["rajiceva"],
    relatedBrandSlugs: ["coach", "michael-kors", "kate-spade"],
  },
  {
    slug: "timberland",
    name: "Timberland",
    category: "lifestyle",
    country: "SAD",
    website: "https://www.timberland.com",
    description:
      "Outdoor-lifestyle brend sa ikoničnim čizmama i održivim pristupom modi.",
    priceSegment: "mid",
    availabilityCount: 14,
    featured: false,
    popular: false,
    locations: [
      {
        id: "18",
        storeName: "Footwear Plus",
        retailerSlug: "footwear-plus",
        address: "BIG Fashion Park",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["big-fashion", "zlatibor"],
    relatedBrandSlugs: ["north-face", "columbia", "levis"],
  },
  {
    slug: "arket",
    name: "ARKET",
    category: "lifestyle",
    country: "Švedska",
    website: "https://www.arket.com",
    description:
      "Nordijski lifestyle brend koji spaja modu, dom i održivost u jedinstven retail koncept.",
    priceSegment: "premium",
    availabilityCount: 3,
    featured: false,
    popular: false,
    locations: [
      {
        id: "21",
        storeName: "Fashion Company",
        retailerSlug: "fashion-company",
        address: "Ušće Shopping Center",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["usce"],
    relatedBrandSlugs: ["cos", "scotch-and-soda"],
  },
  {
    slug: "mac",
    name: "MAC Cosmetics",
    category: "beauty",
    country: "Kanada",
    website: "https://www.maccosmetics.com",
    description:
      "Profesionalna kozmetika za šminkere i beauty entuzijaste sa premium pozicioniranjem.",
    priceSegment: "premium",
    availabilityCount: 9,
    featured: false,
    popular: false,
    locations: [
      {
        id: "22",
        storeName: "Beauty World",
        retailerSlug: "beauty-world",
        address: "Galerija Beograd",
        city: "Beograd",
      },
    ],
    shoppingCenterSlugs: ["galerija"],
    relatedBrandSlugs: ["rituals", "clinique", "estee-lauder"],
  },
  {
    slug: "north-face",
    name: "The North Face",
    category: "sports",
    country: "SAD",
    website: "https://www.thenorthface.com",
    description:
      "Vodeći outdoor brend za planinarenje, urbani lifestyle i performans odeću.",
    priceSegment: "premium",
    availabilityCount: 10,
    featured: false,
    popular: false,
    locations: [
      {
        id: "23",
        storeName: "Sport Vision",
        retailerSlug: "sport-vision",
        address: "Stop Shop Zlatibor",
        city: "Zlatibor",
      },
    ],
    shoppingCenterSlugs: ["zlatibor", "stadion"],
    relatedBrandSlugs: ["columbia", "timberland", "patagonia"],
  },
];

const coreWithoutCurated = coreBrands.filter((b) => !CURATED_SLUGS.has(b.slug));

function dedupeBrandsBySlug(list: Brand[]): Brand[] {
  const seen = new Set<string>();
  return list.filter((brand) => {
    if (seen.has(brand.slug)) return false;
    seen.add(brand.slug);
    return true;
  });
}

const DEPRECATED_BRAND_SLUG_SET = new Set<string>(DEPRECATED_BRAND_SLUGS);

export const brands: Brand[] = dedupeBrandsBySlug([
  ...coreWithoutCurated,
  ...buildFastFashionBrands(),
  ...buildFashionSportBrands(),
  ...buildFashionAndFriendsDirectoryBrands(
    new Set([
      ...coreWithoutCurated.map((b) => b.slug),
      ...CURATED_SLUGS,
    ])
  ),
]).filter((b) => !DEPRECATED_BRAND_SLUG_SET.has(b.slug));

export function getBrandBySlug(slug: string): Brand | undefined {
  if (DEPRECATED_BRAND_SLUG_SET.has(slug)) return undefined;
  return brands.find((b) => b.slug === slug);
}

const FEATURED_EXCLUDED_RETAILERS = new Set([
  "fashion-company",
  "fashion-friends",
]);

export function getFeaturedBrands(): Brand[] {
  return brands
    .filter((b) =>
      b.locations.some(
        (loc) => !FEATURED_EXCLUDED_RETAILERS.has(loc.retailerSlug)
      )
    )
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return b.availabilityCount - a.availabilityCount;
    })
    .slice(0, 20);
}

export function getPopularBrands(): Brand[] {
  return brands.filter((b) => b.popular);
}

export function getBrandsByCategory(category: string): Brand[] {
  return brands.filter((b) => b.category === category);
}

