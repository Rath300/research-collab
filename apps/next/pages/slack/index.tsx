import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import { Spinner, YStack } from 'tamagui';

export default function SlackIndexPage() {
  const router = useRouter();
  const { data: channels, isLoading } = trpc.slack.getChannels.useQuery();

  useEffect(() => {
    // If channels loaded, redirect to the first channel
    if (channels && channels.length > 0) {
      router.replace(`/slack/channels/${channels[0].id}`);
    }
  }, [channels, router]);

  return (
    <YStack f={1} jc="center" ai="center" space>
      <Spinner size="large" />
    </YStack>
  );
} 