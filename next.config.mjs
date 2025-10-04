const { withEdgeRuntime } = require('@cloudflare/next-on-pages');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Removed: experimental: { runtime: 'nodejs' } – this conflicts with Edge
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = withEdgeRuntime(nextConfig);