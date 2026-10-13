import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    DEV_SKIP_AUTH: process.env.DEV_SKIP_AUTH ?? '',
    NEXT_PUBLIC_DEV_SKIP_AUTH: process.env.NEXT_PUBLIC_DEV_SKIP_AUTH ?? '',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      './app/globals.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
