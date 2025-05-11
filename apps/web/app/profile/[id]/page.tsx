"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tab } from '@/components/ui/Tab';
import { ResearchPostCard } from '@/components/research/ResearchPostCard';
import { Avatar } from '@/components/ui/Avatar';
import { 
  FiUser, 
  FiMapPin, 
  FiMail, 
  FiLink, 
  FiMessageSquare, 
  FiUsers, 
  FiEdit, 
  FiBookmark, 
  FiCalendar,
  FiGlobe,
  FiClock,
  FiTarget
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/lib/database.types';

type ResearchPost = Database['public']['Tables']['research_posts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ResearchPostWithProfile extends ResearchPost {
  profiles: Profile;
}

interface TabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabComponent({ active, onClick, children }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 text-sm font-medium border-b-2 ${
        active
          ? 'text-primary-600 border-primary-600'
          : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<ResearchPostWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isMatched, setIsMatched] = useState(false);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  
  const userId = params?.id as string;
  const isOwnProfile = user?.id === userId;

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const loadProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }
      
      setProfile(profileData);
      
      // Get user's research posts
      const { data: userPosts, error: postsError } = await supabase
        .from('research_posts')
        .select('*, profiles:user_id (*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) {
        throw postsError;
      }
      
      setPosts(userPosts as ResearchPostWithProfile[] || []);
      
      // Check if already matched (if not own profile)
      if (user && !isOwnProfile) {
        const { data: matchData, error: matchError } = await supabase
          .from('profile_matches')
          .select('*')
          .eq('matcher_user_id', user.id)
          .eq('matchee_user_id', userId)
          .single();

        if (matchError && matchError.code !== 'PGRST116') {
          throw matchError;
        }

        setIsMatched(!!matchData);
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase, user, isOwnProfile]);
  
  useEffect(() => {
    loadProfileData();
  }, [userId, loadProfileData]);
  
  const handleConnect = async () => {
    if (!user || isOwnProfile) return;
    
    try {
      setIsMatchLoading(true);
      
      const { error: matchError } = await supabase
        .from('profile_matches')
        .insert({
          matcher_user_id: user.id,
          matchee_user_id: userId,
          status: 'matched'
        });

      if (matchError) {
        throw matchError;
      }

      setIsMatched(true);
    } catch (err) {
      console.error('Error connecting:', err);
    } finally {
      setIsMatchLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
        <FiUser size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'The requested profile could not be found'}</p>
        <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-400">
          <div className="absolute -bottom-16 left-8">
            <div className="h-32 w-32 rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-700 overflow-hidden">
              <Avatar 
                src={profile.avatar_url} 
                alt={`${profile.first_name} ${profile.last_name}`}
                size="xl"
                fallback={<FiUser className="text-gray-400" size={64} />}
              />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">{profile.title || 'No title'}</p>
            </div>
            
            {!isOwnProfile && (
              <Button
                onClick={handleConnect}
                disabled={isMatched || isMatchLoading}
                className="flex items-center"
              >
                {isMatchLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : isMatched ? (
                  <>
                    <FiUsers className="mr-2" />
                    Connected
                  </>
                ) : (
                  <>
                    <FiUsers className="mr-2" />
                    Connect
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex space-x-8">
              <TabComponent
                active={activeTab === 'posts'}
                onClick={() => setActiveTab('posts')}
              >
                Posts
              </TabComponent>
              <TabComponent
                active={activeTab === 'about'}
                onClick={() => setActiveTab('about')}
              >
                About
              </TabComponent>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'posts' ? (
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <ResearchPostCard
                    key={post.id}
                    post={post}
                    onLike={() => {}}
                    onBoost={() => {}}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
                  <FiBookmark size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No research posts yet</p>
                  {isOwnProfile && (
                    <Button className="mt-4" onClick={() => router.push('/research/new')}>
                      Create Post
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>Research Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.interests && profile.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <div
                          key={interest}
                          className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center dark:bg-primary-900/30 dark:text-primary-300"
                        >
                          <FiBookmark className="mr-1" size={14} />
                          {interest}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No research interests specified</p>
                  )}
                </CardContent>
              </Card>

              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.email && (
                    <div className="flex items-center">
                      <FiMail className="text-gray-400 mr-2" />
                      <a href={`mailto:${profile.email}`} className="text-primary-600 hover:underline">
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center">
                      <FiLink className="text-gray-400 mr-2" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center">
                      <FiMapPin className="text-gray-400 mr-2" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.institution && (
                    <div className="flex items-center">
                      <FiGlobe className="text-gray-400 mr-2" />
                      <span>{profile.institution}</span>
                    </div>
                  )}
                  {profile.availability_hours && (
                    <div className="flex items-center">
                      <FiClock className="text-gray-400 mr-2" />
                      <span>{profile.availability_hours} hours/week</span>
                    </div>
                  )}
                  {profile.project_preference && (
                    <div className="flex items-center">
                      <FiTarget className="text-gray-400 mr-2" />
                      <span className="capitalize">{profile.project_preference} projects</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 