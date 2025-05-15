'use client';

import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TinderCard from 'react-tinder-card';
import { motion } from 'framer-motion';
import { getBrowserClient } from '@/lib/supabaseClient';
import { type Database } from '@/lib/database.types';
import { useAuthStore } from '@/lib/store';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FiUser, FiLoader, FiAlertCircle, FiHeart, FiX, FiRewind, FiArrowLeft } from 'react-icons/fi';
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

  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDirection, setLastDirection] = useState<string | null>(null);

  const fetchPotentialMatches = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError("User not authenticated.");
      return;
    }
    setLoading(true);
    setError(null);

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

      if (interactedUserIds.length > 0) {
        queryBuilder = queryBuilder.not('id', 'in', `(${interactedUserIds.join(',')})`);
      }
      
      const { data: usersWhoLikedCurrentUserAndWereRejected, error: rejectedLikesError } = await supabase
        .from('profile_matches')
        .select('matcher_user_id')
        .eq('matchee_user_id', user.id)
        .eq('status', 'rejected');

      if (rejectedLikesError) {
        console.warn('Could not fetch users who liked current user and were rejected:', rejectedLikesError.message);
      } else if (usersWhoLikedCurrentUserAndWereRejected && usersWhoLikedCurrentUserAndWereRejected.length > 0) {
        const rejectedLikerIds = usersWhoLikedCurrentUserAndWereRejected.map(r => r.matcher_user_id);
        queryBuilder = queryBuilder.not('id', 'in', `(${rejectedLikerIds.join(',')})`);
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
    fetchPotentialMatches();
  }, [fetchPotentialMatches]);
  
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
    console.log(`Swiped ${direction} on user ${swipedProfile.id} at index ${index}`);

    if (!user || !currentUserProfile) {
      console.error("User or current user profile not available, cannot record swipe.");
      return;
    }

    const newStatus: ProfileMatchStatus = direction === 'right' ? 'liked' : 'rejected';

    try {
      const { data: matchInsertData, error: insertError } = await supabase
        .from('profile_matches')
        .insert({
          matcher_user_id: user.id,
          matchee_user_id: swipedProfile.id,
          status: newStatus,
        })
        .select()
        .single();

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

  const goBack = async () => {
    if (currentIndex < potentialMatches.length - 1) {
       console.log('Trying to go back - feature not fully implemented for db rollback.');
    } else {
      console.log('No more cards to go back to or already at the start.');
    }
  };
  
  const swipeButtonAction = async (dir: 'left' | 'right') => {
    if (currentIndex >= 0 && currentIndex < potentialMatches.length && childRefs[currentIndex]) {
      await childRefs[currentIndex].current?.swipe(dir);
    }
  };


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
        <Button onClick={fetchPotentialMatches} variant="secondary">Try Again</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Discover Matches" className="bg-black min-h-screen flex flex-col items-center justify-center text-neutral-100 font-sans overflow-hidden pt-16 sm:pt-8">
      <div className="absolute top-6 left-4 z-20">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-neutral-300 hover:bg-neutral-800 hover:text-white p-2 rounded-full">
              <FiArrowLeft size={24} />
          </Button>
      </div>
      <div className="absolute top-6 right-4 z-20">
          <Link href="/matches">
              <Button variant="secondary" className="font-sans text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white">
                  My Matches
              </Button>
          </Link>
      </div>
      
      <div className='relative w-[90vw] max-w-[380px] h-[calc(70vh-40px)] max-h-[550px] flex items-center justify-center'>
        {potentialMatches.length > 0 ? potentialMatches.map((character, index) => (
          <TinderCard
            ref={childRefs[index]}
            className='absolute swipe-card'
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
              className='relative w-full h-full rounded-2xl bg-neutral-900 shadow-2xl border border-neutral-700 overflow-hidden p-6 flex flex-col justify-end'
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center z-0" 
                style={{ backgroundImage: `url(${character.avatar_url || '/images/default-avatar.png'})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
              </div>
              
              <div className="relative z-20 text-white">
                <h3 className='text-3xl font-heading mb-1 truncate'>
                  {character.first_name || 'User'} {character.last_name?.[0] ? `${character.last_name[0]}.` : ''}
                </h3>
                <p className='text-sm text-neutral-300 line-clamp-2'>{character.bio || 'No bio yet.'}</p>
                {character.interests && Array.isArray(character.interests) && character.interests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {character.interests.slice(0, 3).map(interest => (
                      <span key={interest} className="px-2.5 py-1 bg-accent-purple/20 text-accent-purple text-xs rounded-full font-sans">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </TinderCard>
        )) : (
          !loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl flex flex-col items-center"
            >
              <FiUser size={56} className="text-neutral-600 mb-4" />
              <h2 className="text-xl font-heading text-neutral-200 mb-2">No More Profiles</h2>
              <p className="text-neutral-400 mb-5 text-sm">You've swiped on everyone for now. Check back later for new users!</p>
              <Link href="/dashboard">
                  <Button variant="primary" size="sm">Back to Dashboard</Button>
              </Link>
            </motion.div>
          )
        )}
      </div>

      {potentialMatches.length > 0 && currentIndex >= 0 && currentIndex < potentialMatches.length && (
        <div className='flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 z-20'>
          <Button 
            onClick={() => swipeButtonAction('left')} 
            variant="outline"
            size="lg"
            className="rounded-full p-4 w-16 h-16 sm:w-20 sm:h-20 bg-neutral-800 border-neutral-700 hover:bg-red-500/20 hover:border-red-500 text-red-500"
            aria-label="Reject"
          >
            <FiX className="w-6 h-6 sm:w-8 sm:h-8" />
          </Button>
          <Button 
            onClick={() => swipeButtonAction('right')} 
            variant="outline"
            size="lg"
            className="rounded-full p-4 w-16 h-16 sm:w-20 sm:h-20 bg-neutral-800 border-neutral-700 hover:bg-green-500/20 hover:border-green-500 text-green-500"
            aria-label="Like"
          >
            <FiHeart className="w-6 h-6 sm:w-8 sm:h-8" />
          </Button>
        </div>
      )}
    </PageContainer>
  );
} 