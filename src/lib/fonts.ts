import { Golos_Text, Inter } from "next/font/google";

/** Body — ista porodica kao bilbord.rs Ghost (Article nova tema) */
export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: true,
});

/** Naslovi, dugmad, labela — Golos Text kao na bilbord.rs */
export const golosText = Golos_Text({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-golos",
  adjustFontFallback: true,
});
