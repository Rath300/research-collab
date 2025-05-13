"use client";

import React, { useEffect, useState, useCallback } from 'react';
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
  FiInfo
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

const PlaceholderCard: React.FC<{ title: string; icon: React.ElementType; className?: string; children?: React.ReactNode }> = 
  ({ title, icon: Icon, className = '', children }) => (
  <div className={`bg-neutral-800 p-4 md:p-6 rounded-lg shadow-md ${className}`}> 
    <div className="flex items-center mb-4">
      <Icon className="w-5 h-5 text-neutral-400 mr-3" />
      <h3 className="text-md font-semibold text-neutral-200">{title}</h3>
    </div>
    <div className="text-neutral-300 text-sm">
      {children || <p>Placeholder content for {title}.</p>}
    </div>
  </div>
);

const EnergyGraphPlaceholder = () => <PlaceholderCard title="Total Energy Consumption" icon={FiBarChart2} className="h-64 md:h-80">Graph Area</PlaceholderCard>;
const GreenConnectionsPlaceholder = () => <PlaceholderCard title="Green Connections" icon={FiMapPin} className="h-64 md:h-80">Map Area</PlaceholderCard>;
const RecommendationsPlaceholder = () => <PlaceholderCard title="Recommendations" icon={FiList}>Recommendation List</PlaceholderCard>;
const TrackingPlaceholder = () => <PlaceholderCard title="Tracking" icon={FiTrendingUp}>Device/Usage List</PlaceholderCard>;
const GreenEnergyUsagePlaceholder = () => <PlaceholderCard title="Green Energy Usage" icon={FiTrendingUp}>Stats Area</PlaceholderCard>;

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

  const supabase = getBrowserClient();
  
  const loadDashboardData = useCallback(async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      
      // Get profile stats
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
        viewCount: 0 // TODO: Implement view count
      });
      
      // Get recent matches with full profile data
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
      
      // Get recent posts in feed
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
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <p className="text-neutral-400">Loading Dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <p className="text-neutral-400">Redirecting to login...</p>
      </div>
    );
  }

  const welcomeName = profile?.first_name || 'Researcher';

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-100">Welcome back, {welcomeName}!</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2 lg:col-span-2">
          <EnergyGraphPlaceholder />
        </div>
        <div className="lg:col-span-1">
          <RecommendationsPlaceholder />
        </div>
        
        <div className="lg:col-span-1">
          <TrackingPlaceholder />
        </div>
         <div className="md:col-span-2 lg:col-span-2">
           <GreenConnectionsPlaceholder />
         </div>

         <div className="lg:col-span-1">
           <GreenEnergyUsagePlaceholder />
         </div>
         <div className="md:col-span-2 lg:col-span-2 flex items-end">
           <PlaceholderCard title="Reports" icon={FiInfo}>
             <Button variant="secondary" size="sm" className="mt-4">View Detailed Report</Button>
           </PlaceholderCard>
         </div>
      </div>
    </div>
  );
}