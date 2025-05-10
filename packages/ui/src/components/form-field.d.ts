export interface FormFieldProps {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    helper?: string;
    required?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
}
export declare function FormField({ label, placeholder, value, onChange, error, helper, required, multiline, numberOfLines, autoCapitalize, autoCorrect, secureTextEntry, keyboardType, }: FormFieldProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=form-field.d.ts.map