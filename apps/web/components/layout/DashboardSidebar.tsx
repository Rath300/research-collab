'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiGrid, FiUser, FiFolder, FiChevronRight, FiFilePlus, FiSearch,
  FiMessageSquare, FiSettings, FiPlus, FiLogOut
} from 'react-icons/fi';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/lib/store';
import React, { useState, Fragment } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { Button } from '@/components/ui/Button';
import { titleCase } from '@/lib/utils';
import { Database } from '@/lib/database.types';
import { cn } from '@/lib/utils';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SidebarProps {
  profile: Profile | null;
  isCollapsed: boolean;
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
          ? 'bg-neutral-700 text-white font-medium'
          : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100',
        isCollapsed ? 'justify-center' : ''
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0', !isCollapsed && 'mr-3')} />
      {!isCollapsed && <span className='flex-grow truncate'>{label}</span>}
    </Link>
  );
};

const SidebarHeader: React.FC<{ isCollapsed: boolean; children: React.ReactNode }> = ({ isCollapsed, children }) => {
  if (isCollapsed) return null;
  return (
    <h3 className="px-3 pt-4 pb-2 text-xs font-semibold uppercase text-neutral-500">
      {children}
    </h3>
  );
};

export function DashboardSidebar({ profile, isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const displayName = profile?.first_name 
    ? titleCase(`${profile.first_name} ${profile.last_name ?? ''}`.trim()) 
    : 'User';
  const displayRole = 'Researcher'; 
  const displayAvatarUrl = profile?.avatar_url;

  const mainNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiGrid }, 
    { name: 'Discover', href: '/discover', icon: FiSearch },
    { name: 'Chats', href: '/chats', icon: FiMessageSquare },
  ];

  const settingsNavItems = [
    { name: 'Account', href: '/settings/account', icon: FiUser },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  const messages = [
    { name: 'Erik Gunsel', avatar: undefined },
    { name: 'Emily Smith', avatar: undefined },
    { name: 'Arthur Adelk', avatar: undefined },
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
        <Avatar src={displayAvatarUrl} alt={displayName} size={isCollapsed ? "sm" : "md"} fallback={<FiUser size={isCollapsed ? 20: 24}/>} />
        {!isCollapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-semibold text-neutral-100 truncate" title={displayName}>{displayName}</p>
            <p className="text-xs text-neutral-400 truncate" title={displayRole}>{displayRole}</p>
          </div>
        )}
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
                      ? 'bg-neutral-700 text-white'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100',
                    isCollapsed ? 'justify-center px-3' : 'px-3 text-left'
                  )}
                >
                  <FiFolder className={cn('w-5 h-5 flex-shrink-0', !isCollapsed && 'mr-3')} aria-hidden="true" />
                  {!isCollapsed && <span className="flex-1">Projects</span>}
                  {!isCollapsed && (
                    <FiChevronRight
                      className={cn('ml-auto h-4 w-4 transition-transform duration-150 ease-in-out', open && 'rotate-90 transform' )}
                    />
                  )}
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
                    <Disclosure.Panel className="pl-3 pr-1 pt-1 space-y-0.5" static>
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
                {messages.slice(0, 3).map((msg, index) => (
                    <Avatar key={index} src={msg.avatar} alt={msg.name} size="sm" fallback={<FiUser size={16} />} />
                ))}
                {messages.length > 3 && (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-neutral-700 text-neutral-400 text-xs" title={`+${messages.length - 3} more`}>
                        +{messages.length - 3}
                    </div>
                )}
                <Button variant="ghost" size="sm" className="h-8 w-8 mt-1 p-2" title="Add Message">
                    <FiPlus className="w-4 h-4" />
                </Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {messages.slice(0, 3).map((msg, index) => (
                <button key={index} className="flex items-center w-full px-3 py-1.5 rounded-lg text-left text-sm text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100">
                  <Avatar src={msg.avatar} alt={msg.name} size="sm" fallback={<FiUser size={16} />} />
                  <span className="ml-2 truncate flex-grow">{msg.name}</span>
                </button>
              ))}
              {messages.length > 3 && (
                 <button className="flex items-center w-full px-3 py-1.5 rounded-lg text-left text-sm text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300">
                   <span className="ml-8 truncate">+{messages.length-3} more</span>
                 </button>
              )}
              <button className="flex items-center w-full px-3 py-1.5 rounded-lg text-left text-sm text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300">
                <FiPlus className="w-4 h-4 mr-2 text-neutral-500"/>
                <span>Add Message</span>
              </button>
            </div>
          )}
        </nav>
        
        <div className={`mt-auto border-t border-neutral-800 ${isCollapsed? 'p-2' : 'p-3' }`}>
          <Button 
            variant="secondary"
            className={cn(
                'w-full flex items-center justify-center h-10 rounded-lg text-sm font-semibold',
                'bg-orange-600 hover:bg-orange-500 text-white'
            )}
            onClick={() => router.push('/projects/new')}
            title={isCollapsed ? "New Project" : undefined}
          >
            <FiFilePlus className={`h-5 w-5 ${!isCollapsed ? 'mr-2' : ''}`} />
            {!isCollapsed && <span>New Project</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
