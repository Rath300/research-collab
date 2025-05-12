import { jsx as _jsx } from "react/jsx-runtime";
import { Button, styled } from 'tamagui';
export const ThemedButton = styled(Button, {
    name: 'ThemedButton',
    variants: {
        intentType: {
            primary: {
                backgroundColor: '$researchbeeYellow',
                color: '$researchbeeBlack',
                borderWidth: 0,
            },
            secondary: {
                backgroundColor: 'transparent',
                color: '$researchbeeYellow',
                borderWidth: 1,
                borderColor: '$researchbeeYellow',
            },
            tertiary: {
                backgroundColor: 'transparent',
                color: '$color',
                borderWidth: 0,
            },
            destructive: {
                backgroundColor: '$red9',
                color: '$white',
                borderWidth: 0,
            },
        },
        buttonStyleSize: {
            small: {
                paddingHorizontal: '$2',
                paddingVertical: '$1',
                borderRadius: '$1',
            },
            medium: {
                paddingHorizontal: '$3',
                paddingVertical: '$2',
                borderRadius: '$2',
            },
            large: {
                paddingHorizontal: '$4',
                paddingVertical: '$3',
                borderRadius: '$3',
            },
        },
    },
    defaultVariants: {
        intentType: 'primary',
        buttonStyleSize: 'medium',
    },
});
export function ResearchBeeButton({ intentType = 'primary', buttonStyleSize = 'medium', children, ...props }) {
    return (_jsx(ThemedButton, { intentType: intentType, buttonStyleSize: buttonStyleSize, ...props, children: children }));
}
//# sourceMappingURL=themed-button.js.map