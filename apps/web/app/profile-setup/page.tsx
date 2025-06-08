'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FiLoader, FiUserCheck } from 'react-icons/fi';
import { PageContainer } from '@/components/layout/PageContainer';
import { motion } from 'framer-motion';

const ProfileForm = dynamic(() => import('@/components/profile/ProfileForm').then(mod => mod.ProfileForm), {
  loading: () => (
    <div className="flex justify-center items-center p-8">
      <FiLoader className="animate-spin text-accent-purple text-3xl" />
    </div>
  ),
  ssr: false, // Profile form is client-side heavy, no need for SSR
});

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, profile } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1 },
    }),
  };

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
    return (
      <PageContainer title="Profile Setup" className="bg-neutral-950 min-h-screen text-neutral-100 font-sans flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center"
        >
          <FiLoader className="animate-spin text-accent-purple text-5xl mb-4" />
          <p className="text-xl text-neutral-400">Loading your information...</p>
        </motion.div>
      </PageContainer>
    );
  }
  
  if (isRedirecting) {
    return (
      <PageContainer title="Profile Setup Complete" className="bg-neutral-950 min-h-screen text-neutral-100 font-sans flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <FiUserCheck className="text-7xl text-green-500 mx-auto mb-5" />
          <h2 className="text-3xl font-semibold text-neutral-100 font-heading">Profile setup complete!</h2>
          <p className="text-xl text-neutral-400 mt-2">Redirecting you to the dashboard...</p>
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Set Up Your Profile" className="bg-neutral-950 min-h-screen text-neutral-100 font-sans flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl"
      >
        <Card className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden">
          <CardHeader className="pt-8 pb-6 text-center">
            <motion.div custom={0} variants={itemVariants}>
              <FiUserCheck className="text-5xl text-accent-purple mx-auto mb-4" />
            </motion.div>
            <motion.div custom={1} variants={itemVariants}>
              <CardTitle className="text-3xl sm:text-4xl font-heading font-semibold text-neutral-100">
                Welcome! Let&apos;s Get You Set Up
              </CardTitle>
            </motion.div>
            <motion.div custom={2} variants={itemVariants}>
              <CardDescription className="text-neutral-400 mt-3 text-lg px-4 font-sans">
                Complete your profile to start connecting and collaborating.
              </CardDescription>
            </motion.div>
          </CardHeader>
          <motion.div custom={3} variants={itemVariants}>
            <CardContent className="p-6 sm:p-8">
              <ProfileForm onProfileUpdate={handleProfileSetupComplete} />
            </CardContent>
          </motion.div>
        </Card>
      </motion.div>
    </PageContainer>
  );
} 