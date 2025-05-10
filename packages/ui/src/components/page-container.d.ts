import React from 'react';
export interface PageContainerProps {
    children: React.ReactNode;
    title?: string;
    showHeader?: boolean;
    showBackButton?: boolean;
    onBackPress?: () => void;
    scrollable?: boolean;
    headerRight?: React.ReactNode;
    paddingHorizontal?: number | string;
    paddingVertical?: number | string;
    backgroundColor?: string;
}
export declare function PageContainer({ children, title, showHeader, showBackButton, onBackPress, scrollable, headerRight, paddingHorizontal, paddingVertical, backgroundColor, }: PageContainerProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=page-container.d.ts.map