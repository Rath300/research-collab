import { Text, YStack, XStack, Button, Separator } from 'tamagui';
import { MessageSquare, Home, Users, Bookmark, Settings } from '@tamagui/lucide-icons';
import { useRouter } from 'solito/router';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  currentPath?: string;
}

export function Sidebar({ currentPath = '' }: SidebarProps) {
  const router = useRouter();
  
  const navigationItems: NavigationItem[] = [
    {
      name: 'Home',
      href: '/',
      icon: <Home size={20} />,
    },
    {
      name: 'Slack',
      href: '/slack',
      icon: <MessageSquare size={20} />,
    },
    // Add your other navigation items here
  ];
  
  return (
    <YStack
      width={240}
      borderRightWidth={1}
      borderColor="$borderColor"
      bg="$backgroundStrong"
      display={{ xs: 'none', md: 'flex' } as any}
    >
      <YStack p="$4">
        <Text fontWeight="bold" fontSize="$5">Your App</Text>
      </YStack>
      
      <Separator />
      
      <YStack flex={1} p="$2" gap="$1">
        {navigationItems.map((item) => (
          <Button
            key={item.href}
            justifyContent="flex-start"
            alignItems="center"
            px="$3"
            py="$2"
            theme={currentPath.startsWith(item.href) ? 'active' : undefined}
            chromeless={!currentPath.startsWith(item.href)}
            onPress={() => router.push(item.href)}
          >
            <XStack gap="$3" alignItems="center">
              {item.icon}
              <Text>{item.name}</Text>
            </XStack>
          </Button>
        ))}
      </YStack>
    </YStack>
  );
} 