'use client';

import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TinderCard from 'react-tinder-card';
import { motion } from 'framer-motion';
import { getBrowserClient } from '@/lib/supabaseClient';
import { type Database } from '@/lib/database.types';
import { useAuthStore } from '@/lib/store';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar as UIAvatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FiUser, FiLoader, FiAlertCircle, FiHeart, FiX, FiArrowLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Link from 'next/link';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileMatchStatus = Database['public']['Tables']['profile_matches']['Row']['status'];

interface PotentialMatch extends Profile {
  // Any additional properties needed for the card
}

export default function MatchPage() {
  const supabase = getBrowserClient();
  const { user, profile: currentUserProfile } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDirection, setLastDirection] = useState<string | null>(null);

  // State for "review like" mode
  const [reviewModeActive, setReviewModeActive] = useState(false);
  const [likerProfileData, setLikerProfileData] = useState<Profile | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [isDecisionProcessing, setIsDecisionProcessing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const fetchPotentialMatches = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError("User not authenticated to fetch matches.");
      return;
    }
    setLoading(true);
    setError(null);
    setPotentialMatches([]);

    try {
      const { data: interactedUsersData, error: interactedUsersError } = await supabase
        .from('profile_matches')
        .select('matchee_user_id')
        .eq('matcher_user_id', user.id)
        .in('status', ['liked', 'rejected', 'matched']);

      if (interactedUsersError) throw interactedUsersError;
      const interactedUserIds = interactedUsersData.map(item => item.matchee_user_id);
      
      let queryBuilder = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id);

      const allInteractedIds = [...interactedUserIds];
      
      const { data: usersWhoLikedCurrentUserAndWereRejected, error: rejectedLikesError } = await supabase
        .from('profile_matches')
        .select('matcher_user_id')
        .eq('matchee_user_id', user.id)
        .eq('status', 'rejected');

      if (rejectedLikesError) {
        console.warn('Could not fetch users who liked current user and were rejected:', rejectedLikesError.message);
      } else if (usersWhoLikedCurrentUserAndWereRejected && usersWhoLikedCurrentUserAndWereRejected.length > 0) {
        const rejectedLikerIds = usersWhoLikedCurrentUserAndWereRejected.map(r => r.matcher_user_id);
        allInteractedIds.push(...rejectedLikerIds);
      }
      
      const uniqueInteractedIds = Array.from(new Set(allInteractedIds));

      if (uniqueInteractedIds.length > 0) {
        queryBuilder = queryBuilder.not('id', 'in', `(${uniqueInteractedIds.join(',')})`);
      }

      const { data: profilesData, error: profilesError } = await queryBuilder.limit(20);

      if (profilesError) {
        console.error("Supabase profiles fetch error:", profilesError);
        throw profilesError;
      }
      
      setPotentialMatches(profilesData || []);
      setCurrentIndex((profilesData?.length || 0) - 1);

    } catch (err) {
      console.error("Error fetching potential matches:", err);
      const defaultMessage = 'Failed to load potential matches.';
      if (err && typeof err === 'object' && 'message' in err) {
        setError(String((err as Error).message) || defaultMessage);
      } else {
        setError(defaultMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (!searchParams) return;

    const action = searchParams.get('action');
    const likerId = searchParams.get('liker_id');

    if (action === 'review_like' && likerId && user?.id) {
      setReviewModeActive(true);
      setIsReviewLoading(true);
      setLoading(false);
      setError(null);
      setReviewError(null);
      
      const fetchLikerProfile = async () => {
        try {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', likerId)
            .single();

          if (profileError) throw profileError;
          if (!data) throw new Error('Liker profile not found.');
          
          setLikerProfileData(data);
        } catch (err) {
          console.error("Error fetching liker profile:", err);
          const defaultMessage = 'Failed to load liker profile for review.';
          setReviewError((err instanceof Error ? err.message : String(err)) || defaultMessage);
        } finally {
          setIsReviewLoading(false);
        }
      };
      fetchLikerProfile();
    } else if (user?.id && !reviewModeActive) {
      setReviewModeActive(false);
      if (potentialMatches.length === 0 && !loading && !error) {
         fetchPotentialMatches();
      }
    } else if (!user?.id) {
      setLoading(false);
      setIsReviewLoading(false);
    }
  }, [searchParams, user, supabase, fetchPotentialMatches, potentialMatches.length, loading, error]);

  useEffect(() => {
    if (user && !reviewModeActive && potentialMatches.length === 0 && !loading && !error) {
        fetchPotentialMatches();
    }
  }, [user, reviewModeActive, potentialMatches.length, loading, error, fetchPotentialMatches]);
  
  const childRefs = useMemo(
    () =>
      Array(potentialMatches.length)
        .fill(0)
        .map((i) => React.createRef<any>()),
    [potentialMatches.length]
  );

  const swiped = async (direction: 'left' | 'right', swipedProfile: PotentialMatch, index: number) => {
    setLastDirection(direction);
    setCurrentIndex(index - 1);

    if (!user || !currentUserProfile) {
      console.error("User or current user profile not available, cannot record swipe.");
      return;
    }

    const newStatus: ProfileMatchStatus = direction === 'right' ? 'liked' : 'rejected';

    try {
      const { error: insertError } = await supabase
        .from('profile_matches')
        .insert({
          matcher_user_id: user.id,
          matchee_user_id: swipedProfile.id,
          status: newStatus,
        });

      if (insertError) {
        console.error('Error inserting profile_match:', insertError);
      } else {
        console.log(`Profile_match (${newStatus}) between ${user.id} and ${swipedProfile.id} recorded.`);
        
        if (newStatus === 'liked') {
          const senderName = `${currentUserProfile.first_name || 'Someone'} ${currentUserProfile.last_name || ''}`.trim();
          const notificationContent = `${senderName} is interested in matching with you!`;
          
          const { error: notificationError } = await supabase
            .from('user_notifications')
            .insert({
              user_id: swipedProfile.id,
              sender_id: user.id,
              content: notificationContent,
              type: 'new_like',
              link_to: `/match?action=review_like&liker_id=${user.id}`
            });

          if (notificationError) {
            console.error('Error creating like notification:', notificationError);
          } else {
            console.log(`Notification created for user ${swipedProfile.id} about like from ${user.id}`);
          }
        }
      }
    } catch (e) {
      console.error("Supabase error during swipe processing:", e);
    }
  };

  const outOfFrame = (name: string | null, idx: number) => {
    console.log(`${name || 'User'} left the screen at index ${idx}!`);
  };
  
  const swipeButtonAction = async (dir: 'left' | 'right') => {
    if (currentIndex >= 0 && currentIndex < potentialMatches.length && childRefs[currentIndex]?.current) {
      await childRefs[currentIndex].current?.swipe(dir);
    }
  };

  const handleAcceptLike = async () => {
    if (!user || !likerProfileData || !currentUserProfile) {
      setReviewError("Cannot process match: missing user data.");
      return;
    }
    setIsDecisionProcessing(true);
    setReviewError(null);
    try {
      const { error: updateError } = await supabase
        .from('profile_matches')
        .update({ status: 'matched' })
        .eq('matcher_user_id', likerProfileData.id)
        .eq('matchee_user_id', user.id)
        .eq('status', 'liked');

      if (updateError) throw new Error(`Failed to update liker's status: ${updateError.message}`);

      const { error: insertMatchError } = await supabase
        .from('profile_matches')
        .upsert({
          matcher_user_id: user.id,
          matchee_user_id: likerProfileData.id,
          status: 'matched',
        }, { onConflict: 'matcher_user_id,matchee_user_id' });
      
      if (insertMatchError) throw new Error(`Failed to record your match: ${insertMatchError.message}`);

      const senderName = `${currentUserProfile.first_name || 'Someone'} ${currentUserProfile.last_name || ''}`.trim();
      const notificationContent = `${senderName} matched with you! Let's start chatting.`;
      const { error: notificationError } = await supabase
        .from('user_notifications')
        .insert({
          user_id: likerProfileData.id,
          sender_id: user.id,
          content: notificationContent,
          type: 'new_match',
          link_to: `/chats?userId=${user.id}`
        });

      if (notificationError) console.warn("Failed to create match notification:", notificationError.message);

      router.push(`/chats?userId=${likerProfileData.id}`);

    } catch (err) {
      console.error("Error accepting like:", err);
      setReviewError((err instanceof Error ? err.message : String(err)) || "Failed to accept match.");
    } finally {
      setIsDecisionProcessing(false);
    }
  };

  const handleDeclineLike = async () => {
    if (!user || !likerProfileData) {
      setReviewError("Cannot process decline: missing user data.");
      return;
    }
    setIsDecisionProcessing(true);
    setReviewError(null);
    try {
      const { error: updateError } = await supabase
        .from('profile_matches')
        .update({ status: 'rejected' })
        .eq('matcher_user_id', likerProfileData.id)
        .eq('matchee_user_id', user.id)
        .eq('status', 'liked');

      if (updateError) throw new Error(`Failed to decline like: ${updateError.message}`);
      
      router.push('/match');
      setReviewModeActive(false);
      setLikerProfileData(null);
      setPotentialMatches([]);
      setError(null);
      fetchPotentialMatches();

    } catch (err) {
      console.error("Error declining like:", err);
      setReviewError((err instanceof Error ? err.message : String(err)) || "Failed to decline match.");
    } finally {
      setIsDecisionProcessing(false);
    }
  };

  if (isReviewLoading) {
    return (
      <PageContainer title="Reviewing Like" className="bg-black min-h-screen flex flex-col items-center justify-center text-neutral-100 font-sans">
        <FiLoader className="animate-spin text-accent-purple text-6xl" />
        <p className="mt-4 text-neutral-400">Loading profile for review...</p>
      </PageContainer>
    );
  }
  
  if (reviewModeActive) {
    if (!likerProfileData) {
       return (
        <PageContainer title="Error Reviewing Like" className="bg-black min-h-screen flex flex-col items-center justify-center text-neutral-100 font-sans p-6">
          <FiAlertCircle className="text-red-500 text-6xl mb-4" />
          <h2 className="text-2xl font-heading mb-2">Profile Not Found</h2>
          <p className="text-neutral-400 text-center mb-6">{reviewError || "Could not load the profile of the user who liked you."}</p>
          <Link href="/match">
            <Button variant="secondary" onClick={() => { 
              setReviewModeActive(false); 
              setLikerProfileData(null); 
              setPotentialMatches([]); 
              setError(null); 
              fetchPotentialMatches(); 
            }}>Back to Matching</Button>
          </Link>
        </PageContainer>
      );
    }

    return (
      <PageContainer title={`Review like from ${likerProfileData.first_name || 'User'}`} className="bg-black min-h-screen flex flex-col items-center justify-center text-neutral-100 font-sans p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-neutral-900 p-6 sm:p-8 rounded-xl shadow-2xl border border-neutral-700 w-full max-w-md text-center"
        >
          <UIAvatar 
            src={likerProfileData.avatar_url || '/images/default-avatar.png'} 
            alt={`${likerProfileData.first_name || 'Liker'}'s profile`} 
            fallback={(likerProfileData.first_name?.toUpperCase() || 'U')[0]}
            className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 border-4 border-accent-purple rounded-full"
          />
          <h2 className="text-2xl sm:text-3xl font-heading mb-2">{likerProfileData.first_name || 'User'} {likerProfileData.last_name || ''}</h2>
          <p className="text-neutral-400 mb-1 text-sm sm:text-base">Wants to connect with you!</p>
          {likerProfileData.bio && <p className="text-neutral-300 italic mb-6 text-xs sm:text-sm line-clamp-3">"{likerProfileData.bio}"</p>}

          {reviewError && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md mb-6 text-sm">
              <FiAlertCircle className="inline mr-2" /> {reviewError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              onClick={handleAcceptLike} 
              variant="primary" 
              className="bg-green-600 hover:bg-green-500 text-white flex-1 py-3"
              disabled={isDecisionProcessing}
            >
              {isDecisionProcessing ? <FiLoader className="animate-spin mr-2" /> : <FiCheckCircle className="mr-2" />}
              Accept Match
            </Button>
            <Button 
              onClick={handleDeclineLike} 
              variant="danger" 
              className="bg-red-700 hover:bg-red-600 text-white flex-1 py-3"
              disabled={isDecisionProcessing}
            >
              {isDecisionProcessing ? <FiLoader className="animate-spin mr-2" /> : <FiXCircle className="mr-2" />}
              Decline
            </Button>
          </div>
        </motion.div>
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer title="Find Matches" className="bg-black min-h-screen flex flex-col items-center justify-center text-neutral-100 font-sans">
        <FiLoader className="animate-spin text-accent-purple text-6xl" />
        <p className="mt-4 text-neutral-400">Loading potential matches...</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" className="bg-black min-h-screen flex flex-col items-center justify-center text-neutral-100 font-sans p-6">
        <FiAlertCircle className="text-red-500 text-6xl mb-4" />
        <h2 className="text-2xl font-heading mb-2">Oops! Something went wrong.</h2>
        <p className="text-neutral-400 text-center mb-6">{error}</p>
        <Button onClick={() => { setError(null); fetchPotentialMatches();}} variant="secondary">Try Again</Button>
        <Link href="/dashboard" className="mt-4">
            <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Discover Matches" className="bg-black min-h-screen flex flex-col items-center justify-center text-neutral-100 font-sans overflow-hidden pt-16 sm:pt-8 pb-4">
      <div className="absolute top-4 left-4 z-20">
          <Button variant="ghost" onClick={() => router.back()} className="text-neutral-300 hover:bg-neutral-800 hover:text-white p-2 rounded-full">
              <FiArrowLeft size={24} />
          </Button>
      </div>
      <div className="absolute top-4 right-4 z-20">
          <Link href="/matches">
              <Button variant="secondary" className="font-sans text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white">
                  My Matches
              </Button>
          </Link>
      </div>
      
      <div className='relative w-[90vw] max-w-[360px] h-[calc(75vh-80px)] sm:h-[calc(70vh-40px)] max-h-[500px] sm:max-h-[550px] flex items-center justify-center'>
        {potentialMatches.length > 0 ? potentialMatches.map((character, index) => (
          <TinderCard
            ref={childRefs[index]}
            className='absolute swipe-card cursor-grab active:cursor-grabbing'
            key={character.id}
            onSwipe={(dir) => {
              if (dir === 'left' || dir === 'right') {
                swiped(dir, character, index);
              }
            }}
            onCardLeftScreen={() => outOfFrame(character.first_name, index)}
            preventSwipe={['up', 'down']}
          >
            <motion.div
              className='relative w-full h-full rounded-2xl bg-neutral-900 shadow-2xl border border-neutral-700 overflow-hidden flex flex-col justify-end group'
              initial={{ scale: index === currentIndex ? 1 : 0.9, opacity: index === currentIndex ? 1: 0.7 }}
              animate={{ scale: index === currentIndex ? 1 : 0.9, opacity: index === currentIndex ? 1: 0.7 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center z-0" 
                style={{ backgroundImage: `url(${character.avatar_url || '/images/default-avatar.png'})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-75"></div>
              </div>
              
              <div className="relative z-20 text-white p-4 sm:p-6">
                <h3 className='text-2xl sm:text-3xl font-heading mb-1 truncate'>
                  {character.first_name || 'User'} {character.last_name?.[0] ? `${character.last_name[0]}.` : ''}
                </h3>
                <p className='text-sm text-neutral-300 line-clamp-2 mb-2'>{character.bio || 'No bio yet.'}</p>
                {character.interests && Array.isArray(character.interests) && character.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {character.interests.slice(0, 3).map(interest => (
                      <span key={interest as string} className="px-2 py-0.5 bg-accent-purple/30 text-accent-purple text-xs rounded-full font-sans">
                        {interest as string}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </TinderCard>
        )) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-neutral-900 rounded-xl shadow-xl border border-neutral-700"
          >
            <FiUser size={60} className="mx-auto text-neutral-500 mb-6" />
            <h2 className="text-3xl font-heading text-neutral-100 mb-3">No More Profiles</h2>
            <p className="text-neutral-400 mb-6">You've seen everyone for now. Check back later!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => { setError(null); fetchPotentialMatches();}} variant="secondary" disabled={loading}>
                {loading ? <FiLoader className="animate-spin mr-2" /> : null}
                Refresh
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {potentialMatches.length > 0 && currentIndex >=0 && (
        <motion.div 
          className="flex items-center justify-around w-full max-w-xs mt-6 sm:mt-8 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button onClick={() => swipeButtonAction('left')} aria-label="Reject" variant="danger" size="lg" className="rounded-full p-0 aspect-square shadow-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
            <FiX size={28} className="sm:w-8 sm:h-8" />
          </Button>
          <Button onClick={() => swipeButtonAction('right')} aria-label="Like" variant="primary" size="lg" className="rounded-full p-0 aspect-square shadow-xl bg-green-600 hover:bg-green-500 text-white flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
            <FiHeart size={28} className="sm:w-8 sm:h-8" />
          </Button>
        </motion.div>
      )}
       {lastDirection && currentIndex < potentialMatches.length -1 && (
        <motion.p
          key={lastDirection + currentIndex.toString()} 
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150%] text-5xl sm:text-6xl font-bold pointer-events-none z-30 ${
            lastDirection === 'left' ? 'text-red-500 -rotate-12' : 'text-green-500 rotate-12'
          }`}
          style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}
        >
          {lastDirection === 'left' ? 'NOPE' : 'LIKED'}
        </motion.p>
      )}
    </PageContainer>
  );
} 