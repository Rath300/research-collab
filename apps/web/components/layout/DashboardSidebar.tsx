'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiUser, FiFolder, FiHeart, FiArchive, FiSettings, FiPlusCircle, FiChevronDown, FiChevronRight, FiFilePlus } from 'react-icons/fi';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/lib/store';
import React, { useState } from 'react';

// Utility to capitalize first letter of each word
function titleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// TODO: Replace with actual user profile data from store or props
const UserProfilePlaceholder = {
  name: 'User Name',
  role: 'Researcher',
  avatarUrl: undefined, // Replace with actual avatar URL or leave undefined for fallback
};

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  hasNotification?: boolean;
  isSubItem?: boolean;
  onClick?: () => void;
  children?: React.ReactNode; // For expandable items
  isOpen?: boolean; // For expandable items
}

const NavItem: React.FC<NavItemProps> = ({ href, icon: Icon, label, isActive, hasNotification, isSubItem, children, isOpen, onClick }) => {
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
        {hasNotification && <span className='ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5'>2</span>}
      </Link>
      {children && isOpen && (
        <ul className='mt-1 space-y-1'>
          {children}
        </ul>
      )}
    </li>
  );
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, profile } = useAuthStore(); // Get user and profile from Zustand store
  const [openFolders, setOpenFolders] = useState(false);

  // Use titleCase for display name
  const rawFirstName = profile?.first_name;
  const rawLastName = profile?.last_name;
  const displayName = (rawFirstName || rawLastName) 
    ? titleCase(`${rawFirstName ?? ''} ${rawLastName ?? ''}`.trim()) 
    : UserProfilePlaceholder.name;
  
  const displayAvatarUrl = profile?.avatar_url ?? UserProfilePlaceholder.avatarUrl;
  // Role: Assuming this might come from profile later or a default
  const displayRole = UserProfilePlaceholder.role; 

  const navItems = [
    { href: '/dashboard', icon: FiGrid, label: 'Dashboard' },
    { href: '/settings/account', icon: FiUser, label: 'Account', hasNotification: true }, // Example notification
    // Placeholder for expandable Folders section
    // { href: '#', icon: FiFolder, label: 'Folders', isExpandable: true, subItems: [
    //   { href: '/dashboard/projects/my', label: 'My Projects', icon: FiFolder },
    //   { href: '/dashboard/projects/shared', label: 'Shared With Me', icon: FiFolder },
    // ]},
    { href: '/dashboard/favorites', icon: FiHeart, label: 'Favorites' },
    { href: '/dashboard/archive', icon: FiArchive, label: 'Archive' },
    { href: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <aside className='w-64 h-screen bg-neutral-900 text-white flex flex-col border-r border-neutral-800 p-4 fixed left-0 top-0'>
      {/* User Profile Section */}
      <div className='flex items-center space-x-3 p-2 mb-6'>
        <Avatar src={displayAvatarUrl} alt={displayName} size='md' fallback={<FiUser size={20}/>} />
        <div>
          <h4 className='text-sm font-semibold text-neutral-100'>{displayName}</h4>
          <p className='text-xs text-neutral-400'>{displayRole}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-grow'>
        <ul className='space-y-1.5'>
          {navItems.map((item) => (
            <NavItem 
              key={item.label}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
              hasNotification={item.hasNotification}
            />
          ))}
          {/* Folders section with expandable sub-items */}
           <li>
            <div 
              onClick={() => setOpenFolders(!openFolders)}
              className={`flex items-center py-2.5 px-4 rounded-md text-sm transition-colors cursor-pointer 
                          text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100`}
            >
              <FiFolder className={`w-5 h-5 mr-3`} />
              <span className='flex-grow'>Folders</span>
              {openFolders ? <FiChevronDown className='ml-auto w-4 h-4' /> : <FiChevronRight className='ml-auto w-4 h-4' />}
            </div>
            {openFolders && (
              <ul className='mt-1 space-y-1'>
                <NavItem href='/dashboard/projects/my' icon={FiFolder} label='My Projects' isSubItem isActive={pathname === '/dashboard/projects/my'} />
                <NavItem href='/dashboard/projects/shared' icon={FiFolder} label='Shared With Me' isSubItem isActive={pathname === '/dashboard/projects/shared'} />
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Add New Section */}
      <div className='mt-auto p-2 border-t border-neutral-800 pt-4'>
        <Link href='/dashboard/projects/new' className='w-full flex items-center justify-center py-3 px-4 bg-neutral-800 hover:bg-neutral-700 rounded-md text-neutral-200 text-sm'>
          <FiFilePlus className='w-5 h-5 mr-2' />
          New Project
        </Link>
      </div>

       {/* My Account / Shared Toggle - Placeholder */}
       <div className='flex items-center justify-between p-2 mt-2 border-t border-neutral-800 pt-2'>
        <button className='flex-1 py-2 px-3 rounded-md text-xs bg-neutral-700 text-white'>My account</button>
        <button className='flex-1 py-2 px-3 rounded-md text-xs text-neutral-400 hover:bg-neutral-800'>Shared</button>
      </div>
    </aside>
  );
} 