'use client';

import { Sidebar as AppSidebar } from '@/components/layout/Sidebar'; // Renamed import alias for clarity
import { DashboardHeader as AppHeader } from '@/components/layout/DashboardHeader'; // Renamed import alias
import React from 'react';
import { useUIStore, useAuthStore } from '@/lib/store';

export default function AppLayout({ children }: { children: React.ReactNode }) { // Renamed component
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { profile } = useAuthStore();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const isSidebarCollapsed = !sidebarOpen;

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