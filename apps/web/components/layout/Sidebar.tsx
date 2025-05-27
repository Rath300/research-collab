"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUIStore, useAuthStore } from '@/lib/store';
import { getBrowserClient } from '@/lib/supabaseClient'; // Import Supabase client
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
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useUIStore(state => ({
    sidebarOpen: state.sidebarOpen,
    setSidebarOpen: state.setSidebarOpen,
  }));
  const { profile, clearAuth } = useAuthStore(state => ({
    profile: state.profile,
    clearAuth: state.clearAuth, // Use clearAuth
  }));

  const currentUserId = profile?.id;
  const currentUserName = (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.first_name) || 'User';
  const currentUserAvatarUrl = profile?.avatar_url || '/images/default-avatar.png';

  const mainNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <FiGrid /> },
    { label: 'Chats', href: '/chats', icon: <FiMessageSquare /> },
    { label: 'Discover Matches', href: '/match', icon: <FiSearch /> },
    { label: 'My Matches', href: '/matches', icon: <FiHeart /> },
    { label: 'Trending', href: '/trending', icon: <FiTrendingUp /> },
  ];
  
  const settingsSubItems = [
    { label: 'Account', href: '/settings/account', icon: <FiUser /> },
  ];

  const isActive = (href: string) => pathname === href || (pathname?.startsWith(`${href}/`) && href !== '/') || (href === '/settings' && pathname?.startsWith('/settings'));

  const handleSignOut = async () => {
    const supabase = getBrowserClient();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        // Optionally show an error message to the user
        alert('Error signing out. Please try again.');
        return;
      }
      // Successfully signed out from Supabase, now clear client-side auth state
      clearAuth();
      // Router will redirect to /login due to AppLayout's useEffect
      // router.push('/login'); // Explicit redirect can also be an option if needed
    } catch (e) {
      console.error('Unexpected error during sign out:', e);
      alert('An unexpected error occurred during sign out.');
    }
  };

  return (
    <div className="flex h-screen fixed top-0 left-0 z-30">
      <ProSidebar
        collapsed={!sidebarOpen}
        width="270px"
        collapsedWidth="80px"
        backgroundColor="rgb(24 24 27)"
        rootStyles={{
          borderRightWidth: '0px',
          color: '#e0e0e0',
          height: '100vh',
          '.ps-sidebar-container': {
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
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
                  priority
                />
              </Link>
            ) : (
              <div className={`rounded-full bg-neutral-700 flex items-center justify-center ${sidebarOpen ? 'mr-3' : 'mb-2'}`} style={{ width: sidebarOpen ? 48 : 40, height: sidebarOpen ? 48 : 40}}>
                <FiUser size={sidebarOpen? 24 : 20} className="text-neutral-400" />
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
              className={`p-1 rounded-md hover:bg-neutral-700/50 transition-colors ${sidebarOpen ? 'ml-auto self-center' : 'mt-2'}`}
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
                color: active ? '#ffffff' : '#a3a3a3',
                backgroundColor: active ? 'rgb(63 63 70)' : 'transparent',
                paddingLeft: sidebarOpen ? (level === 0 ? '20px' : '0') : '0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                height: '48px',
                borderRadius: '8px',
                margin: '2px 10px',
                alignItems: 'center',
                transition: 'background-color 0.2s ease, color 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgb(82 82 91)',
                  color: '#ffffff',
                },
              }),
              icon: ({ active }) => ({
                 color: active ? '#ffffff' : '#a3a3a3',
                 marginLeft: sidebarOpen ? '0' : 'auto',
                 marginRight: sidebarOpen ? '10px' : 'auto',
                 transition: 'color 0.2s ease',
              }),
              label: () => ({
                fontSize: '0.875rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }),
              subMenuContent: () => ({
                backgroundColor: 'transparent',
                marginLeft: sidebarOpen ? '10px' : '0',
              })
            }}
          >
            <div className={`px-5 py-2 text-xs text-neutral-500 uppercase ${sidebarOpen ? '' : 'text-center sr-only'}`}>
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
              active={settingsSubItems.some(sub => isActive(sub.href)) || isActive('/settings')}
              defaultOpen={settingsSubItems.some(sub => isActive(sub.href)) || isActive('/settings')}
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
                onClick={handleSignOut}
            >
                {sidebarOpen ? "Logout" : ""}
            </MenuItem>
          </Menu>

          {/* Bottom CTA */}
          <div className={`mb-4 px-4 ${sidebarOpen ? '' : 'flex justify-center'}`}>
            {sidebarOpen ? (
              <div className="p-3 rounded-lg bg-neutral-800/70 text-center">
                <h6 className="font-semibold text-white text-sm mb-0.5">New Project</h6>
                <p className="text-xs text-neutral-400 mb-2.5">Start collaborating on a new idea.</p>
                <Link href="/projects/new" passHref>
                  <button className="w-full bg-neutral-700 text-white py-2 px-3 rounded-md text-xs font-semibold hover:bg-neutral-600 transition-colors flex items-center justify-center">
                    <FiPlus className="inline mr-1.5 -ml-0.5" size={16} /> Add Project
                  </button>
                </Link>
              </div>
            ) : (
              <Link href="/projects/new" passHref>
                <button className="bg-neutral-700 text-white p-2.5 rounded-lg hover:bg-neutral-600 transition-colors" aria-label="Add New Project">
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