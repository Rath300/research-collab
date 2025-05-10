import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ScrollView, YStack, styled, SafeAreaView, XStack, H2, Button, SizableText } from 'tamagui';
import { BeeIcon } from './bee-icon';
var StyledSafeAreaView = styled(SafeAreaView, {
    name: 'StyledSafeAreaView',
    flex: 1,
    backgroundColor: '$background',
});
var ContentContainer = styled(YStack, {
    name: 'ContentContainer',
    flex: 1,
    padding: '$4',
    paddingBottom: '$8',
});
export function PageContainer(_a) {
    var children = _a.children, title = _a.title, _b = _a.showHeader, showHeader = _b === void 0 ? true : _b, _c = _a.showBackButton, showBackButton = _c === void 0 ? false : _c, onBackPress = _a.onBackPress, _d = _a.scrollable, scrollable = _d === void 0 ? true : _d, headerRight = _a.headerRight, _e = _a.paddingHorizontal, paddingHorizontal = _e === void 0 ? '$4' : _e, _f = _a.paddingVertical, paddingVertical = _f === void 0 ? '$4' : _f, _g = _a.backgroundColor, backgroundColor = _g === void 0 ? '$background' : _g;
    var content = (_jsx(ContentContainer, { paddingHorizontal: paddingHorizontal, paddingVertical: paddingVertical, backgroundColor: backgroundColor, children: children }));
    return (_jsxs(StyledSafeAreaView, { children: [showHeader && (_jsxs(XStack, { paddingHorizontal: "$4", paddingVertical: "$2.5", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "$borderColor", backgroundColor: "$backgroundHover", children: [showBackButton && (_jsx(Button, { chromeless: true, paddingRight: "$2", onPress: onBackPress, icon: _jsx(SizableText, { fontSize: "$5", children: "\u2190" }) })), title ? (_jsx(H2, { flex: 1, textAlign: "center", children: title })) : (_jsxs(XStack, { flex: 1, justifyContent: "center", alignItems: "center", gap: "$2", children: [_jsx(BeeIcon, { size: 24 }), _jsx(H2, { children: "Research Bee" })] })), headerRight ? (_jsx(XStack, { children: headerRight })) : (_jsx(XStack, { width: showBackButton ? 24 : 0 }))] })), scrollable ? _jsx(ScrollView, { flex: 1, children: content }) : content] }));
}
//# sourceMappingURL=page-container.js.map