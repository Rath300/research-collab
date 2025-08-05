'use client';

import React from 'react';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Simple admin check - you can enhance this based on your needs
  const isAdmin = user?.email?.includes('admin') || user?.email === 'shreyanshrath4@gmail.com';

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
  }, [user, isAdmin, router]);

  if (!user) {
    return (
      <PageContainer title="Loading..." className="bg-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-text-primary">Loading...</div>
      </PageContainer>
    );
  }

  if (!isAdmin) {
    return (
      <PageContainer title="Access Denied" className="bg-bg-primary min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading text-text-primary mb-4">Access Denied</h1>
          <p className="text-text-secondary">You don't have permission to view this page.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Analytics" className="bg-bg-primary min-h-screen">
      <AnalyticsDashboard />
    </PageContainer>
  );
} 