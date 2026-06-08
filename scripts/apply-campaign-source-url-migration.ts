/**
 * Dodaje source_url u campaigns + popunjava LPP akciju.
 * Pokreni SQL ručno u Supabase SQL Editoru ako skripta ne može DDL:
 *   supabase/migrations/004_campaign_source_url.sql
 *
 * npx tsx --env-file=.env.local scripts/apply-campaign-source-url-migration.ts
 */

import { createSupabaseAdminClient } from "../src/lib/supabase/server";

const MIGRATION_SQL = `
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS discount_percent SMALLINT,
  ADD COLUMN IF NOT EXISTS promo_scope VARCHAR(320);
`;

async function main() {
  const db = createSupabaseAdminClient();
  if (!db) {
    console.error("Supabase admin nije konfigurisan.");
    process.exit(1);
  }

  console.log("Ako kolone ne postoje, pokreni u Supabase SQL Editoru:\n");
  console.log(MIGRATION_SQL);
  console.log("\n---\n");

  const { error: updateErr } = await db
    .from("campaigns")
    .update({
      source_url: "https://www.reserved.com/rs/sr/",
      discount_percent: 30,
      promo_scope: "ženske haljine i košulje, muške polo majice i pantalone",
    })
    .eq("slug", "lpp-rs-sr");

  if (updateErr) {
    console.error(
      "Update nije uspeo (verovatno fale kolone — prvo pokreni migraciju SQL):\n",
      updateErr.message
    );
    process.exit(1);
  }

  console.log("✓ lpp-rs-sr → source_url https://www.reserved.com/rs/sr/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
