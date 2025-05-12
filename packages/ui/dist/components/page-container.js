import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ScrollView, YStack, styled, XStack, H2, Button, SizableText } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BeeIcon } from './bee-icon';
const StyledSafeAreaView = styled(SafeAreaView, {
    name: 'StyledSafeAreaView',
    flex: 1,
    backgroundColor: '$background',
});
const ContentContainer = styled(YStack, {
    name: 'ContentContainer',
    flex: 1,
    padding: '$4',
    paddingBottom: '$8',
});
export function PageContainer({ children, title, showHeader = true, showBackButton = false, onBackPress, scrollable = true, headerRight, paddingHorizontal = '$4', paddingVertical = '$4', backgroundColor = '$background', }) {
    const content = (_jsx(ContentContainer, { paddingHorizontal: paddingHorizontal, paddingVertical: paddingVertical, backgroundColor: backgroundColor, children: children }));
    return (_jsxs(StyledSafeAreaView, { children: [showHeader && (_jsxs(XStack, { paddingHorizontal: "$4", paddingVertical: "$2.5", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "$borderColor", backgroundColor: "$backgroundHover", children: [showBackButton && (_jsx(Button, { chromeless: true, paddingRight: "$2", onPress: onBackPress, icon: _jsx(SizableText, { fontSize: "$5", children: "\u2190" }) })), title ? (_jsx(H2, { flex: 1, textAlign: "center", children: title })) : (_jsxs(XStack, { flex: 1, justifyContent: "center", alignItems: "center", gap: "$2", children: [_jsx(BeeIcon, { size: 24 }), _jsx(H2, { children: "Research Bee" })] })), headerRight ? (_jsx(XStack, { children: headerRight })) : (_jsx(XStack, { width: showBackButton ? 24 : 0 }))] })), scrollable ? _jsx(ScrollView, { flex: 1, children: content }) : content] }));
}
//# sourceMappingURL=page-container.js.map