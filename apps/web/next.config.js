/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://yltnvmypasnfdgtnyhwg.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdG52bXlwYXNuZmRndG55aHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNDcxNTMsImV4cCI6MjA1OTkyMzE1M30.ajCPb95af8_It1m_D4yGJhErKuLEtqqfqk8Yq2n4MCw'
  },
  output: 'standalone',
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
  webpack: (config, { isServer, webpack }) => {
    // Ignore optional native dependencies of ws
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(bufferutil|utf-8-validate)$/,
      })
    );

    // Also ensure that the fallbacks are properly set for these optional native modules
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }

    // Required by Supabase to work with WebAssembly
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    
    return config;
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  },
  distDir: 'dist',
};

module.exports = nextConfig;
