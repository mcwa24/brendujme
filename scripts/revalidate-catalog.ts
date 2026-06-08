/**
 * Osvežava Next.js katalog keš posle seed-a (brendovi, prodavci).
 * Zahteva pokrenut dev/prod server i BRANDS_CRON_SECRET ili CRON_SECRET u .env.local.
 */

async function main() {
  const base = (process.env.REVALIDATE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const secret =
    process.env.BRANDS_CRON_SECRET?.trim() || process.env.CRON_SECRET?.trim();

  if (!secret) {
    console.warn(
      "⚠ Nema BRANDS_CRON_SECRET / CRON_SECRET — preskačem revalidaciju (restartuj dev server posle seed-a)."
    );
    return;
  }

  const res = await fetch(`${base}/api/revalidate-catalog`, {
    method: "POST",
    headers: { "x-cron-secret": secret },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Revalidacija nije uspela (${res.status}): ${body}`);
    process.exit(1);
  }

  console.log("✓ Katalog keš osvežen.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
