'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getBrowserClient } from '@/lib/supabaseClient';
import { type Database } from '@/lib/database.types';
import { useAuthStore } from '@/lib/store';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FiUser, FiLoader, FiAlertCircle, FiMessageSquare, FiEye, FiArrowLeft, FiInbox } from 'react-icons/fi';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MatchedProfile extends Profile {
  match_created_at: string; 
}

export default function MatchesPage() {
  const supabase = getBrowserClient();
  const { user } = useAuthStore();
  const router = useRouter();

  const [matchedProfiles, setMatchedProfiles] = useState<MatchedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchedProfiles = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError("User not authenticated.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Fetch matches where current user was the matcher
      const { data: initiatedMatchesData, error: initiatedMatchesError } = await supabase
        .from('profile_matches')
        .select('created_at, matchee_profile:matchee_user_id!inner(*)')
        .eq('matcher_user_id', user.id)
        .eq('status', 'matched');

      if (initiatedMatchesError) throw initiatedMatchesError;

      // Fetch matches where current user was the matchee
      // AND the matcher also has a 'matched' status towards the current user (for mutual matches)
      // This assumes our swipe right immediately creates a 'matched' record.
      // If we had a 'liked' status, this query would be more complex to find true mutual matches.
      const { data: receivedMatchesData, error: receivedMatchesError } = await supabase
        .from('profile_matches')
        .select('created_at, matcher_profile:matcher_user_id!inner(*)')
        .eq('matchee_user_id', user.id)
        .eq('status', 'matched');
        
      if (receivedMatchesError) throw receivedMatchesError;

      const profilesMap = new Map<string, MatchedProfile>();

      if (initiatedMatchesData) {
        initiatedMatchesData.forEach((match: any) => {
          if (match.matchee_profile && !profilesMap.has(match.matchee_profile.id)) {
            profilesMap.set(match.matchee_profile.id, { 
              ...match.matchee_profile, 
              match_created_at: match.created_at 
            });
          }
        });
      }

      if (receivedMatchesData) {
        receivedMatchesData.forEach((match: any) => {
          if (match.matcher_profile && !profilesMap.has(match.matcher_profile.id)) {
             // To ensure this is a *mutual* match with the current simplified logic
             // (where a right swipe by current user = 'matched'), we need to check
             // if the current user also 'matched' this 'matcher_profile'.
             // This check is implicitly handled if both queries only look for 'matched' status.
             // A more robust system would check for reciprocal 'liked' statuses.
            profilesMap.set(match.matcher_profile.id, { 
              ...match.matcher_profile, 
              match_created_at: match.created_at 
            });
          }
        });
      }
      
      const uniqueProfiles = Array.from(profilesMap.values());
      uniqueProfiles.sort((a, b) => new Date(b.match_created_at).getTime() - new Date(a.match_created_at).getTime());

      setMatchedProfiles(uniqueProfiles);

    } catch (err) {
      console.error("Error fetching matched profiles:", err);
      const defaultMessage = 'Failed to load your matches.';
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
    fetchMatchedProfiles();
  }, [fetchMatchedProfiles]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.1 }
    }
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } }
  };

  if (loading) {
    return (
      <PageContainer title="My Matches" className="bg-black min-h-screen flex flex-col items-center justify-center text-neutral-100 font-sans">
        <FiLoader className="animate-spin text-accent-purple text-6xl" />
        <p className="mt-4 text-neutral-400">Loading your matches...</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" className="bg-black min-h-screen flex flex-col items-center justify-center text-neutral-100 font-sans p-6">
        <FiAlertCircle className="text-red-500 text-6xl mb-4" />
        <h2 className="text-2xl font-heading mb-2">Oops! Something went wrong.</h2>
        <p className="text-neutral-400 text-center mb-6">{error}</p>
        <Button onClick={fetchMatchedProfiles} variant="secondary">Try Again</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="My Matches" className="bg-black min-h-screen text-neutral-100 font-sans">
      <div className="p-4 sm:p-6 md:p-8">
        <motion.div 
          className="flex items-center mb-6 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()} 
            className="mr-3 text-neutral-300 hover:bg-neutral-700 !p-2 rounded-full"
            aria-label="Back"
          >
              <FiArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl md:text-4xl font-heading text-neutral-100">
            My Matches
          </h1>
        </motion.div>

        {matchedProfiles.length === 0 && (
          <motion.div 
            className="text-center py-20 bg-neutral-900 rounded-lg border border-neutral-800 max-w-3xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <FiInbox className="mx-auto text-6xl text-neutral-600 mb-6" />
            <h3 className="text-xl font-heading text-neutral-300 mb-2">No Matches Yet</h3>
            <p className="text-neutral-500 font-sans text-sm mb-4">Keep swiping to find your research partners!</p>
            <Link href="/match">
                <Button variant="primary" className="font-sans">
                    Find Matches
                </Button>
            </Link>
          </motion.div>
        )}

        {matchedProfiles.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {matchedProfiles.map((profile) => (
              <motion.div
                key={profile.id}
                variants={cardItemVariants}
                className="bg-neutral-900 rounded-xl border border-neutral-800 shadow-lg overflow-hidden flex flex-col"
              >
                <div className="p-5 flex-grow">
                    <Avatar 
                        src={profile.avatar_url} 
                        alt={profile.first_name || 'User'} 
                        size="xl" 
                        className="mx-auto mb-4 border-2 border-neutral-700" 
                        fallback={<FiUser size={40}/>}
                    />
                  <h3 className="text-xl font-heading text-neutral-100 text-center truncate">
                    {profile.first_name || ''} {profile.last_name || ''}
                  </h3>
                  <p className="text-sm text-neutral-400 text-center truncate mb-1">{profile.title || 'Researcher'}</p>
                  <p className="text-xs text-neutral-500 text-center mb-3">Matched: {new Date(profile.match_created_at).toLocaleDateString()}</p>
                  
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="mb-3 flex flex-wrap justify-center gap-1.5">
                      {profile.interests.slice(0, 3).map(interest => (
                        <span key={interest} className="px-2 py-0.5 bg-accent-purple/20 text-accent-purple text-[10px] rounded-full font-sans">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-neutral-400 line-clamp-2 text-center mb-4 min-h-[30px]">
                    {profile.bio || 'No bio available.'}
                  </p>
                </div>
                <div className="border-t border-neutral-800 p-3 flex gap-2">
                    <Link href={profile.id ? `/profile/${profile.id}` : '#'} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full font-sans"><FiEye className="mr-1.5"/> View Profile</Button>
                    </Link>
                    <Link href={profile.id ? `/chats?userId=${profile.id}` : '#'} className="flex-1">
                         <Button variant="primary" size="sm" className="w-full font-sans"><FiMessageSquare className="mr-1.5"/> Message</Button>
                    </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
} 