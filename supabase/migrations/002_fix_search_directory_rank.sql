-- Fix: "rank" is reserved in PostgreSQL (conflicts with rank() window function)
-- Run this if 001_production_schema.sql failed at search_directory CREATE

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
