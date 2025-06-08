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
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['react-native'] = 'react-native-web';
    
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

module.exports = tamaguiPlugin(nextConfig);