export interface DbCategory {
  slug: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface DbBrand {
  slug: string;
  name: string;
  country_of_origin: string;
  website: string;
  description: string;
  short_description: string | null;
  price_segment: string;
  is_featured: boolean;
  is_popular: boolean;
  logo_url: string | null;
  logo_storage_path: string | null;
  categories: { slug: string } | { slug: string }[] | null;
}

export interface DbStoreLocationJoin {
  id: string;
  name: string;
  address: string;
  city: string;
  retailers: { slug: string } | { slug: string }[] | null;
}

export interface DbBrandLocationJoin {
  brand_id: string;
  store_locations: DbStoreLocationJoin | DbStoreLocationJoin[] | null;
}

export interface DbBrandMallPresence {
  brand_id: string;
  shopping_centers: { slug: string } | { slug: string }[] | null;
}

export interface DbBrandRelated {
  brand_id: string;
  related_brand_id: string;
}

export interface DbRetailer {
  slug: string;
  name: string;
  description: string;
  headquarters_city: string | null;
  logo_url: string | null;
  logo_storage_path: string | null;
  website: string | null;
}

export interface DbShoppingCenter {
  slug: string;
  name: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  logo_url: string | null;
  logo_storage_path: string | null;
}

export interface DbArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
  is_featured: boolean;
  featured_image: string | null;
  featured_image_storage_path: string | null;
}
