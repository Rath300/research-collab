'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TinderCard from 'react-tinder-card';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth-store';
import { useSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';
import { PageContainerLayout } from '@/components/layout/page-container-layout';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Heart, X, Loader2, AlertTriangle, Info, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Image } from '@/components/ui/image';

type DbProfile = Database['public']['Tables']['profiles']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type ProfileMatch = Database['public']['Tables']['profile_matches']['Row'];

interface ProfileWithProjects extends DbProfile {
  projects?: Project[];
  headline: string | null;
  skills: string[] | null;
  interests: string[] | null;
}

// Helper function moved to component scope
const getDisplayName = (profile: ProfileWithProjects | DbProfile | null | undefined): string => {
  if (!profile) return 'Someone';
  // Ensure first_name and last_name are accessed safely if they might be null
  const firstName = profile.first_name || '';
  const lastName = profile.last_name || '';
  return profile.full_name || `${firstName} ${lastName}`.trim() || 'Anonymous User';
};

export default function MatchPage() {
  const { profile: currentUser, isLoading: isAuthLoading } = useAuthStore();
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [potentialMatches, setPotentialMatches] = useState<ProfileWithProjects[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [reviewLikerProfile, setReviewLikerProfile] = useState<ProfileWithProjects | null>(null);
  const [originalLikerId, setOriginalLikerId] = useState<string | null>(null);
  
  const childRefs = useMemo(
    () =>
      Array(potentialMatches.length)
        .fill(0)
        .map(() => React.createRef<any>()),
    [potentialMatches.length]
  );

  useEffect(() => {
    if (!searchParams) return;
    const action = searchParams.get('action');
    const likerId = searchParams.get('liker_id');

    if (action === 'review_like' && likerId && currentUser && currentUser.id !== likerId) {
      setIsReviewMode(true);
      setOriginalLikerId(likerId);
      setPotentialMatches([]); 

      const fetchLikerProfile = async () => {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*, projects(*)') 
          .eq('id', likerId)
          .single();

        if (fetchError) {
          toast.error(`Failed to load profile: ${fetchError.message}`);
          setError(`Failed to load profile: ${fetchError.message}`);
          setIsReviewMode(false);
          setOriginalLikerId(null);
          router.replace('/match', undefined);
        } else if (data) {
          setReviewLikerProfile(data as ProfileWithProjects);
          setPotentialMatches([data as ProfileWithProjects]); 
          setCurrentIndex(0); 
        }
        setLoading(false);
      };
      fetchLikerProfile();
    } else {
      if (likerId && currentUser && currentUser.id === likerId) {
        router.replace('/match', undefined);
      }
      setIsReviewMode(false);
      setOriginalLikerId(null);
      setReviewLikerProfile(null);
    }
  }, [searchParams, currentUser, supabase, router]);

  const fetchPotentialMatches = useCallback(async () => {
    if (!currentUser || isReviewMode || loading) return;

    setLoading(true);
    setError(null);
    try {
      const { data: interactedMatchesData, error: interactedMatchesError } = await supabase
        .from('profile_matches')
        .select('matcher_user_id, matchee_user_id')
        .or(`matcher_user_id.eq.${currentUser.id},matchee_user_id.eq.${currentUser.id}`);

      if (interactedMatchesError) throw interactedMatchesError;

      const interactedUserIds = interactedMatchesData
        ? interactedMatchesData.reduce((acc: string[], match: { matcher_user_id: string; matchee_user_id: string; }) => {
            if (match.matcher_user_id === currentUser.id && match.matchee_user_id) {
              acc.push(match.matchee_user_id);
            } else if (match.matchee_user_id === currentUser.id && match.matcher_user_id) {
              acc.push(match.matcher_user_id);
            }
            return acc;
          }, [])
        : [];
      
      const excludeIds = [...new Set([...interactedUserIds, currentUser.id])];

      let queryBuilder = supabase
        .from('profiles')
        .select('*, projects(*)')
        .neq('id', currentUser.id)
        .limit(10);

      if (excludeIds.length > 0) {
        queryBuilder = queryBuilder.not('id', 'in', `(${excludeIds.join(',')})`);
      }
      
      const { data: profilesData, error: profilesError } = await queryBuilder;

      if (profilesError) {
        if (profilesError.message.includes("syntax error at or near )") && excludeIds.length === 0) {
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*, projects(*)')
            .neq('id', currentUser.id)
            .limit(10);
          if (retryError) throw retryError;
          setPotentialMatches((retryData || []) as ProfileWithProjects[]);
        } else {
          throw profilesError;
        }
      } else {
        setPotentialMatches((profilesData || []) as ProfileWithProjects[]);
      }
    } catch (e: any) {
      console.error('Error fetching potential matches:', e);
      setError(`Failed to fetch matches: ${e.message}`);
      toast.error(`Failed to fetch matches: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentUser, supabase, isReviewMode, loading]);

  useEffect(() => {
    if (!searchParams) return;
    if (currentUser && !isReviewMode && potentialMatches.length === 0 && !loading && !searchParams.get('action')) {
      fetchPotentialMatches();
    }
  }, [currentUser, isReviewMode, potentialMatches.length, loading, fetchPotentialMatches, searchParams]);

  const onCardLeftScreenHandler = (profileSwiped: ProfileWithProjects, direction: string) => {
    if (!currentUser) return;
    
    setPotentialMatches((prevMatches) => prevMatches.filter(p => p.id !== profileSwiped.id));

    handleSwipeAction(direction, profileSwiped.id, profileSwiped);
  };

  const handleSwipeAction = async (direction: string, profileIdSwiped: string, swipedProfile: ProfileWithProjects) => {
    if (!currentUser) return;

    const status = direction === 'right' ? 'liked' : 'rejected';
    try {
      const { error: insertError } = await supabase.from('profile_matches').insert({
        matcher_user_id: currentUser.id,
        matchee_user_id: profileIdSwiped,
        status: status,
      });
      if (insertError) throw insertError;

      if (status === 'liked') {
        await supabase.from('user_notifications').insert({
          user_id: profileIdSwiped,
          type: 'new_like',
          message: `${getDisplayName(currentUser)} is interested in you!`,
          link_to: `/match?action=review_like&liker_id=${currentUser.id}`,
          actor_id: currentUser.id,
        });
        toast.success(`You liked ${getDisplayName(swipedProfile)}!`);
      } else {
        toast.info(`You passed on ${getDisplayName(swipedProfile)}.`);
      }
    } catch (error: any) {
      console.error('Error recording swipe:', error);
      toast.error(`Oops! Something went wrong processing your swipe.`);
    }
  };

  const swipeButtonAction = (direction: 'left' | 'right') => {
    if (potentialMatches.length > 0 && childRefs[potentialMatches.length -1]) {
      childRefs[potentialMatches.length -1].current?.swipe(direction);
    }
  };

  if (isAuthLoading) {
    return (
      <PageContainerLayout title="Loading..." description="Please wait.">
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        </div>
      </PageContainerLayout>
    );
  }

  if (loading && potentialMatches.length === 0 && !error) {
    return (
      <PageContainerLayout
        title="Finding Matches"
        description="Please wait while we find potential collaborators."
      >
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
          <p className="mt-4 text-lg text-gray-400">Looking for profiles...</p>
        </div>
      </PageContainerLayout>
    );
  }

  if (error) {
    return (
      <PageContainerLayout
        title="Error"
        description="Something went wrong."
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg text-red-400">Could not load matches.</p>
          <p className="text-sm text-neutral-500">{error}</p>
          <Button onClick={() => { setError(null); fetchPotentialMatches(); }} className="mt-6">Try Again</Button>
        </div>
      </PageContainerLayout>
    );
  }
  
  if (!loading && potentialMatches.length === 0 && !isReviewMode) { 
    return (
      <PageContainerLayout
        title="No More Matches For Now"
        description="You've seen all available profiles. Check back later!"
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Users className="h-16 w-16 text-purple-500" />
          <p className="mt-4 text-xl font-semibold text-neutral-300">All Caught Up!</p>
          <p className="text-neutral-400">There are no new profiles matching your criteria at the moment.</p>
          <Button onClick={fetchPotentialMatches} className="mt-6 bg-purple-600 hover:bg-purple-700">
            Refresh Matches
          </Button>
        </div>
      </PageContainerLayout>
    );
  }

  return (
    <PageContainerLayout
      title={isReviewMode && reviewLikerProfile ? `Reviewing ${getDisplayName(reviewLikerProfile)}` : "Discover Collaborators"}
      description={isReviewMode ? "Decide if you'd like to match with this user." : "Swipe right to like, left to pass."}
    >
      <div className="absolute top-6 left-4 z-20">
         <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-neutral-300 hover:bg-neutral-700/50 hover:text-white p-2 rounded-full">
            <ArrowLeft size={24} />
          </Button>
      </div>
      <div className="relative flex flex-col items-center justify-center w-full h-[calc(100vh-200px)] overflow-hidden">
        {potentialMatches.length > 0 ? (
          potentialMatches.map((profile, index) => (
            <TinderCard
              ref={childRefs[index]}
              key={profile.id}
              onCardLeftScreen={(direction) => onCardLeftScreenHandler(profile, direction)}
              preventSwipe={['up', 'down']}
              className="absolute cursor-grab" 
            >
              <div className="relative w-[300px] h-[450px] sm:w-[350px] sm:h-[525px] md:w-[400px] md:h-[600px] rounded-xl overflow-hidden shadow-2xl bg-neutral-800 border border-neutral-700">
                <Image
                  src={profile.avatar_url || '/images/default-avatar.png'}
                  alt={`${getDisplayName(profile)}'s profile avatar`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 300px, (max-width: 768px) 350px, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-3xl font-bold text-white drop-shadow-md geist-sans">
                    {getDisplayName(profile)}
                  </h3>
                  {profile.headline && (
                    <p className="text-sm text-neutral-200 mt-1 drop-shadow-sm truncate">
                      {profile.headline}
                    </p>
                  )}
                   {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {profile.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="bg-purple-500/40 text-purple-200 text-xs px-2 py-0.5 rounded-full border border-purple-500/60">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TinderCard>
          ))
        ) : (
          <div className="text-center text-neutral-400">
            <p>No profiles to show at the moment.</p>
            {isReviewMode && <p>Could not load the profile for review.</p>}
             {!loading && !isReviewMode && (
                <Button onClick={fetchPotentialMatches} className="mt-4 bg-purple-600 hover:bg-purple-700">
                    Check for New Profiles
                </Button>
            )}
          </div>
        )}
        {potentialMatches.length > 0 && !loading && (
            <div className="absolute bottom-[-60px] sm:bottom-[-70px] flex justify-center items-center gap-6 z-10">
                 <Button
                    onClick={() => swipeButtonAction('left')}
                    className="p-4 bg-neutral-700 rounded-full shadow-xl hover:bg-red-600/90 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    aria-label="Pass"
                    size="lg"
                >
                    <X size={32} className="text-red-400 group-hover:text-white" />
                </Button>
                <Button
                    onClick={() => swipeButtonAction('right')}
                    className="p-4 bg-neutral-700 rounded-full shadow-xl hover:bg-green-600/90 transition-colors transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    aria-label="Like"
                    size="lg"
                >
                    <Heart size={32} className="text-green-400 group-hover:text-white" />
                </Button>
            </div>
        )}
      </div>
    </PageContainerLayout>
  );
} 