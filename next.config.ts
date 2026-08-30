import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  images: {
    qualities: [75, 90]
  }
};

export default nextConfig;
