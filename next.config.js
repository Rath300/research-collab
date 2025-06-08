/**
 * @type {import('next').NextConfig}
 */
const { withTamagui } = require('@tamagui/next-plugin')
const { join } = require('path')
const solitoPlugin = require('solito/next-plugin')

const boolVals = {
  true: true,
  false: false,
}

const disableExtraction =
  boolVals[process.env.DISABLE_EXTRACTION] ?? process.env.NODE_ENV === 'development'

process.env.TAMAGUI_TARGET = 'web'

const withPlugins = (plugins, config) => {
  return plugins.reduce((acc, plugin) => plugin(acc), config)
}

module.exports = function () {
  /** @type {import('next').NextConfig} */
  let config = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
        },
        {
          protocol: 'https',
          hostname: 'i.pravatar.cc',
        },
        {
          protocol: 'https',
          hostname: 'ixvofwbhsgtbitjdayip.supabase.co',
        },
      ],
    },
    transpilePackages: [
      'solito',
      'react-native',
      'react-native-web',
      'expo-linking',
      'expo-constants',
      'expo-modules-core',
      'tamagui',
      '@tamagui/core',
      '@tamagui/config',
      '@tamagui/next-plugin',
      '@tamagui/babel-plugin',
      'expo-image-picker',
      'expo-av',
      '@research-collab/ui',
    ],
    experimental: {
      scrollRestoration: true,
      appDir: true,
    },
  }

  const tamaguiPlugin = withTamagui({
    config: './tamagui.config.ts',
    components: ['tamagui', '@research-collab/ui'],
    importsWhitelist: ['constants.js', 'colors.js'],
    outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
    logTimings: true,
    disableExtraction,
    appDir: true,
    shouldExtract: (path) => {
      if (path.includes(join('packages', 'app'))) {
        return true
      }
    },
    excludeReactNativeWebExports: ['Switch', 'ProgressBar', 'Picker', 'CheckBox', 'Touchable'],
  })

  return withPlugins([tamaguiPlugin, solitoPlugin], config)
} 