/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'canvas'],
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  },
  // Ensure we don't have 'output: export' for Vercel deployment
  // as it disables API routes and server-side features
};

module.exports = nextConfig;
