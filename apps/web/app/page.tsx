"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FiArrowRight, FiUsers, FiTarget, FiClock, FiSearch, FiBook, FiLayers, FiCode, FiMessageCircle, FiPlay, FiCheckCircle, FiDatabase, FiCalendar, FiFileText } from 'react-icons/fi';
import { YStack, XStack, Text, Button, Card } from 'tamagui';

export default function Home() {
  const [activeSection, setActiveSection] = useState('all');
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  // Handle header background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <YStack fullscreen backgroundColor="$background" alignItems="center" justifyContent="center" gap={32} paddingHorizontal={16}>
      <YStack alignItems="center" gap={16} marginTop={40}>
        <Text fontSize={40} fontWeight="bold" color="$color" textAlign="center">
          Get your research noticed by the world
        </Text>
        <Text fontSize={20} color="$gray10" textAlign="center" maxWidth={600}>
          Completely Free – No credit card required.
        </Text>
        <Button
          size="$6"
          borderRadius={100}
          backgroundColor="$purple10"
          color="$background"
          fontWeight="bold"
          fontSize={18}
          paddingHorizontal={32}
          paddingVertical={12}
          hoverStyle={{ backgroundColor: '$purple9' }}
          asChild
        >
          <a href="/signup">Get started</a>
        </Button>
      </YStack>
      <Card elevate size="$6" width={400} alignItems="center" paddingVertical={24} marginTop={32}>
        <Text fontSize={18} fontWeight="600" color="$gray10">
          Demo Video
        </Text>
        <Text color="$gray8" marginTop={8}>
          Demo coming soon!
        </Text>
      </Card>
      <YStack gap={12} width={400} marginTop={32}>
        <Text fontSize={22} fontWeight="600" color="$purple10">
          Key Features
        </Text>
        <YStack gap={8}>
          {features.map((feature) => (
            <XStack key={feature} alignItems="center" gap={8}>
              <Text color="$purple10">•</Text>
              <Text color="$color">{feature}</Text>
            </XStack>
          ))}
        </YStack>
      </YStack>
    </YStack>
  );
}

// Feature list for the features section
const features = [
  'Real-time collaborative research boards',
  'Invite and manage collaborators',
  'Task and progress tracking',
  'Integrated chat and comments',
  'Secure authentication (Supabase)',
  'Responsive design for web and mobile',
  'Export and share research summaries',
  'Personalized notifications',
  'Easy onboarding and profile setup',
];
