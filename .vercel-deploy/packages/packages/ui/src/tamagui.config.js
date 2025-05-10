var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { themes, tokens } from '@tamagui/themes';
import { createTamagui } from 'tamagui';
var interFont = createInterFont();
// Define custom colors for Research-Bee
var researchBeeColors = {
    researchbeeYellow: '#FFCB05', // Primary brand color
    researchbeeBlack: '#121212', // Dark text/background
    researchbeeLightGray: '#F7F7F7', // Light background
    researchbeeMediumGray: '#DDDDDD', // Border color
    researchbeeDarkGray: '#333333', // Darker background
    researchbeeAccent: '#FF8C00', // Accent color (orange)
};
// Custom theme based on Tamagui themes
var customThemes = __assign(__assign({}, themes), { researchBeeLight: __assign(__assign(__assign({}, themes.light), { background: researchBeeColors.researchbeeLightGray, color: researchBeeColors.researchbeeBlack, borderColor: researchBeeColors.researchbeeMediumGray, shadowColor: 'rgba(0, 0, 0, 0.1)' }), researchBeeColors), researchBeeDark: __assign(__assign(__assign({}, themes.dark), { background: researchBeeColors.researchbeeBlack, color: '#FFFFFF', borderColor: researchBeeColors.researchbeeDarkGray, shadowColor: 'rgba(0, 0, 0, 0.5)' }), researchBeeColors) });
var config = createTamagui({
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
    shorthands: shorthands,
    tokens: tokens,
    themes: customThemes,
});
export default config;
//# sourceMappingURL=tamagui.config.js.map