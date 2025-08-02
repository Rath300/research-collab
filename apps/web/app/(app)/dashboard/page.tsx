"use client";
export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  FiUsers, 
  FiMessageSquare, 
  FiTarget, 
  FiTrendingUp, 
  FiSearch, 
  FiChevronRight, 
  FiPlus, 
  FiCalendar, 
  FiBarChart2,
  FiBookmark,
  FiUser,
  FiMapPin,
  FiList,
  FiInfo,
  FiBell,
  FiLink,
  FiActivity,
  FiBriefcase,
  FiLink2,
  FiEdit2,
  FiFilePlus,
  FiCheckSquare,
  FiLoader,
  FiHome
} from 'react-icons/fi';
import { useAuthStore, type AuthState } from '@/lib/store';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabaseClient';
import { ResearchPostCard } from '@/components/research/ResearchPostCard';
import { Avatar } from '@/components/ui/Avatar';
import { getProjects } from '@/lib/posts';

type Profile = Database['public']['Tables']['profiles']['Row'];
type BaseProfileMatch = Database['public']['Tables']['profile_matches']['Row'];

interface ProfileMatch extends BaseProfileMatch {
  matched_profile: Profile;
}

type UserNotification = Database['public']['Tables']['user_notifications']['Row'];

interface DashboardStats {
  postCount: number;
  matchCount: number;
  messageCount: number;
  viewCount: number;
  activeProjectsCount: number;
  pendingRequestsCount: number;
  unreadMessagesCount: number;
}

function titleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const ActivityFeed = ({ notifications }: { notifications: UserNotification[] }) => {
  const router = useRouter();
  const hasActualActivity = notifications && notifications.length > 0;

  const formatTimeAgo = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-text-secondary/10 rounded-lg mr-3 shadow">
          <FiActivity className="w-5 h-5 text-accent-primary" />
        </div>
        <h3 className="text-xl font-heading text-text-primary">Recent Activity</h3>
      </div>
      <div className="font-sans text-text-secondary bg-white p-5 md:p-6 rounded-xl shadow-md border border-border-light min-h-[200px]">
        {hasActualActivity ? (
          <motion.ul
            variants={{ 
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {}
            }}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {notifications.map((activity) => (
              <motion.li
                key={activity.id} 
                className="font-sans text-sm text-text-secondary hover:text-text-primary transition-colors"
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                {activity.link_to ? (
                  <Link href={activity.link_to} className="hover:underline">
                    {activity.content}
                  </Link>
                ) : (
                  <span>{activity.content}</span>
                )}
                {' - '}
                <span className="text-xs text-text-secondary">{formatTimeAgo(activity.created_at)}</span>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <div className="text-center py-6 font-sans">
            <p className="text-text-secondary mb-3">No recent activity yet.</p>
            <Button variant="secondary" size="sm" onClick={() => router.push('/trending')} className="font-sans">
              <FiSearch className="mr-1"/> Explore Platform
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const CollaborationStatsDisplay = ({ stats }: { stats: DashboardStats }) => {
  const router = useRouter();

  interface StatDetail {
    label: string;
    value: number;
    icon: React.ElementType;
    href?: string;
  }

  const statItems: StatDetail[] = [
    { label: "Active Projects", value: stats.activeProjectsCount, icon: FiBriefcase, href: "/projects" },
    { label: "Pending Requests", value: stats.pendingRequestsCount, icon: FiUsers, href: "/collaborators/requests" },
    { label: "Unread Messages", value: stats.unreadMessagesCount, icon: FiMessageSquare, href: "/chats" },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {statItems.map((item) => {
        const StatCardContent = (
          <div className="flex flex-col items-start text-left h-full p-1">
            <div className="flex items-center w-full">
              <item.icon className="w-6 h-6 text-accent-primary mr-3 flex-shrink-0" />
              <p className="text-2xl md:text-3xl font-heading text-text-primary truncate">
                {item.value}
              </p>
            </div>
            <p className="text-xs text-text-secondary font-sans mt-1 ml-[calc(1.5rem+0.75rem)]"> {/* 24px (w-6) + 12px (mr-3) = 36px */}
              {item.label}
            </p>
          </div>
        );

        const kpiBlockClasses = "block p-3 md:p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 border border-border-light transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 cursor-pointer";

        return item.href ? (
          <Link href={item.href} key={item.label} className={kpiBlockClasses}>
            {StatCardContent}
          </Link>
        ) : (
          <div key={item.label} className={kpiBlockClasses}>
            {StatCardContent}
          </div>
        );
      })}
    </div>
  );
};

const RecentMatchesDisplay = ({ matches }: { matches: ProfileMatch[] }) => {
  const router = useRouter();

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-text-secondary/10 rounded-lg mr-3 shadow">
          <FiUsers className="w-5 h-5 text-accent-primary" />
        </div>
        <h3 className="text-xl font-heading text-text-primary">Recent Matches</h3>
      </div>
      <div className="font-sans text-text-secondary bg-white p-5 md:p-6 rounded-xl shadow-md border border-border-light">
        {matches.length > 0 ? (
          <ul className="space-y-3">
            {matches.map(match => (
              <li key={match.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                <Avatar src={match.matched_profile?.avatar_url} alt={titleCase(match.matched_profile?.full_name) || 'User'} size="sm" fallback={<FiUser size={18}/>} />
                <div>
                  <Link href={`/profile/${match.matchee_user_id}`} className="font-sans font-medium text-text-primary hover:underline">
                    {titleCase(match.matched_profile?.full_name) || 'Matched User'}
                  </Link>
                  <p className="text-xs text-text-secondary font-sans">Matched on: {new Date(match.created_at).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-text-secondary py-4 text-center">No recent matches yet.</p>
        )}
        <Link href="/match" className="block mt-4 text-sm text-accent-primary hover:text-accent-primary/80 font-sans hover:underline">
          Find New Collaborators
        </Link>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuthStore() as AuthState;
  const [stats, setStats] = useState<DashboardStats>({
    postCount: 0,
    matchCount: 0,
    messageCount: 0,
    viewCount: 0,
    activeProjectsCount: 0,
    pendingRequestsCount: 0,
    unreadMessagesCount: 0
  });
  
  const [recentMatches, setRecentMatches] = useState<ProfileMatch[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // supabase is already imported as a singleton
  
  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    try {
      const userId = user.id;

      // Define all data fetching promises together
      const getActiveProjectsCount = async () => {
        const { data: collaboratorEntries, error: collabError } = await supabase
          .from('project_collaborators')
          .select('project_id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'active');
        return { count: collaboratorEntries?.length ?? 0, error: collabError };
      };

      const promises = {
        postCount: supabase.from('projects').select('id', { count: 'exact', head: true }).eq('leader_id', userId),
        matchCount: supabase.from('profile_matches').select('id', { count: 'exact', head: true }).eq('matcher_user_id', userId).eq('status', 'matched'),
        messageCount: supabase.from('messages').select('id', { count: 'exact', head: true }).or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
        activeProjectsCount: getActiveProjectsCount(),
        pendingRequestsCount: supabase.from('collaborator_matches').select('id', { count: 'exact', head: true }).eq('target_user_id', userId).eq('status', 'pending'),
        unreadMessagesCount: supabase.from('messages').select('id', { count: 'exact', head: true }).eq('receiver_id', userId).eq('is_read', false),
        recentMatches: supabase
          .from('profile_matches')
          .select('*, matched_profile:profiles!profile_matches_matchee_user_id_fkey (*)')
          .eq('matcher_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3),
        recentNotifications: supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(4)
      };

      // Await all promises simultaneously
      const results = await Promise.all(Object.values(promises));
      const [
        postCountRes,
        matchCountRes,
        messageCountRes,
        activeProjectsCountRes,
        pendingRequestsCountRes,
        unreadMessagesCountRes,
        matchesRes,
        notificationsRes
      ] = results;

      // Process and set stats
      setStats({
        postCount: postCountRes.count ?? 0,
        matchCount: matchCountRes.count ?? 0,
        messageCount: messageCountRes.count ?? 0,
        viewCount: 0, // Not implemented yet
        activeProjectsCount: activeProjectsCountRes.count ?? 0,
        pendingRequestsCount: pendingRequestsCountRes.count ?? 0,
        unreadMessagesCount: unreadMessagesCountRes.count ?? 0,
      });

      if (matchesRes.error) console.error('Error fetching matches:', matchesRes.error);
      else setRecentMatches((matchesRes.data as ProfileMatch[]) || []);
      
      if (notificationsRes.error) console.error('Error fetching notifications:', notificationsRes.error);
      else setRecentNotifications((notificationsRes.data as UserNotification[]) || []);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <FiLoader className="animate-spin text-accent-purple text-4xl" />
        <p className="text-neutral-400 font-sans ml-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-bg-primary text-text-primary p-4 md:p-6 lg:p-8 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-heading text-text-primary">Dashboard</h1>
        {profile?.first_name && (
          <p className="text-lg text-text-secondary mt-1 font-sans">
            Welcome back, <span className="font-semibold text-text-primary">{titleCase(profile.first_name)}</span>!
          </p>
        )}
      </header>

      <CollaborationStatsDisplay stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-6">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <ActivityFeed notifications={recentNotifications} />
        </div>
        
        <div className="lg:col-span-1 space-y-6 md:space-y-8">
          <RecentMatchesDisplay matches={recentMatches} />
        </div>
      </div>
    </motion.div>
  );
}