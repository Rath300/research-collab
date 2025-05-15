"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ResearchPostCard } from '@/components/research/ResearchPostCard';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { 
  FiUser, 
  FiMapPin, 
  FiMail, 
  FiLink, 
  FiUsers, 
  FiBookmark, 
  FiCalendar,
  FiGlobe,
  FiClock,
  FiTarget,
  FiPlus,
  FiLoader,
  FiAlertTriangle,
  FiEdit
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getBrowserClient } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { cn } from '@/lib/utils';

type ResearchPost = Database['public']['Tables']['research_posts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ResearchPostWithProfile extends ResearchPost {
  profiles: Profile;
}

interface TabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isCollapsed?: boolean;
}

function TabComponent({ active, onClick, children }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pb-3 text-sm font-medium transition-colors duration-150 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-accent-purple",
        active
          ? 'border-b-2 border-accent-purple text-accent-purple'
          : 'border-b-2 border-transparent text-neutral-400 hover:text-neutral-100 hover:border-neutral-500'
      )}
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
  const isOwnProfile = user?.id === userId || (userId === 'me' && user);
  const actualUserId = userId === 'me' ? user?.id : userId;

  const supabase = getBrowserClient();
  
  const loadProfileData = useCallback(async () => {
    if (!actualUserId) {
      setError('User ID not available.');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', actualUserId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      
      const { data: userPosts, error: postsError } = await supabase
        .from('research_posts')
        .select('*, profiles:user_id(*)')
        .eq('user_id', actualUserId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(userPosts as ResearchPostWithProfile[] || []);
      
      if (user && !isOwnProfile && actualUserId) {
        setIsMatchLoading(true);
        const { data: matchData, error: matchError } = await supabase
          .from('profile_matches')
          .select('*')
          .eq('matcher_user_id', user.id)
          .eq('matchee_user_id', actualUserId)
          .maybeSingle();

        if (matchError && matchError.code !== 'PGRST116') {
          console.error('Match check error:', matchError);
        }
        setIsMatched(!!matchData);
        setIsMatchLoading(false);
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile data.');
      setProfile(null);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [actualUserId, supabase, user, isOwnProfile]);
  
  useEffect(() => {
    if (userId === 'me' && !user?.id) {
      if (!isLoading && !error) setIsLoading(true);
      return;
    }
    loadProfileData();
  }, [userId, user?.id, loadProfileData, isLoading, error]);
  
  const handleConnect = async () => {
    if (!user || isOwnProfile || !actualUserId) return;
    
    setIsMatchLoading(true);
    try {
      const { error: matchError } = await supabase
        .from('profile_matches')
        .insert({
          matcher_user_id: user.id,
          matchee_user_id: actualUserId,
          status: 'matched'
        });

      if (matchError) throw matchError;
      setIsMatched(true);
    } catch (err: any) {
      console.error('Error connecting:', err);
      setError(err.message || 'Failed to send connection request.');
    } finally {
      setIsMatchLoading(false);
    }
  };
  
  if (isLoading || (userId === 'me' && !user)) {
    return (
      <div className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center text-neutral-100 p-6">
        <FiLoader className="animate-spin text-accent-purple text-5xl mb-4" />
        <p className="text-neutral-400">Loading profile...</p>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center text-neutral-100 p-6 text-center">
        <FiAlertTriangle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-heading text-neutral-100 mb-2">Profile Not Found</h1>
        <p className="text-neutral-400 mb-6">{error || 'The requested profile could not be found or loaded.'}</p>
        <Button variant="secondary" onClick={() => router.push('/discover')}>Back to Discover</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <Card className="bg-neutral-900 border border-neutral-800 shadow-xl overflow-hidden rounded-lg">
        <div className="h-40 md:h-48 bg-neutral-800" />

        <div className="px-6 sm:px-8 pb-8">
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-16 sm:-mt-20">
            <Avatar 
              src={profile.avatar_url} 
              alt={`${profile.first_name} ${profile.last_name}`}
              className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-neutral-900 bg-neutral-700 text-4xl flex-shrink-0 text-neutral-400"
              fallback={`${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase() || <FiUser size={60}/>}
            />
            <div className="mt-4 sm:mt-0 flex-grow min-w-0 pt-10 sm:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-100 truncate">
                    {profile.first_name || ''} {profile.last_name || ''}
                  </h1>
                  <p className="text-sm text-neutral-400 truncate">{profile.title || 'Research Enthusiast'}</p>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 flex space-x-2">
                  {isOwnProfile ? (
                    <Button variant="outline" size="sm" onClick={() => router.push('/settings/account')} className="font-sans">
                      <FiEdit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleConnect}
                        disabled={isMatched || isMatchLoading}
                        variant={isMatched ? "secondary" : "primary"}
                        size="sm"
                        className="font-sans"
                      >
                        {isMatchLoading ? (
                          <FiLoader className="animate-spin mr-2 h-4 w-4" />
                        ) : isMatched ? (
                          <FiUsers className="mr-2 h-4 w-4" />
                        ) : (
                          <FiUsers className="mr-2 h-4 w-4" />
                        )}
                        {isMatchLoading ? 'Connecting...' : isMatched ? 'Connected' : 'Connect'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-b border-neutral-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <TabComponent
                active={activeTab === 'posts'}
                onClick={() => setActiveTab('posts')}
              >
                Research Posts
              </TabComponent>
              <TabComponent
                active={activeTab === 'about'}
                onClick={() => setActiveTab('about')}
              >
                About
              </TabComponent>
            </nav>
          </div>

          <div className="mt-8">
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <ResearchPostCard
                      key={post.id}
                      post={post}
                    />
                  ))
                ) : (
                  <Card className="bg-neutral-800/50 border border-neutral-700 text-center py-12 shadow-md rounded-lg">
                    <CardContent className="flex flex-col items-center">
                      <FiBookmark size={32} className="text-neutral-500 mb-3" />
                      <h3 className="text-lg font-semibold text-neutral-100 mb-1">No Research Posts Yet</h3>
                      <p className="text-sm text-neutral-400 mb-4">This user hasn't shared any research posts.</p>
                      {isOwnProfile && (
                        <Button variant="primary" size="sm" onClick={() => router.push('/projects/new')} className="font-sans">
                          <FiPlus className="mr-2 h-4 w-4" /> Create First Post
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            {activeTab === 'about' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-neutral-800/50 border border-neutral-700 rounded-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-heading text-neutral-100 flex items-center">
                      <FiBookmark className="mr-2 text-accent-purple"/>Research Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.interests && profile.interests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest) => (
                          <span
                            key={interest}
                            className="bg-accent-purple/20 text-accent-purple px-3 py-1.5 rounded-full text-xs font-sans shadow-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400">No research interests specified.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-neutral-800/50 border border-neutral-700 rounded-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-heading text-neutral-100 flex items-center">
                      <FiUser className="mr-2 text-accent-purple"/>Bio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {profile.bio || 'No bio provided.'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-neutral-800/50 border border-neutral-700 rounded-lg md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg font-heading text-neutral-100 flex items-center">
                      <FiLink className="mr-2 text-accent-purple"/>Contact & Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {profile.email && (
                      <div className="flex items-center text-neutral-300">
                        <FiMail className="text-neutral-500 mr-3 flex-shrink-0" size={16} />
                        <a href={`mailto:${profile.email}`} className="hover:text-accent-purple transition-colors break-all">
                          {profile.email}
                        </a>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center text-neutral-300">
                        <FiLink className="text-neutral-500 mr-3 flex-shrink-0" size={16} />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-accent-purple transition-colors break-all">
                          {profile.website}
                        </a>
                      </div>
                    )}
                     {profile.location && (
                      <div className="flex items-center text-neutral-300">
                        <FiMapPin className="text-neutral-500 mr-3 flex-shrink-0" size={16} />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.institution && (
                      <div className="flex items-center text-neutral-300">
                        <FiGlobe className="text-neutral-500 mr-3 flex-shrink-0" size={16} />
                        <span>{profile.institution}</span>
                      </div>
                    )}
                    {profile.availability_hours !== null && profile.availability_hours !== undefined && (
                      <div className="flex items-center text-neutral-300">
                        <FiClock className="text-neutral-500 mr-3 flex-shrink-0" size={16} />
                        <span>Available {profile.availability_hours} hours/week</span>
                      </div>
                    )}
                    {profile.project_preference && (
                      <div className="flex items-center text-neutral-300">
                        <FiTarget className="text-neutral-500 mr-3 flex-shrink-0" size={16} />
                        <span className="capitalize">{profile.project_preference} projects</span>
                      </div>
                    )}
                    {profile.created_at && (
                      <div className="flex items-center text-neutral-300">
                        <FiCalendar className="text-neutral-500 mr-3 flex-shrink-0" size={16} />
                        <span>Joined on {new Date(profile.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 