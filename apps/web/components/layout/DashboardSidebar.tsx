'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiGrid, FiUser, FiFolder, FiHeart, FiArchive, FiSettings, FiPlusCircle, FiChevronDown, FiChevronRight, FiFilePlus, FiSearch, FiMessageSquare } from 'react-icons/fi';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/lib/store';
import React, { useState, Fragment } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { Button } from '@/components/ui/Button';
import { titleCase } from '@/lib/utils';
import { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SidebarProps {
  profile: Profile | null;
  isCollapsed: boolean;
}

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  isSubItem?: boolean;
  onClick?: () => void;
  children?: React.ReactNode; // For expandable items
  isOpen?: boolean; // For expandable items
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label, isActive, isSubItem, children, isOpen, onClick, isCollapsed }) => {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick} // Handle click for expandable items
        className={`flex items-center py-2.5 px-4 rounded-md text-sm transition-colors 
                    ${isSubItem ? 'pl-10' : ''}
                    ${isActive ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'}`}
      >
        <Icon className={`w-5 h-5 mr-3 ${isSubItem ? 'mr-2' : ''}`} />
        <span className='flex-grow'>{label}</span>
        {children && (isOpen ? <FiChevronDown className='ml-auto w-4 h-4' /> : <FiChevronRight className='ml-auto w-4 h-4' />)}
      </Link>
      {children && isOpen && (
        <ul className='mt-1 space-y-1'>
          {children}
        </ul>
      )}
    </li>
  );
};

export function DashboardSidebar({ profile, isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [openProjects, setOpenProjects] = useState(false);

  const displayName = profile?.first_name 
    ? titleCase(`${profile.first_name} ${profile.last_name ?? ''}`.trim()) 
    : 'User';
  const displayAvatarUrl = profile?.avatar_url;

  const sidebarNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiGrid },
    { name: 'Discover', href: '/discover', icon: FiSearch },
    { name: 'Chats', href: '/chats', icon: FiMessageSquare },
    { name: 'Account', href: '/settings/account', icon: FiUser },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  const isActive = (href: string) => {
    // Handle exact match for dashboard and nested matches for others
    if (href === '/dashboard') {
      return pathname === href;
    } 
    // Ensure pathname is not null before calling startsWith
    return pathname ? pathname.startsWith(href) : false;
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-neutral-950 text-neutral-300 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-64'}`}>
      <div className="flex items-center h-16 px-4 border-b border-neutral-800">
        {/* TODO: Replace with actual logo? */} 
        {!isCollapsed && <h1 className="text-xl font-bold text-white ml-2">ResearchCollab</h1>}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {/* User Profile Snippet - Conditionally Rendered */}
        {!isCollapsed && (
          <div className="px-2 py-3 mb-4 border-b border-neutral-800">
            <div className="flex items-center">
              <Avatar src={displayAvatarUrl} alt={displayName} size="sm" fallback={<FiUser size={16}/>} />
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-100">{displayName}</p>
                {/* <p className="text-xs text-neutral-400">{profile?.role || 'Researcher'}</p> */}
              </div>
            </div>
          </div>
        )}

        {sidebarNavItems.map((item) => (
          <NavItem 
            key={item.name}
            href={item.href}
            icon={item.icon}
            label={item.name}
            isActive={isActive(item.href)}
            isCollapsed={isCollapsed}
          />
        ))}

        {/* Project Sub-items */}
        <Disclosure defaultOpen={pathname?.startsWith('/projects')}>
          {({ open }: { open: boolean }) => (
            <>
              <Disclosure.Button className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md text-left ${isActive('/projects') ? 'bg-neutral-800 text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'}`}>
                <FiFolder className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive('/projects') ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'}`} aria-hidden="true" />
                {!isCollapsed && <span className="flex-1">Projects</span>}
                {!isCollapsed && (
                  <FiChevronRight
                    className={`${ open ? 'rotate-90 transform' : '' } ml-auto h-5 w-5 transition-transform duration-150 ease-in-out`}
                  />
                )}
              </Disclosure.Button>
              {!isCollapsed && (
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Disclosure.Panel className="pl-8 pr-2 py-1 space-y-1">
                    <Link href="/projects"
                      className={`block px-2 py-1 text-xs font-medium rounded-md ${pathname === '/projects' ? 'text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'}`}>
                      My Projects
                    </Link>
                    <Link href="/projects?filter=shared"
                      className={`block px-2 py-1 text-xs font-medium rounded-md ${pathname === '/projects?filter=shared' ? 'text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'}`}>
                      Shared With Me
                    </Link>
                  </Disclosure.Panel>
                </Transition>
              )}
            </>
          )}
        </Disclosure>
      </nav>

      {/* Bottom Section - New Project Button */} 
      <div className="mt-auto p-4 border-t border-neutral-800">
        <Button 
          variant="secondary"
          className="w-full justify-center"
          onClick={() => router.push('/projects/new')}
        >
          <FiFilePlus className={`h-5 w-5 ${!isCollapsed ? 'mr-2' : ''}`} />
          {!isCollapsed && <span>New Project</span>}
        </Button>
      </div>
    </div>
  );
} 