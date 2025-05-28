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
    // appDir: true, // Not needed for Next.js 13.5+ if using app directory by default
    // scrollRestoration: true, // Default true in newer Next.js
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
        // 'react-native$': 'react-native-web', // Tamagui plugin should handle this
      };
    }

    // Required by Supabase to work with WebAssembly
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    
    return config;
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  },
  // transpilePackages will be handled by the Tamagui plugin options
};

const tamaguiPluginOptions = {
  config: './tamagui.config.js', // Path to your tamagui.config.ts
  components: ['tamagui'], // Which packages to compile down
  importsWhitelist: ['constants.js', 'colors.js'], // Optional: Whitelist for imports
  logTimings: true, // Optional: Logs build times
  disableExtraction: process.env.NODE_ENV === 'development', // Optional: Speeds up dev builds
  shouldExtract: (path) => {
    if (path.includes('node_modules/@tamagui/')) { // Or your monorepo's tamagui components path
      return true;
    }
    return false;
  },
  // Ensure these are transpiled
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
    // Add any other tamagui packages you use here
    // Add any packages from your monorepo that need transpilation
    '@research-collab/db',
    // For the build errors specifically:
    '@tamagui/alert-dialog',
    '@tamagui/animate-presence',
    '@tamagui/button',
    '@tamagui/card',
    '@tamagui/collapsible',
    '@tamagui/accordion',
    '@tamagui/popover', // Since ProjectDetailPage uses Popover
    '@tamagui/tabs',    // Since ProjectDetailPage uses Tabs
    '@tamagui/progress',// Since ProjectDetailPage uses Progress
    '@tamagui/separator',// Since ProjectDetailPage uses Separator
    '@tamagui/spinner', // Since ProjectDetailPage uses Spinner
    '@tamagui/scroll-view', // Since ProjectDetailPage uses ScrollView
    // '@tamagui/use-event' should be a dep of other tamagui packages and be handled
  ],
  // Advanced options (usually not needed)
  // themeBuilder: {
  //   input: 'path/to/your/themes.ts',
  //   output: 'path/to/generated/theme.js',
  // },
};

module.exports = function (name, { defaultConfig }) {
  let config = { ...nextConfigBase, ...defaultConfig };
  // Apply Tamagui plugin
  config = withTamagui(tamaguiPluginOptions)(config);
  return config;
};
