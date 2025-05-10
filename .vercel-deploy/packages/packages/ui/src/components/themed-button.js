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
import { jsx as _jsx } from "react/jsx-runtime";
import { Button, styled } from 'tamagui';
export var ThemedButton = styled(Button, {
    name: 'ThemedButton',
    variants: {
        variant: {
            primary: {
                backgroundColor: '$researchbeeYellow',
                color: '$researchbeeBlack',
                borderWidth: 0,
            },
            secondary: {
                backgroundColor: 'transparent',
                color: '$researchbeeYellow',
                borderWidth: 1,
                borderColor: '$researchbeeYellow',
            },
            tertiary: {
                backgroundColor: 'transparent',
                color: '$color',
                borderWidth: 0,
            },
            destructive: {
                backgroundColor: '$red9',
                color: '$white',
                borderWidth: 0,
            },
        },
        size: {
            small: {
                paddingHorizontal: '$2',
                paddingVertical: '$1',
                borderRadius: '$1',
            },
            medium: {
                paddingHorizontal: '$3',
                paddingVertical: '$2',
                borderRadius: '$2',
            },
            large: {
                paddingHorizontal: '$4',
                paddingVertical: '$3',
                borderRadius: '$3',
            },
        },
    },
    defaultVariants: {
        variant: 'primary',
        size: 'medium',
    },
});
export function ResearchBeeButton(_a) {
    var _b = _a.variant, variant = _b === void 0 ? 'primary' : _b, _c = _a.size, size = _c === void 0 ? 'medium' : _c, children = _a.children, props = __rest(_a, ["variant", "size", "children"]);
    return (_jsx(ThemedButton, __assign({ variant: variant, size: size }, props, { children: children })));
}
//# sourceMappingURL=themed-button.js.map