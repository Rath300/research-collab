"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { Button as TamaguiButton } from 'tamagui';
export function Button(_a) {
    var text = _a.text, onClick = _a.onClick, _b = _a.variant, variant = _b === void 0 ? 'primary' : _b, _c = _a.size, size = _c === void 0 ? 'medium' : _c, _d = _a.disabled, disabled = _d === void 0 ? false : _d;
    return (_jsx(TamaguiButton, { size: size, theme: variant, disabled: disabled, onPress: onClick, children: text }));
}
//# sourceMappingURL=button.js.map