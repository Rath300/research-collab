'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FiUser, FiLoader, FiAlertCircle, FiSettings } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getProfile } from '@/lib/api';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { type Profile as ProfileType } from '@research-collab/db';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar } from '@/components/ui/Avatar';

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, setProfile } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        // This should ideally be caught by middleware, but as a fallback:
        router.push('/login');
        return;
      }
      
      setIsLoading(true);
      setPageError(null);
      try {
        if (!profile || !profile.updated_at) {
          const fetchedProfileData = await getProfile(user.id);
          if (fetchedProfileData) {
            const processedProfile: ProfileType = {
              ...fetchedProfileData,
              updated_at: fetchedProfileData.updated_at ? new Date(fetchedProfileData.updated_at) : null,
              // Ensure other date fields are also processed if they exist and are used by ProfileForm
              created_at: fetchedProfileData.created_at ? new Date(fetchedProfileData.created_at) : new Date(), 
              joining_date: fetchedProfileData.joining_date ? new Date(fetchedProfileData.joining_date) : new Date(), 
            };
            setProfile(processedProfile);
          } else {
            throw new Error('Profile data could not be fetched.');
          }
        }
      } catch (err: any) {
        console.error('Error loading profile on settings page:', err);
        setPageError(err.message || 'Failed to load profile data. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
        loadProfileData();
    } else if (!isLoading && !useAuthStore.getState().isLoading) { // Check auth store loading state too
        router.push('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router, isLoading]); // Removed profile, setProfile from deps as it causes loops if profile itself is updated by setProfile call within

  const handleProfileUpdated = () => {
    // console.log('Profile updated successfully from callback!');
    // Potentially refetch or update local state if needed beyond what ProfileForm does
  };

  const profileForForm = profile ? {
    ...profile,
    full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
    research_interests: profile.interests || [],
    // Ensure all fields expected by ProfileForm are mapped correctly
    // skills, looking_for, education etc.
  } : undefined;

  if (isLoading || (!profile && !pageError)) { // Show loading if isLoading or if profile isn't there yet (and no error)
    return (
      <PageContainer title="Settings" className="bg-black min-h-screen text-neutral-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-accent-purple text-5xl mb-4" />
          <p className="text-xl text-neutral-300 font-sans">Loading your settings...</p>
        </div>
      </PageContainer>
    );
  }

  if (pageError) {
    return (
      <PageContainer title="Error" className="bg-black min-h-screen text-neutral-100 flex items-center justify-center">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-xl text-center max-w-md w-full">
          <FiAlertCircle className="mx-auto text-red-500 text-5xl mb-4" />
          <h2 className="text-2xl font-heading text-neutral-100 mb-2">Oops! Something went wrong.</h2>
          <p className="text-neutral-400 mb-6 font-sans">{pageError}</p>
          <Button 
            variant="primary"
            onClick={() => router.refresh()} 
            className="w-full bg-accent-purple hover:bg-accent-purple-hover text-white font-sans"
          >
            Try Again
          </Button>
        </div>
      </PageContainer>
    );
  }
  
  if (!user || !profileForForm ) {
     // This state should ideally not be reached if middleware and above checks are working.
     // If it is, it implies a deeper issue or a race condition.
     if (!useAuthStore.getState().isLoading) router.push('/login');
     return (
      <PageContainer title="Settings" className="bg-black min-h-screen text-neutral-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-accent-purple text-5xl mb-4" />
          <p className="text-xl text-neutral-300 font-sans">Preparing settings...</p>
        </div>
      </PageContainer>
     );
  }

  return (
    <PageContainer title="Account Settings" className="bg-black min-h-screen text-neutral-100 font-sans">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16 lg:py-20">
        <div className="mb-12 sm:mb-16 text-center">
          <FiSettings className="mx-auto text-accent-purple text-5xl mb-4" />
          <h1 className="text-4xl sm:text-5xl font-heading text-white tracking-tight">
            Account Settings
          </h1>
        </div>
        
        {/* 
          The original layout had a side card for avatar/name and a main card for the form.
          For simplicity and to align with settings/account/page.tsx's directness, 
          we can make ProfileForm the primary content here. If a sidebar is desired later,
          it can be re-added. For now, let's have a single column layout for the form.
        */}
        
        <Card className="bg-neutral-900 border border-neutral-800 shadow-xl">
          <CardHeader className="border-b border-neutral-700 pb-4">
            <CardTitle className="text-2xl sm:text-3xl font-heading text-neutral-100">Profile Information</CardTitle>
            <CardDescription className="text-neutral-400 mt-1 font-sans">
              Keep your personal details and preferences up to date.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ProfileForm initialData={profileForForm} onProfileUpdate={handleProfileUpdated} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
} 