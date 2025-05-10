import React from 'react';
import { H1, H4, Button, XStack, YStack, Text, Input, ScrollView } from 'tamagui';
import { Image } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack 
        flex={1} 
        backgroundColor="$researchbeeBlack" 
        padding="$4" 
        space="$4"
        alignItems="center"
      >
        <YStack 
          alignItems="center" 
          marginTop="$10"
          space="$2"
        >
          <XStack alignItems="center" space="$2">
            <Image 
              source={require('../assets/bee-icon.png')} 
              style={{ width: 40, height: 40 }} 
            />
            <H1 color="$researchbeeYellow" fontWeight="bold">Research-Bee</H1>
          </XStack>
          <H4 color="$color" textAlign="center" opacity={0.8}>
            Streamline Your Research Workflow
          </H4>
        </YStack>

        <YStack 
          backgroundColor="$researchbeeDarkGray" 
          padding="$5" 
          borderRadius="$4"
          marginTop="$6"
          width="100%"
          maxWidth={400}
          space="$4"
        >
          <Text color="$color" fontWeight="bold" fontSize="$5">Sign In</Text>
          
          <YStack space="$3">
            <Text color="$color" fontSize="$3">Email</Text>
            <Input 
              size="$4" 
              borderWidth={1}
              borderColor="$researchbeeMediumGray"
              backgroundColor="$background"
              placeholder="your@email.com"
              placeholderTextColor="$researchbeeLightGray"
            />
          </YStack>
          
          <YStack space="$3">
            <Text color="$color" fontSize="$3">Password</Text>
            <Input 
              size="$4" 
              borderWidth={1}
              borderColor="$researchbeeMediumGray"
              backgroundColor="$background"
              placeholder="••••••••"
              placeholderTextColor="$researchbeeLightGray"
              secureTextEntry
            />
          </YStack>
          
          <Button 
            backgroundColor="$researchbeeYellow" 
            color="$researchbeeBlack"
            size="$4"
            fontWeight="bold"
            marginTop="$2"
          >
            Sign In
          </Button>
          
          <XStack justifyContent="center" marginTop="$2">
            <Text color="$researchbeeLightGray" fontSize="$2">
              Don't have an account?{' '}
            </Text>
            <Link href="/signup" asChild>
              <Text color="$researchbeeYellow" fontSize="$2" fontWeight="bold">
                Sign Up
              </Text>
            </Link>
          </XStack>
        </YStack>

        <YStack marginTop="auto" paddingBottom="$10" space="$4" alignItems="center">
          <Text color="$researchbeeLightGray" textAlign="center" fontSize="$2">
            Research-Bee helps academic researchers organize projects, 
            collaborate with peers, and track progress from idea to publication.
          </Text>
          
          <XStack space="$4">
            <Link href="/features" asChild>
              <Text color="$researchbeeYellow" fontSize="$2">Features</Text>
            </Link>
            <Link href="/pricing" asChild>
              <Text color="$researchbeeYellow" fontSize="$2">Pricing</Text>
            </Link>
            <Link href="/support" asChild>
              <Text color="$researchbeeYellow" fontSize="$2">Support</Text>
            </Link>
          </XStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
} 