'use client';

import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-black"> {/* Use bg-black or your desired dashboard background */}
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto pl-64"> {/* Add padding-left equal to sidebar width */}
        {/* Add dashboard-specific header/navbar here if needed */}
        <div className="p-6 md:p-8"> {/* Padding for content area */}
          {children}
        </div>
      </main>
    </div>
  );
} 