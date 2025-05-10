import { useRouter } from 'solito/router';
import { useState } from 'react';
import { Text, YStack, XStack, Button, H4, Spinner, Sheet, ScrollView } from 'tamagui';
import { ChevronDown, Hash } from '@tamagui/lucide-icons';
import type { SlackChannel } from '@acme/api/src/slack/types';

interface ChannelListProps {
  channels: SlackChannel[];
  isLoading: boolean;
  error: Error | null;
  selectedChannelId?: string;
}

export function ChannelList({
  channels,
  isLoading,
  error,
  selectedChannelId,
}: ChannelListProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleChannelSelect = (channelId: string) => {
    router.push(`/slack/channels/${channelId}`);
    setOpen(false);
  };

  if (error) {
    return (
      <YStack p="$4">
        <Text color="$red10">Error loading channels: {error.message}</Text>
      </YStack>
    );
  }

  const renderChannelList = () => (
    <ScrollView>
      <YStack p="$2" gap="$2">
        {channels.map((channel) => (
          <XStack
            key={channel.id}
            px="$3"
            py="$2"
            borderRadius="$4"
            bg={selectedChannelId === channel.id ? '$backgroundHover' : 'transparent'}
            pressStyle={{ bg: '$backgroundHover' }}
            onPress={() => handleChannelSelect(channel.id)}
            opacity={channel.is_private ? 0.7 : 1}
            gap="$2"
            alignItems="center"
          >
            <Hash size={16} opacity={0.7} />
            <Text
              fontSize="$3"
              fontWeight={selectedChannelId === channel.id ? '600' : '400'}
            >
              {channel.name}
            </Text>
            {channel.is_private && (
              <Text fontSize="$1" opacity={0.5}>
                (private)
              </Text>
            )}
          </XStack>
        ))}
      </YStack>
    </ScrollView>
  );

  // For mobile we use a Sheet
  return (
    <>
      <YStack
        display={{ xs: 'none', sm: 'flex' }}
        width={240}
        borderRightWidth={1}
        borderColor="$borderColor"
        bg="$backgroundStrong"
        p="$2"
      >
        <H4 p="$3">Channels</H4>
        {isLoading ? (
          <XStack justifyContent="center" p="$4">
            <Spinner />
          </XStack>
        ) : (
          renderChannelList()
        )}
      </YStack>

      {/* Mobile channel selector */}
      <XStack
        display={{ xs: 'flex', sm: 'none' }}
        p="$2"
        borderBottomWidth={1}
        borderColor="$borderColor"
        justifyContent="space-between"
        alignItems="center"
      >
        <Button
          chromeless
          icon={<Hash />}
          iconAfter={<ChevronDown />}
          onPress={() => setOpen(true)}
        >
          {selectedChannelId
            ? channels.find((c) => c.id === selectedChannelId)?.name || 'Select Channel'
            : 'Select Channel'}
        </Button>
      </XStack>

      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[80]}
        dismissOnSnapToBottom
      >
        <Sheet.Frame>
          <Sheet.Handle />
          <H4 p="$3" textAlign="center">
            Slack Channels
          </H4>
          {isLoading ? (
            <XStack justifyContent="center" p="$4">
              <Spinner />
            </XStack>
          ) : (
            renderChannelList()
          )}
        </Sheet.Frame>
      </Sheet>
    </>
  );
} 