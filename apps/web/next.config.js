const { withTamagui } = require('@tamagui/next-plugin');

const tamaguiOptions = {
  config: '../../packages/ui/src/tamagui.config.ts', // Adjusted path for being inside apps/web
  components: ['tamagui', '@research-collab/ui'],
  importsWhitelist: ['constants.js', 'colors.js'],
  logTimings: true,
  disableExtraction: process.env.NODE_ENV === 'development',
};

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
    scrollRestoration: true,
    transpilePackages: [
      'solito',
      'react-native-web',
      'expo-linking',
      'expo-constants',
      'expo-modules-core',
      'react-native', // Explicitly add react-native
      '@research-collab/ui',
      '@research-collab/db',
    ],
  },
   webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
      options: {
        name: '[name].[ext]',
      },
    });

    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    return config;
  },
};

module.exports = withTamaguiPlugin(nextConfig);
