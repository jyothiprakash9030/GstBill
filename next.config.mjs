// next.config.mjs
import pkg from "@cloudflare/next-on-pages";
const { withEdgeRuntime } = pkg;

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default withEdgeRuntime(nextConfig);
