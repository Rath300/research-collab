import React from 'react';
import { ButtonProps } from 'tamagui';
export declare const ThemedButton: import("tamagui").TamaguiComponent<import("@tamagui/web").TamaDefer, import("tamagui").TamaguiElement, import("@tamagui/core").RNTamaguiViewNonStyleProps & import("tamagui").TextContextStyles & {
    textProps?: Partial<import("tamagui").SizableTextProps>;
    noTextWrap?: boolean;
} & import("@tamagui/web").ThemeableProps & {
    icon?: JSX.Element | import("react").FunctionComponent<{
        color?: any;
        size?: any;
    }> | ((props: {
        color?: any;
        size?: any;
    }) => any) | null;
    iconAfter?: JSX.Element | import("react").FunctionComponent<{
        color?: any;
        size?: any;
    }> | ((props: {
        color?: any;
        size?: any;
    }) => any) | null;
    scaleIcon?: number;
    spaceFlex?: number | boolean;
    scaleSpace?: number;
    unstyled?: boolean;
}, import("@tamagui/web").StackStyleBase, {
    size?: number | import("tamagui").SizeTokens | undefined;
    variant?: "outlined" | undefined;
    disabled?: boolean | undefined;
    elevation?: number | import("tamagui").SizeTokens | undefined;
    inset?: number | import("tamagui").SizeTokens | {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    } | null | undefined;
    unstyled?: boolean | undefined;
    transparent?: boolean | undefined;
    fullscreen?: boolean | undefined;
    circular?: boolean | undefined;
    hoverTheme?: boolean | undefined;
    pressTheme?: boolean | undefined;
    focusTheme?: boolean | undefined;
    elevate?: boolean | undefined;
    bordered?: number | boolean | undefined;
    backgrounded?: boolean | undefined;
    radiused?: boolean | undefined;
    padded?: boolean | undefined;
    chromeless?: boolean | "all" | undefined;
}, import("@tamagui/web").StaticConfigPublic>;
export interface ThemedButtonProps extends ButtonProps {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
    size?: 'small' | 'medium' | 'large';
    children: React.ReactNode;
}
export declare function ResearchBeeButton({ variant, size, children, ...props }: ThemedButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=themed-button.d.ts.map