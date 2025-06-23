import React from 'react';
import { CardProps } from 'tamagui';
export interface ThemedCardProps extends CardProps {
    title?: string;
    subtitle?: string;
    headerContent?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    elevation?: 'none' | 'small' | 'medium' | 'large';
}
export declare function ThemedCard({ title, subtitle, headerContent, children, footer, elevation, ...props }: ThemedCardProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=themed-card.d.ts.map