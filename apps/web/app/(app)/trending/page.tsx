'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { type Database } from '@/lib/database.types';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar } from '@/components/ui/Avatar';
import { FiLoader, FiAlertCircle, FiUser, FiTag, FiThumbsUp, FiMessageSquare, FiBookmark, FiBarChart2, FiZap, FiHome } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

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
  const calculatedAuthorName = (post.profiles?.first_name && post.profiles?.last_name 
    ? `${post.profiles.first_name} ${post.profiles.last_name}` 
    : post.profiles?.first_name)
    || 'Anonymous';
  const authorName = calculatedAuthorName.trim() || 'Anonymous';

  const postDate = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'some time ago';
  const truncatedContent = post.description && post.description.length > 150 
    ? `${post.description.substring(0, 150)}...` 
    : post.description;

  return (
    <motion.div 
      className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:border-neutral-700/80"
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
                <p className="text-sm font-medium text-neutral-200 line-clamp-1">{authorName || 'Unknown Author'}</p>
                <p className="text-xs text-neutral-500">{post.profiles?.institution || 'Independent Researcher'} • {postDate}</p>
            </div>
        </div>

        <Link href={`/projects/${post.id}`} className="block mb-2">
          <h3 className="text-lg font-heading text-neutral-100 hover:text-accent-purple transition-colors duration-150 line-clamp-2">
            {post.title}
          </h3>
        </Link>
        
        {truncatedContent && (
            <p className="text-neutral-400 text-sm mb-4 line-clamp-3">
            {truncatedContent}
            </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="bg-accent-purple/10 text-accent-purple px-2.5 py-1 rounded-full text-xs font-medium"
              >
                <FiTag className="inline mr-1 -mt-px h-3 w-3"/> {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="bg-neutral-800/30 px-5 py-3 border-t border-neutral-800 flex items-center justify-between text-neutral-500">
        <div className="flex items-center gap-3">
            <button className="hover:text-accent-purple transition-colors flex items-center"><FiMessageSquare size={16} className="mr-1" /> <span className="text-xs">{/* count */}</span></button>
        </div>
        <button className="hover:text-accent-purple transition-colors"><FiBookmark size={16} /></button>
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
      const { data: fetchedProjects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (projectsError) throw projectsError;
      const currentProjects = (fetchedProjects as TrendingProject[] | null) || [];
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
    <PageContainer title="Trending" className="bg-black min-h-screen text-neutral-100 font-sans">
      <div className="p-4 sm:p-6 md:p-8">
        <HomeButton />
        <motion.h1 
            className="text-3xl md:text-4xl font-heading text-neutral-100 mb-6 md:mb-8 text-center"
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
          <h2 className="text-2xl font-heading text-neutral-200 mb-4 flex items-center"><FiZap className="mr-2 text-accent-purple"/>Hot Right Now</h2>
          {hotTopics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {hotTopics.map(topic => (
                <motion.div 
                  key={topic.name} 
                  className="bg-neutral-800/70 p-4 rounded-lg border border-neutral-700/70 hover:bg-neutral-700/90 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                >
                  <p className="font-sans font-medium text-neutral-100 text-sm truncate">{topic.name}</p>
                  <p className="text-xs text-accent-purple/80">{topic.count} mention{topic.count === 1 ? '' : 's'}</p>
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
          <h2 className="text-2xl font-heading text-neutral-200 mb-5 flex items-center"><FiBarChart2 className="mr-2 text-accent-purple"/>Popular Research</h2>
          
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
 