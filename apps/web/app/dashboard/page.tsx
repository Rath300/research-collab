"use client";

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
  FiCheckSquare
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { Database } from '@/lib/database.types';
import { getBrowserClient } from '@/lib/supabaseClient';
import { ResearchPostCard } from '@/components/research/ResearchPostCard';
import { Avatar } from '@/components/ui/Avatar';

type ResearchPost = Database['public']['Tables']['research_posts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type BaseProfileMatch = Database['public']['Tables']['profile_matches']['Row'];

interface ProfileMatch extends BaseProfileMatch {
  matched_profile: Profile;
}

type UserNotification = Database['public']['Tables']['user_notifications']['Row'];

type Message = Database['public']['Tables']['messages']['Row'];

interface DashboardStats {
  postCount: number;
  matchCount: number;
  messageCount: number;
  viewCount: number;
  activeProjectsCount: number;
  pendingRequestsCount: number;
  unreadMessagesCount: number;
}

interface ResearchPostWithProfile extends ResearchPost {
  profiles: Profile;
}

function titleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const DashboardCard: React.FC<{ title?: string; titleIcon?: React.ElementType; className?: string; children: React.ReactNode }> = 
  ({ title, titleIcon: TitleIconProp, className = '', children }) => (
  <motion.div 
    className={`bg-neutral-900 p-5 md:p-6 rounded-xl shadow-lg border border-neutral-800 ${className}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  > 
    {(title || TitleIconProp) && (
      <div className="flex items-center mb-4">
        {TitleIconProp && <TitleIconProp className="w-6 h-6 text-neutral-400 mr-3" />}
        {title && <h3 className="text-xl font-heading text-neutral-100">{title}</h3>}
      </div>
    )}
    <div className="font-sans text-neutral-300"> 
      {children}
    </div>
  </motion.div>
);

const MyProfileSnapshot = () => {
  const { profile } = useAuthStore();
  const router = useRouter();
  
  // Corrected displayName logic
  const calculatedDisplayName = (profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : profile?.first_name)
    || 'User';
  const displayName = calculatedDisplayName.trim() || 'User'; // Ensure it's not empty string, fallback to 'User'
  
  // Ensure displayAvatarUrl is null if not a valid URL
  const isValidAvatarUrl = profile?.avatar_url && (profile.avatar_url.startsWith('http://') || profile.avatar_url.startsWith('https://'));
  const displayAvatarUrl = isValidAvatarUrl ? profile.avatar_url : null;

  return (
    <DashboardCard title="Profile Status" titleIcon={FiUser} className="mb-6 md:mb-8">
      <div className="flex items-center space-x-4 mb-4">
        <Avatar src={displayAvatarUrl} alt={displayName} size='lg' fallback={<FiUser size={24}/>} />
        <div>
          <h4 className="text-lg font-heading text-neutral-100 truncate max-w-xs">{displayName}</h4>
          <Link href={profile?.id ? `/profile/${profile.id}` : '/settings/account'} className="text-sm text-neutral-400 hover:text-neutral-100 font-sans hover:underline">
            View Profile
          </Link>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="secondary" size="sm" onClick={() => router.push(profile?.id ? `/profile/${profile.id}` : '/settings/account')} className="font-sans"><FiUser className="mr-1"/> View Full</Button>
        <Button variant="outline" size="sm" onClick={() => router.push('/settings/account')} className="font-sans"><FiEdit2 className="mr-1"/> Edit Profile</Button>
      </div>
    </DashboardCard>
  );
};

const QuickActions = () => {
  const router = useRouter();
  const actions = [
    { label: "Find Collaborators", href: "/collaborators", icon: FiSearch },
    { label: "New Project", href: "/projects/new", icon: FiFilePlus },
    { label: "Messages", href: "/chats", icon: FiMessageSquare },
    { label: "Update Profile", href: "/settings/account", icon: FiCheckSquare }
  ];

  return (
    <DashboardCard title="Quick Actions" titleIcon={FiTarget} className="mb-6 md:mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className="flex flex-col items-center justify-center p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700/80 transition-colors aspect-square group"
          >
            <action.icon className="w-7 h-7 text-neutral-300 group-hover:text-white mb-1 transition-colors" />
            <span className="text-[11px] leading-tight font-sans text-neutral-200 group-hover:text-white text-center transition-colors">{action.label}</span>
          </button>
        ))}
      </div>
    </DashboardCard>
  );
};

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
    <DashboardCard title="Recent Activity" titleIcon={FiActivity} className="min-h-[200px] mb-6 md:mb-8">
      {hasActualActivity ? (
        <ul className="space-y-3">
          {notifications.map((activity) => (
            <li key={activity.id} className="font-sans text-sm text-neutral-400 hover:text-neutral-200 transition-colors">
              {activity.link_to ? (
                <Link href={activity.link_to} className="hover:underline">
                  {activity.content}
                </Link>
              ) : (
                <span>{activity.content}</span>
              )}
              {' - '}
              <span className="text-xs text-neutral-500">{formatTimeAgo(activity.created_at)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6 font-sans">
          <p className="text-neutral-500 mb-3">No recent activity yet.</p>
          <Button variant="secondary" size="sm" onClick={() => router.push('/discover')} className="font-sans">
            <FiSearch className="mr-1"/> Explore Platform
          </Button>
        </div>
      )}
    </DashboardCard>
  );
};

const CollaborationStatsDisplay = ({ stats }: { stats: DashboardStats }) => {
  
  interface StatDetail {
    label: string;
    value: number;
    icon: React.ElementType;
  }

  const statItems: StatDetail[] = [
    { label: "Active Projects", value: stats.activeProjectsCount, icon: FiBriefcase },
    { label: "Pending Requests", value: stats.pendingRequestsCount, icon: FiUsers },
    { label: "Unread Messages", value: stats.unreadMessagesCount, icon: FiMessageSquare },
  ];

  return (
    <DashboardCard title="Collaboration Stats" titleIcon={FiTrendingUp} className="mb-6 md:mb-8">
      <div className="space-y-4 font-sans">
        {statItems.map((item) => (
          <div key={item.label} className="bg-neutral-800/60 p-4 rounded-lg flex items-center transition-all hover:bg-neutral-800/90">
            <item.icon className="w-6 h-6 text-accent-purple mr-4 flex-shrink-0" />
            <div className="flex-grow">
              <p className="text-sm text-neutral-400">{item.label}</p>
              <p className="text-xl font-heading text-neutral-100">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
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
  const [recentPosts, setRecentPosts] = useState<ResearchPostWithProfile[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getBrowserClient();
  
  const loadDashboardData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    try {
      const userId = user.id;

      // Fetch all counts in parallel
      const countsPromises = [
        supabase.from('research_posts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('profile_matches').select('id', { count: 'exact', head: true }).eq('matcher_user_id', userId).eq('status', 'matched'),
        supabase.from('messages').select('id', { count: 'exact', head: true }).or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
        supabase.from('project_collaborators').select('project_id!inner(status)', { count: 'exact', head: true }).eq('user_id', userId).eq('project_id.status', 'active'),
        supabase.from('collaborator_matches').select('id', { count: 'exact', head: true }).eq('target_user_id', userId).eq('status', 'pending'), // Assuming target_user_id, adjust if different
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('receiver_id', userId).eq('is_read', false)
      ];

      const [
        { count: postCount },
        { count: matchCount },
        { count: messageCount },
        { count: activeProjectsCount, error: activeProjectsError },
        { count: pendingRequestsCount, error: pendingRequestsError },
        { count: unreadMessagesCount, error: unreadMessagesError }
      ] = await Promise.all(countsPromises.map(p => p.then(response => ({ ...response, count: response.count || 0 }))));
      
      if (activeProjectsError) console.error('Error fetching active projects count:', activeProjectsError.message);
      if (pendingRequestsError) console.error('Error fetching pending requests count:', pendingRequestsError.message);
      if (unreadMessagesError) console.error('Error fetching unread messages count:', unreadMessagesError.message);
      
      setStats({
        postCount: postCount || 0,
        matchCount: matchCount || 0,
        messageCount: messageCount || 0,
        viewCount: 0, // viewCount is not fetched, keeping as 0
        activeProjectsCount: activeProjectsCount || 0,
        pendingRequestsCount: pendingRequestsCount || 0,
        unreadMessagesCount: unreadMessagesCount || 0
      });
      
      // Fetch detailed data
      const detailedDataPromises = [
        supabase
          .from('profile_matches')
          .select('*, matched_profile:profiles!profile_matches_matchee_user_id_fkey (*)')
          .eq('matcher_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('research_posts')
          .select('*, profiles (*)')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('user_notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(4) // Fetch 4 notifications for the activity feed
      ];

      const [
        { data: matchesData, error: matchesError },
        { data: postsData, error: postsError },
        { data: notificationsData, error: notificationsError }
      ] = await Promise.all(detailedDataPromises);
            
      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
      } else {
        setRecentMatches(matchesData as ProfileMatch[] || []);
      }
      
      if (postsError) {
        console.error('Error fetching recent posts:', postsError);
      } else {
        setRecentPosts(postsData as ResearchPostWithProfile[] || []);
      }

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
      } else {
        setRecentNotifications(notificationsData as UserNotification[] || []);
      }

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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-neutral-400 font-sans">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-black text-neutral-100 p-4 md:p-6 lg:p-8 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-heading text-white">Dashboard</h1>
        {profile?.first_name && (
          <p className="text-lg text-neutral-400 mt-1 font-sans">
            Welcome back, <span className="font-semibold text-neutral-200">{profile.first_name}</span>!
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1 space-y-6 md:space-y-8">
          <MyProfileSnapshot />
          <QuickActions />
        </div>

        <div className="lg:col-span-1 space-y-6 md:space-y-8">
          <ActivityFeed notifications={recentNotifications} />
          <CollaborationStatsDisplay stats={stats} />
        </div>
        
        <div className="lg:col-span-1 space-y-6 md:space-y-8">
          <DashboardCard title="Recent Research Posts" titleIcon={FiList}>
            {recentPosts.length > 0 ? (
              <div className="space-y-4">
                {recentPosts.map(post => (
                  <ResearchPostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-neutral-500">No recent posts to display.</p>
            )}
            <Link href="/research" className="block mt-4 text-sm text-accent-purple hover:text-accent-purple-hover font-sans hover:underline">View All Posts</Link>
          </DashboardCard>

          <DashboardCard title="Recent Matches" titleIcon={FiUsers}>
            {recentMatches.length > 0 ? (
              <ul className="space-y-3">
                {recentMatches.map(match => (
                  <li key={match.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-neutral-800 transition-colors">
                    <Avatar src={match.matched_profile?.avatar_url} alt={match.matched_profile?.full_name || 'User'} size="sm" fallback={<FiUser size={18}/>} />
                    <div>
                      <Link href={`/profile/${match.matchee_user_id}`} className="font-sans font-medium text-neutral-200 hover:underline">
                        {match.matched_profile?.full_name || 'Matched User'}
                      </Link>
                      <p className="text-xs text-neutral-500 font-sans">Matched on: {new Date(match.created_at).toLocaleDateString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-500">No recent matches yet.</p>
            )}
            <Link href="/collaborators" className="block mt-4 text-sm text-accent-purple hover:text-accent-purple-hover font-sans hover:underline">Find New Collaborators</Link>
          </DashboardCard>
        </div>
      </div>
    </motion.div>
  );
}