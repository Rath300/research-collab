import { createTamagui, createTokens, createFont } from 'tamagui';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { config } from '@tamagui/config/v2';
// import { animations } from './animation.config';

const { themes, tokens: tamaguiTokens } = config;

// --- 1. FONTS ---
const headingFont = createInterFont({
  size: {
    6: 15,
  },
  transform: {
    6: 'uppercase',
    7: 'none',
  },
  weight: {
    6: '400',
    7: '700',
  },
  color: {
    6: '$colorFocus',
    7: '$color',
  },
  letterSpacing: {
    5: 2,
    6: 1,
    7: 0,
    8: -1,
    9: -2,
    10: -3,
    12: -4,
    14: -5,
    15: -6,
  },
  face: {
    700: { normal: 'InterBold' },
  },
});

const bodyFont = createInterFont(
  {
    face: {
      700: { normal: 'InterBold' },
    },
  },
  {
    sizeSize: (size) => Math.round(size * 1.1),
    sizeLineHeight: (size) => Math.round(size * 1.1 + (size > 20 ? 10 : 10)),
  }
);


// --- 2. TOKENS ---
// Custom color palette inspired by a modern, clean aesthetic (like Notion)
const color = {
  // Light Theme Palette
  lightBg: '#FFFFFF',
  lightText: '#1A1A1A',
  lightSubtleText: '#7A7A7A',
  lightBorder: '#E5E5E5',
  lightSubtleBg: '#F5F5F5',
  lightPrimary: '#3B82F6', // A nice blue for primary actions
  lightPrimaryText: '#FFFFFF',

  // Dark Theme Palette
  darkBg: '#1A1A1A',
  darkText: '#FFFFFF',
  darkSubtleText: '#9A9A9A',
  darkBorder: '#3A3A3A',
  darkSubtleBg: '#2A2A2A',
  darkPrimary: '#3B82F6',
  darkPrimaryText: '#FFFFFF',
};

// Combine with default tamagui tokens
const combinedTokens = createTokens({
  ...tamaguiTokens,
  color,
  radius: { ...tamaguiTokens.radius, 1: 3, 2: 5, 3: 7, 4: 9, 5: 12, 6: 15 },
  space: { ...tamaguiTokens.space, true: 16 },
});


// --- 3. THEMES ---
const customThemes = {
  light: {
    background: color.lightBg,
    backgroundPress: color.lightSubtleBg,
    backgroundFocus: color.lightSubtleBg,
    backgroundHover: color.lightSubtleBg,
    color: color.lightText,
    colorPress: color.lightText,
    colorFocus: color.lightText,
    colorHover: color.lightText,
    borderColor: color.lightBorder,
    borderColorPress: color.lightBorder,
    borderColorFocus: color.lightPrimary,
    borderColorHover: color.lightBorder,
    placeholderColor: color.lightSubtleText,
    primary: color.lightPrimary,
    primaryText: color.lightPrimaryText,
  },
  dark: {
    background: color.darkBg,
    backgroundPress: color.darkSubtleBg,
    backgroundFocus: color.darkSubtleBg,
    backgroundHover: color.darkSubtleBg,
    color: color.darkText,
    colorPress: color.darkText,
    colorFocus: color.darkText,
    colorHover: color.darkText,
    borderColor: color.darkBorder,
    borderColorPress: color.darkBorder,
    borderColorFocus: color.darkPrimary,
    borderColorHover: color.darkBorder,
    placeholderColor: color.darkSubtleText,
    primary: color.darkPrimary,
    primaryText: color.darkPrimaryText,
  },
};

const allThemes = { ...themes, ...customThemes };


// --- 4. CONFIG ---
const tamaguiConfig = createTamagui({
  // animations,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes: allThemes,
  tokens: combinedTokens,
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
});


export type AppConfig = typeof tamaguiConfig;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig;