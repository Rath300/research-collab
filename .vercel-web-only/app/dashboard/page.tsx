'use client';

import React, { useEffect, useState } from 'react';
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
  FiBarChart2 
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getMatches, getResearchPosts, getProfileStats } from '@/lib/api';
import { Profile, ResearchPost, Match } from '@research-collab/db';
import { ResearchPostCard } from '@/components/research/ResearchPostCard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  
  const [stats, setStats] = useState({
    postCount: 0,
    matchCount: 0,
    messageCount: 0,
    viewCount: 0
  });
  
  const [recentMatches, setRecentMatches] = useState<(Match & { profiles: Profile })[]>([]);
  const [recentPosts, setRecentPosts] = useState<ResearchPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const loadDashboardData = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      
      // Get profile stats
      const profileStats = await getProfileStats(user.id);
      setStats(profileStats);
      
      // Get recent matches
      const matches = await getMatches(user.id, { limit: 3 });
      setRecentMatches(matches);
      
      // Get recent posts in feed
      const posts = await getResearchPosts({ limit: 3 });
      setRecentPosts(posts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);
  
  if (!user || !profile) {
    // Redirect to login if not authenticated
    router.push('/login');
    return null;
  }
  
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-1 dark:text-gray-400">
            Welcome back, {profile.first_name}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 space-x-2">
          <Button
            onClick={() => router.push('/research/new')}
            leftIcon={<FiPlus />}
          >
            New Post
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/collaborators')}
            leftIcon={<FiUsers />}
          >
            Find Collaborators
          </Button>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Research Posts</p>
                <h3 className="text-3xl font-bold mt-1">{stats.postCount}</h3>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <FiBarChart2 size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Collaborator Matches</p>
                <h3 className="text-3xl font-bold mt-1">{stats.matchCount}</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <FiUsers size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Messages</p>
                <h3 className="text-3xl font-bold mt-1">{stats.messageCount}</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <FiMessageSquare size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Profile Views</p>
                <h3 className="text-3xl font-bold mt-1">{stats.viewCount}</h3>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <FiTrendingUp size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Recent Matches</CardTitle>
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto text-sm font-medium text-primary-600 dark:text-primary-400"
                  onClick={() => router.push('/chats')}
                >
                  View All
                  <FiChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
                </div>
              ) : recentMatches.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentMatches.map((match) => {
                    // Get the other user's ID and profile
                    const otherUserId = match.user_id_1 === user.id ? match.user_id_2 : match.user_id_1;
                    const otherUserProfile = match.profiles;
                    const fullName = `${otherUserProfile.first_name} ${otherUserProfile.last_name}`;
                    
                    return (
                      <div 
                        key={match.id}
                        className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => router.push(`/chats?id=${otherUserId}`)}
                      >
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden mr-3">
                          {otherUserProfile.avatar_url ? (
                            <img 
                              src={otherUserProfile.avatar_url} 
                              alt={fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FiUsers className="text-primary-600" size={20} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{fullName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {otherUserProfile.institution || 'Researcher'}
                          </p>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="ml-2">
                          <FiMessageSquare size={18} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <FiUsers size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No matches yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => router.push('/collaborators')}
                  >
                    Find Collaborators
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Feed Posts */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Recent Research Posts</CardTitle>
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto text-sm font-medium text-primary-600 dark:text-primary-400"
                  onClick={() => router.push('/research')}
                >
                  View Feed
                  <FiChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
                </div>
              ) : recentPosts.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="p-4">
                      <ResearchPostCard 
                        post={post} 
                        onLike={() => {}} 
                        onBoost={() => {}}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <FiSearch size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No recent posts</p>
                  <Button 
                    className="mt-4"
                    onClick={() => router.push('/research/new')}
                  >
                    Create Post
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Upcoming Events */}
      <Card>
        <CardHeader className="px-6 pt-6 pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Upcoming Research Events</CardTitle>
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-sm font-medium text-primary-600 dark:text-primary-400"
              onClick={() => router.push('/events')}
            >
              View All
              <FiChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center py-8 px-4">
            <FiCalendar size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              No upcoming events at this time
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Check back later for conferences, workshops, and networking opportunities
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 