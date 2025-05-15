"use client";

import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiMenu, FiUser, FiBell, FiMoon, FiSun, FiLogOut } from 'react-icons/fi';
import { useTheme } from 'next-themes';
import { Avatar } from '@/components/ui/Avatar';

export function Navbar() {
  const { user, profile, signOut } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely access theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = () => {
    signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-expanded="false"
          >
            <span className="sr-only">Open sidebar</span>
            <FiMenu className="w-6 h-6" />
          </button>
          <Link href="/dashboard" className="flex ml-2 md:mr-24 items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              Research Collab
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <button 
              onClick={toggleTheme} 
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              <span className="sr-only">Toggle dark mode</span>
            </button>
          )}
          
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <span className="sr-only">View notifications</span>
              <div className="relative">
                <FiBell className="w-5 h-5" />
                <div className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full -top-2 -right-2">
                  3
                </div>
              </div>
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
                <div className="py-2 px-4 font-medium text-center text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white">
                  Notifications
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  <a href="#" className="flex py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <div className="pl-3 w-full">
                      <div className="text-gray-500 font-normal text-sm mb-1.5 dark:text-gray-400">
                        New connection request from <span className="font-semibold text-gray-900 dark:text-white">Alex Johnson</span>
                      </div>
                      <div className="text-xs font-medium text-primary-600">10 minutes ago</div>
                    </div>
                  </a>
                </div>
                <a href="#" className="block py-2 text-sm font-medium text-center text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:underline">
                  View all notifications
                </a>
              </div>
            )}
          </div>
          
          {/* User menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            >
              <span className="sr-only">Open user menu</span>
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                <Avatar 
                  src={profile?.avatar_url} 
                  alt={profile ? `${profile.first_name} ${profile.last_name}` : 'User'} 
                  size="sm" 
                  fallback={<FiUser className="w-4 h-4" />} 
                />
              </div>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 z-50 my-4 w-56 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
                <div className="py-3 px-4">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                  </span>
                  <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                    {user?.email || 'user@example.com'}
                  </span>
                </div>
                <ul className="py-1 text-gray-700 dark:text-gray-300">
                  <li>
                    <Link href="/dashboard" className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                      Settings
                    </Link>
                  </li>
                </ul>
                <div className="py-1">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white w-full"
                  >
                    <FiLogOut className="mr-2 w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 