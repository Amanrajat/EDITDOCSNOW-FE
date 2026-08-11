import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@astryxdesign/core"],
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
