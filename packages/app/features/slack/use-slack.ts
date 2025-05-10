import { useState } from 'react';
import { trpc } from '../../utils/trpc';
import type { SlackMessageWithUser, SlackChannel } from '@acme/api/src/slack/types';

export function useSlack(channelId?: string) {
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Fetch channels
  const channelsQuery = trpc.slack.getChannels.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch messages for the current channel
  const messagesQuery = trpc.slack.getMessages.useQuery(
    { channelId: channelId || '', limit: 50 },
    {
      enabled: !!channelId,
      refetchInterval: 10000, // Refetch every 10 seconds
      staleTime: 5000, // Consider data stale after 5 seconds
    }
  );
  
  // Mutation for sending messages
  const sendMessageMutation = trpc.slack.sendMessage.useMutation({
    onSuccess: () => {
      // Invalidate messages query to refresh after sending a message
      void messagesQuery.refetch();
    },
  });
  
  // Function to send a message
  const sendMessage = async (text: string) => {
    if (!channelId) return;
    
    setSendingMessage(true);
    try {
      await sendMessageMutation.mutateAsync({
        channelId,
        text,
      });
    } finally {
      setSendingMessage(false);
    }
  };
  
  return {
    // Data
    channels: (channelsQuery.data || []) as SlackChannel[],
    messages: (messagesQuery.data || []) as SlackMessageWithUser[],
    
    // Loading states
    isLoadingChannels: channelsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading && !!channelId,
    isSendingMessage: sendingMessage,
    
    // Errors
    channelsError: channelsQuery.error,
    messagesError: messagesQuery.error,
    
    // Actions
    sendMessage,
    refetchMessages: messagesQuery.refetch,
  };
} 