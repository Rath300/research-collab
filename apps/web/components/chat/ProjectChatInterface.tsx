/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { YStack, XStack, ScrollView as TamaguiScrollView, Input, Button, Text, Spinner, Separator, Avatar } from 'tamagui';
import { FiSend, FiMessageSquare, FiRefreshCw, FiChevronsDown, FiUser } from 'react-icons/fi';
import { api } from '@/lib/trpc';
import { type ProjectChatMessage } from '@research-collab/db';
import { formatDistanceToNowStrict } from 'date-fns';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface MessageWithSender extends ProjectChatMessage {
  sender: Profile | null;
}

interface ChatMessageItemProps {
  message: MessageWithSender;
  currentUserId: string | undefined;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, currentUserId }) => {
  const isCurrentUser = message.user_id === currentUserId;
  const displayName = message.sender?.first_name || message.sender?.last_name || 'Anonymous';
  const initials = (message.sender?.first_name?.[0] || '') + (message.sender?.last_name?.[0] || '');

  return (
    <XStack 
      space="$3" 
      padding="$3" 
      borderRadius="$4" 
      backgroundColor={isCurrentUser ? '$blue4' : '$gray4'}
      alignSelf={isCurrentUser ? 'flex-end' : 'flex-start'}
      maxWidth="80%"
      marginBottom="$2"
    >
      {!isCurrentUser && (
        <Avatar circular size="$3">
          {message.sender?.avatar_url && <Avatar.Image accessibilityLabel={displayName} src={message.sender.avatar_url} />}
          <Avatar.Fallback backgroundColor={isCurrentUser ? '$blue7' : '$gray7'} delayMs={300}>
            <Text fontSize="$4" color={isCurrentUser ? '$blue11' : '$gray11'}>{initials || <FiUser />}</Text>
          </Avatar.Fallback>
        </Avatar>
      )}
      <YStack flex={1}>
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$1">
          {!isCurrentUser && <Text fontWeight="bold" fontSize="$3" color={isCurrentUser ? '$blue11' : '$gray11'}>{displayName}</Text>}
          <Text fontSize="$2" color={isCurrentUser ? '$blue10' : '$gray10'}>
            {formatDistanceToNowStrict(message.created_at, { addSuffix: true })}
          </Text>
        </XStack>
        <Text fontSize="$4" color={isCurrentUser ? '$blue12' : '$gray12'}>{message.content}</Text>
      </YStack>
      {isCurrentUser && (
         <Avatar circular size="$3">
          {message.sender?.avatar_url && <Avatar.Image accessibilityLabel={displayName} src={message.sender.avatar_url} />}
          <Avatar.Fallback backgroundColor={isCurrentUser ? '$blue7' : '$gray7'} delayMs={300}>
            <Text fontSize="$4" color={isCurrentUser ? '$blue11' : '$gray11'}>{initials || <FiUser />}</Text>
          </Avatar.Fallback>
        </Avatar>
      )}
    </XStack>
  );
};

interface ChatMessageInputProps {
  onSendMessage: (content: string) => void;
  isSending: boolean;
}

const ChatMessageInput: React.FC<ChatMessageInputProps> = ({ onSendMessage, isSending }) => {
  const [messageContent, setMessageContent] = useState('');

  const handleSend = () => {
    if (messageContent.trim()) {
      onSendMessage(messageContent.trim());
      setMessageContent('');
    }
  };

  return (
    <XStack space="$3" alignItems="center" padding="$4" borderTopWidth={1} borderColor="$gray6">
      <Input 
        flex={1} 
        placeholder="Type your message..." 
        value={messageContent} 
        onChangeText={setMessageContent}
        onSubmitEditing={handleSend}
        disabled={isSending}
        backgroundColor="$gray3"
        borderColor="$gray7"
        focusStyle={{ borderColor: '$blue8' }}
      />
      <Button 
        icon={isSending ? <Spinner size="small" color="$gray10" /> : <FiSend />}
        onPress={handleSend}
        disabled={isSending || !messageContent.trim()}
        circular
        theme="blue"
      />
    </XStack>
  );
};

interface ProjectChatInterfaceProps {
  projectId: string;
  currentUserId?: string;
}

// This interface matches the actual structure returned by your tRPC procedure for ONE page of messages
interface ChatMessageApiPage {
  messages: MessageWithSender[];
  nextCursor?: string | null; 
}

// This interface describes the overall data structure returned by useInfiniteQuery
interface InfiniteQueryData {
  pages: ChatMessageApiPage[];
  pageParams: (string | undefined)[];
}

export function ProjectChatInterface({ projectId, currentUserId }: ProjectChatInterfaceProps) {
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const scrollRef = useRef<React.ElementRef<typeof TamaguiScrollView>>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  
  const queryProcedureInput = { projectId, limit: 20 };

  const messagesQuery = api.chat.listMessagesForProject.useInfiniteQuery(
    queryProcedureInput, 
    { 
      queryKey: ['chat.listMessagesForProject', queryProcedureInput], 
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: true,
    }
  );

  const sendMessageMutation = api.chat.sendMessage.useMutation({
    onSuccess: () => {
      messagesQuery.refetch();
      scrollToBottom();
    },
  });

  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate({ projectId, content });
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    const data = messagesQuery.data as InfiniteQueryData | undefined;
    if (data?.pages && data.pages.length > 0) {
      const lastPage = data.pages[data.pages.length - 1];
      if (lastPage?.messages?.length > 0) {
          scrollToBottom('auto');
      }
    }
  }, [messagesQuery.data, scrollToBottom]);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (!layoutMeasurement || !contentOffset || !contentSize) return;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setShowScrollToBottom(!isAtBottom);
  };

  if (messagesQuery.isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
        <Spinner size="large" color="$blue10" />
        <Text marginTop="$3" fontSize="$5">Loading messages...</Text>
      </YStack>
    );
  }

  if (messagesQuery.isError) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
        <FiMessageSquare size={40} color="$red10" />
        <Text marginTop="$3" fontSize="$5" color="$red10">Error: {messagesQuery.error?.message || 'Unknown error'}</Text>
        <Button icon={<FiRefreshCw />} onPress={() => messagesQuery.refetch()} marginTop="$4">
          Try Again
        </Button>
      </YStack>
    );
  }

  const data = messagesQuery.data as InfiniteQueryData | undefined;
  const allMessages: MessageWithSender[] = data?.pages?.flatMap((page: ChatMessageApiPage) => page.messages) || [];

  return (
    <YStack flex={1} backgroundColor="$gray1" height="100%" maxHeight="70vh"> 
      <YStack flex={1} paddingHorizontal="$4" paddingTop="$4">
        {allMessages.length === 0 && !messagesQuery.isFetching ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <FiMessageSquare size={40} color="$gray8" />
            <Text marginTop="$2" fontSize="$5" color="$gray9">No messages yet.</Text>
            <Text fontSize="$4" color="$gray8">Be the first to say something!</Text>
          </YStack>
        ) : (
          <TamaguiScrollView 
            ref={scrollRef} 
            flex={1} 
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
          >
            {messagesQuery.hasNextPage && (
              <Button 
                onPress={() => messagesQuery.fetchNextPage()} 
                disabled={messagesQuery.isFetchingNextPage}
                marginVertical="$3"
                size="$3"
                iconAfter={messagesQuery.isFetchingNextPage ? <Spinner /> : null}
              >
                Load older messages
              </Button>
            )}
            {messagesQuery.isFetchingNextPage && <Spinner marginVertical="$3" />}
            {allMessages.slice().reverse().map((message: MessageWithSender) => (
              <ChatMessageItem key={message.id} message={message} currentUserId={currentUserId} />
            ))}
            <div ref={bottomRef} />
          </TamaguiScrollView>
        )}
      </YStack>
      
      {showScrollToBottom && allMessages.length > 0 && (
        <Button
            circular
            icon={<FiChevronsDown />}
            position="absolute"
            bottom="$10"
            right="$4"
            zIndex={10}
            onPress={() => scrollToBottom('smooth')}
            theme="blue"
            size="$3"
        />
      )}
      
      <ChatMessageInput onSendMessage={handleSendMessage} isSending={sendMessageMutation.isPending} />
    </YStack>
  );
} 