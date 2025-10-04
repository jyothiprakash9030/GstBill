// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // recommended
  eslint: {
    ignoreDuringBuilds: true, // ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // ignore TypeScript errors during build
  },
  images: {
    unoptimized: true, // disable Next.js image optimization
  },
  experimental: {
    appDir: true, // if using app/ directory
  },
};

export default nextConfig;
