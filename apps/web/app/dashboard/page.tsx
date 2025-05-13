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
  FiUser
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

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
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
    } else if (!isLoading) {
      router.push('/login');
    }
  }, [user, isLoading, loadDashboardData, router]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Research Posts</p>
                <h3 className="text-2xl font-bold mt-2">{stats.postCount}</h3>
              </div>
              <div className="bg-primary-100 p-3 rounded-full dark:bg-primary-900/30">
                <FiBookmark className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Matches</p>
                <h3 className="text-2xl font-bold mt-2">{stats.matchCount}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full dark:bg-green-900/30">
                <FiUsers className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages</p>
                <h3 className="text-2xl font-bold mt-2">{stats.messageCount}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full dark:bg-blue-900/30">
                <FiMessageSquare className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profile Views</p>
                <h3 className="text-2xl font-bold mt-2">{stats.viewCount}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full dark:bg-purple-900/30">
                <FiBarChart2 className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Posts</CardTitle>
              <Button variant="ghost" onClick={() => router.push('/research')}>
                View All <FiChevronRight className="ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentPosts.length > 0 ? (
                recentPosts.map((post) => (
                  <ResearchPostCard
                    key={post.id}
                    post={post}
                    onLike={() => {}}
                    onBoost={() => {}}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No research posts yet</p>
                  <Button onClick={() => router.push('/research/new')}>
                    <FiPlus className="mr-2" /> Create Post
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Matches</CardTitle>
              <Button variant="ghost" onClick={() => router.push('/collaborators')}>
                View All <FiChevronRight className="ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMatches.length > 0 ? (
                recentMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar
                        src={match.matched_profile.avatar_url}
                        alt={`${match.matched_profile.first_name} ${match.matched_profile.last_name}`}
                        size="md"
                        fallback={<FiUser className="text-gray-400" size={24} />}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {match.matched_profile.first_name} {match.matched_profile.last_name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {match.matched_profile.title || match.matched_profile.institution || 'Researcher'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => router.push(`/profile/${match.matched_profile.id}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No matches yet</p>
                  <Button onClick={() => router.push('/discover')}>
                    <FiSearch className="mr-2" /> Find Collaborators
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}