import type { NextConfig } from "next";

const API_ORIGIN =
  process.env.API_PROXY_TARGET || "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${API_ORIGIN}/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qiknsadlbfpjxtvgcllk.supabase.co",
        pathname: "/**",
      },
    ],
  },

  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;