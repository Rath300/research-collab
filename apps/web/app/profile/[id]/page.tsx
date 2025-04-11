'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tab } from '@/components/ui/Tab';
import { ResearchPostCard } from '@/components/research/ResearchPostCard';
import { 
  FiUser, 
  FiMapPin, 
  FiMail, 
  FiLink, 
  FiMessageSquare, 
  FiUsers, 
  FiEdit, 
  FiBookmark, 
  FiCalendar,
  FiGlobe,
  FiClock
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getProfile, getUserPosts, createMatch, checkIfMatched } from '@/lib/api';
import { Profile, ResearchPost } from '@research-collab/db';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<ResearchPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isMatched, setIsMatched] = useState(false);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  
  const userId = params.id as string;
  const isOwnProfile = user?.id === userId;
  
  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get profile data
      const profileData = await getProfile(userId);
      setProfile(profileData);
      
      // Get user's research posts
      const userPosts = await getUserPosts(userId);
      setPosts(userPosts);
      
      // Check if already matched (if not own profile)
      if (user && !isOwnProfile) {
        const matchStatus = await checkIfMatched(user.id, userId);
        setIsMatched(matchStatus.isMatched);
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadProfileData();
  }, [userId]);
  
  const handleConnect = async () => {
    if (!user || isOwnProfile) return;
    
    try {
      setIsMatchLoading(true);
      await createMatch(user.id, userId);
      setIsMatched(true);
    } catch (err) {
      console.error('Error connecting:', err);
    } finally {
      setIsMatchLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
        <FiUser size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'The requested profile could not be found'}</p>
        <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Profile header */}
      <Card className="mb-6 overflow-hidden">
        {/* Cover image/background */}
        <div className="h-48 bg-gradient-to-r from-primary-600 to-purple-600 relative">
          {isOwnProfile && (
            <Button 
              variant="outline"
              className="absolute top-4 right-4 bg-white dark:bg-gray-800 shadow-sm"
              onClick={() => router.push('/profile/edit')}
            >
              <FiEdit size={18} className="mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
        
        <CardContent className="relative px-6 pt-0 pb-6">
          {/* Profile image */}
          <div className="absolute -top-16 left-6 h-32 w-32 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-md">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={`${profile.first_name} ${profile.last_name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <FiUser size={48} className="text-gray-400" />
            )}
          </div>
          
          {/* Profile actions */}
          <div className="flex justify-end mb-12 mt-4">
            {isOwnProfile ? (
              <Button 
                onClick={() => router.push('/dashboard')}
                leftIcon={<FiUser />}
              >
                Dashboard
              </Button>
            ) : (
              <div className="space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/chats?id=${userId}`)}
                  leftIcon={<FiMessageSquare />}
                  disabled={!isMatched}
                >
                  Message
                </Button>
                
                <Button 
                  onClick={handleConnect}
                  leftIcon={<FiUsers />}
                  disabled={isMatched || isMatchLoading}
                  isLoading={isMatchLoading}
                >
                  {isMatched ? 'Connected' : 'Connect'}
                </Button>
              </div>
            )}
          </div>
          
          {/* Profile info */}
          <div className="mt-2">
            <h1 className="text-3xl font-bold">{profile.first_name} {profile.last_name}</h1>
            
            <div className="mt-2 flex flex-wrap items-center text-gray-500 dark:text-gray-400 gap-y-2">
              {profile.title && (
                <div className="flex items-center mr-4">
                  <FiUser className="mr-1" size={16} />
                  <span>{profile.title}</span>
                </div>
              )}
              
              {profile.institution && (
                <div className="flex items-center mr-4">
                  <FiGlobe className="mr-1" size={16} />
                  <span>{profile.institution}</span>
                </div>
              )}
              
              {profile.location && (
                <div className="flex items-center mr-4">
                  <FiMapPin className="mr-1" size={16} />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile.availability && (
                <div className="flex items-center mr-4">
                  <FiClock className="mr-1" size={16} />
                  <span className="capitalize">{profile.availability.replace('-', ' ')}</span>
                </div>
              )}
              
              {profile.joining_date && (
                <div className="flex items-center">
                  <FiCalendar className="mr-1" size={16} />
                  <span>Joined {new Date(profile.joining_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            {profile.bio && (
              <p className="mt-4 text-gray-700 dark:text-gray-300">{profile.bio}</p>
            )}
            
            {/* Contact & Social */}
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.email && (
                <a 
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <FiMail size={14} className="mr-1" />
                  {profile.email}
                </a>
              )}
              
              {profile.website && (
                <a 
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <FiLink size={14} className="mr-1" />
                  Website
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          <Tab
            active={activeTab === 'posts'}
            onClick={() => setActiveTab('posts')}
            label="Research Posts"
            count={posts.length}
          />
          
          <Tab
            active={activeTab === 'about'}
            onClick={() => setActiveTab('about')}
            label="About"
          />
        </div>
      </div>
      
      {/* Tab content */}
      {activeTab === 'posts' ? (
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <ResearchPostCard 
                key={post.id}
                post={post}
                onLike={() => {}}
                onBoost={() => {}}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
              <FiBookmark size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">No research posts yet</p>
              {isOwnProfile && (
                <Button 
                  className="mt-4"
                  onClick={() => router.push('/research/new')}
                >
                  Create Post
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>Research Interests</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.interests && profile.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <div 
                      key={interest}
                      className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center dark:bg-primary-900/30 dark:text-primary-300"
                    >
                      <FiBookmark className="mr-1" size={14} />
                      {interest}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No research interests specified</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.education && profile.education.length > 0 ? (
                <div className="space-y-4">
                  {profile.education.map((edu, index) => (
                    <div key={index} className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0 last:pb-0">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{edu.institution}</p>
                      <p className="text-xs text-gray-500">{edu.year}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No education details available</p>
              )}
            </CardContent>
          </Card>
          
          {/* Additional blocks could be added here for publications, experience, etc. */}
        </div>
      )}
    </div>
  );
} 