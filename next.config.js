// This file will be used to modify the Next.js config for a minimal deployment

const { withTamagui } = require('@tamagui/next-plugin');
const { join } = require('path');

const bools = {
  true: true,
  false: false,
};

const isProd = process.env.NODE_ENV === 'production';

// Common options for Tamagui
const tamaguiOptions = {
  config: './packages/ui/src/tamagui.config.ts',
  components: ['tamagui', '@research-collab/ui'],
  importsWhitelist: ['constants.js', 'colors.js'],
  logTimings: true,
  disableExtraction: process.env.NODE_ENV === 'development',
};

// Create the Tamagui plugin
const withTamaguiPlugin = withTamagui(tamaguiOptions);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // This can sometimes cause issues in monorepos on Vercel
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // optimizeCss: true, // Re-enable if needed
    scrollRestoration: true,
    // transpilePackages is key for monorepos
    transpilePackages: [
      'solito',
      'react-native-web',
      'expo-linking',
      'expo-constants',
      'expo-modules-core',
      'react-native', // Explicitly add react-native
      '@research-collab/ui',
      '@research-collab/db', // Add your own packages here
    ],
  },
  webpack: (config, { isServer }) => {
    // Add a rule to handle .node files for Supabase
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
      options: {
        name: '[name].[ext]',
      },
    });

    // Ignore optional native dependencies of ws
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/',
      },
      {
        source: '/todo',
        destination: '/todo',
      }
    ];
  },
  async redirects() {
    return [
      {
        source: '/((?!todo|api|_next/static|_next/image|favicon.ico).*)',
        destination: '/404',
        permanent: false,
      },
    ];
  }
};

module.exports = withTamaguiPlugin(nextConfig); 