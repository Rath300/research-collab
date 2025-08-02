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
  FiEdit,
  FiMessageSquare
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { cn } from '@/lib/utils';

type Project = Database['public']['Tables']['projects']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProjectWithProfile extends Project {
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
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-accent-primary",
        active
          ? 'border-b-2 border-accent-primary text-accent-primary'
          : 'border-b-2 border-transparent text-text-secondary hover:text-text-primary hover:border-border-medium'
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
  const [projects, setProjects] = useState<ProjectWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isMatched, setIsMatched] = useState(false);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  
  const userId = params?.id as string;
  const isOwnProfile = user?.id === userId || (userId === 'me' && user);
  const actualUserId = userId === 'me' ? user?.id : userId;

  // supabase is already imported as a singleton
  
  const loadProfileData = useCallback(async () => {
    if (!actualUserId) {
      setError('User ID not available for profile lookup.');
      setIsLoading(false);
      return;
    }

    console.log(`[ProfilePage] Loading data for actualUserId: ${actualUserId}`);
    setIsLoading(true);
    setError('');
    setProfile(null);
    setProjects([]);

    try {
      const profileQuery = supabase.from('profiles').select('*').eq('id', actualUserId).single();
      const projectsQuery = supabase.from('projects').select('*').eq('leader_id', actualUserId).order('created_at', { ascending: false });
      
      // Explicitly define the type for the array elements if needed, or let map infer.
      const queries: any[] = [profileQuery, projectsQuery];
      let fetchMatchStatus = false;

      if (user && !isOwnProfile) {
        queries.push(supabase.from('profile_matches').select('*').eq('matcher_user_id', user.id).eq('matchee_user_id', actualUserId).maybeSingle());
        fetchMatchStatus = true;
      }

      // Ensure all elements are treated as Promises by TypeScript for Promise.allSettled
      // Each query builder from Supabase is a "thenable", which Promise.allSettled can handle.
      const results = await Promise.allSettled(queries);

      let fetchedProfile: Profile | null = null;
      let fetchedProjects: ProjectWithProfile[] = [];
      let combinedErrorMessages = [];

      const profileResult = results[0];
      if (profileResult.status === 'fulfilled' && profileResult.value && !profileResult.value.error) {
        fetchedProfile = profileResult.value.data as Profile;
        // Normalize potentially null/undefined array fields to empty arrays
        if (fetchedProfile) {
          fetchedProfile.interests = fetchedProfile.interests || [];
          // Ensure skills and looking_for are also initialized if they exist on the Profile type
          // and are intended to be arrays. This assumes they follow a similar pattern.
          if ('skills' in fetchedProfile && typeof fetchedProfile.skills === 'undefined') {
            fetchedProfile.skills = [];
          } else if ('skills' in fetchedProfile && fetchedProfile.skills === null) {
             fetchedProfile.skills = [];
          }

          if ('looking_for' in fetchedProfile && typeof fetchedProfile.looking_for === 'undefined') {
            fetchedProfile.looking_for = [];
          } else if ('looking_for' in fetchedProfile && fetchedProfile.looking_for === null) {
            fetchedProfile.looking_for = [];
          }
        }
      } else {
        const errorMsg = profileResult.status === 'rejected' 
          ? profileResult.reason?.message 
          : profileResult.value?.error?.message;
        combinedErrorMessages.push(`Profile: ${errorMsg || 'Failed to load'}`);
        console.error('Error fetching profile:', profileResult.status === 'rejected' ? profileResult.reason : profileResult.value?.error);
      }

      const projectsResult = results[1];
      if (projectsResult.status === 'fulfilled' && projectsResult.value && !projectsResult.value.error) {
        fetchedProjects = (projectsResult.value.data as ProjectWithProfile[]) || [];
      } else {
        const errorMsg = projectsResult.status === 'rejected' 
          ? projectsResult.reason?.message 
          : projectsResult.value?.error?.message;
        combinedErrorMessages.push(`Projects: ${errorMsg || 'Failed to load'}`);
        console.error('Error fetching projects:', projectsResult.status === 'rejected' ? projectsResult.reason : projectsResult.value?.error);
      }

      if (fetchMatchStatus && results[2]) {
        const matchResult = results[2];
        if (matchResult.status === 'fulfilled' && matchResult.value) {
            if (!matchResult.value.error) {
                setIsMatched(!!matchResult.value.data);
            } else if (matchResult.value.error && matchResult.value.error.code !== 'PGRST116') { 
                const errorMsg = matchResult.value.error?.message;
                combinedErrorMessages.push(`Match status: ${errorMsg || 'Failed to load'}`);
                console.error('Error checking match status:', matchResult.value.error);
            }
        } else if (matchResult.status === 'rejected'){
            const errorMsg = matchResult.reason?.message;
            combinedErrorMessages.push(`Match status (rejected): ${errorMsg || 'Failed to load'}`);
            console.error('Error checking match status (rejected promise):', matchResult.reason);
        }
      }
      
      setProfile(fetchedProfile);
      setProjects(fetchedProjects);

      if (combinedErrorMessages.length > 0) {
        setError(combinedErrorMessages.join('; '));
      }

    } catch (err: any) {
      console.error('Critical error in loadProfileData:', err);
      setError(err.message || 'An unexpected error occurred while loading profile data.');
      setProfile(null);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [actualUserId, supabase, user, isOwnProfile]);
  
  useEffect(() => {
    if (actualUserId) {
        console.log(`[ProfilePage] useEffect triggered for loadProfileData. actualUserId: ${actualUserId}`);
        loadProfileData();
    } else if (userId === 'me' && !user && !useAuthStore.getState().isLoading) {
        console.warn('[ProfilePage] Waiting for user session for /profile/me');
        setError('Authenticating user session...');
        setIsLoading(true);
    } else if (!actualUserId && !useAuthStore.getState().isLoading) {
      setError('User profile cannot be determined.');
      setIsLoading(false);
    }
  }, [actualUserId, loadProfileData, userId, user]);
  
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
      setError(err.message || 'Failed to connect.');
    } finally {
      setIsMatchLoading(false);
    }
  };
  
  if (isLoading || (userId === 'me' && !user && !error)) {
    return (
      <div className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center text-neutral-100 p-6">
        <FiLoader className="animate-spin text-accent-purple text-5xl mb-4" />
        <p className="text-neutral-400">Loading profile...</p>
      </div>
    );
  }
  
  if (!profile && error) { // Show error page if there's an error AND profile is not loaded
    return (
      <div className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center text-neutral-100 p-6 text-center">
        <FiAlertTriangle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-heading text-neutral-100 mb-2">Profile Error</h1>
        <p className="text-neutral-400 mb-6">{error || 'The requested profile could not be found or an error occurred.'}</p>
        <Button variant="secondary" onClick={() => router.push('/discover')}>Back to Discover</Button>
      </div>
    );
  }

  if (!profile && !isLoading) { // If not loading, and no specific error message, but profile is null
    return (
      <div className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center text-neutral-100 p-6 text-center">
        <FiAlertTriangle size={48} className="text-yellow-500 mb-4" />
        <h1 className="text-2xl font-heading text-neutral-100 mb-2">Profile Unavailable</h1>
        <p className="text-neutral-400 mb-6">This profile could not be loaded. It may not exist or there was a temporary issue.</p>
        <Button variant="secondary" onClick={() => router.push('/discover')}>Back to Discover</Button>
      </div>
    );
  }
 
  if (!profile) { // Final fallback if profile is still null after loading and error checks
    return (
        <div className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center text-neutral-100 p-6">
            <FiLoader className="animate-spin text-accent-purple text-5xl mb-4" />
            <p className="text-neutral-400">Preparing profile data...</p>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <Card className="bg-white border border-border-light shadow-xl overflow-hidden rounded-lg">
        <div className="h-40 md:h-48 bg-gray-100" />

        <div className="px-6 sm:px-8 pb-8">
          <div className="relative flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-16 sm:-mt-20">
            <Avatar 
              src={profile.avatar_url} 
              alt={`${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
              className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white bg-text-secondary/10 text-4xl flex-shrink-0 text-text-secondary"
            />
            <div className="mt-4 sm:mt-0 flex-grow min-w-0 pt-10 sm:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary truncate">
                    {profile.first_name || ''} {profile.last_name || ''}
                  </h1>
                  <p className="text-sm text-text-secondary truncate">{profile.title || 'Research Enthusiast'}</p>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 flex space-x-2">
                  {isOwnProfile ? (
                    <Button variant="outline" size="sm" onClick={() => router.push('/settings')} className="font-sans">
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
                      {isMatched && (
                        <Button variant="primary" size="sm" onClick={() => router.push(`/chats?userId=${actualUserId}`)} className="font-sans">
                            <FiMessageSquare className="mr-2 h-4 w-4" /> Message
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-b border-border-light">
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
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <ResearchPostCard key={project.id} post={project} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FiBookmark className="mx-auto text-4xl text-text-secondary mb-3" />
                    <p className="text-text-secondary">This user hasn't posted any research yet.</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'about' && (
              <div className="prose prose-sm sm:prose-base max-w-none text-text-primary space-y-4 font-sans">
                {profile.bio && <p>{profile.bio}</p>}
                {!profile.bio && <p>No bio available.</p>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-4">
                  {profile.email && (
                    <div className="flex items-center">
                      <FiMail className="w-5 h-5 mr-3 text-text-secondary flex-shrink-0" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center">
                      <FiMapPin className="w-5 h-5 mr-3 text-text-secondary flex-shrink-0" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center">
                      <FiLink className="w-5 h-5 mr-3 text-text-secondary flex-shrink-0" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-accent-primary break-all">{profile.website}</a>
                    </div>
                  )}
                  {profile.created_at && (
                    <div className="flex items-center">
                      <FiCalendar className="w-5 h-5 mr-3 text-text-secondary flex-shrink-0" />
                      <span>Joined on {new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {profile.interests && profile.interests.length > 0 && (
                  <div className="pt-4">
                    <h3 className="text-lg font-semibold text-neutral-200 mb-2 font-heading">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <span key={interest} className="px-3 py-1 bg-neutral-700 text-neutral-300 text-xs rounded-full font-sans">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 