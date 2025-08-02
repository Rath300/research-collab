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
    <nav className="bg-surface-primary border-b border-border-light px-4 py-3">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden inline-flex items-center p-2 text-sm text-text-secondary rounded-lg hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-accent-primary"
            aria-expanded="false"
          >
            <span className="sr-only">Open sidebar</span>
            <FiMenu className="w-6 h-6" />
          </button>
          <Link href="/dashboard" className="flex ml-2 md:mr-16 items-center">
            <span className="self-center text-lg font-heading font-medium text-text-primary">
              Research Collab
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme Toggle - Hidden for now since we're using light theme */}
          {/* {mounted && (
            <button 
              onClick={toggleTheme} 
              className="p-2 text-text-secondary rounded-lg hover:text-text-primary hover:bg-surface-hover"
            >
              {theme === 'dark' ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              <span className="sr-only">Toggle dark mode</span>
            </button>
          )} */}
          
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-text-secondary rounded-lg hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <span className="sr-only">View notifications</span>
              <div className="relative">
                <FiBell className="w-5 h-5" />
                <div className="absolute inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-text-inverse bg-accent-error rounded-full -top-1 -right-1">
                  3
                </div>
              </div>
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 bg-surface-primary rounded-lg border border-border-light shadow-lg">
                <div className="py-3 px-4 font-ui font-medium text-center text-text-primary bg-surface-secondary rounded-t-lg">
                  Notifications
                </div>
                <div className="divide-y divide-border-light">
                  <a href="#" className="flex py-3 px-4 hover:bg-surface-hover transition-colors">
                    <div className="pl-3 w-full">
                      <div className="text-text-secondary font-body text-sm mb-1.5">
                        New connection request from <span className="font-semibold text-text-primary">Alex Johnson</span>
                      </div>
                      <div className="text-xs font-medium text-accent-primary">10 minutes ago</div>
                    </div>
                  </a>
                </div>
                <a href="#" className="block py-3 text-sm font-ui font-medium text-center text-text-primary bg-surface-secondary hover:bg-surface-hover rounded-b-lg transition-colors">
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
              className="flex text-sm rounded-full focus:ring-1 focus:ring-border-dark focus:ring-offset-1 focus:ring-offset-bg-primary transition-all"
            >
              <span className="sr-only">Open user menu</span>
              <div className="w-8 h-8 rounded-full bg-border-medium flex items-center justify-center text-text-primary">
                <Avatar 
                  src={profile?.avatar_url} 
                  alt={profile ? `${profile.first_name} ${profile.last_name}` : 'User'} 
                  size="sm" 
                  fallback={<FiUser className="w-4 h-4" />} 
                />
              </div>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 z-50 my-4 w-56 bg-surface-primary rounded-lg border border-border-light shadow-lg">
                <div className="py-3 px-4 border-b border-border-light">
                  <span className="block text-sm font-ui font-semibold text-text-primary">
                    {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                  </span>
                  <span className="block text-sm text-text-secondary truncate font-body">
                    {user?.email || 'user@example.com'}
                  </span>
                </div>
                <ul className="py-2 text-text-primary">
                  <li>
                    <Link href="/dashboard" className="block py-2 px-4 text-sm font-body hover:bg-surface-hover transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="block py-2 px-4 text-sm font-body hover:bg-surface-hover transition-colors">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="block py-2 px-4 text-sm font-body hover:bg-surface-hover transition-colors">
                      Settings
                    </Link>
                  </li>
                </ul>
                <div className="py-2 border-t border-border-light">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center py-2 px-4 text-sm text-accent-error hover:bg-surface-hover font-body w-full transition-colors"
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