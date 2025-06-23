import React from 'react';
import { ButtonProps } from 'tamagui';
export interface CustomButtonProps extends ButtonProps {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    loading?: boolean;
    intent?: 'primary' | 'secondary' | 'outline' | 'danger';
    buttonSize?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
}
export declare function Button({ children, leftIcon, rightIcon, loading, intent, buttonSize, fullWidth, disabled, ...props }: CustomButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=button.d.ts.map