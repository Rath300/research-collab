"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore, useAuthStore } from '@/lib/store';
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

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore(state => ({
    sidebarOpen: state.sidebarOpen,
    setSidebarOpen: state.setSidebarOpen,
  }));
  const { profile } = useAuthStore(state => ({
    profile: state.profile,
  }));

  const currentUserId = profile?.id;
  const currentUserName = profile?.full_name || (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.first_name) || 'User';
  const currentUserAvatarUrl = profile?.avatar_url || '/images/default-avatar.png';

  const mainNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiGrid /> },
    { label: 'Profile', href: currentUserId ? `/profile/${currentUserId}` : '/settings/account', icon: <FiUser /> },
    { label: 'Matching', href: '/matching', icon: <FiHeart /> },
    { label: 'Chat', href: '/chats', icon: <FiMessageSquare /> },
    { label: 'Projects', href: '/projects', icon: <FiBriefcase /> },
    { label: 'Trending', href: '/trending', icon: <FiTrendingUp /> },
    { label: 'Collaborators', href: '/collaborators', icon: <FiUsers /> },
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
            display: 'flex', // Needed for flex-col on child
            flexDirection: 'column', // Needed for flex-col on child
          },
          transition: 'width 0.3s ease-in-out',
        }}
      >
        <div className="flex flex-col h-full">
          {/* User Profile */}
          <div className={`p-4 mt-2 mb-4 flex ${sidebarOpen ? 'items-center' : 'items-center flex-col justify-center'} transition-all duration-300`}>
            {currentUserId ? (
              <Link href={`/profile/${currentUserId}`} passHref>
                <Image 
                  src={currentUserAvatarUrl} 
                  alt={currentUserName} 
                  width={sidebarOpen ? 48 : 40} 
                  height={sidebarOpen ? 48 : 40} 
                  className={`rounded-full ${sidebarOpen ? 'mr-3' : 'mb-2'} cursor-pointer hover:opacity-80 transition-opacity`}
                  priority // Potentially prioritize loading avatar
                />
              </Link>
            ) : (
              <div className={`rounded-full bg-gray-700 flex items-center justify-center ${sidebarOpen ? 'mr-3' : 'mb-2'}`} style={{ width: sidebarOpen ? 48 : 40, height: sidebarOpen ? 48 : 40}}>
                <FiUser size={sidebarOpen? 24 : 20} className="text-gray-400" />
              </div>
            )}
            {sidebarOpen && (
              <div className="overflow-hidden whitespace-nowrap flex-grow">
                {currentUserId ? (
                  <Link href={`/profile/${currentUserId}`} passHref className="hover:underline">
                    <h5 className="font-semibold text-sm text-white truncate">{currentUserName}</h5>
                  </Link>
                ) : (
                  <h5 className="font-semibold text-sm text-white truncate">{currentUserName}</h5>
                )}
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className={`p-1 rounded-md hover:bg-white/10 transition-colors ${sidebarOpen ? 'ml-auto self-center' : 'mt-2'}`}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
            </button>
          </div>

          {/* Main Navigation */}
          <Menu
            className="flex-grow overflow-y-auto"
            menuItemStyles={{
              button: ({ level, active }) => ({
                color: active ? '#F9A826' : '#d0d0d0',
                backgroundColor: active ? 'rgba(249, 168, 38, 0.1)' : 'transparent',
                paddingLeft: sidebarOpen ? (level === 0 ? '20px' : '0') : '0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                height: '48px',
                borderRadius: '8px',
                margin: '2px 10px', // Slightly reduced margin
                alignItems: 'center',
                transition: 'background-color 0.2s ease, color 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(249, 168, 38, 0.2)',
                  color: '#F9A826',
                },
              }),
              icon: ({ active }) => ({
                 color: active ? '#F9A826' : '#888EA8',
                 marginLeft: sidebarOpen ? '0' : 'auto',
                 marginRight: sidebarOpen ? '10px' : 'auto',
                 transition: 'color 0.2s ease',
              }),
              label: () => ({
                fontSize: '0.875rem', // Adjusted font size
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }),
              subMenuContent: () => ({
                backgroundColor: 'transparent',
                marginLeft: sidebarOpen ? '10px' : '0',
              }),
            }}
          >
            <div className={`px-5 py-2 text-xs text-gray-500 uppercase ${sidebarOpen ? '' : 'text-center sr-only'}`}>
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
            
            <MenuItem 
                icon={<FiLogOut />}
                onClick={() => {
                    // Replace with actual logout logic from useAuthStore
                    // Example: useAuthStore.getState().signOut(); router.push('/login');
                    alert("Logout functionality to be implemented!");
                }}
            >
                {sidebarOpen ? "Logout" : ""}
            </MenuItem>
          </Menu>

          {/* Bottom CTA */}
          <div className={`mb-4 px-4 ${sidebarOpen ? '' : 'flex justify-center'}`}>
            {sidebarOpen ? (
              <div className="p-3 rounded-lg bg-white/5 text-center">
                <h6 className="font-semibold text-white text-sm mb-0.5">New Project</h6>
                <p className="text-xs text-gray-400 mb-2.5">Start collaborating on a new idea.</p>
                <Link href="/projects/new" passHref>
                  <button className="w-full bg-[#F9A826] text-black py-2 px-3 rounded-md text-xs font-semibold hover:bg-opacity-90 transition-colors flex items-center justify-center">
                    <FiPlus className="inline mr-1.5 -ml-0.5" size={16} /> Add Project
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
    </div>
  );
} 