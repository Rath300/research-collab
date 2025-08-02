'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSearch, FiBell, FiUser, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi'; 
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input'; // Assuming Input component exists
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; // Corrected path
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabaseClient';
// import { Database } from '@/lib/database.types'; // Comment out or remove local Database type import
import { type Profile as DbProfile } from '@research-collab/db'; // Ensure DbProfile is imported
import { titleCase } from '@/lib/utils';

// type Profile = Database['public']['Tables']['profiles']['Row']; // Use DbProfile instead

interface DashboardHeaderProps {
  profile: DbProfile | null; // Changed to use DbProfile
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export function DashboardHeader({ profile, toggleSidebar, isSidebarCollapsed }: DashboardHeaderProps) {
  const router = useRouter();
  // supabase is already imported as a singleton
  const { clearAuth } = useAuthStore(); // Get clearAuth from the store

  const handleLogout = async () => {
    console.log('[DashboardHeader] handleLogout CALLED.');
    try {
      console.log('[DashboardHeader] Attempting Supabase signOut...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[DashboardHeader] Supabase signOut error:', error.message);
      } else {
        console.log('[DashboardHeader] Supabase signOut successful.');
      }
    } catch (e: any) {
      console.error('[DashboardHeader] Exception during Supabase signOut attempt:', e.message);
    }
    
    clearAuth(); // Explicitly clear Zustand auth state

    console.log('[DashboardHeader] Attempting redirect to /login via window.location.assign().');
    if (typeof window !== 'undefined') {
      window.location.assign('/login'); // Force full page reload and redirect
    } else {
      router.push('/login');
    }
    console.log('[DashboardHeader] Redirect attempt made. End of handleLogout.');
  };

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const query = event.currentTarget.value;
      if (query.trim()) {
        // Redirect to discover page for now, which shows projects
        // TODO: Create a unified search page that searches across projects, users, and research papers
        router.push(`/discover?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const displayName = profile?.first_name 
    ? titleCase(`${profile.first_name} ${profile.last_name ?? ''}`.trim()) 
    : 'User';
  const displayAvatarUrl = profile?.avatar_url;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-border-light shadow-sm">
      <div className="flex items-center">
        {/* Sidebar Toggle Button */} 
        <Button 
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="mr-4 p-2 text-text-secondary hover:text-text-primary"
        >
          {isSidebarCollapsed ? <FiMenu className="h-5 w-5" /> : <FiX className="h-5 w-5" />}
        </Button>
        
        {/* Search Input - Adjusted width and placeholder */}
        <div className="relative w-full max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-9 pr-4 py-2 text-sm w-full bg-bg-tertiary border-border-medium focus:ring-accent-primary focus:border-accent-primary rounded-md text-text-primary placeholder-text-muted"
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <Link href="/notifications" className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-hover">
          <FiBell className="w-5 h-5" />
          {/* Optional: Add a badge for unread notifications */}
        </Link>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar src={displayAvatarUrl} alt={displayName} size="sm" fallback={<FiUser size={16} />} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-neutral-800 border-neutral-700 text-neutral-200" align="end" forceMount>
            <DropdownMenuItem className="focus:bg-neutral-700 focus:text-neutral-100 cursor-pointer" onClick={() => router.push('/profile/me')}>
              <FiUser className="mr-2 h-4 w-4" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-neutral-700 focus:text-neutral-100 cursor-pointer" onClick={() => router.push('/settings/account')}>
              <FiSettings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-700"/>
            <DropdownMenuItem className="focus:bg-red-900/50 focus:text-red-400 text-red-500 cursor-pointer" onClick={handleLogout}>
              <FiLogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 