import React from 'react';
import { ButtonProps } from 'tamagui';
export interface CustomButtonProps extends ButtonProps {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
}
export declare function Button({ children, leftIcon, rightIcon, loading, variant, size, fullWidth, disabled, ...props }: CustomButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=button.d.ts.map