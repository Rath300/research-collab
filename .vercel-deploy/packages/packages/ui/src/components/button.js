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
import { Button as TamaguiButton, styled, Spinner, Text, XStack } from 'tamagui';
var CustomButton = styled(TamaguiButton, {
    name: 'CustomButton',
    borderRadius: '$3',
    paddingVertical: '$3',
    paddingHorizontal: '$4',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '$2',
    variants: {
        variant: {
            primary: {
                backgroundColor: '$researchbeeYellow',
                color: '$color',
                borderColor: '$researchbeeYellow',
                hoverStyle: {
                    backgroundColor: '$researchbeeYellowDark',
                    borderColor: '$researchbeeYellowDark',
                },
                pressStyle: {
                    backgroundColor: '$researchbeeYellowPress',
                    borderColor: '$researchbeeYellowPress',
                },
            },
            secondary: {
                backgroundColor: 'transparent',
                color: '$color',
                borderColor: '$borderColor',
                borderWidth: 1,
                hoverStyle: {
                    backgroundColor: '$backgroundHover',
                },
                pressStyle: {
                    backgroundColor: '$backgroundPress',
                },
            },
            outline: {
                backgroundColor: 'transparent',
                color: '$researchbeeYellow',
                borderColor: '$researchbeeYellow',
                borderWidth: 1,
                hoverStyle: {
                    backgroundColor: '$backgroundHover',
                },
                pressStyle: {
                    backgroundColor: '$backgroundPress',
                },
            },
            danger: {
                backgroundColor: '$red9',
                color: 'white',
                borderColor: '$red9',
                hoverStyle: {
                    backgroundColor: '$red10',
                    borderColor: '$red10',
                },
                pressStyle: {
                    backgroundColor: '$red11',
                    borderColor: '$red11',
                },
            },
        },
        size: {
            small: {
                height: '$3',
                paddingHorizontal: '$2.5',
                paddingVertical: '$1.5',
                fontSize: '$1',
            },
            medium: {
                height: '$4',
                paddingHorizontal: '$3',
                paddingVertical: '$2',
                fontSize: '$2',
            },
            large: {
                height: '$5',
                paddingHorizontal: '$4',
                paddingVertical: '$2.5',
                fontSize: '$3',
            },
        },
        fullWidth: {
            true: {
                width: '100%',
            },
        },
    },
    defaultVariants: {
        variant: 'primary',
        size: 'medium',
        fullWidth: false,
    },
});
export function Button(_a) {
    var children = _a.children, leftIcon = _a.leftIcon, rightIcon = _a.rightIcon, _b = _a.loading, loading = _b === void 0 ? false : _b, _c = _a.variant, variant = _c === void 0 ? 'primary' : _c, _d = _a.size, size = _d === void 0 ? 'medium' : _d, _e = _a.fullWidth, fullWidth = _e === void 0 ? false : _e, _f = _a.disabled, disabled = _f === void 0 ? false : _f, props = __rest(_a, ["children", "leftIcon", "rightIcon", "loading", "variant", "size", "fullWidth", "disabled"]);
    return (_jsx(CustomButton, __assign({ variant: variant, size: size, fullWidth: fullWidth, disabled: disabled || loading, opacity: disabled ? 0.5 : 1 }, props, { children: _jsxs(XStack, { alignItems: "center", justifyContent: "center", gap: "$2", children: [loading && _jsx(Spinner, { size: size === 'small' ? 'small' : 'large', color: "$color" }), !loading && leftIcon, typeof children === 'string' ? _jsx(Text, { children: children }) : children, !loading && rightIcon] }) })));
}
//# sourceMappingURL=button.js.map