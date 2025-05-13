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
import { getBrowserClient } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { titleCase } from '@/lib/utils';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardHeaderProps {
  profile: Profile | null;
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export function DashboardHeader({ profile, toggleSidebar, isSidebarCollapsed }: DashboardHeaderProps) {
  const router = useRouter();
  const supabase = getBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Clear Zustand store? Ensure AuthProvider handles this or add clear logic here.
    // useAuthStore.setState({ user: null, profile: null }); // Example of clearing store
    router.push('/login');
  };

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const query = event.currentTarget.value;
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const displayName = profile?.first_name 
    ? titleCase(`${profile.first_name} ${profile.last_name ?? ''}`.trim()) 
    : 'User';
  const displayAvatarUrl = profile?.avatar_url;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-neutral-950 border-b border-neutral-800">
      <div className="flex items-center">
        {/* Sidebar Toggle Button */} 
        <Button 
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="mr-4 p-2 text-neutral-400 hover:text-neutral-100"
        >
          {isSidebarCollapsed ? <FiMenu className="h-5 w-5" /> : <FiX className="h-5 w-5" />}
        </Button>
        
        {/* Search Input - Adjusted width and placeholder */}
        <div className="relative w-full max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            type="search"
            placeholder="Search anything..."
            className="pl-9 pr-4 py-2 text-sm w-full bg-neutral-800 border-neutral-700 focus:ring-blue-500 focus:border-blue-500 rounded-md text-neutral-100 placeholder-neutral-500"
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <Link href="/notifications" className="p-2 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800">
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
            <DropdownMenuItem className="focus:bg-neutral-700 focus:text-neutral-100 cursor-pointer" onClick={() => router.push('/settings')}>
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