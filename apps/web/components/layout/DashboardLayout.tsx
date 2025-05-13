'use client';

import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading: isAuthLoading } = useAuthStore();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login');
    }
  }, [user, isAuthLoading, router]);

  // Optional: Persist sidebar state
  // useEffect(() => {
  //   const savedState = localStorage.getItem('sidebarCollapsed');
  //   if (savedState !== null) {
  //     setIsSidebarCollapsed(JSON.parse(savedState));
  //   }
  // }, []);

  // const toggleSidebar = () => {
  //   const newState = !isSidebarCollapsed;
  //   setIsSidebarCollapsed(newState);
  //   localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  // };

  // Simplified toggle for now
  const toggleSidebar = () => {
    console.log('DashboardLayout: toggleSidebar function called. Current isCollapsed:', isSidebarCollapsed);
    setIsSidebarCollapsed(!isSidebarCollapsed);
    console.log('DashboardLayout: toggleSidebar function finished. New isCollapsed:', !isSidebarCollapsed);
  };

  if (isAuthLoading || !user) {
    // Optionally show a loading state for the whole layout
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-neutral-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-900 text-neutral-100">
      <DashboardSidebar 
        isCollapsed={isSidebarCollapsed} 
        profile={profile} 
        toggleSidebar={toggleSidebar}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'ml-[68px]' : 'ml-64'}`}>
        <DashboardHeader 
          profile={profile} 
          toggleSidebar={toggleSidebar} 
          isSidebarCollapsed={isSidebarCollapsed} 
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-neutral-900 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 