import type { Metadata } from "next";

const siteName = "Bilbord Brands";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bilbordbrands.rs";
const defaultDescription =
  "Premium platforma za otkrivanje brendova dostupnih u Srbiji. Pronađite modu, lepotu, lifestyle i luksuzne brendove i saznajte gde se prodaju.";

export function createMetadata({
  title,
  description = defaultDescription,
  path = "",
}: {
  title?: string;
  description?: string;
  path?: string;
}): Metadata {
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const url = `${siteUrl}${path}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName,
      locale: "sr_RS",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    alternates: {
      canonical: path || "/",
    },
  };
}
