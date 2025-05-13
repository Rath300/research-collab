'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiGrid, FiUser, FiFolder, FiHeart, FiArchive, FiSettings, FiPlusCircle, FiChevronDown, FiChevronRight, FiFilePlus, FiSearch, FiMessageSquare, FiCommand } from 'react-icons/fi';
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
  isCollapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label, isActive, isCollapsed }) => {
  return (
    <li>
      <Link
        href={href}
        title={isCollapsed ? label : undefined}
        className={`flex items-center h-10 rounded-md text-sm transition-colors 
                    ${isActive ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'}
                    ${isCollapsed ? 'justify-center px-3' : 'px-4'}`}
      >
        <Icon className={`w-5 h-5 ${!isCollapsed ? 'mr-3' : ''}`} />
        {!isCollapsed && <span className='flex-grow'>{label}</span>}
      </Link>
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
    if (href === '/dashboard') return pathname === href;
    return pathname ? pathname.startsWith(href) : false;
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-neutral-950 text-neutral-300 transition-all duration-300 ease-in-out shadow-lg ${isCollapsed ? 'w-[72px]' : 'w-64'}`}>
      {/* Top Section: Logo and User Info */}
      <div className={`flex flex-col border-b border-neutral-800 ${isCollapsed ? 'items-center px-3 py-4' : 'px-4 py-4'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center h-8 mb-4' : 'h-8 mb-4'}`}>
            {isCollapsed ? 
                <FiCommand className="w-6 h-6 text-white" title="ResearchCollab" /> :
                <h1 className="text-xl font-bold text-white">ResearchCollab</h1>
            }
        </div>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <Avatar src={displayAvatarUrl} alt={displayName} size={"sm"} fallback={<FiUser size={isCollapsed ? 18: 20}/>} />
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-100 truncate" title={displayName}>{displayName}</p>
              </div>
            )}
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 py-3 space-y-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-2'}">
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

        {/* Project Sub-items Disclosure */}
        <Disclosure defaultOpen={pathname?.startsWith('/projects')}>
          {({ open }: { open: boolean }) => (
            <>
              <Disclosure.Button 
                title={isCollapsed ? "Projects" : undefined}
                className={`w-full flex items-center h-10 rounded-md text-sm font-medium 
                                          ${isActive('/projects') ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}
                                          ${isCollapsed ? 'justify-center px-3' : 'px-4 text-left'}`}>
                <FiFolder className={`w-5 h-5 ${!isCollapsed ? 'mr-3' : ''}`} aria-hidden="true" />
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
                  <Disclosure.Panel className="pl-6 pr-2 py-1 space-y-0.5">
                    <Link href="/projects"
                      className={`block px-2 py-1.5 text-xs font-medium rounded-md ${pathname === '/projects' ? 'text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'}`}>
                      My Projects
                    </Link>
                    <Link href="/projects?filter=shared"
                      className={`block px-2 py-1.5 text-xs font-medium rounded-md ${pathname === '/projects?filter=shared' ? 'text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'}`}>
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
      <div className={`mt-auto border-t border-neutral-800 ${isCollapsed? 'p-2' : 'p-3' }`}>
        <Button 
          variant="secondary"
          className={`w-full flex items-center justify-center h-10 ${isCollapsed ? 'px-0' : ''}`}
          onClick={() => router.push('/projects/new')}
          title={isCollapsed ? "New Project" : undefined}
        >
          <FiFilePlus className={`h-5 w-5 ${!isCollapsed ? 'mr-2' : ''}`} />
          {!isCollapsed && <span className="text-sm">New Project</span>}
        </Button>
      </div>
    </div>
  );
} 