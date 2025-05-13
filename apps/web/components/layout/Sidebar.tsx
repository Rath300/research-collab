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
  FiLogOut // Example for a potential logout
} from 'react-icons/fi';
import Image from 'next/image'; // For user avatars

// Define an interface for user props if not already defined elsewhere
interface User {
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
    name: 'Andrew Smith',
    role: 'PRODUCT DESIGNER',
    avatarUrl: '/images/default-avatar.png', // Replace with actual path or dynamic URL
  };

  const messagesUsers: User[] = [
    { name: 'Erik Gunsel', avatarUrl: '/images/avatar-erik.png', status: 'online' },
    { name: 'Emily Smith', avatarUrl: '/images/avatar-emily.png', status: 'online' },
    { name: 'Arthur Adelk', avatarUrl: '/images/avatar-arthur.png' },
  ];

  // Adjusted nav items based on the new design.
  // Note: Some old items like Collaborators, Discover, Settings are not in the new design's main view.
  // You might want to place them under a "More" SubMenu or reconsider their placement.
  const mainMenuItems = [
    {
      label: 'Dashboard',
      icon: <FiGrid />,
      isSubMenu: true,
      href: '/dashboard', // Main dashboard link
      subItems: [
        { label: 'Activity', href: '/dashboard/activity', icon: <FiActivity /> },
        { label: 'Traffic', href: '/dashboard/traffic', icon: <FiBarChart2 /> },
        { label: 'Statistic', href: '/dashboard/statistic', icon: <FiBarChart2 /> },
      ],
    },
    { label: 'Invoices', href: '/invoices', icon: <FiFileText /> },
    { label: 'Wallet', href: '/wallet', icon: <FiCreditCard /> },
    { label: 'Notifications', href: '/notifications', icon: <FiBell /> },
    // Adding back other items, perhaps they fit here or need a different section
    { label: 'Collaborators', href: '/collaborators', icon: <FiUsers /> },
    { label: 'Research', href: '/research', icon: <FiFileText /> }, // Original research icon
    { label: 'Discover', href: '/discover', icon: <FiSearch /> },
    { label: 'Settings', href: '/settings', icon: <FiSettings /> },
  ];
  
  const isActive = (href: string) => pathname === href || (pathname?.startsWith(`${href}/`) ?? false);

  return (
    <div className="flex h-screen fixed top-0 left-0 z-30">
      <ProSidebar
        collapsed={!sidebarOpen}
        width="270px"
        collapsedWidth="80px"
        backgroundColor="rgba(30, 30, 42, 0.9)" // Dark background from image
        rootStyles={{
          borderRightWidth: '0px', // Remove default border
          color: '#e0e0e0', // Light text color for contrast
          height: '100vh',
          '.ps-sidebar-container': {
            backdropFilter: 'blur(10px)', // Glassmorphism attempt
            WebkitBackdropFilter: 'blur(10px)', // For Safari
          }
        }}
      >
        <div className="flex flex-col h-full">
          {/* User Profile */}
          <div className={`p-4 mt-2 mb-4 flex ${sidebarOpen ? 'items-center' : 'items-center flex-col'} transition-all duration-300`}>
            <Image 
              src={currentUser.avatarUrl} 
              alt={currentUser.name} 
              width={sidebarOpen ? 48 : 40} 
              height={sidebarOpen ? 48 : 40} 
              className="rounded-full mr-3" 
            />
            {sidebarOpen && (
              <div className="overflow-hidden whitespace-nowrap">
                <h5 className="font-semibold text-sm text-white">{currentUser.name}</h5>
                <p className="text-xs text-gray-400">{currentUser.role}</p>
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className={`ml-auto p-1 rounded-md hover:bg-white/10 transition-colors ${sidebarOpen ? '' : 'mt-2'}`}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
            </button>
          </div>

          {/* Main Navigation */}
          <Menu
            menuItemStyles={{
              button: ({ level, active }) => ({
                color: active ? '#F9A826' : '#d0d0d0', // Orange for active, light gray for inactive
                backgroundColor: active ? 'rgba(249, 168, 38, 0.1)' : 'transparent',
                paddingLeft: sidebarOpen ? (level === 0 ? '20px' : '30px') : 'auto',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                borderRadius: '8px',
                margin: '4px 10px',
                '&:hover': {
                  backgroundColor: 'rgba(249, 168, 38, 0.2)',
                  color: '#F9A826',
                },
              }),
              icon: ({active}) => ({
                 color: active ? '#F9A826' : '#888',
                 marginLeft: sidebarOpen ? '0' : 'auto',
                 marginRight: sidebarOpen ? '10px' : 'auto',
              }),
              label: () => ({
                fontSize: '0.875rem',
                fontWeight: 500,
              }),
              subMenuContent: () => ({
                backgroundColor: 'transparent', // Keep submenu background consistent
                marginLeft: sidebarOpen ? '10px' : '0', // Indent submenu content when open
              }),
            }}
          >
            <div className={`px-5 pb-2 text-xs text-gray-500 uppercase ${sidebarOpen ? '' : 'text-center'}`}>
              {sidebarOpen ? 'Main' : 'M'}
            </div>
            {mainMenuItems.map((item) =>
              item.isSubMenu && item.subItems ? (
                <SubMenu
                  key={item.label}
                  label={sidebarOpen ? item.label : ''}
                  icon={item.icon}
                  active={item.subItems.some(sub => isActive(sub.href))}
                  component={<Link href={item.href || '#'} />} // Main link for submenu header if needed
                  defaultOpen={item.subItems.some(sub => isActive(sub.href))} // Keep open if active child
                >
                  {sidebarOpen && item.subItems.map((subItem) => (
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
              ) : (
                <MenuItem
                  key={item.label}
                  icon={item.icon}
                  active={isActive(item.href as string)}
                  component={<Link href={item.href as string} />}
                >
                  {sidebarOpen ? item.label : ''}
                </MenuItem>
              )
            )}
            
            {/* Messages Link - separate as per design */}
             <MenuItem
                icon={<FiMessageSquare />}
                active={isActive('/chats')}
                component={<Link href="/chats" />}
             >
                {sidebarOpen ? 'Messages' : ''}
             </MenuItem>
          </Menu>

          {/* Messages Section - only shown when sidebar is open */}
          {sidebarOpen && (
            <div className="mt-6 px-4">
              <div className="flex items-center justify-between mb-2">
                <h6 className="text-xs text-gray-500 uppercase">Messages</h6>
                <button className="text-gray-400 hover:text-white">
                  <FiPlus size={18} />
                </button>
              </div>
              <ul className="space-y-2">
                {messagesUsers.map(user => (
                  <li key={user.name} className="flex items-center p-1 rounded-md hover:bg-white/5 cursor-pointer">
                    <Image src={user.avatarUrl} alt={user.name} width={28} height={28} className="rounded-full mr-2.5" />
                    <span className="text-xs text-gray-300">{user.name}</span>
                    {user.status === 'online' && <span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom CTA */}
          <div className={`mt-auto mb-6 px-4 ${sidebarOpen ? '' : 'flex justify-center'}`}>
            {sidebarOpen ? (
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <h6 className="font-semibold text-white mb-1">Let's start!</h6>
                <p className="text-xs text-gray-400 mb-3">Creating or adding new tasks couldn't be easier</p>
                <button className="w-full bg-[#F9A826] text-black py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors">
                  <FiPlus className="inline mr-1.5 -ml-1" /> Add New Task
                </button>
              </div>
            ) : (
              <button className="bg-[#F9A826] text-black p-3 rounded-lg hover:bg-opacity-90 transition-colors" aria-label="Add New Task">
                <FiPlus size={22} />
              </button>
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