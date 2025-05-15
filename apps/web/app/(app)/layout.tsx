'use client';

import { Sidebar as AppSidebar } from '@/components/layout/Sidebar'; // Renamed import alias for clarity
import { DashboardHeader as AppHeader } from '@/components/layout/DashboardHeader'; // Renamed import alias
import React, { useEffect } from 'react';
import { useUIStore, useAuthStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { FiLoader } from 'react-icons/fi'; // Added FiLoader
import { AppTour } from '@/components/layout/AppTour'; // Import AppTour

export default function AppLayout({ children }: { children: React.ReactNode }) { // Renamed component
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, profile, isLoading: authIsLoading, hasAttemptedProfileFetch } = useAuthStore(); // Added hasAttemptedProfileFetch
  const router = useRouter();
  const pathname = usePathname(); // Initialize pathname

  useEffect(() => {
    if (!authIsLoading) {
      if (!user) {
        console.log('[AppLayout] Auth check: No user. Redirecting to /login.');
        router.replace('/login');
      } else if (user && hasAttemptedProfileFetch && (!profile || !profile.first_name) && pathname !== '/profile-setup') {
        console.log('[AppLayout] User exists, profile incomplete. Redirecting to /profile-setup.');
        router.replace('/profile-setup');
      }
    }
  }, [user, profile, authIsLoading, router, pathname, hasAttemptedProfileFetch]); // Added dependencies

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const isSidebarCollapsed = !sidebarOpen;

  // Combined loading condition:
  // 1. Auth is still loading.
  // 2. Auth is NOT loading, but there's NO user (useEffect is handling /login redirect, show loader).
  // 3. Auth is NOT loading, USER exists, profile fetch ATTEMPTED, profile INCOMPLETE, 
  //    and we are NOT on /profile-setup (useEffect is handling /profile-setup redirect, show loader).
  if (authIsLoading || 
      (!authIsLoading && !user) ||
      (!authIsLoading && user && hasAttemptedProfileFetch && (!profile || !profile.first_name) && pathname !== '/profile-setup')
     ) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <FiLoader className="animate-spin text-accent-purple text-4xl" />
      </div>
    );
  }

  // If all checks pass, render the layout
  return (
    <div className="flex h-screen bg-black">
      <AppSidebar />
      <div 
        className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarOpen ? '270px' : '80px' }}
      >
        <AppHeader 
          profile={profile} 
          toggleSidebar={toggleSidebar} 
          isSidebarCollapsed={isSidebarCollapsed} 
        />
        <main className="flex-1 overflow-y-auto">
          {/* The div with padding is important here for the PageContainer to fill correctly */}
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
      <AppTour /> {/* Render AppTour component here */}
    </div>
  );
} 