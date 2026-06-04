-- =============================================================================
-- Brands Serbia (Bilbord Brands) — Production PostgreSQL Schema
-- Supabase project: wbmvlooxrwdmqsyxfpia
-- Target scale: 10k+ brands, 5k+ retailers, 20k+ stores, 500+ malls, 100k+ campaigns
--
-- Run once in SQL Editor (replaces legacy 001_initial_schema if present).
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- 0. CLEANUP (legacy prototype tables)
-- =============================================================================
DROP TABLE IF EXISTS news_article_brands CASCADE;
DROP TABLE IF EXISTS news_articles CASCADE;
DROP TABLE IF EXISTS brand_segments CASCADE;
DROP TABLE IF EXISTS product_segments CASCADE;
DROP TABLE IF EXISTS retailer_brands CASCADE;
DROP TABLE IF EXISTS brand_related CASCADE;
DROP TABLE IF EXISTS brand_shopping_centers CASCADE;
DROP TABLE IF EXISTS brand_locations CASCADE;
DROP TABLE IF EXISTS fc_stores CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS shopping_centers CASCADE;
DROP TABLE IF EXISTS retailers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

DROP TYPE IF EXISTS publish_status CASCADE;
DROP TYPE IF EXISTS campaign_type CASCADE;
DROP TYPE IF EXISTS campaign_target_type CASCADE;
DROP TYPE IF EXISTS campaign_status CASCADE;
DROP TYPE IF EXISTS store_status CASCADE;
DROP TYPE IF EXISTS price_segment CASCADE;
DROP TYPE IF EXISTS seo_entity_type CASCADE;
DROP TYPE IF EXISTS claim_status CASCADE;
DROP TYPE IF EXISTS promotion_placement CASCADE;

-- =============================================================================
-- 1. ENUMS
-- =============================================================================
CREATE TYPE publish_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE price_segment AS ENUM ('budget', 'mid', 'premium', 'luxury');
CREATE TYPE store_status AS ENUM ('open', 'closed', 'temporarily_closed', 'coming_soon');
CREATE TYPE campaign_type AS ENUM (
  'sale',
  'seasonal',
  'black_friday',
  'clearance',
  'new_collection',
  'collaboration',
  'other'
);
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'active', 'ended', 'cancelled');
CREATE TYPE campaign_target_type AS ENUM ('brand', 'retailer', 'shopping_center');
CREATE TYPE seo_entity_type AS ENUM (
  'brand',
  'category',
  'retailer',
  'shopping_center',
  'campaign',
  'article',
  'store_location'
);
CREATE TYPE claim_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE promotion_placement AS ENUM (
  'home_hero',
  'directory_featured',
  'search_boost',
  'campaign_spotlight'
);

-- =============================================================================
-- 2. CORE ENTITIES
-- =============================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  parent_category_id UUID REFERENCES categories (id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  status publish_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT categories_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_categories_parent ON categories (parent_category_id);
CREATE INDEX idx_categories_status ON categories (status) WHERE status = 'published';

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  region VARCHAR(120),
  country_code CHAR(2) NOT NULL DEFAULT 'RS',
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT cities_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_cities_name_trgm ON cities USING gin (name gin_trgm_ops);

CREATE TABLE retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  website VARCHAR(500),
  description TEXT NOT NULL DEFAULT '',
  short_description VARCHAR(320),
  logo_url TEXT,
  logo_storage_path TEXT,
  headquarters_city VARCHAR(120),
  headquarters_city_id UUID REFERENCES cities (id) ON DELETE SET NULL,
  status publish_status NOT NULL DEFAULT 'published',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT retailers_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT retailers_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_retailers_status ON retailers (status) WHERE status = 'published';
CREATE INDEX idx_retailers_featured ON retailers (is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_retailers_name_trgm ON retailers USING gin (name gin_trgm_ops);
CREATE INDEX idx_retailers_search ON retailers USING gin (search_vector);

CREATE TABLE shopping_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  city VARCHAR(120) NOT NULL,
  city_id UUID REFERENCES cities (id) ON DELETE SET NULL,
  address TEXT NOT NULL DEFAULT '',
  website VARCHAR(500),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  description TEXT NOT NULL DEFAULT '',
  short_description VARCHAR(320),
  logo_url TEXT,
  logo_storage_path TEXT,
  status publish_status NOT NULL DEFAULT 'published',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT shopping_centers_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT shopping_centers_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_shopping_centers_city ON shopping_centers (city_id);
CREATE INDEX idx_shopping_centers_status ON shopping_centers (status) WHERE status = 'published';
CREATE INDEX idx_shopping_centers_geo ON shopping_centers (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_shopping_centers_name_trgm ON shopping_centers USING gin (name gin_trgm_ops);
CREATE INDEX idx_shopping_centers_search ON shopping_centers USING gin (search_vector);

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  short_description VARCHAR(320),
  website VARCHAR(500),
  country_of_origin VARCHAR(120),
  founded_year SMALLINT,
  category_id UUID NOT NULL REFERENCES categories (id),
  logo_url TEXT,
  logo_storage_path TEXT,
  price_segment price_segment,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  ff_slug VARCHAR(120),
  status publish_status NOT NULL DEFAULT 'published',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT brands_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT brands_slug_unique UNIQUE (slug),
  CONSTRAINT brands_founded_year CHECK (
    founded_year IS NULL OR (founded_year >= 1800 AND founded_year <= EXTRACT(YEAR FROM NOW())::INT + 1)
  )
);

CREATE INDEX idx_brands_category ON brands (category_id);
CREATE INDEX idx_brands_status ON brands (status) WHERE status = 'published';
CREATE INDEX idx_brands_featured ON brands (is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_brands_popular ON brands (is_popular) WHERE is_popular = TRUE;
CREATE INDEX idx_brands_name_trgm ON brands USING gin (name gin_trgm_ops);
CREATE INDEX idx_brands_search ON brands USING gin (search_vector);
CREATE INDEX idx_brands_ff_slug ON brands (ff_slug) WHERE ff_slug IS NOT NULL;

CREATE TABLE store_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers (id) ON DELETE CASCADE,
  shopping_center_id UUID REFERENCES shopping_centers (id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  city VARCHAR(120) NOT NULL,
  city_id UUID REFERENCES cities (id) ON DELETE SET NULL,
  address TEXT NOT NULL DEFAULT '',
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  phone VARCHAR(40),
  working_hours JSONB NOT NULL DEFAULT '{}'::JSONB,
  status store_status NOT NULL DEFAULT 'open',
  publish_status publish_status NOT NULL DEFAULT 'published',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT store_locations_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT store_locations_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_store_locations_retailer ON store_locations (retailer_id);
CREATE INDEX idx_store_locations_mall ON store_locations (shopping_center_id)
  WHERE shopping_center_id IS NOT NULL;
CREATE INDEX idx_store_locations_city ON store_locations (city_id);
CREATE INDEX idx_store_locations_city_name ON store_locations (city);
CREATE INDEX idx_store_locations_status ON store_locations (publish_status)
  WHERE publish_status = 'published';
CREATE INDEX idx_store_locations_search ON store_locations USING gin (search_vector);
CREATE INDEX idx_store_locations_geo ON store_locations (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- =============================================================================
-- 3. RELATIONSHIPS
-- =============================================================================

CREATE TABLE brand_retailers (
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES retailers (id) ON DELETE CASCADE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_primary_distributor BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (brand_id, retailer_id)
);

CREATE INDEX idx_brand_retailers_retailer ON brand_retailers (retailer_id);
CREATE INDEX idx_brand_retailers_verified ON brand_retailers (verified) WHERE verified = TRUE;

CREATE TABLE brand_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE CASCADE,
  store_location_id UUID NOT NULL REFERENCES store_locations (id) ON DELETE CASCADE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT brand_locations_unique UNIQUE (brand_id, store_location_id)
);

CREATE INDEX idx_brand_locations_brand ON brand_locations (brand_id);
CREATE INDEX idx_brand_locations_store ON brand_locations (store_location_id);
CREATE INDEX idx_brand_locations_verified ON brand_locations (verified) WHERE verified = TRUE;

CREATE TABLE brand_related (
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE CASCADE,
  related_brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (brand_id, related_brand_id),
  CONSTRAINT brand_related_not_self CHECK (brand_id <> related_brand_id)
);

CREATE INDEX idx_brand_related_related ON brand_related (related_brand_id);

-- Denormalized mall presence (brand available in center via any store)
CREATE TABLE brand_shopping_center_presence (
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE CASCADE,
  shopping_center_id UUID NOT NULL REFERENCES shopping_centers (id) ON DELETE CASCADE,
  store_count INT NOT NULL DEFAULT 0,
  last_verified_at TIMESTAMPTZ,
  PRIMARY KEY (brand_id, shopping_center_id)
);

CREATE INDEX idx_brand_mall_presence_mall ON brand_shopping_center_presence (shopping_center_id);

-- =============================================================================
-- 4. CAMPAIGNS
-- =============================================================================

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(240) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  short_description VARCHAR(320),
  campaign_type campaign_type NOT NULL DEFAULT 'sale',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  banner_image TEXT,
  banner_storage_path TEXT,
  status campaign_status NOT NULL DEFAULT 'draft',
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT campaigns_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT campaigns_slug_unique UNIQUE (slug),
  CONSTRAINT campaigns_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_campaigns_status_dates ON campaigns (status, start_date, end_date);
CREATE INDEX idx_campaigns_active ON campaigns (start_date, end_date)
  WHERE status = 'active';
CREATE INDEX idx_campaigns_search ON campaigns USING gin (search_vector);
CREATE INDEX idx_campaigns_type ON campaigns (campaign_type);

CREATE TABLE campaign_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
  target_type campaign_target_type NOT NULL,
  brand_id UUID REFERENCES brands (id) ON DELETE CASCADE,
  retailer_id UUID REFERENCES retailers (id) ON DELETE CASCADE,
  shopping_center_id UUID REFERENCES shopping_centers (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT campaign_targets_one_fk CHECK (
    (target_type = 'brand' AND brand_id IS NOT NULL AND retailer_id IS NULL AND shopping_center_id IS NULL)
    OR (target_type = 'retailer' AND retailer_id IS NOT NULL AND brand_id IS NULL AND shopping_center_id IS NULL)
    OR (target_type = 'shopping_center' AND shopping_center_id IS NOT NULL AND brand_id IS NULL AND retailer_id IS NULL)
  )
);

CREATE UNIQUE INDEX uq_campaign_target_brand
  ON campaign_targets (campaign_id, brand_id) WHERE brand_id IS NOT NULL;
CREATE UNIQUE INDEX uq_campaign_target_retailer
  ON campaign_targets (campaign_id, retailer_id) WHERE retailer_id IS NOT NULL;
CREATE UNIQUE INDEX uq_campaign_target_mall
  ON campaign_targets (campaign_id, shopping_center_id) WHERE shopping_center_id IS NOT NULL;
CREATE INDEX idx_campaign_targets_campaign ON campaign_targets (campaign_id);

-- =============================================================================
-- 5. ARTICLES (NEWS / EDITORIAL)
-- =============================================================================

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(280) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  featured_image TEXT,
  featured_image_storage_path TEXT,
  published_at TIMESTAMPTZ,
  status publish_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT articles_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT articles_slug_unique UNIQUE (slug)
);

CREATE INDEX idx_articles_published ON articles (published_at DESC)
  WHERE status = 'published';
CREATE INDEX idx_articles_featured ON articles (is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_articles_search ON articles USING gin (search_vector);

CREATE TABLE article_brands (
  article_id UUID NOT NULL REFERENCES articles (id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, brand_id)
);

CREATE INDEX idx_article_brands_brand ON article_brands (brand_id);

CREATE TABLE article_retailers (
  article_id UUID NOT NULL REFERENCES articles (id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES retailers (id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, retailer_id)
);

CREATE TABLE article_shopping_centers (
  article_id UUID NOT NULL REFERENCES articles (id) ON DELETE CASCADE,
  shopping_center_id UUID NOT NULL REFERENCES shopping_centers (id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, shopping_center_id)
);

-- =============================================================================
-- 6. SEO (unified per entity)
-- =============================================================================

CREATE TABLE seo_metadata (
  entity_type seo_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  meta_title VARCHAR(70),
  meta_description VARCHAR(160),
  og_image TEXT,
  og_image_storage_path TEXT,
  canonical_path VARCHAR(500),
  no_index BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (entity_type, entity_id)
);

CREATE INDEX idx_seo_canonical ON seo_metadata (canonical_path)
  WHERE canonical_path IS NOT NULL;

-- =============================================================================
-- 7. FUTURE FEATURES (schema-ready, optional RLS later)
-- =============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name VARCHAR(120),
  avatar_url TEXT,
  role VARCHAR(40) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_favorite_brands (
  user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, brand_id)
);

CREATE TABLE user_favorite_retailers (
  user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  retailer_id UUID NOT NULL REFERENCES retailers (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, retailer_id)
);

CREATE TABLE brand_claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands (id) ON DELETE CASCADE,
  requester_user_id UUID REFERENCES profiles (id) ON DELETE SET NULL,
  company_name VARCHAR(200),
  contact_email VARCHAR(255) NOT NULL,
  message TEXT,
  status claim_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_brand_claims_status ON brand_claim_requests (status);

CREATE TABLE retailer_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  role VARCHAR(40) NOT NULL DEFAULT 'editor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT retailer_members_unique UNIQUE (retailer_id, user_id)
);

CREATE TABLE sponsored_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement promotion_placement NOT NULL,
  campaign_id UUID REFERENCES campaigns (id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands (id) ON DELETE SET NULL,
  retailer_id UUID REFERENCES retailers (id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sponsored_placements_dates CHECK (ends_at > starts_at)
);

CREATE INDEX idx_sponsored_active ON sponsored_placements (placement, starts_at, ends_at)
  WHERE is_active = TRUE;

-- =============================================================================
-- 8. TRIGGERS — updated_at + search vectors
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_categories_updated
  BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_retailers_updated
  BEFORE UPDATE ON retailers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_shopping_centers_updated
  BEFORE UPDATE ON shopping_centers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_brands_updated
  BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_store_locations_updated
  BEFORE UPDATE ON store_locations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_campaigns_updated
  BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_articles_updated
  BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION brands_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(NEW.country_of_origin, '')), 'D');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_brands_search_vector
  BEFORE INSERT OR UPDATE OF name, short_description, description, country_of_origin
  ON brands FOR EACH ROW EXECUTE FUNCTION brands_search_vector_update();

CREATE OR REPLACE FUNCTION retailers_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_retailers_search_vector
  BEFORE INSERT OR UPDATE OF name, short_description, description
  ON retailers FOR EACH ROW EXECUTE FUNCTION retailers_search_vector_update();

CREATE OR REPLACE FUNCTION shopping_centers_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.city, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_shopping_centers_search_vector
  BEFORE INSERT OR UPDATE OF name, city, description
  ON shopping_centers FOR EACH ROW EXECUTE FUNCTION shopping_centers_search_vector_update();

CREATE OR REPLACE FUNCTION campaigns_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_campaigns_search_vector
  BEFORE INSERT OR UPDATE OF title, short_description, description
  ON campaigns FOR EACH ROW EXECUTE FUNCTION campaigns_search_vector_update();

CREATE OR REPLACE FUNCTION articles_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.content, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_articles_search_vector
  BEFORE INSERT OR UPDATE OF title, excerpt, content
  ON articles FOR EACH ROW EXECUTE FUNCTION articles_search_vector_update();

CREATE OR REPLACE FUNCTION store_locations_search_vector_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.city, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.address, '')), 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_store_locations_search_vector
  BEFORE INSERT OR UPDATE OF name, city, address
  ON store_locations FOR EACH ROW EXECUTE FUNCTION store_locations_search_vector_update();

-- =============================================================================
-- 9. HELPER VIEWS (public discovery)
-- =============================================================================

CREATE OR REPLACE VIEW v_published_brands
WITH (security_invoker = true)
AS
SELECT
  b.*,
  c.name AS category_name,
  c.slug AS category_slug
FROM brands b
JOIN categories c ON c.id = b.category_id
WHERE b.status = 'published' AND c.status = 'published';

CREATE OR REPLACE VIEW v_active_campaigns
WITH (security_invoker = true)
AS
SELECT *
FROM campaigns
WHERE status = 'active'
  AND start_date <= CURRENT_DATE
  AND end_date >= CURRENT_DATE;

REVOKE ALL ON v_published_brands FROM PUBLIC;
REVOKE ALL ON v_active_campaigns FROM PUBLIC;
GRANT SELECT ON v_published_brands TO anon, authenticated, service_role;
GRANT SELECT ON v_active_campaigns TO anon, authenticated, service_role;

-- =============================================================================
-- 10. GLOBAL SEARCH RPC (Supabase-friendly)
-- =============================================================================

CREATE OR REPLACE FUNCTION search_directory(q TEXT, result_limit INT DEFAULT 20)
RETURNS TABLE (
  entity_type TEXT,
  entity_id UUID,
  slug TEXT,
  title TEXT,
  subtitle TEXT,
  relevance REAL
)
LANGUAGE sql
STABLE
AS $$
  WITH query AS (
    SELECT plainto_tsquery('simple', q) AS tsq, lower(q) AS raw
  )
  SELECT
    combined.entity_type,
    combined.entity_id,
    combined.slug,
    combined.title,
    combined.subtitle,
    combined.relevance
  FROM (
    SELECT
      'brand'::TEXT AS entity_type,
      b.id AS entity_id,
      b.slug,
      b.name AS title,
      COALESCE(b.short_description, b.country_of_origin, '')::TEXT AS subtitle,
      ts_rank(b.search_vector, query.tsq)::REAL AS relevance
    FROM brands b, query
    WHERE b.status = 'published'
      AND (b.search_vector @@ query.tsq OR b.name ILIKE '%' || query.raw || '%')
    UNION ALL
    SELECT
      'retailer'::TEXT,
      r.id,
      r.slug,
      r.name,
      COALESCE(r.headquarters_city, '')::TEXT,
      ts_rank(r.search_vector, query.tsq)::REAL
    FROM retailers r, query
    WHERE r.status = 'published'
      AND (r.search_vector @@ query.tsq OR r.name ILIKE '%' || query.raw || '%')
    UNION ALL
    SELECT
      'shopping_center'::TEXT,
      sc.id,
      sc.slug,
      sc.name,
      sc.city::TEXT,
      ts_rank(sc.search_vector, query.tsq)::REAL
    FROM shopping_centers sc, query
    WHERE sc.status = 'published'
      AND (sc.search_vector @@ query.tsq OR sc.name ILIKE '%' || query.raw || '%' OR sc.city ILIKE '%' || query.raw || '%')
    UNION ALL
    SELECT
      'store'::TEXT,
      sl.id,
      sl.slug,
      sl.name,
      sl.city::TEXT,
      ts_rank(sl.search_vector, query.tsq)::REAL
    FROM store_locations sl, query
    WHERE sl.publish_status = 'published'
      AND (sl.search_vector @@ query.tsq OR sl.city ILIKE '%' || query.raw || '%')
    UNION ALL
    SELECT
      'city'::TEXT,
      ci.id,
      ci.slug,
      ci.name,
      COALESCE(ci.region, '')::TEXT,
      0.1::REAL
    FROM cities ci, query
    WHERE ci.name ILIKE '%' || query.raw || '%'
  ) combined
  ORDER BY combined.relevance DESC, combined.title
  LIMIT GREATEST(result_limit, 1);
$$;

-- =============================================================================
-- 11. ROW LEVEL SECURITY (public read, write via service role)
-- =============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_related ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_shopping_center_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_shopping_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_cities" ON cities FOR SELECT USING (true);
CREATE POLICY "public_read_retailers" ON retailers FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_malls" ON shopping_centers FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_brands" ON brands FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_stores" ON store_locations FOR SELECT USING (publish_status = 'published');
CREATE POLICY "public_read_brand_retailers" ON brand_retailers FOR SELECT USING (true);
CREATE POLICY "public_read_brand_locations" ON brand_locations FOR SELECT USING (true);
CREATE POLICY "public_read_brand_related" ON brand_related FOR SELECT USING (true);
CREATE POLICY "public_read_brand_mall_presence" ON brand_shopping_center_presence FOR SELECT USING (true);
CREATE POLICY "public_read_campaigns" ON campaigns FOR SELECT USING (status IN ('active', 'scheduled', 'ended'));
CREATE POLICY "public_read_campaign_targets" ON campaign_targets FOR SELECT USING (true);
CREATE POLICY "public_read_articles" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "public_read_article_brands" ON article_brands FOR SELECT USING (true);
CREATE POLICY "public_read_article_retailers" ON article_retailers FOR SELECT USING (true);
CREATE POLICY "public_read_article_malls" ON article_shopping_centers FOR SELECT USING (true);
CREATE POLICY "public_read_seo" ON seo_metadata FOR SELECT USING (no_index = false);

-- Future tables: RLS off until auth flows exist (service role only)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_retailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsored_placements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_sponsored" ON sponsored_placements
  FOR SELECT USING (is_active = TRUE AND starts_at <= NOW() AND ends_at >= NOW());

-- =============================================================================
-- 12. SEED LOOKUP DATA (categories + cities)
-- =============================================================================

INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Moda', 'fashion', 'Savremena i luksuzna moda', 1),
  ('Lepota', 'beauty', 'Kozmetika, parfemi i nega', 2),
  ('Sport', 'sports', 'Sportska odeća i oprema', 3),
  ('Luksuz', 'luxury', 'Premium i luksuzni brendovi', 4),
  ('Lifestyle', 'lifestyle', 'Lifestyle i urbani brendovi', 5),
  ('Dom', 'home', 'Dom i enterijer', 6),
  ('Tehnologija', 'technology', 'Tehnologija i gadžeti', 7),
  ('Deca', 'kids', 'Moda i proizvodi za decu', 8)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, description, parent_category_id, sort_order)
SELECT 'Obuća', 'footwear', 'Patike, čizme, sandale', id, 10
FROM categories WHERE slug = 'fashion'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (name, slug, region) VALUES
  ('Beograd', 'beograd', 'Grad Beograd'),
  ('Novi Beograd', 'novi-beograd', 'Beograd'),
  ('Novi Sad', 'novi-sad', 'Južnobački okrug'),
  ('Niš', 'nis', 'Nišavski okrug'),
  ('Kragujevac', 'kragujevac', 'Šumadija'),
  ('Zlatibor', 'zlatibor', 'Zlatibor')
ON CONFLICT (slug) DO NOTHING;
