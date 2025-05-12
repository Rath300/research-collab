"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { FiArrowRight, FiUsers, FiTarget, FiClock, FiSearch, FiBook, FiLayers, FiCode, FiMessageCircle, FiPlay, FiCheckCircle, FiDatabase, FiCalendar, FiFileText } from 'react-icons/fi';
import { YStack, XStack, Text, H1, H2, H3, H4, Paragraph, ThemedButton, ThemedCard, BeeIcon } from 'ui';

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
    <YStack minHeight="100vh" backgroundColor="$background">
      <HeroSection />
      <DemoCard />
      <FeaturesSection />
    </YStack>
  );
}

function HeroSection() {
  return (
    <YStack alignItems="center" justifyContent="center" gap="$6" paddingVertical="$10" paddingHorizontal="$4" backgroundColor="$background">
      <XStack alignItems="center" gap="$3" marginBottom="$4">
        <BeeIcon size={40} />
        <Text fontSize={28} fontWeight="bold" color="$color">It's Might Happen</Text>
      </XStack>
      <H1 textAlign="center" color="$color" fontWeight="bold">
        Get your research noticed by the world
      </H1>
      <Paragraph color="$gray10" fontSize={20} textAlign="center" maxWidth={600}>
        Collaborate, organize, and share your research with a global audience. <Text color="$purple10" fontWeight="bold">Completely Free.</Text>
      </Paragraph>
      <Link href="/signup" passHref legacyBehavior>
        <a>
          <ThemedButton intentType="primary" buttonStyleSize="large">
            Get started
          </ThemedButton>
        </a>
      </Link>
    </YStack>
  );
}

function DemoCard() {
  return (
    <ThemedCard title="Demo Video" elevation="medium" width="400px" alignItems="center" paddingVertical="$6" marginTop="$8">
      <Text fontSize={18} fontWeight="600" color="$gray10">Demo coming soon!</Text>
    </ThemedCard>
  );
}

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
  // Add more as needed
];

function FeaturesSection() {
  return (
    <YStack gap="$4" width="400px" alignSelf="center" marginTop="$10">
      <H2 color="$purple10" fontWeight="600" textAlign="center">Key Features</H2>
      <YStack gap="$2">
        {features.map((feature) => (
          <XStack key={feature} alignItems="center" gap="$2">
            <Text color="$purple10">•</Text>
            <Text color="$color">{feature}</Text>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}

// Feature list for the features section
const featuresList = [
  {
    title: "Find Collaborators",
    description: "Discover the perfect research partners based on interests, expertise, and availability.",
    icon: FiUsers,
  },
  {
    title: "Research Feed",
    description: "Browse trending research and papers from the community, filtered to your interests.",
    icon: FiSearch,
  },
  {
    title: "Project Guilds",
    description: "Join specialized research communities to collaborate on shared objectives.",
    icon: FiTarget,
  },
  {
    title: "Timestamped Ideas",
    description: "Securely record and verify ownership of your research ideas and contributions.",
    icon: FiClock,
  },
  {
    title: "AI Paper Reviews",
    description: "Get instant feedback and improvement suggestions on your research papers.",
    icon: FiBook,
  },
  {
    title: "Mentor Matching",
    description: "Connect with experienced mentors who can guide your research journey.",
    icon: FiUsers,
  },
  {
    title: "Real-time Collaboration",
    description: "Work together on documents, data analysis, and research papers in real-time.",
    icon: FiCode,
  },
  {
    title: "Opportunity Finder",
    description: "Discover funding opportunities, conferences, and publication venues in your field.",
    icon: FiLayers,
  },
  {
    title: "Research Analytics",
    description: "Track the impact and reach of your research with comprehensive analytics.",
    icon: FiMessageCircle,
  },
];
