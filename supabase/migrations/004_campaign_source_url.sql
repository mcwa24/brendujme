-- Tačan srpski URL stranice akcije (baner klik → ista stranica odakle je detektovano)
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS discount_percent SMALLINT,
  ADD COLUMN IF NOT EXISTS promo_scope VARCHAR(320);

COMMENT ON COLUMN campaigns.source_url IS 'Stranica akcije na srpskom shopu (npr. reserved.com/rs/sr/...)';

-- Poznate akcije: slug lpp-rs-sr = detekcija sa Reserved RS početne
UPDATE campaigns
SET source_url = 'https://www.reserved.com/rs/sr/'
WHERE slug = 'lpp-rs-sr'
  AND (source_url IS NULL OR source_url = '' OR source_url LIKE '%lpp.com%');
