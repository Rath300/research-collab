import { useEffect } from 'react';
import { Redirect, Stack, useRouter } from 'expo-router';
import { Spinner, YStack } from 'tamagui';
import { trpc } from '../../utils/trpc';

export default function SlackIndexPage() {
  const router = useRouter();
  const { data: channels, isLoading } = trpc.slack.getChannels.useQuery();

  useEffect(() => {
    // If channels loaded, redirect to the first channel
    if (channels && channels.length > 0) {
      router.replace(`/slack/channels/${channels[0].id}`);
    }
  }, [channels, router]);

  // We can also use Redirect component for simpler redirection
  if (channels && channels.length > 0) {
    return <Redirect href={`/slack/channels/${channels[0].id}`} />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Slack',
        }}
      />
      <YStack f={1} jc="center" ai="center" space>
        <Spinner size="large" />
      </YStack>
    </>
  );
} 