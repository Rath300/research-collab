import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { 
  FiHome, 
  FiSearch, 
  FiUsers, 
  FiMessageSquare, 
  FiTarget, 
  FiHash, 
  FiClock, 
  FiBook, 
  FiAward, 
  FiDollarSign
} from 'react-icons/fi';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: FiHome },
  { name: 'Research Feed', href: '/research', icon: FiSearch },
  { name: 'Find Collaborators', href: '/collaborators', icon: FiUsers },
  { name: 'Chats', href: '/chats', icon: FiMessageSquare },
  { name: 'Project Guilds', href: '/guilds', icon: FiTarget },
  { name: 'Timestamped Ideas', href: '/ideas', icon: FiClock },
  { name: 'Mentor Matching', href: '/mentors', icon: FiAward },
  { name: 'AI Paper Reviews', href: '/papers', icon: FiBook },
  { name: 'Premium Features', href: '/premium', icon: FiDollarSign },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-10 w-64 transform bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 transition duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0`}
    >
      <div className="flex h-full flex-col">
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
              <FiHash className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ResearchCollab</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Sidebar footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <Link
            href="/help"
            className="flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Help & Support
          </Link>
        </div>
      </div>
    </aside>
  );
} 