'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, ChevronDown, Moon, Sun, LogOut, User, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Header() {
  const { profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center">
          <h1 className="hidden md:block text-lg font-semibold">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500" />
              <span className="sr-only">Notifications</span>
            </button>
            
            {notificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-50" 
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-card shadow-lg border border-border">
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-3">Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { 
                          title: 'New collaboration request', 
                          description: 'John Doe sent you a collaboration request',
                          time: '2 hours ago'
                        },
                        { 
                          title: 'Research post liked', 
                          description: 'Your research post received 5 new likes',
                          time: '5 hours ago'
                        },
                        { 
                          title: 'New comment', 
                          description: 'Jane Smith commented on your post',
                          time: '1 day ago'
                        }
                      ].map((notification, index) => (
                        <div 
                          key={index}
                          className="flex gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                        >
                          <div className="h-9 w-9 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{notification.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <button className="text-xs text-primary hover:underline">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-full bg-muted/60 p-1.5 hover:bg-muted/80 transition-colors"
            >
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-3.5 w-3.5 text-primary" />
                )}
              </div>
              <span className="max-w-24 truncate text-xs text-muted-foreground">
                {profile?.first_name || 'User'}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
            
            {userMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-50" 
                  onClick={() => setUserMenuOpen(false)}
                />
                <div 
                  className={cn(
                    "absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-card shadow-lg border border-border"
                  )}
                >
                  <div className="p-2">
                    <div className="mb-2 p-2">
                      <p className="text-sm font-medium">{profile?.first_name} {profile?.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                    </div>
                    
                    <div className="border-t border-border pt-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted/80 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted/80 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 