-- =============================================================================
-- Fix Supabase "UNRESTRICTED" warning on public views
-- Views default to SECURITY DEFINER (postgres) and bypass RLS.
-- security_invoker = true → view respects RLS on brands / campaigns / categories
-- =============================================================================

-- Existing views (quick fix)
ALTER VIEW public.v_published_brands SET (security_invoker = true);
ALTER VIEW public.v_active_campaigns SET (security_invoker = true);

-- Recreate with explicit option (idempotent, same definitions)
CREATE OR REPLACE VIEW public.v_published_brands
WITH (security_invoker = true)
AS
SELECT
  b.*,
  c.name AS category_name,
  c.slug AS category_slug
FROM public.brands b
JOIN public.categories c ON c.id = b.category_id
WHERE b.status = 'published'
  AND c.status = 'published';

CREATE OR REPLACE VIEW public.v_active_campaigns
WITH (security_invoker = true)
AS
SELECT *
FROM public.campaigns
WHERE status = 'active'
  AND start_date <= CURRENT_DATE
  AND end_date >= CURRENT_DATE;

-- API access (anon + authenticated use invoker RLS)
REVOKE ALL ON public.v_published_brands FROM PUBLIC;
REVOKE ALL ON public.v_active_campaigns FROM PUBLIC;

GRANT SELECT ON public.v_published_brands TO anon, authenticated, service_role;
GRANT SELECT ON public.v_active_campaigns TO anon, authenticated, service_role;
