import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
