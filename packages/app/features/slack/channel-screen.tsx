import { useEffect } from 'react';
import { Stack } from 'tamagui';
import { ChannelView } from '@acme/ui/src/slack/channel-view';
import { useParam } from 'solito/navigation';
import { useSlack } from './use-slack';

export function ChannelScreen() {
  // Get the channel ID from the route params
  const [channelId] = useParam<{ id: string }>('id');
  
  // Use our Slack hook to get data and actions
  const {
    channels,
    messages,
    isLoadingChannels,
    isLoadingMessages,
    isSendingMessage,
    channelsError,
    messagesError,
    sendMessage,
  } = useSlack(channelId);

  return (
    <Stack f={1} backgroundColor="$background">
      <ChannelView
        channels={channels}
        messages={messages}
        selectedChannelId={channelId}
        isLoadingChannels={isLoadingChannels}
        isLoadingMessages={isLoadingMessages}
        isSendingMessage={isSendingMessage}
        channelsError={channelsError}
        messagesError={messagesError}
        onSendMessage={sendMessage}
      />
    </Stack>
  );
} 