/**
 * Ažurira opis prodavaca u Supabase iz statičkog retailers.ts (bez broja brendova u tekstu).
 * npm run db:sync:retailers
 */

import { fashionCompanyRetailer } from "../src/lib/data/fashion-company";
import { retailers } from "../src/lib/data/retailers";
import { createSupabaseAdminClient } from "../src/lib/supabase/server";
import { isSupabaseSeedConfigured } from "../src/lib/supabase/env";

const bySlug = new Map(
  [...retailers, fashionCompanyRetailer].map((r) => [r.slug, r])
);

async function main() {
  if (!isSupabaseSeedConfigured()) {
    console.error(
      "Postavi NEXT_PUBLIC_SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY u .env.local"
    );
    process.exit(1);
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) process.exit(1);

  console.log(`Ažuriranje opisa za ${bySlug.size} prodavaca…`);

  for (const r of bySlug.values()) {
    const { error } = await supabase
      .from("retailers")
      .update({ description: r.description })
      .eq("slug", r.slug);

    if (error) {
      console.warn(`  ${r.slug}: ${error.message}`);
    } else {
      console.log(`  ✓ ${r.slug}`);
    }
  }

  console.log("\nGotovo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
