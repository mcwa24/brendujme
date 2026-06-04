export type CategorySlug =
  | "fashion"
  | "beauty"
  | "sports"
  | "luxury"
  | "lifestyle"
  | "home"
  | "technology"
  | "kids";

export type PriceSegment = "budget" | "mid" | "premium" | "luxury";

export type LogoSource = "upload" | "url" | "discovered";

export interface LogoManifestEntry {
  path: string;
  source: LogoSource;
}

export type LogoManifest = Record<string, LogoManifestEntry>;

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
}

export interface RetailLocation {
  id: string;
  storeName: string;
  retailerSlug: string;
  address: string;
  city: string;
}

export interface Brand {
  slug: string;
  name: string;
  category: CategorySlug;
  country: string;
  /** Zvanični sajt brenda — koristi se za offline otkrivanje logoa */
  website: string;
  /** URL logoa iz baze (prioritet #2) */
  logoUrl?: string;
  /** Putanja u Supabase Storage (bucket Photos) */
  logoStoragePath?: string;
  /** Ručno uploadovan logo u public/logos/{slug}.png */
  hasCustomLogo?: boolean;
  description: string;
  priceSegment: PriceSegment;
  availabilityCount: number;
  featured?: boolean;
  popular?: boolean;
  locations: RetailLocation[];
  shoppingCenterSlugs: string[];
  relatedBrandSlugs: string[];
}

export interface Retailer {
  slug: string;
  name: string;
  description: string;
  city: string;
  brandCount: number;
  brandSlugs: string[];
  logoUrl?: string;
}

export interface RetailerStore {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string | null;
  email?: string | null;
  shoppingCenterSlug?: string | null;
  shoppingCenterName?: string | null;
  storeUrl?: string | null;
}

export interface ShoppingCenter {
  slug: string;
  name: string;
  city: string;
  brandCount: number;
  description: string;
  brandSlugs: string[];
  logoUrl?: string;
  logoStoragePath?: string;
}

export interface NewsArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  category: string;
  featured?: boolean;
  brandSlugs?: string[];
  imageLabel: string;
  imageUrl?: string;
}

export type SearchResultType = "brand" | "retailer" | "shopping-center";

export interface SearchResult {
  type: SearchResultType;
  slug: string;
  title: string;
  subtitle: string;
  href: string;
}

export type BrandLogoInput = Pick<
  Brand,
  | "slug"
  | "name"
  | "category"
  | "website"
  | "logoUrl"
  | "logoStoragePath"
  | "hasCustomLogo"
>;
