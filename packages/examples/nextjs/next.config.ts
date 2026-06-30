import nextra from "nextra";
import type { NextConfig } from "next";

const withNextra = nextra({
  contentDirBasePath: "/docs",
});

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  images: { unoptimized: true },
  transpilePackages: [
    "@addresskit/core",
    "@addresskit/data",
    "@addresskit/react",
    "@addresskit/react-hook-form",
    "@addresskit/providers-libaddressinput",
    "@addresskit/providers-dr5hn",
  ],
};

export default withNextra(nextConfig);
