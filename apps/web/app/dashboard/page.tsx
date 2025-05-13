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
}

interface ResearchPostWithProfile extends ResearchPost {
  profiles: Profile;
}

function titleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const PlaceholderCard: React.FC<{ title?: string; icon?: React.ElementType; className?: string; children: React.ReactNode }> = 
  ({ title, icon: Icon, className = '', children }) => (
  <div className={`bg-neutral-950 p-4 md:p-6 rounded-lg shadow-md ${className}`}> 
    {(title || Icon) && (
      <div className="flex items-center mb-4">
        {Icon && <Icon className="w-5 h-5 text-neutral-500 mr-3" />}
        {title && <h3 className="text-md font-semibold text-neutral-100">{title}</h3>}
      </div>
    )}
    <div className="text-neutral-400 text-sm">
      {children}
    </div>
  </div>
);

const MyProfileSnapshot = () => {
  const { profile } = useAuthStore();
  const router = useRouter();
  const displayName = profile?.first_name 
    ? titleCase(`${profile.first_name} ${profile.last_name ?? ''}`.trim()) 
    : 'User';
  const displayAvatarUrl = profile?.avatar_url;
  const profileCompletion = 75;

  return (
    <PlaceholderCard title="Profile Status" icon={FiUser}>
      <div className="flex items-center space-x-4 mb-4">
        <Avatar src={displayAvatarUrl} alt={displayName} size='lg' fallback={<FiUser size={24}/>} />
        <div>
          <h4 className="text-lg font-semibold text-neutral-100">{displayName}</h4>
          <p className="text-xs text-neutral-500">Profile Completion: {profileCompletion}%</p> 
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="secondary" size="sm" onClick={() => router.push('/profile/me')}><FiUser className="mr-1"/> View</Button>
        <Button variant="outline" size="sm" onClick={() => router.push('/settings/account')}><FiEdit2 className="mr-1"/> Edit</Button>
      </div>
    </PlaceholderCard>
  );
};

const QuickStartActions = () => {
  const router = useRouter();
  return (
    <PlaceholderCard title="Quick Actions" icon={FiTarget}>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <Button variant="ghost" className="flex flex-col items-center h-20 justify-center text-center text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100" onClick={() => router.push('/discover')}>
          <FiSearch className="mb-1 w-6 h-6"/> Find Collaborators
        </Button>
        <Button variant="ghost" className="flex flex-col items-center h-20 justify-center text-center text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100" onClick={() => router.push('/projects/new')}>
          <FiFilePlus className="mb-1 w-6 h-6"/> New Project
        </Button>
        <Button variant="ghost" className="flex flex-col items-center h-20 justify-center text-center text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100" onClick={() => router.push('/chats')}>
          <FiMessageSquare className="mb-1 w-6 h-6"/> Messages
        </Button>
        <Button variant="ghost" className="flex flex-col items-center h-20 justify-center text-center text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100" onClick={() => router.push('/settings/account')}>
          <FiCheckSquare className="mb-1 w-6 h-6"/> Update Profile
        </Button>
      </div>
    </PlaceholderCard>
  );
};

const ActivityFeed = ({ hasActivity }: { hasActivity: boolean }) => {
  const router = useRouter();
  return (
    <PlaceholderCard title="Recent Activity" icon={FiActivity} className="min-h-[200px]">
      {hasActivity ? (
        <ul className="space-y-3">
          <li className="text-xs"><span className="font-semibold text-neutral-200">New Match:</span> Dr. Emily Carter</li>
          <li className="text-xs"><span className="font-semibold text-neutral-200">New Message:</span> Project Alpha Group</li>
          <li className="text-xs"><span className="font-semibold text-neutral-200">Collaboration Request:</span> Prof. Davis</li>
        </ul>
      ) : (
        <div className="text-center py-6">
          <p className="text-neutral-500 mb-3">No recent activity yet.</p>
          <Button variant="secondary" size="sm" onClick={() => router.push('/discover')}><FiSearch className="mr-1"/> Find Collaborators</Button>
        </div>
      )}
    </PlaceholderCard>
  );
};

const CollaborationStats = ({ hasStats }: { hasStats: boolean }) => {
  const router = useRouter();
  const stats = { projects: 2, requests: 1, messages: 5 };

  return (
    <PlaceholderCard title="Collaboration Stats" icon={FiTrendingUp}>
      {hasStats ? (
        <div className="space-y-2 mt-2">
          <p>Active Projects: <span className="font-semibold text-neutral-100">{stats.projects}</span></p>
          <p>Pending Requests: <span className="font-semibold text-neutral-100">{stats.requests}</span></p>
          <p>Unread Messages: <span className="font-semibold text-neutral-100">{stats.messages}</span></p>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-neutral-500 mb-3">Start collaborating to see your stats.</p>
          <Button variant="secondary" size="sm" onClick={() => router.push('/projects/new')}><FiFilePlus className="mr-1"/> Start a Project</Button>
        </div>
      )}
    </PlaceholderCard>
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

  const welcomeName = profile?.first_name || 'Researcher';

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <MyProfileSnapshot />
        </div>

        <div className="lg:col-span-1 space-y-6 md:space-y-8">
          <QuickStartActions />
          <CollaborationStats hasStats={hasStats} /> 
        </div>
      </div>
    </div>
  );
}