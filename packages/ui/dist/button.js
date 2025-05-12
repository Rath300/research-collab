"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { Button as TamaguiButton, styled } from 'tamagui';
// Define your styled button with variants
const StyledTamaguiButton = styled(TamaguiButton, {
    name: 'MyButton', // Optional: good for debugging and theming
    variants: {
        intent: {
            primary: {
                backgroundColor: '$blue10', // Example: replace with your theme tokens
                color: '$blue1',
                // Add other styles for primary variant
            },
            secondary: {
                backgroundColor: '$gray10', // Example: replace with your theme tokens
                color: '$gray1',
                // Add other styles for secondary variant
            },
            tertiary: {
                backgroundColor: 'transparent', // Example: replace with your theme tokens
                borderColor: '$gray8',
                borderWidth: 1,
                color: '$gray12',
                // Add other styles for tertiary variant
            },
        },
        // You can also define variants for 'size' if needed, mapping your 'small', 'medium', 'large'
        // to Tamagui's SizableStackProps['size'] or specific height/padding values.
        // For now, we'll pass Tamagui's size prop directly.
    }, // 'as const' is important for type inference of variants
    defaultVariants: {
        intent: 'primary',
    },
});
export function Button({ text, onClick, intent = 'primary', size = 'medium', // This will be passed to TamaguiButton's size prop
disabled = false }) {
    return (_jsx(StyledTamaguiButton, { size: size, intent: intent, disabled: disabled, onPress: onClick, children: text }));
}
//# sourceMappingURL=button.js.map