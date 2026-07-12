import type { Metadata } from "next";

export const siteName = "Bilbord Shop";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://shop.bilbord.rs";

export const siteTagline = "Gde kupiti modne brendove u Srbiji";

export const defaultTitle = `${siteName} — ${siteTagline}`;

export const defaultDescription =
  "Pronađite modne brendove u Srbiji — patike, streetwear i premium odeća. Saznajte u kojoj prodavnici, tržnom centru ili gradu možete kupiti omiljeni fashion brend.";

export const siteKeywords = [
  "gde kupiti modne brendove",
  "modni brendovi Srbija",
  "patike Srbija",
  "streetwear Srbija",
  "tržni centri Beograd",
  "Fashion Company",
  "Fashion and Friends",
  "prodavnice moda",
  "fashion brendovi",
  "shop bilbord",
];

const ogImage = {
  url: "/og-image.png",
  width: 402,
  height: 410,
  alt: siteName,
  type: "image/png" as const,
};

/** Osnovni metadata — root layout */
export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: siteKeywords,
  applicationName: siteName,
  authors: [{ name: "Bilbord", url: "https://bilbord.rs" }],
  creator: siteName,
  publisher: siteName,
  category: "shopping",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon-32.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "sr_RS",
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImage.url],
  },
  alternates: {
    canonical: "/",
  },
  other: {
    "apple-mobile-web-app-title": siteName,
    "mobile-web-app-capable": "yes",
  },
};

export function createMetadata({
  title,
  description = defaultDescription,
  path = "",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${siteUrl}${path}`;
  const pageTitle = title ? `${title} | ${siteName}` : defaultTitle;

  return {
    title: title,
    description,
    alternates: {
      canonical: path || "/",
    },
    robots: noIndex
      ? { index: false, follow: false }
      : undefined,
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName,
      locale: "sr_RS",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage.url],
    },
  };
}
