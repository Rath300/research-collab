'use client';

import React, { useState } from 'react';
import { FiSearch, FiBell, FiUser, FiChevronDown } from 'react-icons/fi';
import { Avatar } from '@/components/ui/Avatar'; // Assuming Avatar component
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { getBrowserClient } from '@/lib/supabaseClient'; // Import Supabase client

// Utility to capitalize first letter of each word (can be moved to a shared util file)
function titleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function DashboardHeader() {
  const { profile } = useAuthStore();
  const router = useRouter();
  const supabase = getBrowserClient();

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // State for dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // User display info
  const displayName = profile?.first_name 
    ? titleCase(`${profile.first_name} ${profile.last_name ?? ''}`.trim()) 
    : 'User';
  const displayAvatarUrl = profile?.avatar_url;

  // Handle search submission (e.g., on Enter key)
  const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      // Optionally clear search query after navigation
      // setSearchQuery(''); 
    }
  };

  // Handle logout
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      // Handle error display if necessary
    } else {
      // Redirect to login page after successful logout
      router.push('/login'); 
      // Optionally clear auth store state here if needed, 
      // though AuthProvider should handle session change
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-neutral-900 border-b border-neutral-800">
      {/* Search Bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
        <input 
          type="search" 
          placeholder="Search anything..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchSubmit} // Trigger search on Enter
          className="pl-10 pr-4 py-2 w-64 text-sm bg-neutral-800 text-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-600 placeholder-neutral-500"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications Link */}
        <Link 
          href="/notifications" 
          className="p-2 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 transition-colors relative"
          title="View Notifications" // Accessibility improvement
        >
          <FiBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 block w-2 h-2 bg-red-500 rounded-full" aria-hidden="true"></span> {/* Static dot */}
        </Link>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-neutral-700 transition-colors"
            aria-label="Open user menu" // Accessibility
            aria-expanded={isDropdownOpen}
          >
            <Avatar src={displayAvatarUrl} alt={displayName} size="sm" fallback={<FiUser size={18}/>} />
          </button>
          {isDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-50 border border-neutral-700" 
              role="menu" // Accessibility
              aria-orientation="vertical"
              aria-labelledby="user-menu-button" // Needs an ID on the button if using this
            >
              <Link href="/profile/me" role="menuitem" className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100">Your Profile</Link>
              <Link href="/settings" role="menuitem" className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100">Settings</Link>
              <hr className="border-neutral-700 my-1"/>
              <button 
                onClick={handleLogout} 
                role="menuitem" 
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 hover:text-red-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 