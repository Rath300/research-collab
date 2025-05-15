'use client';

import { Sidebar as AppSidebar } from '@/components/layout/Sidebar'; // Renamed import alias for clarity
import { DashboardHeader as AppHeader } from '@/components/layout/DashboardHeader'; // Renamed import alias
import React, { useEffect } from 'react';
import { useUIStore, useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation'; // Added useRouter
import { FiLoader } from 'react-icons/fi'; // Added FiLoader

export default function AppLayout({ children }: { children: React.ReactNode }) { // Renamed component
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, profile, isLoading: authIsLoading } = useAuthStore(); // Added user and authIsLoading
  const router = useRouter(); // Initialize router

  useEffect(() => {
    if (!authIsLoading && !user) {
      console.log('[AppLayout] Auth check: No user and not loading. Redirecting to /login.');
      router.replace('/login');
    }
  }, [user, authIsLoading, router]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const isSidebarCollapsed = !sidebarOpen;

  if (authIsLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <FiLoader className="animate-spin text-accent-purple text-4xl" />
      </div>
    );
  }

  // If not loading and still no user (e.g., redirect hasn't happened yet or failed),
  // prevent rendering children that might rely on auth.
  // This is a safeguard; the useEffect should handle the redirect.
  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <p className="text-neutral-500">Redirecting to login...</p>
      </div>
    );
  }

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
    </div>
  );
} 