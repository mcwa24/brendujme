import type { NextConfig } from "next";

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
    ],
  },
};

export default nextConfig;
