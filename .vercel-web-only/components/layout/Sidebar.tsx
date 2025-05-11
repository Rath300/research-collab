"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { 
  FiHome, 
  FiUsers, 
  FiMessageSquare, 
  FiSearch, 
  FiFileText, 
  FiSettings,
  FiChevronRight,
  FiChevronLeft
} from 'react-icons/fi';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const navItems = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: FiHome 
    },
    { 
      name: 'Collaborators', 
      href: '/collaborators', 
      icon: FiUsers 
    },
    { 
      name: 'Research', 
      href: '/research', 
      icon: FiFileText 
    },
    { 
      name: 'Discover', 
      href: '/discover', 
      icon: FiSearch 
    },
    { 
      name: 'Messages', 
      href: '/chats', 
      icon: FiMessageSquare 
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: FiSettings 
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 w-64 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between mb-6 pl-2">
            <Link href="/dashboard" className="text-xl font-semibold flex items-center">
              Research<span className="text-indigo-600">Collab</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <FiChevronLeft className="w-5 h-5" />
              <span className="sr-only">Close sidebar</span>
            </button>
          </div>
          
          <ul className="space-y-2 font-medium flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-2 rounded-lg group ${
                      isActive 
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' 
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    <span className="ms-3">{item.name}</span>
                    {item.name === 'Chats' && (
                      <span className="inline-flex items-center justify-center w-5 h-5 ms-auto text-xs font-semibold text-white bg-indigo-500 rounded-full">
                        3
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 text-sm text-gray-500 dark:text-gray-400">
              <p>© 2024 ResearchCollab</p>
              <p className="mt-1">Connect and collaborate</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Toggle button for larger screens */}
      <div className="hidden lg:block fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white text-gray-700 rounded-full shadow hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {sidebarOpen ? (
            <FiChevronLeft className="w-5 h-5" />
          ) : (
            <FiChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </>
  );
} 