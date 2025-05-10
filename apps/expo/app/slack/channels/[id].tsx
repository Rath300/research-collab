import { ChannelScreen } from 'app/features/slack';
import { Stack } from 'expo-router';

export default function ChannelPage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Slack Channel',
        }}
      />
      <ChannelScreen />
    </>
  );
} 