-- DEPRECATED — koristi 001_production_schema.sql
-- Bilbord Brands — početna šema (zamenjena produkcijskom arhitekturom)

-- Kategorije (moda, lepota, sport…)
CREATE TABLE IF NOT EXISTS categories (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Segmenti proizvoda (obuća, odeća, aksesoari…)
CREATE TABLE IF NOT EXISTS product_segments (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category_slug TEXT REFERENCES categories (slug) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS retailers (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  brand_count INT NOT NULL DEFAULT 0,
  logo_url TEXT,
  logo_storage_path TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_centers (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  brand_count INT NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  logo_storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brands (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_slug TEXT NOT NULL REFERENCES categories (slug),
  country TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price_segment TEXT NOT NULL CHECK (
    price_segment IN ('budget', 'mid', 'premium', 'luxury')
  ),
  availability_count INT NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  popular BOOLEAN NOT NULL DEFAULT FALSE,
  logo_url TEXT,
  logo_storage_path TEXT,
  ff_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_slug TEXT NOT NULL REFERENCES brands (slug) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  retailer_slug TEXT REFERENCES retailers (slug) ON DELETE SET NULL,
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS brand_shopping_centers (
  brand_slug TEXT NOT NULL REFERENCES brands (slug) ON DELETE CASCADE,
  shopping_center_slug TEXT NOT NULL REFERENCES shopping_centers (slug) ON DELETE CASCADE,
  PRIMARY KEY (brand_slug, shopping_center_slug)
);

CREATE TABLE IF NOT EXISTS brand_related (
  brand_slug TEXT NOT NULL REFERENCES brands (slug) ON DELETE CASCADE,
  related_slug TEXT NOT NULL REFERENCES brands (slug) ON DELETE CASCADE,
  PRIMARY KEY (brand_slug, related_slug),
  CHECK (brand_slug <> related_slug)
);

CREATE TABLE IF NOT EXISTS retailer_brands (
  retailer_slug TEXT NOT NULL REFERENCES retailers (slug) ON DELETE CASCADE,
  brand_slug TEXT NOT NULL REFERENCES brands (slug) ON DELETE CASCADE,
  PRIMARY KEY (retailer_slug, brand_slug)
);

CREATE TABLE IF NOT EXISTS brand_segments (
  brand_slug TEXT NOT NULL REFERENCES brands (slug) ON DELETE CASCADE,
  segment_slug TEXT NOT NULL REFERENCES product_segments (slug) ON DELETE CASCADE,
  PRIMARY KEY (brand_slug, segment_slug)
);

CREATE TABLE IF NOT EXISTS news_articles (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  published_at DATE NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  image_label TEXT NOT NULL DEFAULT '',
  image_storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_article_brands (
  article_slug TEXT NOT NULL REFERENCES news_articles (slug) ON DELETE CASCADE,
  brand_slug TEXT NOT NULL REFERENCES brands (slug) ON DELETE CASCADE,
  PRIMARY KEY (article_slug, brand_slug)
);

CREATE TABLE IF NOT EXISTS fc_stores (
  id TEXT PRIMARY KEY,
  store_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  brand_slug TEXT REFERENCES brands (slug) ON DELETE SET NULL,
  city_code TEXT,
  city_label TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  shopping_center TEXT,
  shopping_center_slug TEXT REFERENCES shopping_centers (slug) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'loyalty'
);

CREATE INDEX IF NOT EXISTS idx_brands_category ON brands (category_slug);
CREATE INDEX IF NOT EXISTS idx_brands_featured ON brands (featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_brands_popular ON brands (popular) WHERE popular = TRUE;
CREATE INDEX IF NOT EXISTS idx_brand_locations_brand ON brand_locations (brand_slug);

-- Javno čitanje (anon key), upis samo preko service role / dashboard
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_shopping_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_related ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_article_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE fc_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read_product_segments" ON product_segments FOR SELECT USING (true);
CREATE POLICY "public_read_retailers" ON retailers FOR SELECT USING (true);
CREATE POLICY "public_read_shopping_centers" ON shopping_centers FOR SELECT USING (true);
CREATE POLICY "public_read_brands" ON brands FOR SELECT USING (true);
CREATE POLICY "public_read_brand_locations" ON brand_locations FOR SELECT USING (true);
CREATE POLICY "public_read_brand_shopping_centers" ON brand_shopping_centers FOR SELECT USING (true);
CREATE POLICY "public_read_brand_related" ON brand_related FOR SELECT USING (true);
CREATE POLICY "public_read_retailer_brands" ON retailer_brands FOR SELECT USING (true);
CREATE POLICY "public_read_brand_segments" ON brand_segments FOR SELECT USING (true);
CREATE POLICY "public_read_news" ON news_articles FOR SELECT USING (true);
CREATE POLICY "public_read_news_brands" ON news_article_brands FOR SELECT USING (true);
CREATE POLICY "public_read_fc_stores" ON fc_stores FOR SELECT USING (true);

-- Storage bucket "Photos" — u Dashboardu: Storage → Photos → Policies
-- Primer politike za javne slike:
-- CREATE POLICY "public_read_photos" ON storage.objects FOR SELECT
--   USING (bucket_id = 'Photos');
