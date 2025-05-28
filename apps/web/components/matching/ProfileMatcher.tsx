'use client'

import { useState, useEffect, useCallback } from 'react'
import { getBrowserClient } from '@/lib/supabaseClient'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/lib/store'
import { type Database } from '@/types/database.types'

// Define a type for the profile data we expect to display
// Using the exact Row type from generated types and making it Partial
type DisplayProfile = Partial<Database['public']['Tables']['profiles']['Row']>;

export function ProfileMatcher() {
  const supabase = getBrowserClient()
  const { user } = useAuthStore()
  const [currentProfile, setCurrentProfile] = useState<DisplayProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [seenProfileIds, setSeenProfileIds] = useState<string[]>([])
  const [isDeciding, setIsDeciding] = useState(false);

  const loadNextProfile = useCallback(async () => {
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data: matchedUserConnections, error: connectionsError } = await supabase
        .from('profile_matches')
        .select('matchee_user_id')
        .eq('matcher_user_id', user.id);

      if (connectionsError) throw connectionsError;

      const interactedProfileIds = matchedUserConnections.map(conn => conn.matchee_user_id);
      // Ensure user.id is part of allExcludedIds before it's used in the query.
      const allExcludedIds = user?.id ? [user.id, ...seenProfileIds, ...interactedProfileIds] : [...seenProfileIds, ...interactedProfileIds];
      
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .not('id', 'in', `(${allExcludedIds.filter(id => !!id).map(id => `'${id}'`).join(',') || 'null'})`)
        // .eq('visibility', 'public') // Consider adding a visibility filter if applicable

      if (countError) throw countError;
      if (!count || count === 0) {
        setCurrentProfile(null);
        setError('No more profiles to match with at the moment.');
        setLoading(false);
        return;
      }

      const randomOffset = Math.floor(Math.random() * count);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${allExcludedIds.filter(id => !!id).map(id => `'${id}'`).join(',') || 'null'})`)
        // .eq('visibility', 'public') 
        .limit(1)
        .range(randomOffset, randomOffset);

      if (profilesError) throw profilesError;

      const nextProfile = profiles?.[0] || null; // Type assertion to DisplayProfile happens at setCurrentProfile
      setCurrentProfile(nextProfile as DisplayProfile);

      if (nextProfile?.id) { // Check if nextProfile and its id exist
        setSeenProfileIds(prev => [...prev, nextProfile.id!]);
      } else if (count > 0 && !nextProfile) {
        setError('Could not load a random profile. Please try again or refresh.');
      }

    } catch (err) {
      console.error('Error in loadNextProfile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user, supabase, seenProfileIds]) // user itself is a dependency now

  useEffect(() => {
    if (user) {
      loadNextProfile();
    }
  }, [user, loadNextProfile]);

  const handleMatchDecision = async (matcheeProfileId: string | undefined, decision: 'matched' | 'rejected') => {
    if (!user || !matcheeProfileId) { // Check if matcheeProfileId is defined
      setError('User or profile ID missing.');
      return;
    }
    setIsDeciding(true);

    try {
      const { error: insertError } = await supabase
        .from('profile_matches')
        .insert({
          matcher_user_id: user.id,
          matchee_user_id: matcheeProfileId,
          status: decision
        });

      if (insertError) throw insertError;

      if (decision === 'matched') {
        const { data: currentUserProfile } = await supabase // Renamed for clarity
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single()

        const matcherName = `${currentUserProfile?.first_name || 'Someone'} ${currentUserProfile?.last_name || ''}`.trim();
        
        await supabase
          .from('user_notifications')
          .insert({
            user_id: matcheeProfileId,
            type: 'new_direct_match', 
            content: `${matcherName} is interested in collaborating with you!`,
            sender_id: user.id,
            link_to: `/profile/${user.id}`
          });
      }
      loadNextProfile();
    } catch (err) {
      console.error('Error in handleMatchDecision:', err);
      setError(err instanceof Error ? err.message : 'Failed to record match decision');
    } finally {
      setIsDeciding(false);
    }
  };

  if (loading) return <div className="text-center p-10">Loading profiles...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  if (!currentProfile) return <div className="text-center p-10">No more profiles to show right now. Check back later!</div>;

  const profileName = `${currentProfile.first_name || ''} ${currentProfile.last_name || ''}`.trim() || 'Anonymous User';
  const fallbackText = (currentProfile.first_name?.[0] || 'U') + (currentProfile.last_name?.[0] || '');

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="p-0">
          <div className="w-full h-32 bg-gradient-to-r from-purple-500 to-pink-500" />
        </CardHeader>
        <CardContent className="p-6 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Avatar 
              className="w-24 h-24 border-4 border-white shadow-md"
              src={currentProfile.avatar_url}
              alt={profileName}
              fallback={fallbackText}
            />
          </div>
          
          <div className="mt-12 text-center">
            <CardTitle className="text-2xl font-bold">{profileName}</CardTitle>
            {currentProfile.institution && <p className="text-sm text-gray-500">{currentProfile.institution}</p>}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">Collaboration Pitch:</h3>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
              {currentProfile.collaboration_pitch || 'No collaboration pitch provided yet.'}
            </p>
          </div>

          {currentProfile.interests && currentProfile.interests.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Interests:</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.interests.map((interest: string) => (
                  <span
                    key={interest}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
           {currentProfile.skills && currentProfile.skills.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {currentProfile.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="p-6 bg-gray-50 border-t">
          <div className="flex w-full justify-between gap-4">
            <Button
              onClick={() => handleMatchDecision(currentProfile.id, 'rejected')}
              variant="outline"
              className="flex-1 py-3 text-lg"
              disabled={!currentProfile.id || isDeciding}
            >
              Pass
            </Button>
            <Button
              onClick={() => handleMatchDecision(currentProfile.id, 'matched')}
              variant="primary"
              className="flex-1 py-3 text-lg"
              disabled={!currentProfile.id || isDeciding}
            >
              Interested
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 
      </Card>
    </div>
  );
} 