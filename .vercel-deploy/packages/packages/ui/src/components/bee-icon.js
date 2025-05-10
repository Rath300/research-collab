import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Svg, Path, Circle } from 'react-native-svg';
import { View } from 'tamagui';
export function BeeIcon(_a) {
    var _b = _a.size, size = _b === void 0 ? 32 : _b, _c = _a.color, color = _c === void 0 ? '#F5BD30' : _c;
    return (_jsx(View, { width: size, height: size, children: _jsxs(Svg, { width: size, height: size, viewBox: "0 0 64 64", fill: "none", children: [_jsx(Path, { d: "M32 48c9.941 0 18-8.059 18-18S41.941 12 32 12 14 20.059 14 30s8.059 18 18 18z", fill: color }), _jsx(Path, { d: "M26 22h12M24 30h16M26 38h12", stroke: "#000", strokeWidth: 3, strokeLinecap: "round" }), _jsx(Path, { d: "M14 26c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zM50 26c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z", fill: "#E6E6E6", fillOpacity: 0.8 }), _jsx(Path, { d: "M32 48v8l4-4-4-4z", fill: "#333" }), _jsx(Circle, { cx: "26", cy: "20", r: "3", fill: "#333" }), _jsx(Circle, { cx: "38", cy: "20", r: "3", fill: "#333" }), _jsx(Path, { d: "M27 15c-1-3-3-5-5-5M37 15c1-3 3-5 5-5", stroke: "#333", strokeWidth: 1.5, strokeLinecap: "round" })] }) }));
}
//# sourceMappingURL=bee-icon.js.map