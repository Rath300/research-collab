'use client';

import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TinderCard from 'react-tinder-card';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
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
  // supabase is already imported as a singleton
  const { user } = useAuthStore();
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
      // 1. Get IDs of users the current user has already interacted with (matched or rejected)
      const { data: interactedUsersData, error: interactedUsersError } = await supabase
        .from('profile_matches')
        .select('matchee_user_id')
        .eq('matcher_user_id', user.id)
        .in('status', ['matched', 'rejected']);

      if (interactedUsersError) throw interactedUsersError;
      const interactedUserIds = interactedUsersData.map(item => item.matchee_user_id);
      
      // 2. Fetch all profiles excluding the current user and interacted users
      let queryBuilder = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id); // Exclude self

      if (interactedUserIds.length > 0) {
        queryBuilder = queryBuilder.not('id', 'in', `(${interactedUserIds.join(',')})`);
      }

      const { data: profilesData, error: profilesError } = await queryBuilder;

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

  const swiped = async (direction: 'left' | 'right', swipedUserId: string, index: number) => {
    setLastDirection(direction);
    setCurrentIndex(index - 1);
    console.log(`Swiped ${direction} on user ${swipedUserId} at index ${index}`);

    if (!user) {
      console.error("User not logged in, cannot record swipe.");
      return;
    }

    // Always create a 'matched' record on right swipe, allowing instant chat
    if (direction === 'right') {
      try {
        const { error: insertError } = await supabase
          .from('profile_matches')
          .insert({
            matcher_user_id: user.id,
            matchee_user_id: swipedUserId,
            status: 'matched',
          });
        if (insertError) {
          console.error('Error inserting match:', insertError);
        } else {
          console.log(`Match (matched) between ${user.id} and ${swipedUserId} recorded.`);
        }
      } catch (e) {
        console.error("Supabase error:", e);
      }
    }
  };

  const outOfFrame = (name: string | null, idx: number) => {
    console.log(`${name || 'User'} left the screen at index ${idx}!`);
  };

  const goBack = async () => {
    // This is a simplified goBack, true undo would require more state management
    // and potentially reverting the database action or having a 'pending_undo' status.
    // For now, it just visually brings the card back if one is available.
    if (currentIndex < potentialMatches.length - 1) {
       console.log('Trying to go back');
       // This part is tricky with react-tinder-card's imperative API
       // It's usually easier to manage the deck from the parent and re-render
       // For now, we'll just log it. A full undo is a more advanced feature.
    } else {
      console.log('No more cards to go back to or already at the start.');
    }
  };
  
  const swipe = async (dir: 'left' | 'right' | 'up' | 'down') => {
    if (currentIndex >= 0 && childRefs[currentIndex]) {
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
    <PageContainer title="Discover Matches" className="bg-black min-h-screen flex flex-col items-center justify-center text-neutral-100 font-sans overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-neutral-300 hover:bg-neutral-700 p-2">
              <FiArrowLeft size={24} />
          </Button>
      </div>
      <div className="absolute top-4 right-4 z-20">
          <Link href="/matches">
              <Button variant="secondary" className="font-sans text-sm">
                  View My Matches
              </Button>
          </Link>
      </div>
      
      <div className='relative w-[90vw] max-w-[380px] h-[70vh] max-h-[600px] flex items-center justify-center'>
        {potentialMatches.length > 0 ? potentialMatches.map((character, index) => (
          <TinderCard
            ref={childRefs[index]}
            className='absolute swipe-card'
            key={character.id}
            onSwipe={(dir) => {
              if (dir === 'left' || dir === 'right') {
                swiped(dir, character.id, index);
              }
            }}
            onCardLeftScreen={() => outOfFrame(character.first_name, index)}
            preventSwipe={['up', 'down']} // Allow only left/right swipes
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
              </div>
              
              <div className="relative z-20 text-white">
                <h3 className='text-3xl font-heading mb-1'>
                  {character.first_name || 'Anonymous'} {character.last_name || ''}
                </h3>
                <p className='text-sm text-neutral-300 line-clamp-2'>{character.bio || 'No bio yet.'}</p>
                {character.interests && character.interests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {character.interests.slice(0, 3).map(interest => (
                      <span key={interest} className="px-2 py-0.5 bg-accent-purple/20 text-accent-purple text-xs rounded-full font-sans">
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
              className="text-center p-8 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl"
            >
              <FiUser size={64} className="mx-auto text-neutral-600 mb-4" />
              <h2 className="text-2xl font-heading text-neutral-200 mb-2">No More Profiles</h2>
              <p className="text-neutral-400 mb-4 text-sm">You've seen everyone for now. Check back later!</p>
            </motion.div>
          )
        )}
      </div>

      {potentialMatches.length > 0 && currentIndex >= 0 && (
        <div className='flex items-center justify-center gap-6 mt-8 z-20'>
          <Button
            onClick={() => swipe('left')}
            variant="outline"
            size="lg"
            className="rounded-full !p-5 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
            aria-label="Reject"
          >
            <FiX size={28} />
          </Button>
          {/* <Button
            onClick={goBack}
            variant="outline"
            sizeLg
            className="rounded-full !p-4 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400"
            aria-label="Undo"
          >
            <FiRewind size={20} />
          </Button> */}
          <Button
            onClick={() => swipe('right')}
            variant="outline"
            size="lg"
            className="rounded-full !p-5 border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-400"
            aria-label="Like"
          >
            <FiHeart size={28} />
          </Button>
        </div>
      )}
      <style jsx global>{`
        .swipe-card {
          width: 90vw;
          max-width: 380px;
          height: 70vh;
          max-height: 600px;
        }
      `}</style>
    </PageContainer>
  );
} 