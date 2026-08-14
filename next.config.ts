import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@astryxdesign/core"],
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Removes the floating Next.js dev-mode indicator badge from the UI.
  devIndicators: false,
};

export default nextConfig;
