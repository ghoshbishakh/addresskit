import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@addresskit/core",
    "@addresskit/data",
    "@addresskit/react",
    "@addresskit/react-hook-form",
    "@addresskit/providers-libaddressinput",
    "@addresskit/providers-dr5hn",
  ],
};

export default nextConfig;
