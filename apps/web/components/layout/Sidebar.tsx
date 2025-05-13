"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store';
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { 
  FiGrid, // For Dashboard icon (square grid)
  FiFileText, // For Invoices
  FiCreditCard, // For Wallet
  FiBell, // For Notification
  FiMessageSquare, // For Messages (main link)
  FiPlus, // For Add new message
  FiChevronLeft,
  FiChevronRight,
  FiUsers, // For Collaborators (fallback, not in new design explicitly)
  FiSearch, // For Discover (fallback)
  FiSettings, // For Settings (fallback)
  FiActivity, // For Activity sub-item
  FiBarChart2, // For Traffic/Statistic sub-items
  FiLogOut, // Example for a potential logout
  FiUser, // For Profile & Account
  FiHeart, // For Matching
  FiBriefcase, // For Manage Projects
  FiTrendingUp, // For Trending Page
} from 'react-icons/fi';
import Image from 'next/image'; // For user avatars

// Define an interface for user props if not already defined elsewhere
interface ProfileUser {
  id: string;
  name: string;
  avatarUrl: string; // Assuming you'll have URLs for avatars
  status?: 'online' | 'offline'; // Optional: if you want to show status like in image
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore(state => ({
    sidebarOpen: state.sidebarOpen,
    setSidebarOpen: state.setSidebarOpen,
  }));

  // Placeholder for actual user data - replace with your auth context or store
  const currentUser = {
    id: 'current-user-id',
    name: 'Andrew Smith',
    role: 'PRODUCT DESIGNER',
    avatarUrl: '/images/default-avatar.png', // Replace with actual path or dynamic URL
  };

  const messagesUsers: ProfileUser[] = [
    { id: 'erik-gunsel-id', name: 'Erik Gunsel', avatarUrl: '/images/avatar-erik.png', status: 'online' },
    { id: 'emily-smith-id', name: 'Emily Smith', avatarUrl: '/images/avatar-emily.png', status: 'online' },
    { id: 'arthur-adelk-id', name: 'Arthur Adelk', avatarUrl: '/images/avatar-arthur.png' },
  ];

  // Adjusted nav items based on the new design.
  // Note: Some old items like Collaborators, Discover, Settings are not in the new design's main view.
  // You might want to place them under a "More" SubMenu or reconsider their placement.
  const mainNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiGrid /> },
    { label: 'Profile', href: `/profile/${currentUser.id}`, icon: <FiUser /> },
    { label: 'Matching', href: '/matching', icon: <FiHeart /> },
    { label: 'Chat', href: '/chats', icon: <FiMessageSquare /> },
    { label: 'Manage Projects', href: '/projects/manage', icon: <FiBriefcase /> },
    { label: 'Trending', href: '/trending', icon: <FiTrendingUp /> },
  ];
  
  const settingsSubItems = [
    { label: 'Account', href: '/settings/account', icon: <FiUser /> },
    { label: 'Notifications', href: '/settings/notifications', icon: <FiBell /> },
  ];

  const isActive = (href: string) => pathname === href || (pathname?.startsWith(`${href}/`) ?? false);

  return (
    <div className="flex h-screen fixed top-0 left-0 z-30">
      <ProSidebar
        collapsed={!sidebarOpen}
        width="270px"
        collapsedWidth="80px"
        backgroundColor="rgba(25, 25, 35, 0.85)" // Slightly adjusted dark background
        rootStyles={{
          borderRightWidth: '0px',
          color: '#e0e0e0',
          height: '100vh', // Ensure ProSidebar takes full height
          '.ps-sidebar-container': {
            backgroundColor: 'transparent', // Make container transparent to see root background
            backdropFilter: 'blur(12px)', 
            WebkitBackdropFilter: 'blur(12px)',
          },
        }}
      >
        <div className="flex flex-col h-full">
          {/* User Profile */}
          <div className={`p-4 mt-2 mb-4 flex ${sidebarOpen ? 'items-center' : 'items-center flex-col justify-center'} transition-all duration-300`}>
            <Link href={`/profile/${currentUser.id}`} passHref>
              <Image 
                src={currentUser.avatarUrl} 
                alt={currentUser.name} 
                width={sidebarOpen ? 48 : 40} 
                height={sidebarOpen ? 48 : 40} 
                className={`rounded-full ${sidebarOpen ? 'mr-3' : 'mb-2'} cursor-pointer`}
              />
            </Link>
            {sidebarOpen && (
              <div className="overflow-hidden whitespace-nowrap flex-grow">
                <Link href={`/profile/${currentUser.id}`} passHref className="hover:underline">
                  <h5 className="font-semibold text-sm text-white">{currentUser.name}</h5>
                </Link>
                <p className="text-xs text-gray-400">{currentUser.role}</p>
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className={`p-1 rounded-md hover:bg-white/10 transition-colors ${sidebarOpen ? 'ml-auto' : 'mt-2'}`}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
            </button>
          </div>

          {/* Main Navigation */}
          <Menu
            menuItemStyles={{
              button: ({ level, active }) => ({
                color: active ? '#F9A826' : '#d0d0d0',
                backgroundColor: active ? 'rgba(249, 168, 38, 0.1)' : 'transparent',
                paddingLeft: sidebarOpen ? (level === 0 ? '20px' : '30px') : '0', // Center icon when collapsed
                justifyContent: sidebarOpen ? 'flex-start' : 'center', // Center icon when collapsed
                height: '48px', // Consistent item height
                borderRadius: '8px',
                margin: '4px 10px',
                alignItems: 'center', // Vertically align icon and text
                '&:hover': {
                  backgroundColor: 'rgba(249, 168, 38, 0.2)',
                  color: '#F9A826',
                },
              }),
              icon: ({ active }) => ({
                 color: active ? '#F9A826' : '#888EA8', // Slightly softer inactive icon color
                 marginLeft: sidebarOpen ? '0' : 'auto',
                 marginRight: sidebarOpen ? '10px' : 'auto',
              }),
              label: () => ({
                fontSize: '0.9rem', // Slightly larger label
                fontWeight: 500,
                whiteSpace: 'nowrap', // Prevent label wrapping
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }),
              subMenuContent: () => ({
                backgroundColor: 'transparent',
                marginLeft: sidebarOpen ? '10px' : '0',
              }),
            }}
          >
            <div className={`px-5 py-3 text-xs text-gray-500 uppercase ${sidebarOpen ? '' : 'text-center sr-only'}`}>
              {sidebarOpen ? 'Menu' : ''}
            </div>
            {mainNavItems.map((item) => (
              <MenuItem
                key={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                component={<Link href={item.href} />}
              >
                {sidebarOpen ? item.label : ''}
              </MenuItem>
            ))}

            {/* Settings SubMenu */}
            <SubMenu
              label={sidebarOpen ? "Settings" : ""}
              icon={<FiSettings />}
              active={settingsSubItems.some(sub => isActive(sub.href))}
              defaultOpen={settingsSubItems.some(sub => isActive(sub.href))}
            >
              {sidebarOpen && settingsSubItems.map((subItem) => (
                <MenuItem
                  key={subItem.label}
                  icon={subItem.icon}
                  active={isActive(subItem.href)}
                  component={<Link href={subItem.href} />}
                >
                  {subItem.label}
                </MenuItem>
              ))}
            </SubMenu>
          </Menu>

          {/* Messages Section - only shown when sidebar is open */}
          {sidebarOpen && (
            <div className="mt-auto pt-4 border-t border-white/10 mx-2">
              <div className="flex items-center justify-between mb-2 px-2">
                <h6 className="text-xs text-gray-400 uppercase">Messages</h6>
                <Link href="/chats/new" passHref>
                  <button className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10" aria-label="New message">
                    <FiPlus size={18} />
                  </button>
                </Link>
              </div>
              <ul className="space-y-1 max-h-32 overflow-y-auto px-2 pb-2">
                {messagesUsers.map(user => (
                  <li key={user.id}>
                    <Link href={`/chats/${user.id}`} passHref>
                      <div className="flex items-center p-1.5 rounded-md hover:bg-white/10 cursor-pointer">
                        <Image src={user.avatarUrl} alt={user.name} width={28} height={28} className="rounded-full mr-2.5" />
                        <span className="text-xs text-gray-300 truncate flex-grow">{user.name}</span>
                        {user.status === 'online' && <span className="ml-2 w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>}
                      </div>
                    </Link>
                  </li>
                ))}
                {messagesUsers.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-2">No recent messages.</p>
                )}
              </ul>
            </div>
          )}

          {/* Bottom CTA */}
          <div className={`mt-auto mb-4 px-4 ${sidebarOpen ? '' : 'flex justify-center'}`}>
            {sidebarOpen ? (
              <div className="p-3 rounded-lg bg-white/5 text-center">
                <h6 className="font-semibold text-white text-sm mb-0.5">Let's start!</h6>
                <p className="text-xs text-gray-400 mb-2.5">Creating or adding new tasks couldn't be easier.</p>
                <Link href="/projects/new" passHref>
                  <button className="w-full bg-[#F9A826] text-black py-2 px-3 rounded-md text-xs font-semibold hover:bg-opacity-90 transition-colors flex items-center justify-center">
                    <FiPlus className="inline mr-1.5 -ml-0.5" size={16} /> Add New Project
                  </button>
                </Link>
              </div>
            ) : (
              <Link href="/projects/new" passHref>
                <button className="bg-[#F9A826] text-black p-2.5 rounded-lg hover:bg-opacity-90 transition-colors" aria-label="Add New Project">
                  <FiPlus size={20} />
                </button>
              </Link>
            )}
          </div>
        </div>
      </ProSidebar>
      
      {/* This button is now part of the ProSidebar's header section */}
      {/* Original toggle button location, can be removed or adapted if ProSidebar doesn't cover all toggle needs */}
      {/* <div className="hidden lg:block fixed bottom-4 left-4 z-40"> ... </div> */}
    </div>
  );
} 