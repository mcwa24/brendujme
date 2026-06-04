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
  website: string;
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
}

export interface ShoppingCenter {
  slug: string;
  name: string;
  city: string;
  brandCount: number;
  description: string;
  brandSlugs: string[];
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
}

export type SearchResultType = "brand" | "retailer" | "shopping-center";

export interface SearchResult {
  type: SearchResultType;
  slug: string;
  title: string;
  subtitle: string;
  href: string;
}
