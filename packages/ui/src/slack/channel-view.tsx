import { useState } from 'react';
import { YStack, XStack, H3, Spinner } from 'tamagui';
import { Hash } from '@tamagui/lucide-icons';
import { ChannelList } from './channel-list';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
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

export function ChannelView({
  channels,
  messages,
  selectedChannelId,
  isLoadingChannels,
  isLoadingMessages,
  isSendingMessage,
  channelsError,
  messagesError,
  onSendMessage,
}: ChannelViewProps) {
  // Get the current channel info if we have a selected channel
  const selectedChannel = selectedChannelId
    ? channels.find((c) => c.id === selectedChannelId)
    : undefined;

  return (
    <XStack flex={1} overflow="hidden">
      {/* Channel list - will be responsive */}
      <ChannelList
        channels={channels}
        isLoading={isLoadingChannels}
        error={channelsError}
        selectedChannelId={selectedChannelId}
      />

      {/* Main chat area */}
      <YStack flex={1} overflow="hidden">
        {selectedChannelId ? (
          <>
            {/* Channel header */}
            <XStack
              p="$3"
              borderBottomWidth={1}
              borderColor="$borderColor"
              alignItems="center"
              gap="$2"
            >
              <Hash size={20} opacity={0.7} />
              <H3 fontSize="$5">
                {selectedChannel?.name || 'Loading...'}
              </H3>
            </XStack>

            {/* Messages */}
            <YStack flex={1} overflow="hidden">
              <MessageList
                messages={messages}
                isLoading={isLoadingMessages}
                error={messagesError}
              />
            </YStack>

            {/* Message input */}
            <MessageInput
              channelId={selectedChannelId}
              onSendMessage={onSendMessage}
              isLoading={isSendingMessage}
            />
          </>
        ) : (
          <YStack flex={1} justifyContent="center" alignItems="center">
            {isLoadingChannels ? (
              <Spinner />
            ) : (
              <>
                <Hash size={32} opacity={0.5} />
                <H3 mt="$2" opacity={0.7}>
                  Select a channel
                </H3>
              </>
            )}
          </YStack>
        )}
      </YStack>
    </XStack>
  );
} 