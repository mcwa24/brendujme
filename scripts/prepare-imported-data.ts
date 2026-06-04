/**
 * Osvežava scraped JSON fajlove pre seed-a u Supabase (samo moda / sport).
 */

import { execSync } from "child_process";

const STEPS: { name: string; cmd: string; optional?: boolean }[] = [
  { name: "Fashion & sport", cmd: "npm run build:fashion-sport" },
  { name: "Tike brendovi", cmd: "npm run scrape:tike", optional: true },
  { name: "Fast fashion", cmd: "npm run scrape:fashion", optional: true },
];

function runStep(name: string, cmd: string, optional?: boolean) {
  console.log(`\n▶ ${name}…`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: process.cwd() });
  } catch {
    if (optional) {
      console.warn(`  ⚠ ${name} nije uspeo — koristi se postojeći JSON`);
      return;
    }
    throw new Error(`${name} failed`);
  }
}

function main() {
  console.log("Priprema fashion podataka…");
  for (const step of STEPS) {
    runStep(step.name, step.cmd, step.optional);
  }
  console.log("\n✓ Priprema završena.\n");
}

main();
