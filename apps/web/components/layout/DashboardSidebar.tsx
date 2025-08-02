'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiGrid, FiUser, FiFolder, FiChevronRight, FiFilePlus, FiSearch,
  FiMessageSquare, FiSettings, FiPlus, FiLogOut, FiChevronsLeft, FiChevronsRight
} from 'react-icons/fi';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore, useChatStore } from '@/lib/store';
import React, { useState, Fragment } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { Button } from '@/components/ui/Button';
import { titleCase } from '@/lib/utils';
import { Database } from '@/lib/database.types';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SidebarProps {
  profile: Profile | null;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  isSubItem?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon: Icon, label, isActive, isCollapsed, isSubItem = false }) => {
  return (
    <Link
      href={href}
      title={isCollapsed ? label : undefined}
      className={cn(
        'flex items-center h-10 rounded-lg text-sm transition-colors',
        isSubItem ? 'pr-3' : 'px-3',
        isSubItem && !isCollapsed ? 'pl-10' : '',
        isActive
          ? 'bg-accent-primary/10 text-accent-primary font-medium'
          : 'text-text-primary hover:bg-gray-100 hover:text-accent-primary',
        isCollapsed ? 'justify-center' : ''
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', !isCollapsed && 'mr-3')} />
      <Transition
        as={Fragment}
        show={!isCollapsed}
        enter="transition-opacity duration-150 ease-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150 ease-in"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <span className='flex-grow truncate'>{label}</span>
      </Transition>
    </Link>
  );
};

const SidebarHeader: React.FC<{ isCollapsed: boolean; children: React.ReactNode }> = ({ isCollapsed, children }) => {
  return (
    <Transition
      as={Fragment}
      show={!isCollapsed}
      enter="transition-opacity duration-150 ease-out"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150 ease-in"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <h3 className="px-3 pt-4 pb-2 text-xs font-semibold uppercase text-text-primary">
        {children}
      </h3>
    </Transition>
  );
};

export function DashboardSidebar({ profile, isCollapsed, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadMessages } = useChatStore();
  // supabase is already imported as a singleton

  const displayName = profile?.first_name 
    ? titleCase(`${profile.first_name} ${profile.last_name ?? ''}`.trim()) 
    : 'User';
  const displayRole = 'Researcher'; 
  const isValidAvatarUrl = profile?.avatar_url && (profile.avatar_url.startsWith('http://') || profile.avatar_url.startsWith('https://'));
  const displayAvatarUrl = isValidAvatarUrl ? profile.avatar_url : null;

  const handleLogout = async () => {
    console.log('[DashboardSidebar] handleLogout CALLED.');
    try {
      console.log('[DashboardSidebar] Attempting Supabase signOut...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[DashboardSidebar] Supabase signOut error:', error.message);
      } else {
        console.log('[DashboardSidebar] Supabase signOut successful.');
      }
    } catch (e: any) {
      console.error('[DashboardSidebar] Exception during Supabase signOut attempt:', e.message);
    }
    console.log('[DashboardSidebar] Attempting redirect to /login via window.location.replace().');
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    } else {
      console.warn('[DashboardSidebar] window object not available. This redirect might not work as expected.');
      router.push('/login');
    }
    console.log('[DashboardSidebar] Redirect attempt made. End of handleLogout.');
  };

  const mainNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiGrid }, 
    { name: 'Discover Projects', href: '/discover', icon: FiSearch },
    { name: 'Chats', href: '/chats', icon: FiMessageSquare },
  ];

  const settingsNavItems = [
    { name: 'Account', href: '/settings/account', icon: FiUser },
    { name: 'Settings', href: '/settings/account', icon: FiSettings },
  ];

  const recentChats = [
    { id: 'erik-gunsel-id', name: 'Erik Gunsel', avatar_url: null },
    { id: 'emily-smith-id', name: 'Emily Smith', avatar_url: null }, 
    { id: 'arthur-adelk-id', name: 'Arthur Adelk', avatar_url: null },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    if (href === '/settings') return pathname?.startsWith('/settings') ?? false;
    return pathname?.startsWith(href) ?? false;
  };
  
  const isProjectsActive = isActive('/projects');

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-neutral-950 text-neutral-300 transition-all duration-300 ease-in-out shadow-lg',
        isCollapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      <div className={cn('flex items-center p-3 border-b border-neutral-800', isCollapsed ? 'justify-center h-[68px]' : 'h-16')}>
        {!isCollapsed && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleSidebar} 
            className="mr-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700 p-2"
            aria-label="Collapse sidebar"
          >
            <FiChevronsLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar src={displayAvatarUrl} alt={displayName} size={isCollapsed ? "sm" : "md"} fallback={<FiUser size={isCollapsed ? 20: 24}/>} />
        <Transition
          as={Fragment}
          show={!isCollapsed}
          enter="transition-opacity duration-150 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-semibold text-neutral-100 truncate" title={displayName}>{displayName}</p>
            <p className="text-xs text-neutral-400 truncate" title={displayRole}>{displayRole}</p>
          </div>
        </Transition>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        <nav className="flex-1 px-2 py-3 space-y-1">
          <SidebarHeader isCollapsed={isCollapsed}>Main</SidebarHeader>
          {mainNavItems.map((item) => (
            <NavLink 
              key={item.name}
              href={item.href}
              icon={item.icon}
              label={item.name}
              isActive={isActive(item.href)}
              isCollapsed={isCollapsed}
            />
          ))}
          
          <Disclosure defaultOpen={isProjectsActive}>
            {({ open }) => (
              <>
                <Disclosure.Button 
                  title={isCollapsed ? "Projects" : undefined}
                  className={cn(
                    'w-full flex items-center h-10 rounded-lg text-sm font-medium transition-colors',
                    isProjectsActive
                      ? 'bg-accent-primary/10 text-accent-primary'
                      : 'text-text-primary hover:bg-gray-100 hover:text-accent-primary',
                    isCollapsed ? 'justify-center px-3' : 'px-3 text-left'
                  )}
                >
                  <FiFolder className={cn('w-5 h-5 flex-shrink-0', !isCollapsed && 'mr-3')} aria-hidden="true" />
                  <Transition
                    as={Fragment}
                    show={!isCollapsed}
                    enter="transition-opacity duration-150 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150 ease-in"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <span className="flex-1">Projects</span>
                  </Transition>
                  <Transition
                    as={Fragment}
                    show={!isCollapsed}
                    enter="transition-opacity duration-150 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150 ease-in"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <span>
                      <FiChevronRight
                        className={cn('ml-auto h-4 w-4 transition-transform duration-150 ease-in-out', open && 'rotate-90 transform' )}
                      />
                    </span>
                  </Transition>
                </Disclosure.Button>
                {!isCollapsed && (
                  <Transition
                    as={Fragment}
                    show={open}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Disclosure.Panel className="pl-3 pr-1 pt-1 space-y-0.5">
                      <NavLink href="/projects" label="My Projects" icon={FiFolder} isActive={pathname === '/projects'} isCollapsed={isCollapsed} isSubItem />
                      <NavLink href="/projects?filter=shared" label="Shared With Me" icon={FiFolder} isActive={pathname === '/projects?filter=shared'} isCollapsed={isCollapsed} isSubItem />
                    </Disclosure.Panel>
                  </Transition>
                )}
              </>
            )}
          </Disclosure>

          {settingsNavItems.map((item) => (
            <NavLink 
              key={item.name}
              href={item.href}
              icon={item.icon}
              label={item.name}
              isActive={isActive(item.href)}
              isCollapsed={isCollapsed}
            />
          ))}

          <SidebarHeader isCollapsed={isCollapsed}>Messages</SidebarHeader>
          {isCollapsed ? (
            <div className="flex flex-col items-center space-y-2 mt-2">
                {recentChats.slice(0, 3).map((chat) => {
                  const unreadCount = unreadMessages[chat.id] || 0;
                  return (
                    <Link key={chat.id} href={`/chats/${chat.id}`} title={chat.name} className="relative">
                      <Avatar src={chat.avatar_url} alt={chat.name} size="sm" fallback={<FiUser size={16} />} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
                {recentChats.length > 3 && (
                    <Link href="/chats" className="relative flex items-center justify-center w-7 h-7 rounded-full bg-neutral-700 text-neutral-400 text-xs" title={`+${recentChats.length - 3} more chats`}>
                         +{recentChats.length - 3}
                    </Link>
                )}
                <Button variant="ghost" size="sm" className="h-8 w-8 mt-1 p-2" title="Add Message">
                    <FiPlus className="w-4 h-4" />
                </Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentChats.slice(0, 3).map((chat) => {
                 const unreadCount = unreadMessages[chat.id] || 0;
                 return (
                   <Link key={chat.id} href={`/chats/${chat.id}`} className='flex items-center px-3 h-8 rounded-md hover:bg-neutral-800 transition-colors relative'>
                     <Avatar src={chat.avatar_url} alt={chat.name} size="sm" fallback={<FiUser size={16} />} className="mr-2.5" />
                     <Transition
                         as={Fragment}
                         show={!isCollapsed}
                         enter="transition-opacity duration-150 ease-out"
                         enterFrom="opacity-0"
                         enterTo="opacity-100"
                         leave="transition-opacity duration-150 ease-in"
                         leaveFrom="opacity-100"
                         leaveTo="opacity-0"
                       >
                       <span className="text-sm text-neutral-300 truncate flex-grow">{chat.name}</span>
                     </Transition>
                     {unreadCount > 0 && (
                       <Transition
                         as={Fragment}
                         show={!isCollapsed}
                         enter="transition-opacity duration-150 ease-out"
                         enterFrom="opacity-0"
                         enterTo="opacity-100"
                         leave="transition-opacity duration-150 ease-in"
                         leaveFrom="opacity-100"
                         leaveTo="opacity-0"
                       >
                         <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                           {unreadCount > 9 ? '9+' : unreadCount}
                         </span>
                       </Transition>
                     )}
                   </Link>
                 );
              })}
              {recentChats.length > 3 && (
                 <Link href="/chats" className='flex items-center px-3 h-8 rounded-md hover:bg-neutral-800 transition-colors'>
                    <Transition
                      as={Fragment}
                      show={!isCollapsed}
                      enter="transition-opacity duration-150 ease-out"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition-opacity duration-150 ease-in"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <span className="text-sm text-neutral-400 truncate flex-grow pl-7">+{recentChats.length-3} more chats</span>
                    </Transition>
                 </Link>
              )}
              <Button variant="ghost" size="sm" className='w-full justify-start text-neutral-400 hover:text-neutral-100 px-3 mt-1'>
                  <FiPlus className='mr-2.5 h-4 w-4' />
                  <Transition
                      as={Fragment}
                      show={!isCollapsed}
                      enter="transition-opacity duration-150 ease-out"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition-opacity duration-150 ease-in"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                    <span>Add Message</span>
                  </Transition>
              </Button>
            </div>
          )}
        </nav>
        
        <div className="mt-auto p-2 border-t border-neutral-800 space-y-2">
           {isCollapsed && (
             <Button 
               variant="ghost" 
               size="sm"
               onClick={toggleSidebar} 
               className="w-full h-10 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700" 
               aria-label="Expand sidebar"
               title="Expand sidebar"
              >
               <FiChevronsRight className="h-5 w-5" />
             </Button>
           )}
           {!isCollapsed && (
             <Button 
               variant="secondary"
               size="md"
               className='w-full text-neutral-100'
               onClick={() => router.push('/projects/new')}
             >
               <FiFilePlus className="mr-2 h-4 w-4" />
               <Transition
                  as={Fragment}
                  show={!isCollapsed}
                  enter="transition-opacity duration-150 ease-out"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity duration-150 ease-in"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <span>New Project</span>
                </Transition>
             </Button>
           )}

           <Button 
             variant="ghost"
             size={isCollapsed ? "sm" : "md"}
             onClick={handleLogout}
             className={cn(
               'w-full flex items-center text-neutral-400 hover:text-red-500 hover:bg-red-900/30 transition-colors',
               isCollapsed ? 'justify-center h-10' : 'justify-start h-10 px-3'
             )}
             title="Logout"
           >
             <FiLogOut className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
             {!isCollapsed && (
                <Transition
                    as={Fragment}
                    show={!isCollapsed}
                    enter="transition-opacity duration-150 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150 ease-in"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <span>Logout</span>
                </Transition>
             )}
           </Button>
        </div>
      </div>
    </aside>
  );
}
 