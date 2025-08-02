'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
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
  // supabase is already imported as a singleton
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
      // Get all users the current user has matched (as matcher or matchee)
      const { data: matchesData, error: matchesError } = await supabase
        .from('profile_matches')
        .select('matcher_user_id, matchee_user_id, created_at, matcher_profile:matcher_user_id!inner(*), matchee_profile:matchee_user_id!inner(*)')
        .or(`matcher_user_id.eq.${user.id},matchee_user_id.eq.${user.id}`)
        .eq('status', 'matched');

      if (matchesError) throw matchesError;

      // Flatten to unique profiles (other than self)
      const profiles: MatchedProfile[] = [];
      (matchesData || []).forEach(match => {
        const otherProfile = match.matcher_user_id === user.id ? match.matchee_profile : match.matcher_profile;
        if (otherProfile && otherProfile.id !== user.id) {
          profiles.push({ ...otherProfile, match_created_at: match.created_at });
        }
      });
      setMatchedProfiles(profiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matches');
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
      <PageContainer title="My Matches" className="bg-bg-primary min-h-screen flex flex-col items-center justify-center text-text-primary font-sans">
        <FiLoader className="animate-spin text-accent-purple text-6xl" />
        <p className="mt-4 text-neutral-400">Loading your matches...</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" className="bg-bg-primary min-h-screen flex flex-col items-center justify-center text-text-primary font-sans p-6">
        <FiAlertCircle className="text-red-500 text-6xl mb-4" />
        <h2 className="text-2xl font-heading mb-2">Oops! Something went wrong.</h2>
        <p className="text-neutral-400 text-center mb-6">{error}</p>
        <Button onClick={fetchMatchedProfiles} variant="secondary">Try Again</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="My Matches" className="bg-bg-primary min-h-screen text-text-primary font-sans">
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
                        <Button variant="outline" size="sm" className="w-full font-sans"><FiEye className="mr-1.5"/> View</Button>
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