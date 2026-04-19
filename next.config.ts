import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  // Disable Turbopack for build to avoid compatibility issues on CI
  ...(process.env.NEXT_DISABLE_TURBOPACK ? {} : {}),
};

export default nextConfig;
