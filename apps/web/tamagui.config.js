import { createInterFont } from '@tamagui/font-inter'
import { shorthands } from '@tamagui/shorthands'
import { themes, tokens } from '@tamagui/themes'
import { createTamagui } from 'tamagui'

const interFont = createInterFont()

// Define custom colors for Research-Bee
const researchBeeColors = {
  researchbeeYellow: '#FFCB05', // Primary brand color
  researchbeeBlack: '#121212', // Dark text/background
  researchbeeLightGray: '#F7F7F7', // Light background
  researchbeeMediumGray: '#DDDDDD', // Border color
  researchbeeDarkGray: '#333333', // Darker background
  researchbeeAccent: '#FF8C00', // Accent color (orange)
}

// Custom theme based on Tamagui themes
const customThemes = {
  light: {
    ...themes.light,
    background: researchBeeColors.researchbeeLightGray,
    color: researchBeeColors.researchbeeBlack,
    borderColor: researchBeeColors.researchbeeMediumGray,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    primary: researchBeeColors.researchbeeYellow,
    accent: researchBeeColors.researchbeeAccent,
  },
  dark: {
    ...themes.dark,
    background: researchBeeColors.researchbeeBlack,
    color: '#FFFFFF',
    borderColor: researchBeeColors.researchbeeDarkGray,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    primary: researchBeeColors.researchbeeYellow,
    accent: researchBeeColors.researchbeeAccent,
  },
}

// To make your custom color palette easily accessible as tokens if needed:
const customColorTokens = {
  ...tokens.color, // Keep existing color tokens
  researchbeeYellow: researchBeeColors.researchbeeYellow,
  researchbeeBlack: researchBeeColors.researchbeeBlack,
  researchbeeLightGray: researchBeeColors.researchbeeLightGray,
  researchbeeMediumGray: researchBeeColors.researchbeeMediumGray,
  researchbeeDarkGray: researchBeeColors.researchbeeDarkGray,
  researchbeeAccent: researchBeeColors.researchbeeAccent,
};

const customTokens = {
  ...tokens,
  color: customColorTokens,
};

const config = createTamagui({
  defaultFont: 'body',
  animations: {
    fast: {
      type: 'spring',
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
    medium: {
      type: 'spring',
      damping: 10,
      mass: 0.9,
      stiffness: 100,
    },
    slow: {
      type: 'spring',
      damping: 20,
      stiffness: 60,
    },
  },
  fonts: {
    body: interFont,
    heading: interFont,
  },
  shorthands,
  tokens: customTokens,
  themes: customThemes,
})

export default config 