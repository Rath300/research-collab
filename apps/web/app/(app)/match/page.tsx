'use client';

import React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TinderCard from 'react-tinder-card';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { type Database } from '@/lib/database.types';
import { useAuthStore } from '@/lib/store';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FiUser, FiLoader, FiAlertCircle, FiHeart, FiX, FiRewind, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileMatchStatus = Database['public']['Tables']['profile_matches']['Row']['status'];

interface PotentialMatch extends Omit<Profile, 'username'> {
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
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipedUsers, setSwipedUsers] = useState<Set<string>>(new Set());

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
    // Prevent duplicate swipes
    if (swipedUsers.has(swipedUserId)) {
      console.log(`Already swiped on user ${swipedUserId}, ignoring duplicate`);
      return;
    }

    setSwipedUsers(prev => new Set(prev).add(swipedUserId));
    setLastDirection(direction);
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
    // Update current index when card leaves the screen
    setCurrentIndex(idx - 1);
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
    if (currentIndex >= 0 && childRefs[currentIndex] && childRefs[currentIndex].current) {
      try {
        setIsSwiping(true);
        console.log('Attempting to swipe', dir, 'on card at index', currentIndex);
        
        // Call the swipe method on the TinderCard ref
        const result = await childRefs[currentIndex].current.swipe(dir);
        console.log('Swipe result:', result);
        
        // Manually trigger the swipe event if the library doesn't
        if (result && (dir === 'left' || dir === 'right')) {
          const currentUser = potentialMatches[currentIndex];
          if (currentUser) {
            swiped(dir, currentUser.id, currentIndex);
          }
        }
        
        // Add a small delay to allow the animation to complete
        setTimeout(() => setIsSwiping(false), 500);
      } catch (error) {
        console.error('Error swiping card:', error);
        setIsSwiping(false);
      }
    } else {
      console.log('Cannot swipe: currentIndex =', currentIndex, 'childRefs[currentIndex] =', childRefs[currentIndex]);
    }
  };

  const cardVariants = {
    initial: { 
      scale: 0.95, 
      opacity: 0.8,
      rotateY: 0,
      y: 20
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      rotateY: 0,
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      rotateY: 15,
      y: -50,
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
    disabled: { scale: 0.9, opacity: 0.5 }
  };

  if (loading) {
    return (
      <PageContainer title="Find Matches" className="bg-bg-primary min-h-screen flex flex-col items-center justify-center text-text-primary font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <FiLoader className="animate-spin text-accent-primary text-6xl mx-auto mb-4" />
          <p className="mt-4 text-text-secondary">Loading potential matches...</p>
        </motion.div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" className="bg-bg-primary min-h-screen flex flex-col items-center justify-center text-text-primary font-sans p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <FiAlertCircle className="text-red-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-2xl font-heading mb-2">Oops! Something went wrong.</h2>
          <p className="text-text-secondary text-center mb-6">{error}</p>
          <Button onClick={fetchPotentialMatches} variant="secondary">Try Again</Button>
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Discover Matches" className="bg-bg-primary min-h-screen flex flex-col items-center justify-center text-text-primary font-sans overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-text-secondary hover:bg-surface-hover p-2">
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
        {potentialMatches.length > 0 && currentIndex >= 0 ? (
          // Only render the current card and the next few cards for smooth transitions
          potentialMatches.slice(currentIndex, Math.min(currentIndex + 3, potentialMatches.length)).map((character, index) => {
            const actualIndex = currentIndex + index;
            return (
              <TinderCard
                ref={childRefs[actualIndex]}
                className='absolute swipe-card'
                key={character.id}
                onSwipe={(dir) => {
                  if (dir === 'left' || dir === 'right') {
                    swiped(dir, character.id, actualIndex);
                  }
                }}
                onCardLeftScreen={() => outOfFrame(character.first_name, actualIndex)}
                preventSwipe={['up', 'down']} // Allow only left/right swipes
              >
                <motion.div
                  className='relative w-full h-full rounded-2xl bg-white shadow-2xl border border-border-light overflow-hidden p-6 flex flex-col justify-end'
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gray-100 z-0">
                    {character.avatar_url ? (
                      <img
                        src={character.avatar_url}
                        alt={`${character.first_name || 'User'}'s avatar`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide the image if it fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <FiUser className="w-24 h-24 text-gray-400" />
                      </div>
                    )}
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
                          <span key={interest} className="px-2 py-0.5 bg-text-secondary/20 text-text-secondary text-xs rounded-full font-sans">
                            {interest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </TinderCard>
            );
          })
          ) : (
            <motion.div 
              key="no-more-profiles"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center p-8 bg-white rounded-xl border border-border-light shadow-xl max-w-sm mx-auto"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <FiUser size={64} className="mx-auto text-text-secondary" />
              </motion.div>
              <h2 className="text-2xl font-heading text-text-primary mb-3">No More Profiles</h2>
              <p className="text-text-secondary mb-6 text-sm leading-relaxed">
                You've seen everyone for now! Check back later for new profiles, or try refreshing to see if there are any new matches.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={fetchPotentialMatches}
                  variant="primary"
                  className="w-full"
                >
                  <FiRefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button 
                  onClick={() => router.push('/matches')}
                  variant="outline"
                  className="w-full"
                >
                  View My Matches
                </Button>
              </div>
            </motion.div>
          )}
        </div>

      {potentialMatches.length > 0 && currentIndex >= 0 && (
        <motion.div 
          className='flex items-center justify-center gap-6 mt-8 z-20'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div
            variants={buttonVariants}
            initial="initial"
            whileHover={isSwiping ? "disabled" : "hover"}
            whileTap={isSwiping ? "disabled" : "tap"}
          >
            <Button
              onClick={() => {
                console.log('Reject button clicked, currentIndex:', currentIndex);
                swipe('left');
              }}
              variant="outline"
              size="lg"
              disabled={isSwiping}
              className="rounded-full !p-5 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Reject"
            >
              <FiX size={28} />
            </Button>
          </motion.div>
          
          <motion.div
            variants={buttonVariants}
            initial="initial"
            whileHover={isSwiping ? "disabled" : "hover"}
            whileTap={isSwiping ? "disabled" : "tap"}
          >
            <Button
              onClick={() => {
                console.log('Like button clicked, currentIndex:', currentIndex);
                swipe('right');
              }}
              variant="outline"
              size="lg"
              disabled={isSwiping}
              className="rounded-full !p-5 border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Like"
            >
              <FiHeart size={28} />
            </Button>
          </motion.div>
        </motion.div>
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