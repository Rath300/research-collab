import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { YStack, XStack, H3, Spinner } from 'tamagui';
import { Hash } from '@tamagui/lucide-icons';
import { ChannelList } from './channel-list';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
export function ChannelView({ channels, messages, selectedChannelId, isLoadingChannels, isLoadingMessages, isSendingMessage, channelsError, messagesError, onSendMessage, }) {
    // Get the current channel info if we have a selected channel
    const selectedChannel = selectedChannelId
        ? channels.find((c) => c.id === selectedChannelId)
        : undefined;
    return (_jsxs(XStack, { flex: 1, overflow: "hidden", children: [_jsx(ChannelList, { channels: channels, isLoading: isLoadingChannels, error: channelsError, selectedChannelId: selectedChannelId }), _jsx(YStack, { flex: 1, overflow: "hidden", children: selectedChannelId ? (_jsxs(_Fragment, { children: [_jsxs(XStack, { p: "$3", borderBottomWidth: 1, borderColor: "$borderColor", alignItems: "center", gap: "$2", children: [_jsx(Hash, { size: 20, opacity: 0.7 }), _jsx(H3, { fontSize: "$5", children: selectedChannel?.name || 'Loading...' })] }), _jsx(YStack, { flex: 1, overflow: "hidden", children: _jsx(MessageList, { messages: messages, isLoading: isLoadingMessages, error: messagesError }) }), _jsx(MessageInput, { channelId: selectedChannelId, onSendMessage: onSendMessage, isLoading: isSendingMessage })] })) : (_jsx(YStack, { flex: 1, justifyContent: "center", alignItems: "center", children: isLoadingChannels ? (_jsx(Spinner, {})) : (_jsxs(_Fragment, { children: [_jsx(Hash, { size: 32, opacity: 0.5 }), _jsx(H3, { mt: "$2", opacity: 0.7, children: "Select a channel" })] })) })) })] }));
}
//# sourceMappingURL=channel-view.js.map