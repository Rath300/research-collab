import { useState } from 'react';
import { YStack, XStack, Input, Button } from 'tamagui';
import { Send } from '@tamagui/lucide-icons';

interface MessageInputProps {
  channelId: string;
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

export function MessageInput({ channelId, onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      await onSendMessage(message);
      setMessage('');
    } catch (error) {
      // Error handling would be implemented here
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <YStack
      p="$3"
      borderTopWidth={1}
      borderColor="$borderColor"
      bg="$background"
    >
      <XStack gap="$2" alignItems="flex-end">
        <Input
          flex={1}
          size="$4"
          placeholder="Message this channel"
          value={message}
          onChange={(e) => setMessage(e.nativeEvent.text)}
          onKeyPress={handleKeyPress as any}
          multiline
          maxHeight={120}
          autoCapitalize="none"
          disabled={isLoading}
        />
        <Button
          size="$3"
          circular
          icon={<Send size={18} />}
          disabled={!message.trim() || isLoading}
          onPress={() => void handleSendMessage()}
        />
      </XStack>
    </YStack>
  );
} 