const { withTamagui } = require('@tamagui/next-plugin');
const { join } = require('path');

const bools = {
  // if you want to have a slower build with more descriptive server-side rendered classnames
  shouldAddDebugShorthands: true,
  // this adds proper animations support (slower load)
  shouldDisableAnimationDriver: false,
};

const tamaguiPlugin = withTamagui({
  config: './tamagui.config.ts',
  components: ['tamagui', 'ui'],
  importsWhitelist: ['constants.js', 'colors.js'],
  outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
  logTimings: true,
  debug: false,
  ...bools,
});

module.exports = function (name, { defaultConfig }) {
  let config = {
    ...defaultConfig,
    ...{
      // This file will be used to modify the Next.js config for a minimal deployment
      output: 'standalone',
      swcMinify: true,
      eslint: {
        ignoreDuringBuilds: true,
      },
      typescript: {
        ignoreBuildErrors: true,
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
    },
  };

  // Enable Tamagui plugin
  config = { ...config, ...tamaguiPlugin(config) };

  return config;
}; 