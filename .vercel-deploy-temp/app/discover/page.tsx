'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PageContainer } from '../../components';
import { FiX, FiCheck, FiUser, FiMapPin, FiBriefcase, FiTag } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  full_name: string;
  title: string;
  bio: string;
  institution: string;
  research_areas: string[];
  skills: string[];
  avatar_url?: string;
  location?: string;
}

export default function DiscoverPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);

  useEffect(() => {
    async function loadUserAndProfiles() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        setCurrentUser(user.id);
        
        // Fetch potential matches
        await fetchPotentialMatches(user.id);
      } catch (error) {
        console.error('Error loading discover page:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserAndProfiles();
  }, [supabase, router]);

  const fetchPotentialMatches = async (userId: string) => {
    try {
      // Get user's own profile for matching criteria
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('interests, research_areas, skills')
        .eq('id', userId)
        .single();
      
      // Get already matched users to exclude them
      const { data: existingMatches } = await supabase
        .from('matches')
        .select('user_id_1, user_id_2')
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);
      
      // Create an array of user IDs to exclude
      const excludeIds = [userId];
      
      if (existingMatches) {
        existingMatches.forEach(match => {
          if (match.user_id_1 === userId) {
            excludeIds.push(match.user_id_2);
          } else {
            excludeIds.push(match.user_id_1);
          }
        });
      }
      
      // Fetch potential matches - users not already matched
      const { data: potentialMatches, error } = await supabase
        .from('profiles')
        .select('id, full_name, title, bio, institution, research_areas, skills, avatar_url, location')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      if (potentialMatches && potentialMatches.length > 0) {
        // Shuffle the profiles for random order
        const shuffledProfiles = [...potentialMatches].sort(() => Math.random() - 0.5);
        setProfiles(shuffledProfiles);
      } else {
        setNoMoreProfiles(true);
      }
      
    } catch (error) {
      console.error('Error fetching potential matches:', error);
    }
  };

  const handleMatch = async (match: boolean) => {
    if (!currentUser || profiles.length === 0 || currentProfileIndex >= profiles.length) {
      return;
    }
    
    const matchedProfile = profiles[currentProfileIndex];
    
    if (match) {
      try {
        // Calculate a basic match score (could be more sophisticated in a real app)
        const matchScore = Math.floor(Math.random() * 30) + 70; // 70-99% match
        
        // Create a match record in Supabase
        await supabase
          .from('matches')
          .insert({
            user_id_1: currentUser,
            user_id_2: matchedProfile.id,
            match_score: matchScore,
            is_new: true,
            created_at: new Date().toISOString(),
            status: 'pending'
          });
          
        // Optional: Send a notification or message
      } catch (error) {
        console.error('Error creating match:', error);
      }
    }
    
    // Move to next profile
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      // No more profiles to show
      setNoMoreProfiles(true);
    }
  };
  
  // Get the current profile to display
  const currentProfile = profiles[currentProfileIndex];

  return (
    <PageContainer title="Discover">
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Discover Researchers</h1>
        
        {isLoading ? (
          <div className="bg-gray-800 rounded-lg p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-researchbee-yellow"></div>
          </div>
        ) : noMoreProfiles || !currentProfile ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-medium mb-4">No More Profiles</h2>
            <p className="text-gray-400 mb-4">We've run out of potential matches for you.</p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-researchbee-yellow text-black px-6 py-2 rounded-md"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {/* Profile Card */}
            <div className="relative">
              {/* Profile Image */}
              <div className="h-60 bg-gray-700 flex items-center justify-center">
                {currentProfile.avatar_url ? (
                  <img 
                    src={currentProfile.avatar_url} 
                    alt={currentProfile.full_name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-5xl">
                    <FiUser />
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-1">{currentProfile.full_name}</h2>
                <div className="flex items-center text-gray-400 mb-4">
                  <FiBriefcase className="mr-2" />
                  <span>{currentProfile.title}</span>
                </div>
                
                {currentProfile.institution && (
                  <div className="flex items-center text-gray-400 mb-4">
                    <FiMapPin className="mr-2" />
                    <span>{currentProfile.institution}</span>
                  </div>
                )}
                
                <p className="text-gray-300 mb-4 line-clamp-3">{currentProfile.bio}</p>
                
                {/* Research Areas */}
                {currentProfile.research_areas && currentProfile.research_areas.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <FiTag className="mr-2" /> Research Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.research_areas.map((area, i) => (
                        <span key={i} className="bg-gray-700 text-xs px-2 py-1 rounded-full">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Skills */}
                {currentProfile.skills && currentProfile.skills.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.skills.slice(0, 5).map((skill, i) => (
                        <span key={i} className="bg-gray-700 text-xs px-2 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {currentProfile.skills.length > 5 && (
                        <span className="text-xs text-gray-400">+{currentProfile.skills.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Match/Pass Buttons */}
              <div className="flex justify-center p-6 border-t border-gray-700 gap-4">
                <button 
                  onClick={() => handleMatch(false)}
                  className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-2xl hover:bg-red-700 transition-colors"
                >
                  <FiX />
                </button>
                <button 
                  onClick={() => handleMatch(true)}
                  className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-2xl hover:bg-green-700 transition-colors"
                >
                  <FiCheck />
                </button>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="px-6 pb-6">
              <div className="flex justify-between text-sm text-gray-400">
                <span>{currentProfileIndex + 1} of {profiles.length}</span>
                <span>{Math.round(((currentProfileIndex + 1) / profiles.length) * 100)}%</span>
              </div>
              <div className="w-full h-1 bg-gray-700 mt-2">
                <div 
                  className="h-full bg-researchbee-yellow" 
                  style={{ width: `${((currentProfileIndex + 1) / profiles.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
} 