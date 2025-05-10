import type { SlackChannel, SlackMessageWithUser } from '@acme/api/src/slack/types';
interface ChannelViewProps {
    channels: SlackChannel[];
    messages: SlackMessageWithUser[];
    selectedChannelId?: string;
    isLoadingChannels: boolean;
    isLoadingMessages: boolean;
    isSendingMessage: boolean;
    channelsError: Error | null;
    messagesError: Error | null;
    onSendMessage: (text: string) => Promise<void>;
}
export declare function ChannelView({ channels, messages, selectedChannelId, isLoadingChannels, isLoadingMessages, isSendingMessage, channelsError, messagesError, onSendMessage, }: ChannelViewProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=channel-view.d.ts.map