import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card as TamaguiCard, H2, Paragraph, XStack, YStack } from 'tamagui';
export function Card({ title, description, footer, variant = 'default' }) {
    return (_jsx(TamaguiCard, { elevate: true, bordered: variant === 'outlined', elevation: variant === 'elevated' ? '$4' : undefined, size: "$4", borderRadius: "$4", padding: "$4", children: _jsxs(YStack, { space: "$2", children: [_jsx(H2, { children: title }), _jsx(Paragraph, { children: description }), footer && (_jsx(XStack, { marginTop: "$2", children: _jsx(Paragraph, { size: "$2", opacity: 0.7, children: footer }) }))] }) }));
}
//# sourceMappingURL=card.js.map