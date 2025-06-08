const { withTamagui } = require('@tamagui/next-plugin');

const tamaguiPlugin = withTamagui({
  config: './tamagui.config.ts',
  components: ['tamagui', 'ui'],
  importsWhitelist: ['constants.js', 'colors.js'],
  outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
  logTimings: true,
  debug: false,
  shouldAddDebugShorthands: true,
  shouldDisableAnimationDriver: false,
  transpilePackages: ['@research-collab/api', '@research-collab/db', 'ui', 'tamagui', 'react-native-web'],
});

const nextConfig = {
  output: 'standalone',
  swcMinify: true,
  experimental: {
    esmExternals: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Ensure alias object exists
    config.resolve.alias = config.resolve.alias || {};
    
    // Add the crucial alias
    config.resolve.alias['react-native'] = 'react-native-web';

    // Safely add client-side-only aliases
    if (!isServer) {
      config.resolve.alias['bufferutil'] = false;
      config.resolve.alias['utf-8-validate'] = false;
    }

    // Add node-loader for .node files
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
      options: {
        name: '[name].[ext]',
      },
    });

    return config;
  },
};

module.exports = tamaguiPlugin(nextConfig);