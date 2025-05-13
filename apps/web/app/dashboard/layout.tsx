'use client';

import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-black"> {/* Use bg-black or your desired dashboard background */}
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto"> {/* Content scrolls independently */}
          <div className="p-6 md:p-8"> {/* Padding applied to content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 