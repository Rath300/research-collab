import { tokens, themes as defaultThemes } from '@tamagui/themes'; // Aliased themes to defaultThemes
import { createTamagui, createFont } from 'tamagui';
import { shorthands } from '@tamagui/shorthands';
// const interFont = createInterFont() // Removed Inter font
// Removed researchBeeColors and customThemes for radical simplification
const bodyFont = createFont({
    family: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif`,
    size: { 1: 12, 2: 14, 3: 15, 4: 16, 5: 18, 6: 20 },
    lineHeight: { 1: 17, 2: 20, 3: 22, 4: 24, 5: 26, 6: 28 },
    weight: { 1: '300', 4: '400', 7: '600' },
    letterSpacing: { 1: 0 },
});
// --------------------  Zen-Garden Design Tokens  --------------------
// Using warm off-white backgrounds, low-contrast text, and muted accent colours.
const zenColors = {
    background: '#FAFAFA', // Soft off-white background
    backgroundHover: '#F9F9F6', // Slightly darker hover state
    backgroundPress: '#F0F0EC', // Pressed/active background
    color: '#1E1E1E', // Primary text (dark gray)
    colorMuted: '#4F4F4F', // Secondary text
    colorDisabled: '#A0A0A0', // Disabled text
    borderColor: '#EAEAEA', // Light gray borders
    accentColor: '#A3BFFA', // Muted blue accent (buttons, links)
    accentColorHover: '#8AA6E3', // Hover state for accent
    accentColorPress: '#7998D1', // Pressed state for accent
};
/**
 * Build a Tamagui theme from the zenColors map.
 */
function createZenTheme() {
    return {
        // Map tokens that existing components expect (background*, color, borderColor, etc.)
        background: zenColors.background,
        backgroundHover: zenColors.backgroundHover,
        backgroundPress: zenColors.backgroundPress,
        color: zenColors.color,
        colorHover: zenColors.color, // Keep text the same on hover
        colorFocus: zenColors.color,
        colorPress: zenColors.color,
        borderColor: zenColors.borderColor,
        accentBackground: zenColors.accentColor,
        accentBackgroundHover: zenColors.accentColorHover,
        accentBackgroundPress: zenColors.accentColorPress,
        accentColor: '#FFFFFF', // text on accent surfaces
    };
}
const zenLight = createZenTheme();
const config = createTamagui({
    defaultFont: 'body',
    // animations commented out
    fonts: {
        body: bodyFont,
        heading: bodyFont,
    },
    shorthands,
    tokens,
    themes: {
        ...defaultThemes,
        zen: zenLight,
    },
    themeClassNameOnRoot: true, // Ensure theme name is set on root for easier debugging
    defaultTheme: 'zen',
});
export default config;
//# sourceMappingURL=tamagui.config.js.map