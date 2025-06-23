import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Paragraph, H4, YStack, XStack, View, styled } from 'tamagui';
const ThemedCardHeader = styled(XStack, {
    name: 'ThemedCardHeader',
    paddingHorizontal: '$3',
    paddingTop: '$3',
    paddingBottom: '$2',
    borderBottomWidth: 1,
    borderBottomColor: '$borderColor',
});
const ThemedCardContent = styled(YStack, {
    name: 'ThemedCardContent',
    padding: '$3',
    gap: '$2',
});
const ThemedCardFooter = styled(XStack, {
    name: 'ThemedCardFooter',
    paddingHorizontal: '$3',
    paddingTop: '$2',
    paddingBottom: '$3',
    borderTopWidth: 1,
    borderTopColor: '$borderColor',
    justifyContent: 'flex-end',
});
export function ThemedCard({ title, subtitle, headerContent, children, footer, elevation = 'small', ...props }) {
    const shadowProps = {
        none: {},
        small: {
            shadowColor: '$shadowColor',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        medium: {
            shadowColor: '$shadowColor',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
        large: {
            shadowColor: '$shadowColor',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
        },
    }[elevation];
    return (_jsxs(Card, { backgroundColor: "$background", borderRadius: "$3", overflow: "hidden", borderWidth: 1, borderColor: "$borderColor", ...shadowProps, ...props, children: [(title || subtitle || headerContent) && (_jsxs(ThemedCardHeader, { children: [_jsxs(YStack, { flex: 1, children: [title && _jsx(H4, { children: title }), subtitle && _jsx(Paragraph, { color: "$gray9", children: subtitle })] }), headerContent && _jsx(View, { children: headerContent })] })), _jsx(ThemedCardContent, { children: children }), footer && (_jsx(ThemedCardFooter, { children: footer }))] }));
}
//# sourceMappingURL=themed-card.js.map