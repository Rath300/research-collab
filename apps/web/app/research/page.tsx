'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getBrowserClient } from '@/lib/supabaseClient';
import { type Database } from '@/lib/database.types';
import { PageContainer } from '@/components/layout/PageContainer'; // Assuming this exists and is styled for dark theme
import { Avatar } from '@/components/ui/Avatar';
import { FiLoader, FiAlertCircle, FiUser, FiTag, FiExternalLink } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

type ResearchPost = Database['public']['Tables']['research_posts']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ResearchPostWithProfile extends ResearchPost {
  profiles: Profile | null; // Profile can be null if user is deleted or not found
}

export default function ResearchPage() {
  const supabase = getBrowserClient();
  const [posts, setPosts] = useState<ResearchPostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResearchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: postsError } = await supabase
        .from('research_posts')
        .select('*, profiles (*)')
        .order('created_at', { ascending: false })
        .limit(20); // Adjust limit as needed

      if (postsError) throw postsError;
      setPosts((data as ResearchPostWithProfile[] | null) || []);
    } catch (err) {
      console.error("Error loading research posts:", err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadResearchPosts();
  }, [loadResearchPosts]);

  if (loading) {
    return (
      <PageContainer title="Research Feed" className="bg-black min-h-screen text-neutral-100 flex items-center justify-center">
        <div className="flex flex-col items-center font-sans">
          <FiLoader className="animate-spin text-accent-purple text-6xl mb-4" />
          <p className="text-xl text-neutral-300">Loading research feed...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error" className="bg-black min-h-screen text-neutral-100 flex items-center justify-center">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg p-8 text-center font-sans">
          <FiAlertCircle className="mx-auto text-red-500 text-6xl mb-4" />
          <h2 className="text-2xl font-heading text-neutral-100 mb-2">Oops! Something went wrong.</h2>
          <p className="text-neutral-300 mb-4">Error: {error}</p>
          <button 
            onClick={loadResearchPosts}
            className="px-4 py-2 bg-accent-purple hover:bg-accent-purple-hover text-white font-sans rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Research Feed" className="bg-black min-h-screen text-neutral-100 font-sans">
      <div className="p-4 sm:p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-heading text-neutral-100 mb-8 text-center">Research Feed</h1>
        
        {posts.length > 0 ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {posts.map((post) => {
              const authorName = post.profiles?.full_name || post.profiles?.first_name || 'Anonymous';
              const postDate = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'some time ago';
              const truncatedContent = post.content && post.content.length > 200 
                ? `${post.content.substring(0, 200)}...` 
                : post.content;

              return (
                <div key={post.id} className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:border-neutral-700">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center mb-3">
                        <Avatar 
                            src={post.profiles?.avatar_url} 
                            alt={authorName} 
                            size="md"
                            fallback={<FiUser className="h-5 w-5 text-accent-purple" />}
                            className="mr-3"
                        />
                        <div>
                            <p className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">{authorName}</p>
                            <p className="text-xs text-neutral-500">{post.profiles?.institution || 'Independent Researcher'} • {postDate}</p>
          </div>
        </div>
        
                    <Link href={`/research/${post.id}`} className="block mb-2">
                      <h2 className="text-xl lg:text-2xl font-heading text-neutral-100 hover:text-accent-purple transition-colors duration-150">
                        {post.title}
                      </h2>
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
                            className="bg-accent-purple/20 text-accent-purple px-2.5 py-1 rounded-full text-xs font-medium"
                          >
                            <FiTag className="inline mr-1 -mt-px"/> {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-neutral-800/50 px-5 sm:px-6 py-3 border-t border-neutral-800">
                    <Link href={`/research/${post.id}`} className="text-sm font-sans font-medium text-accent-purple hover:text-accent-purple-hover inline-flex items-center">
                        View Post <FiExternalLink className="ml-1.5 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiAlertCircle className="mx-auto text-6xl text-neutral-600 mb-4" />
            <h2 className="text-xl font-heading text-neutral-300 mb-2">No Research Posts Yet</h2>
            <p className="text-neutral-500 font-sans">Check back later or be the first to share your work!</p>
            {/* Optional: Add a link to create a new post if applicable */}
            {/* <Link href="/projects/new" className="mt-4 inline-block px-4 py-2 bg-accent-purple hover:bg-accent-purple-hover text-white font-sans rounded-md transition-colors">
              Create New Post
            </Link> */}
        </div>
        )}
      </div>
    </PageContainer>
  );
} 