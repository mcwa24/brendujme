import type { NextConfig } from "next";

const shopBasePath = (process.env.NEXT_PUBLIC_SHOP_BASE_PATH?.trim() || "/shop").replace(
  /\/+$/,
  "",
);

function supabaseImagePattern():
  | { protocol: "https"; hostname: string; pathname: string }
  | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return null;
  try {
    return {
      protocol: "https",
      hostname: new URL(url).hostname,
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return null;
  }
}

const supabasePattern =
  supabaseImagePattern() ?? {
    protocol: "https" as const,
    hostname: "wbmvlooxrwdmqsyxfpia.supabase.co",
    pathname: "/storage/v1/object/public/**",
  };

const legacyShopRedirects = [
  "/",
  "/brands",
  "/brands/:path*",
  "/retailers",
  "/retailers/:path*",
  "/shopping-centers",
  "/shopping-centers/:path*",
  "/categories",
  "/categories/:path*",
].map((source) => ({
  source,
  destination: `${shopBasePath}${source === "/" ? "" : source}`,
  permanent: true,
  basePath: false as const,
}));

const nextConfig: NextConfig = {
  basePath: shopBasePath || undefined,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "cmdk"],
  },
  async redirects() {
    return [
      ...legacyShopRedirects,
      {
        source: "/contact",
        destination: "https://bilbord.rs/kontakt/",
        permanent: false,
        basePath: false,
      },
      {
        source: "/submit-brand",
        destination: "https://bilbord.rs/kontakt/",
        permanent: false,
        basePath: false,
      },
      {
        source: "/news",
        destination: "https://bilbord.rs/moda-stil/",
        permanent: false,
        basePath: false,
      },
      {
        source: "/news/:slug",
        destination: "https://bilbord.rs/:slug/",
        permanent: false,
        basePath: false,
      },
    ];
  },
  images: {
    minimumCacheTTL: 86400,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "bilbord.rs" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.ghost.io" },
      supabasePattern,
    ],
  },
};

export default nextConfig;
