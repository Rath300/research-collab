'use client';

import React from 'react';
import { FiSearch, FiBell, FiUser, FiChevronDown } from 'react-icons/fi';
import { Avatar } from '@/components/ui/Avatar'; // Assuming Avatar component
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

// Utility to capitalize first letter of each word (can be moved to a shared util file)
function titleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export function DashboardHeader() {
  const { profile } = useAuthStore();

  // User display info
  const displayName = profile?.first_name 
    ? titleCase(`${profile.first_name} ${profile.last_name ?? ''}`.trim()) 
    : 'User';
  const displayAvatarUrl = profile?.avatar_url;

  // Placeholder for dropdown state & handler
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6 bg-neutral-900 border-b border-neutral-800">
      {/* Search Bar - Placeholder */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
        <input 
          type="search" 
          placeholder="Search anything..." 
          className="pl-10 pr-4 py-2 w-64 text-sm bg-neutral-800 text-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-600 placeholder-neutral-500"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications - Placeholder */}
        <button className="p-2 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 transition-colors relative">
          <FiBell className="w-5 h-5" />
          {/* Example notification dot */}
          <span className="absolute top-1.5 right-1.5 block w-2 h-2 bg-red-500 rounded-full"></span> 
        </button>

        {/* Profile Dropdown - Placeholder */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-neutral-700 transition-colors"
          >
            <Avatar src={displayAvatarUrl} alt={displayName} size="sm" fallback={<FiUser size={18}/>} />
            {/* Optional: Display name next to avatar */}
            {/* <span className="text-sm text-neutral-300 hidden md:block">{displayName}</span> */}
            {/* <FiChevronDown className="w-4 h-4 text-neutral-400 hidden md:block" /> */}
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-neutral-800 rounded-md shadow-lg py-1 z-50 border border-neutral-700">
              <Link href="/profile/me" className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100">Your Profile</Link>
              <Link href="/settings" className="block px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100">Settings</Link>
              <hr className="border-neutral-700 my-1"/>
              {/* Logout Button - Placeholder, needs actual logout logic */}
              <button className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-neutral-700 hover:text-red-300">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 