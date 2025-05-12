import type { SlackChannel } from '@acme/api/src/slack/types';
interface ChannelListProps {
    channels: SlackChannel[];
    isLoading: boolean;
    error: Error | null;
    selectedChannelId?: string;
}
export declare function ChannelList({ channels, isLoading, error, selectedChannelId, }: ChannelListProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=channel-list.d.ts.map