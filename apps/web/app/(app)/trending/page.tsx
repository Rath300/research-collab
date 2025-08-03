'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { type Database } from '@/lib/database.types';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FiLoader, FiAlertCircle, FiUser, FiTag, FiThumbsUp, FiMessageSquare, FiBookmark, FiBarChart2, FiZap, FiHome, FiUserPlus } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/trpc';
import { useAuthStore } from '@/lib/store';

type Project = Database['public']['Tables']['projects']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface TrendingProject extends Project {
  profiles?: Profile | null;
}

interface HotTopic {
  name: string;
  count: number;
}

const postCardItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } }
};

const PostCard = ({ post }: { post: TrendingProject }) => {
  const { user } = useAuthStore();
  const requestToJoinMutation = api.project.requestToJoin.useMutation();
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const calculatedAuthorName = (post.profiles?.first_name && post.profiles?.last_name 
    ? `${post.profiles.first_name} ${post.profiles.last_name}` 
    : post.profiles?.first_name)
    || 'Anonymous';
  const authorName = calculatedAuthorName?.trim() || 'Anonymous User';

  const postDate = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'some time ago';
  const truncatedContent = post.description && post.description.length > 150 
    ? `${post.description.substring(0, 150)}...` 
    : post.description;

  // Use username if available, otherwise fall back to old format
  const usernameTag = post.profiles?.first_name 
    ? `@${post.profiles?.first_name?.toLowerCase() || 'user'}${post.profiles?.id?.slice(-4) || ''}` 
    : `@user${post.profiles?.id?.slice(-4) || ''}`;

  const handleRequestToJoin = async () => {
    if (!user) {
      setRequestStatus('error');
      return;
    }

    setIsRequesting(true);
    setRequestStatus('idle');

    try {
      await requestToJoinMutation.mutateAsync({
        projectId: post.id,
        message: `I'm interested in joining your project "${post.title}"`
      });
      setRequestStatus('success');
    } catch (error) {
      console.error('Error requesting to join project:', error);
      setRequestStatus('error');
    } finally {
      setIsRequesting(false);
    }
  };

  const isOwnProject = user && post.leader_id === user.id;

  return (
    <motion.div 
      className="bg-white border border-border-light rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:border-border-medium"
      variants={postCardItemVariants}
    >
      <div className="p-5">
        <div className="flex items-center mb-3">
            <Avatar 
                src={post.profiles?.avatar_url || undefined} 
                alt={authorName} 
                size="md"
                fallback={<FiUser className="h-5 w-5 text-accent-purple" />}
                className="mr-3 flex-shrink-0"
            />
            <div>
                <p className="text-sm font-medium text-text-primary line-clamp-1">{authorName || 'Unknown Author'}</p>
                <p className="text-xs text-text-secondary">{post.profiles?.institution || 'Independent Researcher'} • {postDate}</p>
            </div>
        </div>

        <Link href={`/projects/${post.id}`} className="block mb-2">
          <h3 className="text-lg font-heading text-text-primary hover:text-accent-primary transition-colors duration-150 line-clamp-2">
            {post.title}
          </h3>
        </Link>
        
        {truncatedContent && (
            <p className="text-text-secondary text-sm mb-4 line-clamp-3">
            {truncatedContent}
            </p>
        )}

        {usernameTag && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-text-secondary/10 text-text-secondary px-2.5 py-1 rounded-full text-xs font-medium">
              <FiTag className="inline mr-1 -mt-px h-3 w-3"/> {usernameTag}
            </span>
          </div>
        )}

        {/* Request to Join Button */}
        {!isOwnProject && post.is_public && (
          <div className="mb-4">
            <Button
              onClick={handleRequestToJoin}
              disabled={isRequesting}
              variant="outline"
              size="sm"
              className="w-full text-sm"
            >
              <FiUserPlus className="mr-2 h-4 w-4" />
              {isRequesting ? 'Requesting...' : 'Request to Join'}
            </Button>
            
            {requestStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-green-700 text-xs"
              >
                Request sent successfully!
              </motion.div>
            )}
            
            {requestStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs"
              >
                {requestToJoinMutation.error?.message || 'Failed to send request'}
              </motion.div>
            )}
          </div>
        )}
      </div>
      <div className="bg-gray-50 px-5 py-3 border-t border-border-light flex items-center justify-between text-text-secondary">
        <div className="flex items-center gap-3">
            <button className="hover:text-accent-primary transition-colors flex items-center"><FiMessageSquare size={16} className="mr-1" /> <span className="text-xs">{/* count */}</span></button>
        </div>
        <button className="hover:text-accent-primary transition-colors"><FiBookmark size={16} /></button>
      </div>
    </motion.div>
  );
};

const HomeButton = () => (
  <Link href="/dashboard" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-sans text-sm mb-4">
    <FiHome className="h-5 w-5" /> Home
  </Link>
);

export default function TrendingPage() {
  // supabase is already imported as a singleton
  const [posts, setPosts] = useState<TrendingProject[]>([]);
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.1 }
    }
  };

  const loadTrendingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First fetch projects
      const { data: fetchedProjects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (projectsError) throw projectsError;
      
      // Then fetch profiles for the project leaders
      const leaderIds = fetchedProjects?.map(project => project.leader_id).filter(Boolean) || [];
      let profilesData: any[] = [];
      
      if (leaderIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, institution')
          .in('id', leaderIds);
        
        if (profilesError) throw profilesError;
        profilesData = profiles || [];
      }

      // Combine the data
      const currentProjects = (fetchedProjects || []).map(project => ({
        ...project,
        profiles: profilesData.find(profile => profile.id === project.leader_id) || null
      }));
      
      setPosts(currentProjects.slice(0, 15));

      const tagCounts: Record<string, number> = {};
      currentProjects.forEach(project => {
        project.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const sortedTags = Object.entries(tagCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      
      setHotTopics(sortedTags.slice(0, 4));

    } catch (err) {
      console.error("Error loading trending data:", err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadTrendingData();
  }, [loadTrendingData]);

  const validProjects = posts.filter(
    (project) => project.profiles && typeof project.profiles === 'object' && 'first_name' in project.profiles
  );

  return (
    <PageContainer title="Trending" className="bg-bg-primary min-h-screen text-text-primary font-sans">
      <div className="p-4 sm:p-6 md:p-8">
        <HomeButton />
        <motion.h1 
            className="text-3xl md:text-4xl font-heading text-text-primary mb-6 md:mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            Trending Insights
        </motion.h1>

        <motion.section 
            className="mb-10 md:mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-heading text-text-primary mb-4 flex items-center"><FiZap className="mr-2 text-accent-primary"/>Hot Right Now</h2>
          {hotTopics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {hotTopics.map(topic => (
                <motion.div 
                  key={topic.name} 
                  className="bg-white p-4 rounded-lg border border-border-light hover:bg-gray-50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                >
                  <p className="font-sans font-medium text-text-primary text-sm truncate">{topic.name}</p>
                  <p className="text-xs text-text-secondary">{topic.count} mention{topic.count === 1 ? '' : 's'}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            !loading && <p className="font-sans text-sm text-neutral-500">No trending topics to show right now.</p>
          )}
        </motion.section>
        
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-2xl font-heading text-text-primary mb-5 flex items-center"><FiBarChart2 className="mr-2 text-accent-primary"/>Popular Research</h2>
          
          {loading && !posts.length && (
            <div className="flex justify-center items-center py-10">
              <FiLoader className="animate-spin text-accent-purple text-5xl" />
            </div>
          )}

          {error && (
            <div className="bg-neutral-900 border border-red-500/30 rounded-xl shadow-lg p-6 text-center font-sans my-6">
              <FiAlertCircle className="mx-auto text-red-500 text-4xl mb-3" />
              <h3 className="text-lg font-heading text-neutral-100 mb-1">Error Loading Posts</h3>
              <p className="text-neutral-400 text-sm mb-3">{error}</p>
              <button 
                onClick={loadTrendingData}
                className="px-3 py-1.5 bg-accent-purple hover:bg-accent-purple-hover text-white font-sans text-sm rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {posts.map((post) => <PostCard key={post.id} post={post} />)}
            </motion.div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="text-center py-12 bg-neutral-900 rounded-lg border border-neutral-800">
              <FiAlertCircle className="mx-auto text-5xl text-neutral-600 mb-4" />
              <h3 className="text-xl font-heading text-neutral-300 mb-2">No Trending Posts Yet</h3>
              <p className="text-neutral-500 font-sans text-sm">Check back later to see what's trending!</p>
            </div>
          )}
        </motion.section>

      </div>
    </PageContainer>
  );
} 
 