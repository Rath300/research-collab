/** @type {import('next').NextConfig} */
const path = require('path');
const { withTamagui } = require('@tamagui/next-plugin');

const nextConfigBase = {
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
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(bufferutil|utf-8-validate)$/,
      })
    );
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  },
};

const tamaguiPluginOptions = {
  config: './tamagui.config.js',
  components: ['tamagui', 'ui'],
  importsWhitelist: ['constants.js', 'colors.js'],
  logTimings: true,
  disableExtraction: process.env.NODE_ENV === 'development',
  shouldExtract: (path) => {
    if (path.includes('node_modules/@tamagui/')) {
      return true;
    }
    return false;
  },
  transpilePackages: [
    'react-native-web',
    'expo-constants',
    'expo-linking',
    'expo-modules-core',
    'tamagui',
    '@tamagui/config',
    '@tamagui/font-inter',
    '@tamagui/lucide-icons',
    '@tamagui/shorthands',
    '@tamagui/themes',
    '@tamagui/animations-react-native',
    '@research-collab/db',
    'ui',
    '@tamagui/alert-dialog',
    '@tamagui/animate-presence',
    '@tamagui/button',
    '@tamagui/card',
    '@tamagui/collapsible',
    '@tamagui/accordion',
    '@tamagui/popover',
    '@tamagui/tabs',
    '@tamagui/progress',
    '@tamagui/separator',
    '@tamagui/spinner',
    '@tamagui/scroll-view',
  ],
};

module.exports = function (name, { defaultConfig }) {
  let config = { ...nextConfigBase, ...defaultConfig };
  config = withTamagui(tamaguiPluginOptions)(config);
  return config;
};
