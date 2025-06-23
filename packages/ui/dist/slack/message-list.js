import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { YStack, XStack, Text, Avatar, Spinner, ScrollView } from 'tamagui';
import { formatDistanceToNow } from 'date-fns';
export function MessageList({ messages, isLoading, error }) {
    if (isLoading) {
        return (_jsx(XStack, { flex: 1, justifyContent: "center", alignItems: "center", children: _jsx(Spinner, { size: "large" }) }));
    }
    if (error) {
        return (_jsx(YStack, { p: "$4", children: _jsxs(Text, { color: "$red10", children: ["Error loading messages: ", error.message] }) }));
    }
    if (messages.length === 0) {
        return (_jsx(YStack, { flex: 1, justifyContent: "center", alignItems: "center", p: "$4", children: _jsx(Text, { color: "$gray10", children: "No messages in this channel yet" }) }));
    }
    return (_jsx(ScrollView, { flex: 1, contentContainerStyle: { paddingBottom: 20 }, children: _jsx(YStack, { gap: "$2", p: "$3", children: messages.map((message) => (_jsx(MessageItem, { message: message }, message.ts))) }) }));
}
function MessageItem({ message }) {
    // Parse timestamp from Slack (in seconds) to Date
    const timestamp = new Date(Number(message.ts) * 1000);
    const timeText = formatDistanceToNow(timestamp, { addSuffix: true });
    const user = message.user;
    const userName = user?.real_name || user?.display_name || user?.name || 'Unknown user';
    const avatarUrl = user?.image_192 || '';
    return (_jsxs(XStack, { gap: "$3", alignItems: "flex-start", children: [_jsxs(Avatar, { circular: true, size: "$3", children: [_jsx(Avatar.Image, { src: avatarUrl }), _jsx(Avatar.Fallback, { bc: "$gray5", children: userName.charAt(0).toUpperCase() })] }), _jsxs(YStack, { flex: 1, children: [_jsxs(XStack, { gap: "$2", alignItems: "baseline", children: [_jsx(Text, { fontWeight: "600", children: userName }), _jsx(Text, { fontSize: "$1", color: "$gray10", children: timeText })] }), _jsx(Text, { mt: "$1", fontSize: "$3", children: message.text }), message.reply_count ? (_jsxs(Text, { mt: "$1", fontSize: "$2", color: "$blue10", children: [message.reply_count, " ", message.reply_count === 1 ? 'reply' : 'replies'] })) : null] })] }));
}
//# sourceMappingURL=message-list.js.map