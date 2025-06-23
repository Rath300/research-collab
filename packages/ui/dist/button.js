"use client";
import { Button as TamaguiButton, styled, withStaticProperties } from 'tamagui';
import { SizableText } from 'tamagui';
const ButtonFrame = styled(TamaguiButton, {
    name: 'Button',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: '$4',
    backgroundColor: '$accentBackground',
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
    variants: {
        size: {
            '...size': (val, { tokens }) => ({
                height: val,
                paddingHorizontal: tokens.space[val] ?? val,
            }),
        },
        tone: {
            primary: {
                backgroundColor: '$accentBackground',
                color: '$accentColor',
            },
            neutral: {
                backgroundColor: '$background',
                color: '$color',
                borderColor: '$borderColor',
            },
        },
    },
    defaultVariants: {
        size: '$4',
        tone: 'primary',
    },
    // Soft interaction styles
    '&:hover': {
        backgroundColor: '$accentBackgroundHover',
    },
    pressStyle: {
        backgroundColor: '$accentBackgroundPress',
    },
    focusStyle: {
        outlineWidth: 2,
        outlineColor: '$borderColor',
        outlineStyle: 'solid',
    },
    transition: 'background-color 120ms ease-in-out, shadow-color 120ms ease-in-out',
});
const ButtonText = styled(SizableText, {
    name: 'ButtonText',
    color: '$accentColor',
    fontWeight: '500',
    textAlign: 'center',
    userSelect: 'none',
});
const ButtonIcon = styled(SizableText, {
    name: 'ButtonIcon',
    color: 'currentColor',
    marginRight: '$2', // Space between icon and text
});
export const Button = withStaticProperties(ButtonFrame, {
    Props: TamaguiButton.Props,
    Text: ButtonText,
    Icon: ButtonIcon,
});
//# sourceMappingURL=button.js.map