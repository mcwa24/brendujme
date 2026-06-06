/** Ghost bilbord.rs secondary navigation — isti footer kao na bilbord.rs */
export const BILBORD_SITE_URL = "https://bilbord.rs";

export const bilbordFooterColumns = [
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
    title: "Portal",
    links: [
      { label: "Izdvojeno", href: `${BILBORD_SITE_URL}/izdvojeno/` },
      { label: "Prijava", href: `${BILBORD_SITE_URL}/signin/` },
      { label: "Registracija", href: `${BILBORD_SITE_URL}/signup/` },
      { label: "Newsletter", href: `${BILBORD_SITE_URL}/newsletter/` },
    ],
  },
  {
    title: "Oglašavanje",
    links: [
      { label: "Bilbord Direct", href: `${BILBORD_SITE_URL}/bilbord-direct/` },
      { label: "Info", href: `${BILBORD_SITE_URL}/oglasavanje/` },
      { label: "Cene", href: `${BILBORD_SITE_URL}/cene/` },
      { label: "Uslovi", href: `${BILBORD_SITE_URL}/uslovi-poslovanja/` },
    ],
  },
  {
    title: "Servisi",
    links: [
      { label: "Partner", href: `${BILBORD_SITE_URL}/partner-program/` },
      { label: "PMP", href: `${BILBORD_SITE_URL}/priority-media-publishing/` },
      { label: "PR", href: `${BILBORD_SITE_URL}/pr/` },
    ],
  },
] as const;

export const bilbordFooterSocial = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/bilbordportal",
    icon: "facebook" as const,
  },
  {
    label: "X",
    href: "https://x.com/bilbordrs",
    icon: "x" as const,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/bilbord.rs/",
    icon: "instagram" as const,
  },
  {
    label: "Threads",
    href: "https://www.threads.com/@bilbord.rs",
    icon: "threads" as const,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/bilbordmedia/posts/",
    icon: "linkedin" as const,
  },
  {
    label: "Telegram",
    href: "https://t.me/bilbordrs",
    icon: "telegram" as const,
  },
] as const;

export const BILBORD_IMPRESUM_URL = `${BILBORD_SITE_URL}/impresum/`;
