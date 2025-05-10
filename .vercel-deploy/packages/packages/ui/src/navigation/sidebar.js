import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Text, YStack, XStack, Button, Separator } from 'tamagui';
import { MessageSquare, Home } from '@tamagui/lucide-icons';
import { useRouter } from 'solito/router';
export function Sidebar(_a) {
    var _b = _a.currentPath, currentPath = _b === void 0 ? '' : _b;
    var router = useRouter();
    var navigationItems = [
        {
            name: 'Home',
            href: '/',
            icon: _jsx(Home, { size: 20 }),
        },
        {
            name: 'Slack',
            href: '/slack',
            icon: _jsx(MessageSquare, { size: 20 }),
        },
        // Add your other navigation items here
    ];
    return (_jsxs(YStack, { width: 240, borderRightWidth: 1, borderColor: "$borderColor", bg: "$backgroundStrong", display: { xs: 'none', md: 'flex' }, children: [_jsx(YStack, { p: "$4", children: _jsx(Text, { fontWeight: "bold", fontSize: "$5", children: "Your App" }) }), _jsx(Separator, {}), _jsx(YStack, { flex: 1, p: "$2", gap: "$1", children: navigationItems.map(function (item) { return (_jsx(Button, { justifyContent: "flex-start", alignItems: "center", px: "$3", py: "$2", theme: currentPath.startsWith(item.href) ? 'active' : undefined, chromeless: !currentPath.startsWith(item.href), onPress: function () { return router.push(item.href); }, children: _jsxs(XStack, { gap: "$3", alignItems: "center", children: [item.icon, _jsx(Text, { children: item.name })] }) }, item.href)); }) })] }));
}
//# sourceMappingURL=sidebar.js.map