/** Ghost bilbord.rs footer (Article s-footer) — isti linkovi kao na portalu. */
export const BILBORD_SITE_URL = "https://bilbord.rs";

export const BILBORD_FOOTER_TAGLINE =
  "Bilbord Media Platform - Inspiriši se trendovima.";

export type BilbordFooterNavColumn = {
  title: string;
  links: ReadonlyArray<{ label: string; href: string; external?: boolean }>;
};

export const bilbordFooterNavColumns: readonly BilbordFooterNavColumn[] = [
  {
    title: "Info",
    links: [
      { label: "O nama", href: `${BILBORD_SITE_URL}/onama/` },
      { label: "Kolačići", href: `${BILBORD_SITE_URL}/politika-kolacica/` },
      { label: "Privatnost", href: `${BILBORD_SITE_URL}/politika-privatnosti/` },
      { label: "Kontakt", href: `${BILBORD_SITE_URL}/kontakt/` },
    ],
  },
  {
    title: "Platforma",
    links: [
      { label: "Newsletter", href: `${BILBORD_SITE_URL}/newsletter/` },
      { label: "Novosti", href: `${BILBORD_SITE_URL}/novosti/` },
      { label: "Prijava", href: `${BILBORD_SITE_URL}/signin/` },
      { label: "Oglašavanje", href: `${BILBORD_SITE_URL}/oglasavanje/` },
    ],
  },
  {
    title: "Servisi",
    links: [
      { label: "Direct", href: `${BILBORD_SITE_URL}/bilbord-direct/` },
      { label: "Partner", href: `${BILBORD_SITE_URL}/partner-program/` },
      { label: "PR", href: `${BILBORD_SITE_URL}/pr/` },
      { label: "Shop", href: "https://shop.bilbord.rs/" },
    ],
  },
] as const;

export type BilbordFooterSocialIcon =
  | "facebook"
  | "x"
  | "threads"
  | "instagram"
  | "telegram"
  | "discord";

export const bilbordFooterSocial: ReadonlyArray<{
  label: string;
  href: string;
  icon: BilbordFooterSocialIcon;
}> = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/bilbordportal",
    icon: "facebook",
  },
  {
    label: "X",
    href: "https://x.com/bilbordrs",
    icon: "x",
  },
  {
    label: "Threads",
    href: "https://www.threads.net/@bilbord.rs",
    icon: "threads",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/bilbord.rs",
    icon: "instagram",
  },
  {
    label: "Telegram",
    href: "https://web.telegram.org/k/#@bilbordrs",
    icon: "telegram",
  },
  {
    label: "Discord",
    href: "https://discord.com/channels/1506167647686098975/1523229071893463131",
    icon: "discord",
  },
] as const;

export const bilbordFooterBarLinks = [
  {
    label: "Piši za Bilbord ✍️",
    href: `${BILBORD_SITE_URL}/pisi-za-bilbord/`,
  },
] as const;
