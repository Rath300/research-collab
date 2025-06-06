import { tokens as defaultTokens, themes as defaultThemes } from '@tamagui/themes' // Aliased themes to defaultThemes
import { createTamagui, createFont } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'
import {
  blue,
  gray,
  green,
  purple,
  red,
  white,
  yellow,
} from '@tamagui/colors'

// const interFont = createInterFont() // Removed Inter font

// Removed researchBeeColors and customThemes for radical simplification

const bodyFont = createFont({
  family: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`,
  size: { 1: 12, 2: 14, 3: 15, 4: 16, 5: 18, 6: 20 },
  lineHeight: { 1: 17, 2: 20, 3: 22, 4: 24, 5: 26, 6: 28 },
  weight: { 1: '300', 4: '400', 7: '600' },
  letterSpacing: { 1: 0 },
})

const config = createTamagui({
  defaultFont: 'body',
  // animations commented out
  fonts: {
    body: bodyFont,
    heading: bodyFont,
  },
  shorthands,
  tokens: {
    ...defaultTokens,
    color: {
      ...defaultTokens.color,
      // Add our new color palettes to the tokens
      blue,
      gray,
      green,
      purple,
      red,
      white,
      yellow,
    },
  },
  themes: {
    ...defaultThemes,
    // Add new themes using our color palettes
    // These themes will have 'light' and 'dark' variants by default
    dark_red: {
      ...defaultThemes.dark,
      background: '#1C1C1E',
      color: red.red11,
      // ... more token mappings
    },
    light_red: {
      ...defaultThemes.light,
      background: '#FFFFFF',
      color: red.red11,
    },
    dark_blue: {
      ...defaultThemes.dark,
      background: '#1C1C1E',
      color: blue.blue11,
    },
    light_blue: {
      ...defaultThemes.light,
      background: '#FFFFFF',
      color: blue.blue11,
    },
    dark_yellow: {
      ...defaultThemes.dark,
      background: '#1C1C1E',
      color: yellow.yellow11,
    },
    light_yellow: {
      ...defaultThemes.light,
      background: '#FFFFFF',
      color: yellow.yellow11,
    },
    dark_purple: {
      ...defaultThemes.dark,
      background: '#1C1C1E',
      color: purple.purple11,
    },
    light_purple: {
      ...defaultThemes.light,
      background: '#FFFFFF',
      color: purple.purple11,
    },
     dark_white: {
      ...defaultThemes.dark,
      background: '#1C1C1E',
      color: white.white11,
    },
    light_white: {
      ...defaultThemes.light,
      background: '#FFFFFF',
      color: gray.gray12, // Using dark gray on a white background for a "white" theme
    },
  },
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config