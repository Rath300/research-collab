'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FiLoader, FiUserCheck } from 'react-icons/fi';
import { PageContainer } from '@/components/layout/PageContainer';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, profile } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else if (profile && profile.first_name && profile.last_name) { 
        // If profile seems substantially filled (e.g., has first/last name), 
        // user might have landed here by mistake after setup. Redirect to dashboard.
        // This check can be adjusted based on what signifies a "complete enough" profile.
        router.replace('/dashboard');
      }
    }
  }, [user, authLoading, profile, router]);

  const handleProfileSetupComplete = () => {
    setIsRedirecting(true);
    // Optional: show a success message before redirecting
    setTimeout(() => {
      router.replace('/dashboard');
    }, 1500); // Delay for user to see success message
  };

  if (authLoading || (!user && !authLoading) || (profile && profile.first_name && profile.last_name && !isRedirecting) ) {
    // Show loading while checking auth, or if user is null (pre-redirect),
    // or if profile is already complete (pre-redirect)
  return (
      <PageContainer title="Profile Setup" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-researchbee-yellow text-6xl mb-4" />
          <p className="text-xl text-gray-300">Loading your information...</p>
        </div>
      </PageContainer>
    );
  }
  
  if (isRedirecting) {
    return (
      <PageContainer title="Profile Setup Complete" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <FiUserCheck className="text-7xl text-green-400 mx-auto mb-5" />
          <p className="text-3xl font-semibold text-white">Profile setup complete!</p>
          <p className="text-xl text-gray-300 mt-2">Redirecting you to the dashboard...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Set Up Your Profile" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="glass-card shadow-xl overflow-hidden">
          <CardHeader className="pt-8 pb-6 text-center border-b border-white/10">
            <FiUserCheck className="text-5xl text-researchbee-yellow mx-auto mb-4" />
            <CardTitle className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
              Welcome! Let&apos;s Get You Set Up
            </CardTitle>
            <CardDescription className="text-gray-300 mt-2 text-lg px-4">
              Complete your profile to start connecting and collaborating.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <ProfileForm onProfileUpdate={handleProfileSetupComplete} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
} 