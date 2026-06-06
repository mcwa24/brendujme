import type { NextConfig } from "next";

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

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "cmdk"],
  },
  async redirects() {
    return [
      {
        source: "/contact",
        destination: "https://bilbord.rs/kontakt/",
        permanent: false,
      },
      {
        source: "/submit-brand",
        destination: "https://bilbord.rs/kontakt/",
        permanent: false,
      },
      {
        source: "/news",
        destination: "https://bilbord.rs/moda-stil/",
        permanent: false,
      },
      {
        source: "/news/:slug",
        destination: "https://bilbord.rs/:slug/",
        permanent: false,
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
