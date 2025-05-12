export interface ButtonProps {
    text: string;
    onClick?: () => void;
    intent?: 'primary' | 'secondary' | 'tertiary';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
}
export declare function Button({ text, onClick, intent, size, // This will be passed to TamaguiButton's size prop
disabled }: ButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=button.d.ts.map