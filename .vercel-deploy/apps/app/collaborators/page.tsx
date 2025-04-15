'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiFilter, FiRefreshCw, FiUsers } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SwipeCard } from '@/components/collaborators/SwipeCard';
import { useAuthStore, useSwipeStore } from '@/lib/store';
import { getProfiles, createMatch } from '@/lib/api';
import { Profile } from '@research-collab/db';

export default function CollaboratorsPage() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const { swipedUsers, likedUsers, addSwipedUser, addLikedUser, resetSwipeState } = useSwipeStore();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  
  const loadProfiles = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      setError('');
      
      // Get all previously swiped user IDs to exclude
      const excludeIds = [...swipedUsers];
      if (user.id) excludeIds.push(user.id); // Exclude current user
      
      // Get profiles from API
      const data = await getProfiles({
        excludeIds,
        isRandomized: true,
        limit: 10,
      });
      
      setProfiles(data);
      
      if (data.length === 0) {
        setNoMoreProfiles(true);
      }
    } catch (err: any) {
      console.error('Error loading profiles:', err);
      setError(err.message || 'Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadProfiles();
    }
  }, [user]);
  
  const handleSwipe = async (direction: 'left' | 'right', profileId: string) => {
    // Add to swiped users
    addSwipedUser(profileId);
    
    if (direction === 'right') {
      // User liked this profile
      addLikedUser(profileId);
      
      if (user) {
        try {
          // Create a match
          await createMatch(user.id, profileId);
          // Check if we have a mutual match in the future
        } catch (err) {
          console.error('Error creating match:', err);
        }
      }
    }
    
    // Remove this profile from the stack
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    
    // If no more profiles to show, display message
    if (profiles.length <= 1) {
      setNoMoreProfiles(true);
    }
  };
  
  const resetDeck = () => {
    resetSwipeState();
    setNoMoreProfiles(false);
    loadProfiles();
  };
  
  if (!user || !profile) {
    // Redirect to login if not authenticated
    router.push('/login');
    return null;
  }
  
  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Find Collaborators</h1>
        
        <Button 
          variant="outline" 
          onClick={() => {}}
          leftIcon={<FiFilter />}
        >
          Filter
        </Button>
      </div>
      
      <div className="relative h-[32rem] mb-6">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <Card className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={loadProfiles}>Retry</Button>
            </div>
          </Card>
        ) : noMoreProfiles ? (
          <Card className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <FiUsers size={48} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">No More Profiles</h3>
            <p className="text-gray-500 mb-4">You've seen all available researchers. Check back later or reset your swipes.</p>
            <Button onClick={resetDeck} leftIcon={<FiRefreshCw />}>
              Reset Swipes
            </Button>
          </Card>
        ) : (
          <>
            {/* Only show the top card - others are still there for continuity when swiping */}
            {profiles.length > 0 && (
              <SwipeCard 
                key={profiles[0].id}
                profile={profiles[0]}
                onSwipe={handleSwipe}
              />
            )}
          </>
        )}
      </div>
      
      {/* Manual swipe buttons */}
      {!isLoading && !noMoreProfiles && profiles.length > 0 && (
        <div className="flex justify-center space-x-10">
          <Button
            variant="outline"
            className="h-16 w-16 rounded-full border-2 border-red-500 text-red-500 p-0"
            onClick={() => handleSwipe('left', profiles[0].id)}
          >
            <FiRefreshCw size={28} />
          </Button>
          
          <Button
            variant="outline"
            className="h-16 w-16 rounded-full border-2 border-green-500 text-green-500 p-0"
            onClick={() => handleSwipe('right', profiles[0].id)}
          >
            <FiUsers size={28} />
          </Button>
        </div>
      )}
    </div>
  );
} 