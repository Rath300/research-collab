'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Users, 
  FileText, 
  BookOpen, 
  User, 
  MessageSquare, 
  Settings, 
  Home,
  Shield,
  X,
  Menu
} from 'lucide-react';
import { useTheme } from 'next-themes';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Research', href: '/research', icon: BookOpen },
  { name: 'Collaborators', href: '/collaborators', icon: Users },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Communities', href: '/communities', icon: FileText },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, activePath, isMobile } = useNavigation();
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, allow UI to render based on theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 transform bg-card border-r border-border transition-transform duration-200 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          !isMobile && sidebarOpen && "translate-x-0",
          !isMobile && !sidebarOpen && "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-border px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-purple-blue flex items-center justify-center">
                <span className="text-sm font-bold text-white">R</span>
              </div>
              <span className="text-xl font-bold font-heading text-foreground">ResearchCollab</span>
            </Link>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile?.email}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-muted/50 border-border h-9 rounded-md pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePath === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Pro Badge */}
          <div className="p-4 mt-auto">
            <div className="rounded-lg bg-gradient-to-r from-blue-600/20 to-accent/20 p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                <p className="text-sm font-medium">ResearchCollab Pro</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Upgrade for advanced features and no limits.
              </p>
              <button className="mt-2 w-full rounded-md bg-primary py-1 text-xs text-white">
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
} 