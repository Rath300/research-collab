'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FiUser, FiLoader, FiAlertCircle } from 'react-icons/fi'; // Added FiAlertCircle for error state
import { useAuthStore } from '@/lib/store';
import { getProfile } from '@/lib/api';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { type Profile as ProfileType } from '@research-collab/db';
import { PageContainer } from '@/components/layout/PageContainer'; // Import PageContainer
import { Avatar } from '@/components/ui/Avatar'; // Import Avatar component

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, setProfile } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) {
        router.push('/login');
        return;
      }
      
      setIsLoading(true);
      setPageError(null);
      try {
        if (!profile || !profile.updated_at) { // Fetch if no profile or if crucial data like updated_at is missing
          const fetchedProfileData = await getProfile(user.id);
          if (fetchedProfileData) {
            const processedProfile: ProfileType = {
              ...fetchedProfileData,
              updated_at: fetchedProfileData.updated_at ? new Date(fetchedProfileData.updated_at) : null,
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
    } else if (!isLoading) { // Only redirect if not already loading and no user
        router.push('/login');
    }
  }, [user, profile, setProfile, router, isLoading]);

  const handleProfileUpdated = () => {
    // console.log('Profile updated successfully from callback!');
  };

  const profileForForm = profile ? {
    ...profile,
    full_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
    research_interests: profile.interests || [],
  } : undefined;

  if (isLoading) {
    return (
      <PageContainer title="Settings" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-researchbee-yellow text-6xl mb-4" />
          <p className="text-xl text-gray-300">Loading your settings...</p>
        </div>
      </PageContainer>
    );
  }

  if (pageError) {
    return (
      <PageContainer title="Error" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="glass-card p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <FiAlertCircle className="mx-auto text-red-400 text-5xl mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Oops! Something went wrong.</h2>
          <p className="text-gray-300 mb-6">{pageError}</p>
          <Button 
            variant="primary" 
            onClick={() => router.refresh()} // Simplest way to retry fetching or re-render
            className="w-full bg-researchbee-yellow hover:bg-researchbee-darkyellow text-black"
          >
            Try Again
          </Button>
        </div>
      </PageContainer>
    );
  }
  
  if (!user || !profileForForm ) {
     if (!isLoading) router.push('/login'); // Redirect if not loading and critical data missing
     return (
      <PageContainer title="Settings" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-researchbee-yellow text-6xl mb-4" />
          <p className="text-xl text-gray-300">Preparing settings...</p> {/* Generic message while redirecting or confirming data */}
        </div>
      </PageContainer>
     );
  }

  return (
    <PageContainer title="Account Settings" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white">
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:py-16 lg:py-20">
        <h1 className="text-4xl sm:text-5xl font-bold mb-12 sm:mb-16 text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
          Account Settings
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          <div className="md:col-span-4 lg:col-span-3">
            <Card className="glass-card sticky top-24 shadow-xl">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-black/20 backdrop-blur-md border-2 border-white/10 flex items-center justify-center overflow-hidden mb-5 shadow-lg transition-all duration-300 hover:scale-105 group">
                  <Avatar 
                    src={profileForForm?.avatar_url} 
                    alt="Profile Avatar" 
                    size="lg" // Corresponds to 64px, a common large avatar size
                    className="group-hover:opacity-80 transition-opacity" // Pass through additional classes if needed
                    fallback={<FiUser className="text-gray-400 group-hover:text-researchbee-yellow transition-colors" size={60} />}
                  />
                </div>
                <h2 className="text-2xl font-semibold text-white truncate max-w-full px-2">{`${profileForForm?.first_name || ''} ${profileForForm?.last_name || ''}`.trim() || 'User Name'}</h2>
                <p className="text-sm text-gray-400 mt-1.5 break-all px-2">{user?.email || 'user@example.com'}</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-8 lg:col-span-9">
            <Card className="glass-card shadow-xl">
              <CardHeader className="border-b border-white/10 pb-4">
                <CardTitle className="text-2xl sm:text-3xl font-semibold text-white">Profile Information</CardTitle>
                <CardDescription className="text-gray-300 mt-1">
                  Keep your personal details and preferences up to date.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {/* ProfileForm is expected to be self-contained in terms of its internal styling using glass-card elements where appropriate */}
                <ProfileForm initialData={profileForForm} onProfileUpdate={handleProfileUpdated} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 