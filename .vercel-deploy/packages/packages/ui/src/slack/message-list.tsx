import { YStack, XStack, Text, Avatar, Spinner, ScrollView, H5 } from 'tamagui';
import { formatDistanceToNow } from 'date-fns';
import type { SlackMessageWithUser } from '@acme/api/src/slack/types';

interface MessageListProps {
  messages: SlackMessageWithUser[];
  isLoading: boolean;
  error: Error | null;
}

export function MessageList({ messages, isLoading, error }: MessageListProps) {
  if (isLoading) {
    return (
      <XStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </XStack>
    );
  }

  if (error) {
    return (
      <YStack p="$4">
        <Text color="$red10">Error loading messages: {error.message}</Text>
      </YStack>
    );
  }

  if (messages.length === 0) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" p="$4">
        <Text color="$gray10">No messages in this channel yet</Text>
      </YStack>
    );
  }

  return (
    <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 20 }}>
      <YStack gap="$2" p="$3">
        {messages.map((message) => (
          <MessageItem key={message.ts} message={message} />
        ))}
      </YStack>
    </ScrollView>
  );
}

interface MessageItemProps {
  message: SlackMessageWithUser;
}

function MessageItem({ message }: MessageItemProps) {
  // Parse timestamp from Slack (in seconds) to Date
  const timestamp = new Date(Number(message.ts) * 1000);
  const timeText = formatDistanceToNow(timestamp, { addSuffix: true });

  const user = message.user;
  const userName = user?.real_name || user?.display_name || user?.name || 'Unknown user';
  const avatarUrl = user?.image_192 || '';

  return (
    <XStack gap="$3" alignItems="flex-start">
      <Avatar circular size="$3">
        <Avatar.Image src={avatarUrl} />
        <Avatar.Fallback bc="$gray5">
          {userName.charAt(0).toUpperCase()}
        </Avatar.Fallback>
      </Avatar>
      
      <YStack flex={1}>
        <XStack gap="$2" alignItems="baseline">
          <Text fontWeight="600">{userName}</Text>
          <Text fontSize="$1" color="$gray10">
            {timeText}
          </Text>
        </XStack>
        
        <Text mt="$1" fontSize="$3">
          {message.text}
        </Text>
        
        {message.reply_count ? (
          <Text mt="$1" fontSize="$2" color="$blue10">
            {message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}
          </Text>
        ) : null}
      </YStack>
    </XStack>
  );
} 