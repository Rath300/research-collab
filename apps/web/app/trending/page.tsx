'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getBrowserClient } from '@/lib/supabaseClient';
import { type Database } from '@/lib/database.types';
import { PageContainer } from '@/components/layout/PageContainer';
import { Avatar } from '@/components/ui/Avatar';
import { FiLoader, FiAlertCircle, FiUser, FiTag, FiThumbsUp, FiMessageSquare, FiBookmark, FiBarChart2, FiZap } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

type ResearchPost = Database['public']['Tables']['research_posts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface TrendingPost extends ResearchPost {
  profiles: Profile | null;
  // Add engagement_count if it's part of your research_posts table and you want to use it for sorting
  // engagement_count?: number;
}

// Dummy data for "Hot Right Now" topics until a real algorithm/source is defined
const hotTopicsDummy = [
  { id: 'ai-ethics', name: 'AI Ethics & Governance', trendScore: 95 },
  { id: 'quantum-ml', name: 'Quantum Machine Learning', trendScore: 92 },
  { id: 'sustainable-materials', name: 'Sustainable Materials Science', trendScore: 88 },
  { id: 'neuro-tech', name: 'Neuro-enhancement Technologies', trendScore: 85 },
];

const PostCard = ({ post }: { post: TrendingPost }) => {
  const calculatedAuthorName = (post.profiles?.first_name && post.profiles?.last_name 
    ? `${post.profiles.first_name} ${post.profiles.last_name}` 
    : post.profiles?.first_name)
    || 'Anonymous';
  const authorName = calculatedAuthorName.trim() || 'Anonymous';

  const postDate = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'some time ago';
  const truncatedContent = post.content && post.content.length > 150 
    ? `${post.content.substring(0, 150)}...` 
    : post.content;

  return (
    <motion.div 
      className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:border-neutral-700/80"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-5">
        <div className="flex items-center mb-3">
            <Avatar 
                src={post.profiles?.avatar_url} 
                alt={authorName} 
                size="md"
                fallback={<FiUser className="h-5 w-5 text-accent-purple" />}
                className="mr-3 flex-shrink-0"
            />
            <div>
                <p className="text-sm font-medium text-neutral-200 line-clamp-1">{authorName}</p>
                <p className="text-xs text-neutral-500">{post.profiles?.institution || 'Independent Researcher'} • {postDate}</p>
            </div>
        </div>

        <Link href={`/research/${post.id}`} className="block mb-2">
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
            <button className="hover:text-accent-purple transition-colors flex items-center"><FiThumbsUp size={16} className="mr-1" /> <span className="text-xs">{post.engagement_count || 0}</span></button>
            <button className="hover:text-accent-purple transition-colors flex items-center"><FiMessageSquare size={16} className="mr-1" /> <span className="text-xs">{/* count */}</span></button>
        </div>
        <button className="hover:text-accent-purple transition-colors"><FiBookmark size={16} /></button>
      </div>
    </motion.div>
  );
};

export default function TrendingPage() {
  const supabase = getBrowserClient();
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrendingPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // For now, ordering by created_at. Replace with 'engagement_count' if available and preferred.
      const { data, error: postsError } = await supabase
        .from('research_posts')
        .select('*, profiles (*), engagement_count') // Ensure engagement_count is selected if you use it
        .order('created_at', { ascending: false }) // Or order by engagement_count
        .limit(15); 

      if (postsError) throw postsError;
      setPosts((data as TrendingPost[] | null) || []);
    } catch (err) {
      console.error("Error loading trending posts:", err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadTrendingPosts();
  }, [loadTrendingPosts]);

  return (
    <PageContainer title="Trending" className="bg-black min-h-screen text-neutral-100 font-sans">
      <div className="p-4 sm:p-6 md:p-8">
        <motion.h1 
            className="text-3xl md:text-4xl font-heading text-neutral-100 mb-6 md:mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            Trending Insights
        </motion.h1>

        {/* Section for Hot Topics - Using Dummy Data for now */}
        <motion.section 
            className="mb-10 md:mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-heading text-neutral-200 mb-4 flex items-center"><FiZap className="mr-2 text-accent-purple"/>Hot Right Now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotTopicsDummy.map(topic => (
              <motion.div 
                key={topic.id} 
                className="bg-neutral-800/70 p-4 rounded-lg border border-neutral-700/70 hover:bg-neutral-700/90 transition-colors cursor-pointer"
                whileHover={{ scale: 1.03 }}
              >
                <p className="font-sans font-medium text-neutral-100 text-sm truncate">{topic.name}</p>
                {/* <p className="text-xs text-accent-purple">Score: {topic.trendScore}</p> */}
              </motion.div>
            ))}
          </div>
        </motion.section>
        
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-2xl font-heading text-neutral-200 mb-5 flex items-center"><FiBarChart2 className="mr-2 text-accent-purple"/>Popular Research</h2>
          
          {loading && (
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
                onClick={loadTrendingPosts}
                className="px-3 py-1.5 bg-accent-purple hover:bg-accent-purple-hover text-white font-sans text-sm rounded-md transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
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