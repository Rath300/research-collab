const { withTamagui } = require('@tamagui/next-plugin')
const { join } = require('path')

const boolVals = {
  true: true,
  false: false,
}

const disableExtraction =
  boolVals[process.env.DISABLE_EXTRACTION] ?? process.env.NODE_ENV === 'development'

const plugins = [
  withTamagui({
    config: './tamagui.config.ts',
    components: ['tamagui', '@research-collab/ui'],
    importsWhitelist: ['constants.js', 'colors.js'],
    outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
    logTimings: true,
    disableExtraction,
    // experiment - Fix subpaths resolving
    shouldExtract: (path) => {
      if (path.includes(join('packages', 'app'))) {
        return true
      }
    },
  }),
]

module.exports = function () {
  /** @type {import('next').NextConfig} */
  let config = {
    //
    // Europe (Frankfurt)
    // i18n: {
    //   locales: ['en-US', 'es-ES', 'fr-FR', 'de-DE'],
    //   defaultLocale: 'en-US',
    // },
    // output: 'standalone',
    //
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'gravatar.com',
          port: '',
          pathname: '/avatar/**',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
          port: '',
          pathname: '/a/**',
        },
        {
          protocol: 'https',
          hostname: 'i.pravatar.cc',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'plus.unsplash.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    //
    //
    transpilePackages: [
      'solito',
      'react-native-web',
      'expo-linking',
      'expo-constants',
      'expo-modules-core',
      'expo-image-picker',
      'expo-av',
      '@research-collab/ui',
    ],
    //
    //
    experimental: {
      // optimizeCss: true,
      // scrollRestoration: true,
      // legacyBrowsers: false,
      // serverActions: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    // modularizeImports: {
    //   '@tamagui/lucide-icons': {
    //     transform: `@tamagui/lucide-icons/dist/esm/icons/{{kebabCase member}}`,
    //     skipDefaultConversion: true,
    //   },
    // },
    //
    //
    //
    webpack: (config, { isServer, dev, buildId, config: { pageExtensions } }) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-native$': 'react-native-web',
      }
      return config
    },
    //
  }

  for (const plugin of plugins) {
    config = {
      ...config,
      ...plugin(config),
    }
  }

  return config
} 