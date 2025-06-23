import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useRouter } from 'solito/router';
import { useState } from 'react';
import { Text, YStack, XStack, Button, H4, Spinner, Sheet, ScrollView } from 'tamagui';
import { ChevronDown, Hash } from '@tamagui/lucide-icons';
export function ChannelList({ channels, isLoading, error, selectedChannelId, }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const handleChannelSelect = (channelId) => {
        router.push(`/slack/channels/${channelId}`);
        setOpen(false);
    };
    if (error) {
        return (_jsx(YStack, { p: "$4", children: _jsxs(Text, { color: "$red10", children: ["Error loading channels: ", error.message] }) }));
    }
    const renderChannelList = () => (_jsx(ScrollView, { children: _jsx(YStack, { p: "$2", gap: "$2", children: channels.map((channel) => (_jsxs(XStack, { px: "$3", py: "$2", borderRadius: "$4", bg: selectedChannelId === channel.id ? '$backgroundHover' : 'transparent', pressStyle: { bg: '$backgroundHover' }, onPress: () => handleChannelSelect(channel.id), opacity: channel.is_private ? 0.7 : 1, gap: "$2", alignItems: "center", children: [_jsx(Hash, { size: 16, opacity: 0.7 }), _jsx(Text, { fontSize: "$3", fontWeight: selectedChannelId === channel.id ? '600' : '400', children: channel.name }), channel.is_private && (_jsx(Text, { fontSize: "$1", opacity: 0.5, children: "(private)" }))] }, channel.id))) }) }));
    // For mobile we use a Sheet
    return (_jsxs(_Fragment, { children: [_jsxs(YStack, { display: { xs: 'none', sm: 'flex' }, width: 240, borderRightWidth: 1, borderColor: "$borderColor", bg: "$backgroundStrong", p: "$2", children: [_jsx(H4, { p: "$3", children: "Channels" }), isLoading ? (_jsx(XStack, { justifyContent: "center", p: "$4", children: _jsx(Spinner, {}) })) : (renderChannelList())] }), _jsx(XStack, { display: { xs: 'flex', sm: 'none' }, p: "$2", borderBottomWidth: 1, borderColor: "$borderColor", justifyContent: "space-between", alignItems: "center", children: _jsx(Button, { chromeless: true, icon: _jsx(Hash, {}), iconAfter: _jsx(ChevronDown, {}), onPress: () => setOpen(true), children: selectedChannelId
                        ? channels.find((c) => c.id === selectedChannelId)?.name || 'Select Channel'
                        : 'Select Channel' }) }), _jsx(Sheet, { modal: true, open: open, onOpenChange: setOpen, snapPoints: [80], dismissOnSnapToBottom: true, children: _jsxs(Sheet.Frame, { children: [_jsx(Sheet.Handle, {}), _jsx(H4, { p: "$3", textAlign: "center", children: "Slack Channels" }), isLoading ? (_jsx(XStack, { justifyContent: "center", p: "$4", children: _jsx(Spinner, {}) })) : (renderChannelList())] }) })] }));
}
//# sourceMappingURL=channel-list.js.map