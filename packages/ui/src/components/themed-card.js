var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, Paragraph, H4, YStack, XStack, View, styled } from 'tamagui';
var ThemedCardHeader = styled(XStack, {
    name: 'ThemedCardHeader',
    paddingHorizontal: '$3',
    paddingTop: '$3',
    paddingBottom: '$2',
    borderBottomWidth: 1,
    borderBottomColor: '$borderColor',
});
var ThemedCardContent = styled(YStack, {
    name: 'ThemedCardContent',
    padding: '$3',
    gap: '$2',
});
var ThemedCardFooter = styled(XStack, {
    name: 'ThemedCardFooter',
    paddingHorizontal: '$3',
    paddingTop: '$2',
    paddingBottom: '$3',
    borderTopWidth: 1,
    borderTopColor: '$borderColor',
    justifyContent: 'flex-end',
});
export function ThemedCard(_a) {
    var title = _a.title, subtitle = _a.subtitle, headerContent = _a.headerContent, children = _a.children, footer = _a.footer, _b = _a.elevation, elevation = _b === void 0 ? 'small' : _b, props = __rest(_a, ["title", "subtitle", "headerContent", "children", "footer", "elevation"]);
    var shadowProps = {
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
    return (_jsxs(Card, __assign({ backgroundColor: "$background", borderRadius: "$3", overflow: "hidden", borderWidth: 1, borderColor: "$borderColor" }, shadowProps, props, { children: [(title || subtitle || headerContent) && (_jsxs(ThemedCardHeader, { children: [_jsxs(YStack, { flex: 1, children: [title && _jsx(H4, { children: title }), subtitle && _jsx(Paragraph, { color: "$gray9", children: subtitle })] }), headerContent && _jsx(View, { children: headerContent })] })), _jsx(ThemedCardContent, { children: children }), footer && (_jsx(ThemedCardFooter, { children: footer }))] })));
}
//# sourceMappingURL=themed-card.js.map