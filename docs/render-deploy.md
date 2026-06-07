# Render deployment (promotions scanner)

Deploy the existing Next.js app as a **Docker Web Service** on Render. The promotions pipeline uses the existing endpoint:

`POST /api/cron/scan-promotions`

No separate scanner service is required.

## Render settings

| Field | Value |
| --- | --- |
| Runtime | **Docker** |
| Dockerfile path | `./Dockerfile` |
| Build Command | *(leave empty — Docker builds the image)* |
| Start Command | *(leave empty — uses `CMD` in Dockerfile)* |
| Instance type | **≥ 1 GB RAM** (2 GB recommended while scan runs) |

## Environment variables

Set these in **Render Dashboard → Environment** (and enable **Sync to build** for `NEXT_PUBLIC_*` if the Next.js build needs them).

### Required for `POST /api/cron/scan-promotions`

| Variable | Purpose |
| --- | --- |
| `BRANDS_CRON_SECRET` | Auth secret for cron routes (or use `CRON_SECRET`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin client for seeding `campaigns` |

Send the secret as:

- `Authorization: Bearer <secret>`, or
- header `x-cron-secret: <secret>`

### Recommended for detect quality

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Banner Vision + HTML AI extraction |
| `OPENAI_MODEL` | Optional; default `gpt-4o-mini` |
| `OPENAI_VISION_MODEL` | Optional; default `gpt-4o-mini` |

Without `OPENAI_API_KEY`, detect still runs (heuristics + banners) with lower quality.

### Required for the public site (same service)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase read client |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (e.g. `https://shop.bilbord.rs`) |

### Optional (other app features)

| Variable | Purpose |
| --- | --- |
| `UNSPLASH_ACCESS_KEY` | Home promotion banner images |
| `GHOST_ADMIN_URL`, `GHOST_ADMIN_KEY`, `GHOST_PUBLIC_SITE_URL` | News section |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_CONTACT_TO` | Contact form |

### Do not set on Render

| Variable | Reason |
| --- | --- |
| `VERCEL=1` | Would skip detect (Vercel-only guard) |
| `PW_HEADED=1` | No display on server |
| `PW_CHROME_CHANNEL=chrome` | Use Playwright bundled `chromium` (default) |

## Test the scan endpoint

```bash
curl -X POST "https://<your-service>.onrender.com/api/cron/scan-promotions" \
  -H "Authorization: Bearer $BRANDS_CRON_SECRET" \
  -H "Content-Type: application/json"
```

Success response includes `ok: true`, `promotions`, and `seed` (see existing API contract).

## Optional: scheduled scan

Render **Cron Jobs** → daily HTTP call to the same URL with the same auth header.

## Notes

- Scan may take several minutes; the CLI subprocess timeout is ~280s.
- `retailer-promotions-scraped.json` on disk is ephemeral; seed writes to Supabase.
- Home page cache may lag up to ~1h after seed (ISR); no revalidate hook in this deploy.
