import type { SlackMessageWithUser } from '@acme/api/src/slack/types';
interface MessageListProps {
    messages: SlackMessageWithUser[];
    isLoading: boolean;
    error: Error | null;
}
export declare function MessageList({ messages, isLoading, error }: MessageListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=message-list.d.ts.map