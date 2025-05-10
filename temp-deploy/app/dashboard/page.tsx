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
import { getBrowserClient } from '@/lib/supabase';
import { Profile, ResearchPost, Match } from '@/lib/schema';
import { ResearchPostCard } from '@/components/research/ResearchPostCard';
import { profiles, posts, matches } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, setUser } = useAuthStore();
  
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
      
      // Avoid any references to window during SSR
      if (typeof window === 'undefined') return;
      
      // Use profiles API methods
      const profileStats = await profiles.getStats(user.id);
      
      setStats({
        postCount: profileStats.postCount || 0,
        matchCount: profileStats.matchCount || 0,
        messageCount: profileStats.messageCount || 0,
        viewCount: profileStats.viewCount || 0
      });
      
      // Get recent matches - handle if getMatches doesn't exist
      let matchesData = [];
      try {
        // Use matches API instead of profiles
        matchesData = await matches.getMatches(user.id, { limit: 3 });
      } catch (matchError) {
        console.error('Error fetching matches:', matchError);
        matchesData = [];
      }
      
      if (matchesData && matchesData.length > 0) {
        // Transform match data to have a single profiles field
        const transformedMatches = matchesData.map(match => {
          const otherUser = match.user_id_1 === user.id ? match.user2 : match.user1;
          return {
            ...match,
            profiles: otherUser
          };
        });
        
        setRecentMatches(transformedMatches as unknown as (Match & { profiles: Profile })[]);
      }
      
      // Get recent posts in feed
      const recentPosts = await posts.getResearchPosts({ limit: 3 });
      
      if (recentPosts) {
        setRecentPosts(recentPosts as unknown as ResearchPost[]);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      // Check for auth directly
      const checkAuth = async () => {
        try {
          const supabase = getBrowserClient();
          
          // Check if we're coming from onboarding to avoid redirect loops
          const isFromOnboarding = localStorage.getItem('auth_dashboard_transition') === 'true';
          if (isFromOnboarding) {
            console.log('Coming from onboarding with transition flag');
            // Clear the flag
            localStorage.removeItem('auth_dashboard_transition');
            // Wait for potential auth to be established
            setTimeout(async () => {
              const { data } = await supabase.auth.getSession();
              if (data?.session?.user) {
                console.log('Found user after transition delay, setting in store');
                setUser(data.session.user);
              }
            }, 500);
            return;
          }
          
          // Standard auth check
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            console.log('Setting user from session check');
            setUser(sessionData.session.user);
          } else {
            // Use direct navigation instead of router to preserve cookies
            console.log('No session found, redirecting to login');
            window.location.href = `/login?redirectTo=${encodeURIComponent('/dashboard')}`;
          }
        } catch (error) {
          console.error('Error checking auth:', error);
        }
      };
      
      checkAuth();
    }
  }, [user, setUser]);
  
  // Different approach to auth protection - don't redirect immediately
  // Instead show a message that auto-redirects
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="large" />
        <h2 className="mt-4 text-xl font-medium">Checking authentication...</h2>
        <p className="mt-2 text-sm text-gray-500">If you're not redirected within a few seconds, <a href="/login" className="text-primary-600 hover:underline">click here to log in</a>.</p>
      </div>
    );
  }
  
  // Separate check for profile to avoid undefined access
  if (!profile) {
    console.log('User has no profile, creating minimal profile...');
    // For guest users that might not have a profile, create a minimal one to avoid UI errors
    const minimalProfile = {
      id: user.id,
      user_id: user.id,
      first_name: user.user_metadata?.first_name || 'Guest',
      last_name: user.user_metadata?.last_name || 'User',
      avatar_url: null,
    };
    
    // No need to return null here, just use the minimal profile
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500 mt-1 dark:text-gray-400">
              Welcome, {minimalProfile.first_name}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 space-x-2">
            <Button
              onClick={() => router.push('/research/new')}
            >
              <FiPlus className="mr-2" />
              New Post
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/collaborators')}
            >
              <FiUsers className="mr-2" />
              Find Collaborators
            </Button>
          </div>
        </div>
        
        <Card className="p-6 mb-8">
          <p>It looks like your profile information is incomplete. Please visit your profile settings to add your details.</p>
          <Button
            className="mt-4"
            onClick={() => router.push('/profile/edit')}
          >
            Complete Profile
          </Button>
        </Card>
        
        {/* Stats Section with default values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Research Posts</p>
                  <h3 className="text-3xl font-bold mt-1">0</h3>
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
                  <h3 className="text-3xl font-bold mt-1">0</h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <FiUsers size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
          >
            <FiPlus className="mr-2" />
            New Post
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push('/collaborators')}
          >
            <FiUsers className="mr-2" />
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
              ) : recentPosts.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="p-4">
                      <ResearchPostCard post={post} onClick={() => router.push(`/research/${post.id}`)} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <FiSearch size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No research posts yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => router.push('/research/new')}
                  >
                    Create a Post
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center"
              onClick={() => router.push('/profile/edit')}
            >
              <FiUsers size={24} className="mb-2" />
              <span>Update Profile</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center"
              onClick={() => router.push('/research/new')}
            >
              <FiPlus size={24} className="mb-2" />
              <span>Add Research</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center"
              onClick={() => router.push('/collaborators')}
            >
              <FiSearch size={24} className="mb-2" />
              <span>Find Collaborators</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
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
            
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center justify-center"
              onClick={() => router.push('/collaborators')}
            >
              <FiSearch size={24} className="mb-2" />
              <span>Find Collaborators</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
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