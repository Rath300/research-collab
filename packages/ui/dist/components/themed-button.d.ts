import React from 'react';
import { ButtonProps, TamaguiComponent } from 'tamagui';
export interface ThemedButtonProps extends ButtonProps {
    intentType?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
    buttonStyleSize?: 'small' | 'medium' | 'large';
    children: React.ReactNode;
}
export declare const ThemedButton: TamaguiComponent<ThemedButtonProps, any>;
export interface ThemedButtonProps extends ButtonProps {
    intentType?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
    buttonStyleSize?: 'small' | 'medium' | 'large';
    children: React.ReactNode;
}
export declare function ResearchBeeButton({ intentType, buttonStyleSize, children, ...props }: ThemedButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=themed-button.d.ts.map