"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

type Message = Database['public']['Tables']['messages']['Row'];

interface DashboardStats {
  postCount: number;
  matchCount: number;
  messageCount: number;
  viewCount: number;
  activeProjects?: number;
  pendingRequests?: number;
  unreadMessagesCount?: number;
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
  <div className={`bg-neutral-900 p-5 md:p-6 rounded-xl shadow-lg border border-neutral-800 ${className}`}> 
    {(title || TitleIconProp) && (
      <div className="flex items-center mb-4">
        {TitleIconProp && <TitleIconProp className="w-6 h-6 text-neutral-400 mr-3" />}
        {title && <h3 className="text-xl font-semibold text-neutral-100">{title}</h3>}
      </div>
    )}
    <div>
      {children}
    </div>
  </div>
);

const MyProfileSnapshot = () => {
  const { profile } = useAuthStore();
  const router = useRouter();
  const displayName = profile?.full_name || (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.first_name) || 'User';
  const displayAvatarUrl = profile?.avatar_url;

  return (
    <DashboardCard title="Profile Status" titleIcon={FiUser} className="mb-6 md:mb-8">
      <div className="flex items-center space-x-4 mb-4">
        <Avatar src={displayAvatarUrl} alt={displayName} size='lg' fallback={<FiUser size={24}/>} />
        <div>
          <h4 className="text-lg font-semibold text-neutral-100 truncate max-w-xs">{displayName}</h4>
          <Link href={profile?.id ? `/profile/${profile.id}` : '/settings/account'} className="text-sm text-blue-400 hover:underline">
            View Profile
          </Link>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="secondary" size="sm" onClick={() => router.push(profile?.id ? `/profile/${profile.id}` : '/settings/account')}><FiUser className="mr-1"/> View Full</Button>
        <Button variant="outline" size="sm" onClick={() => router.push('/settings/account')}><FiEdit2 className="mr-1"/> Edit Profile</Button>
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
            className="flex flex-col items-center justify-center p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors aspect-square"
          >
            <action.icon className="w-7 h-7 text-neutral-300 mb-2" />
            <span className="text-sm text-neutral-200 text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </DashboardCard>
  );
};

const ActivityFeed = () => {
  const router = useRouter();
  const activities = [
    { text: "New Match: Dr. Emily Carter", time: "2h ago" },
    { text: "New Message: Project Alpha Group", time: "5h ago" },
    { text: "Collaboration Request: Prof. Davis", time: "1d ago" },
  ];
  const hasActualActivity = activities.length > 0;

  return (
    <DashboardCard title="Recent Activity" titleIcon={FiActivity} className="min-h-[200px] mb-6 md:mb-8">
      {hasActualActivity ? (
        <ul className="space-y-3">
          {activities.map((activity, index) => (
            <li key={index} className="text-sm text-neutral-400">
              {activity.text} - <span className="text-xs text-neutral-500">{activity.time}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6">
          <p className="text-neutral-500 mb-3">No recent activity yet.</p>
          <Button variant="secondary" size="sm" onClick={() => router.push('/discover')}><FiSearch className="mr-1"/> Find Collaborators</Button>
        </div>
      )}
    </DashboardCard>
  );
};

const CollaborationStatsDisplay = () => {
  const stats = {
    activeProjects: 2,
    pendingRequests: 1,
    unreadMessages: 5,
  };

  return (
    <DashboardCard title="Collaboration Stats" titleIcon={FiTrendingUp} className="mb-6 md:mb-8">
      <div className="space-y-3 text-neutral-300">
        <p className="flex justify-between text-md">Active Projects: <span className="font-bold text-neutral-100">{stats.activeProjects}</span></p>
        <p className="flex justify-between text-md">Pending Requests: <span className="font-bold text-neutral-100">{stats.pendingRequests}</span></p>
        <p className="flex justify-between text-md">Unread Messages: <span className="font-bold text-neutral-100">{stats.unreadMessages}</span></p>
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
    viewCount: 0
  });
  
  const [recentMatches, setRecentMatches] = useState<ProfileMatch[]>([]);
  const [recentPosts, setRecentPosts] = useState<ResearchPostWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActivity, setHasActivity] = useState(true);
  const [hasStats, setHasStats] = useState(true);

  const supabase = getBrowserClient();
  
  const loadDashboardData = useCallback(async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      
      const [
        { count: postCount },
        { count: matchCount },
        { count: messageCount }
      ] = await Promise.all([
        supabase
          .from('research_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('profile_matches')
          .select('*', { count: 'exact', head: true })
          .eq('matcher_user_id', user.id),
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      ]);
      
      setStats({
        postCount: postCount || 0,
        matchCount: matchCount || 0,
        messageCount: messageCount || 0,
        viewCount: 0
      });
      
      const { data: matchesData, error: matchesError } = await supabase
        .from('profile_matches')
        .select(`
          *,
          matched_profile:profiles!profile_matches_matchee_user_id_fkey (*)
        `)
        .eq('matcher_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
      } else {
        setRecentMatches(matchesData as ProfileMatch[]);
      }
      
      const { data: postsData, error: postsError } = await supabase
        .from('research_posts')
        .select(`
          *,
          profiles:user_id (*)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (postsError) {
        console.error('Error fetching posts:', postsError);
      } else {
        setRecentPosts(postsData as ResearchPostWithProfile[] || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);
  
  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      router.push('/login');
    }
  }, [user, loadDashboardData, router]);
  
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('DashboardPage: No user found, redirecting to login.');
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false);
    }
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
        <p className="text-neutral-400">Loading Dashboard...</p>
        </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
        <p className="text-neutral-400">Redirecting to login...</p>
      </div>
    );
  }

  const welcomeName = profile?.full_name || (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.first_name) || "Explorer";

  return (
    <div className="space-y-8 p-1">
      <h1 className="text-3xl font-bold text-neutral-100">Welcome back, {welcomeName}!</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <QuickActions />
          <ActivityFeed /> 
        </div>

        <div className="space-y-6 md:space-y-8">
          <MyProfileSnapshot />
          <CollaborationStatsDisplay />
        </div>
      </div>
    </div>
  );
}