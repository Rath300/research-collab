'use client';

import { Sidebar as DashboardSidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import React from 'react';
import { useUIStore, useAuthStore } from '@/lib/store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { profile } = useAuthStore();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const isSidebarCollapsed = !sidebarOpen;

  return (
    <div className="flex h-screen bg-black">
      <DashboardSidebar />
      <div 
        className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarOpen ? '270px' : '80px' }}
      >
        <DashboardHeader 
          profile={profile} 
          toggleSidebar={toggleSidebar} 
          isSidebarCollapsed={isSidebarCollapsed} 
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 