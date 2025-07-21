"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, useChatStore } from "@/lib/store";
import { 
  FiHome, FiFolder, FiUsers, FiSearch, FiMessageSquare, FiChevronLeft, 
  FiSettings, FiLogOut, FiMenu, FiX, FiPlusCircle, FiBell, FiStar, FiChevronDown, FiChevronRight, FiLoader,
  FiInbox
} from "react-icons/fi";
import { NotificationBell } from "./notifications/NotificationBell";
import { Avatar } from '@/components/ui/Avatar';
import { getConversations, type ConversationListItem } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function SideMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, profile, signOut, isLoading: authLoading } = useAuthStore();
  const { totalUnreadMessages, setTotalUnreadMessages } = useChatStore();
  
  const [showConversations, setShowConversations] = useState(false);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const navigationItems: NavigationItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: FiHome, type: 'link' },
    { name: "Discover Projects", href: "/discover", icon: FiSearch, type: 'link' },
    { name: "My Projects", href: "/projects", icon: FiFolder, type: 'link' }, 
    { name: "Find Collaborators", href: "/collaborators", icon: FiUsers, type: 'link' },
    { name: "Create New Post", href: "/projects/new", icon: FiPlusCircle, highlight: true, type: 'link' },
    {
      name: 'Messages',
      icon: FiMessageSquare,
      type: 'dropdown',
      action: () => {
        const newShowState = !showConversations;
        setShowConversations(newShowState);
        if (newShowState && conversations.length === 0 && !conversationsLoading) {
          fetchConversations();
        }
      },
      badgeCount: totalUnreadMessages > 0 ? totalUnreadMessages : undefined,
    },
    { name: "Settings", href: "/settings", icon: FiSettings, type: 'link' },
  ];

  const filteredNavigationItems = navigationItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchConversations = useCallback(async () => {
    if (!user || conversationsLoading) return;
    setConversationsLoading(true);
    setConversationsError(null);
    try {
      const convos = await getConversations();
      setConversations(convos);
      const totalUnread = convos.reduce((sum, convo) => sum + (convo.unreadCount || 0), 0);
      setTotalUnreadMessages(totalUnread);
    } catch (err: any) {
      console.error("Error fetching conversations:", err);
      setConversationsError(err.message || "Failed to load conversations");
    }
    setConversationsLoading(false);
  }, [user, conversationsLoading, setTotalUnreadMessages]);

  useEffect(() => {
    if (user && showConversations && conversations.length === 0 && !conversationsLoading) {
      fetchConversations();
    }
  }, [user, showConversations, conversations.length, conversationsLoading, fetchConversations]);

  useEffect(() => {
    if (!user) return;

    // supabase is already imported as a singleton
    const channel = supabase
      .channel('public:messages:user-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New message received via realtime:', payload);
          fetchConversations();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to messages channel!');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`Failed to subscribe to messages channel:`, err);
        }
        if (status === 'TIMED_OUT') {
          console.warn('Messages channel subscription timed out');
        }
      });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        console.log('Unsubscribed from messages channel');
      }
    };
  }, [user, fetchConversations]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
      setIsMobileOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const commonLinkClass = "flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out group";
  const activeLinkClass = "bg-purple-600 text-white shadow-md";
  const inactiveLinkClass = "text-gray-300 hover:bg-white/10 hover:text-white";
  const iconClass = (isActive: boolean, isHighlight: boolean = false) => 
    `h-5 w-5 flex-shrink-0 ${isActive || isHighlight ? (isHighlight ? 'text-black group-hover:text-black' : 'text-white') : 'text-gray-400 group-hover:text-white'} transition-colors duration-200`;
  const labelClass = (isActive: boolean, isHighlight: boolean = false) => 
    `truncate ${isHighlight? 'text-black group-hover:text-black' : (isActive ? 'text-researchbee-yellow' : 'text-gray-200 group-hover:text-researchbee-yellow')} transition-colors duration-150`;

  interface NavigationItem {
    name: string;
    href?: string;
    icon: React.ElementType;
    highlight?: boolean;
    type?: 'link' | 'dropdown';
    action?: () => void;
    badgeCount?: number;
  }

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-900/70 backdrop-blur-xl border-r border-white/10 shadow-2xl transition-all duration-300 ease-in-out 
        ${isCollapsed ? 'w-20' : 'w-72'}
        md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className={`flex items-center border-b border-white/10 ${isCollapsed ? 'justify-center h-[73px]' : 'px-6 h-[73px]'}`}>
        <Link href="/dashboard" className="flex items-center space-x-3" onClick={() => isMobileOpen && setIsMobileOpen(false)}>
          <FiStar className={`text-3xl transition-colors duration-300 ${isCollapsed ? 'text-researchbee-yellow' : 'text-purple-500'}`} />
          {!isCollapsed && (
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 whitespace-nowrap">
              ResearchCollab
            </span>
          )}
        </Link>
      </div>

      {/* Search Bar - only shown when not collapsed */}
      {!isCollapsed && (
        <div className="p-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </span>
            <Input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border-white/10 hover:border-researchbee-yellow/70 focus:border-researchbee-yellow focus:ring-1 focus:ring-researchbee-yellow transition-colors duration-150 placeholder-gray-500 text-sm text-gray-200 !pl-9 !py-2.5 rounded-lg shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800/50">
        {/* Display filtered items if search term exists, otherwise all items */}
        {(searchTerm ? filteredNavigationItems : navigationItems).map((item) => {
          const isActive = item.href ? (pathname === item.href || (item.href === '/projects' && pathname?.startsWith('/research/'))) : false;
          
          // Common classes for all items
          let itemBaseClass = `relative flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out group ${isCollapsed ? "justify-center" : ""}`;
          let itemSpecificClass = "";

          if (isActive) {
            itemSpecificClass = `bg-researchbee-yellow/10 text-researchbee-yellow shadow-md`;
          } else if (item.highlight) {
            itemSpecificClass = `bg-researchbee-yellow text-black hover:bg-researchbee-darkyellow`;
          } else {
            itemSpecificClass = `text-gray-300 hover:bg-white/5 hover:text-researchbee-yellow`;
          }
          const combinedClasses = `${itemBaseClass} ${itemSpecificClass}`;

          // Active indicator style (left border)
          const activeIndicator = isActive ? 
            <span className="absolute inset-y-0 left-0 w-1 bg-researchbee-yellow rounded-r-md shadow-lg"></span> : null;

          if (item.type === 'dropdown') {
            return (
              <div key={item.name} className="relative">
                {/* Dropdown button doesn't show active indicator directly like links */}
                <button
                  onClick={item.action}
                  className={combinedClasses} // Use combined classes for the button itself
                  title={item.name}
                >
                  {/* For dropdown button, isActive and highlight are effectively false for its own styling */}
                  <item.icon className={`${iconClass(false, false)} ${isCollapsed ? '' : 'mr-3'}`} /> 
                  {!isCollapsed && <span className={labelClass(false, false)}>{item.name}</span>}
                  {!isCollapsed && item.badgeCount && item.badgeCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                      {item.badgeCount}
                    </span>
                  )}
                  {!isCollapsed && (showConversations ? 
                    <FiChevronDown className={`h-5 w-5 ${item.badgeCount ? 'ml-1' : 'ml-auto'} text-gray-400 group-hover:text-white`} /> : 
                    <FiChevronRight className={`h-5 w-5 ${item.badgeCount ? 'ml-1' : 'ml-auto'} text-gray-400 group-hover:text-white`} />
                  )}
                </button>
                <AnimatePresence>
                  {showConversations && !isCollapsed && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="mt-1.5 pl-6 pr-1 space-y-1 border-l border-white/20 ml-2.5 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                    >
                      {conversationsLoading && (
                        <motion.div 
                          initial={{ opacity: 0}}
                          animate={{ opacity: 1}}
                          className="p-3 text-xs text-gray-400 flex items-center justify-center space-x-2"
                        >
                          <FiLoader className="animate-spin h-4 w-4" /> <span>Loading conversations...</span>
                        </motion.div>
                      )}
                      {conversationsError && (
                        <motion.div 
                          initial={{ opacity: 0}}
                          animate={{ opacity: 1}}
                          className="p-3 text-xs text-red-400 text-center"
                        >
                          <p className="font-semibold">Oops! Something went wrong.</p>
                          <p>{conversationsError}</p>
                        </motion.div>
                      )}
                      {!conversationsLoading && !conversationsError && conversations.length === 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 text-center text-gray-400 flex flex-col items-center space-y-2"
                        >
                          <FiInbox size={30} className="opacity-60"/>
                          <p className="text-sm font-medium text-gray-300">No Conversations Yet</p>
                          <p className="text-xs">Start matching with users to begin chatting.</p>
                        </motion.div>
                      )}
                      <AnimatePresence initial={false}>
                        {conversations.map((convo, index) => (
                          <motion.div
                            key={convo.matchId}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <Link href={`/chat/${convo.matchId}`} passHref>
                              <a 
                                className={`relative flex items-center w-full px-3 py-2 rounded-lg transition-all duration-150 group 
                                  ${pathname === `/chat/${convo.matchId}` 
                                    ? 'bg-purple-500/20 text-researchbee-yellow' 
                                    : 'text-gray-400 hover:bg-white/10 hover:text-researchbee-yellow' }`}
                                onClick={() => isMobileOpen && setIsMobileOpen(false)}
                                title={`${convo.otherUserFirstName || ''} ${convo.otherUserLastName || ''}`.trim() || 'Chat User'}
                              >
                                {pathname === `/chat/${convo.matchId}` && 
                                   <span className="absolute inset-y-0 left-0 w-0.5 bg-researchbee-yellow rounded-r-full"></span>}
                                <Avatar 
                                  src={convo.otherUserAvatarUrl || null} 
                                  fallback={`${convo.otherUserFirstName?.[0] || 'U'}${convo.otherUserLastName?.[0] || 'N'}`}
                                  alt={(`${convo.otherUserFirstName || ''} ${convo.otherUserLastName || ''}`).trim() || 'User'}
                                  className="w-7 h-7 mr-2.5 text-xs flex-shrink-0 border border-white/10"
                                />
                                <div className="flex-grow overflow-hidden">
                                  <p className={`text-xs font-medium truncate ${pathname === `/chat/${convo.matchId}` ? 'text-researchbee-yellow' : 'text-gray-200'}`}>
                                    {(`${convo.otherUserFirstName || ''} ${convo.otherUserLastName || ''}`).trim() || 'Chat User'}
                                  </p>
                                  {convo.lastMessageContent && (
                                    <p className="text-[11px] text-gray-500 group-hover:text-gray-300 truncate">
                                      {convo.lastMessageSenderId === user?.id ? <span className="font-semibold">You: </span> : ''}{convo.lastMessageContent}
                                    </p>
                                  )}
                                </div>
                                {convo.unreadCount > 0 && (
                                  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-researchbee-yellow text-black rounded-full flex-shrink-0">
                                    {convo.unreadCount}
                                  </span>
                                )}
                              </a>
                            </Link>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          } else if (item.href && item.type === 'link') { 
                return (
              <Link key={item.name} href={item.href} passHref>
                <a 
                  className={combinedClasses} // Use combined classes for the link
                  onClick={() => isMobileOpen && setIsMobileOpen(false)}
                  title={item.name}
                >
                  {activeIndicator} {/* Render active indicator inside the link */}
                  <item.icon className={`${iconClass(Boolean(isActive), Boolean(item.highlight))} ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && <span className={labelClass(Boolean(isActive), Boolean(item.highlight))}>{item.name}</span>}
                  {!isCollapsed && item.badgeCount && item.badgeCount > 0 && (
                     <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                       {item.badgeCount}
                     </span>
                  )}
                </a>
                    </Link>
                );
          }
          return null; 
              })}
          </nav>

      <div className="mt-auto border-t border-white/10 p-3 space-y-3">
        {!isCollapsed && user && (
          <div className="flex items-center group p-1.5 rounded-md min-w-0">
            <p className="text-sm text-gray-300 truncate">Welcome, {profile?.first_name || 'User'}</p>
          </div>
        )}
        {!isCollapsed && !user && authLoading && (
           <div className="flex items-center p-1.5 min-w-0"><FiLoader className="animate-spin h-8 w-8 mr-2 text-gray-400" /><div className="overflow-hidden"><p className="text-sm font-semibold text-gray-400">Loading...</p></div></div>
        )}
        {!isCollapsed && !user && !authLoading && (
          <Link href="/login" className="flex items-center group p-1.5 rounded-md hover:bg-white/5" onClick={() => isMobileOpen && setIsMobileOpen(false)}>
               <FiLogOut className="h-7 w-7 mr-2 text-gray-400 group-hover:text-researchbee-yellow" /><div className="overflow-hidden"><p className="text-sm font-semibold text-gray-300 group-hover:text-researchbee-yellow">Login / Signup</p></div>
          </Link>
        )}
        <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-2' : 'space-x-2'}`}>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className={`w-full md:w-auto flex items-center justify-center p-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-researchbee-yellow transition-colors ${isCollapsed ? '' : 'flex-1'}`}
            title={isCollapsed ? "Expand Menu" : "Collapse Menu"}
          >
            {isCollapsed ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
            {!isCollapsed && <span className="ml-2 text-sm sr-only md:not-sr-only">Collapse</span>}
          </button>
          {user && (
            <button
              onClick={handleSignOut}
              className={`w-full md:w-auto flex items-center justify-center p-2 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors ${isCollapsed ? '' : 'flex-1'}`}
              title="Logout"
            >
              <FiLogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-2 text-sm sr-only md:not-sr-only">Logout</span>}
            </button>
          )}
        </div>
      </div>

      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-gray-800/80 backdrop-blur-sm rounded-md text-white"
      >
        {isMobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
      </button>
      </aside>
  );
} 
