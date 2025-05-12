import { tokens, themes as defaultThemes } from '@tamagui/themes' // Aliased themes to defaultThemes
import { createTamagui, createFont } from 'tamagui'
import { shorthands } from '@tamagui/shorthands'

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
  tokens,
  themes: defaultThemes, // Using default themes directly from @tamagui/themes
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config 