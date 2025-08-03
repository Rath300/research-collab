"use client";

import React, { useEffect } from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { usePathname } from 'next/navigation';
import { getUser } from '@/lib/supabase';
import { profiles } from '@/lib/api';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { user, setUser, setProfile, isLoading, setLoading } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, darkMode } = useUIStore();

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/reset-password';
  const isLandingPage = pathname === '/';

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await getUser();
        
        if (currentUser) {
          setUser(currentUser);
          const userProfile = await profiles.getById(currentUser.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, setProfile, setLoading]);
  
  // Close sidebar on route change for mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // For auth pages and landing page we use a different layout
  if (isAuthPage || isLandingPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {isLoading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
} 