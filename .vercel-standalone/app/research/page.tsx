'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ResearchPostCard } from '@/components/research/ResearchPostCard';
import { FiPlus, FiSearch, FiFilter, FiTag } from 'react-icons/fi';
import { useResearchStore, useAuthStore } from '@/lib/store';
import { getResearchPosts, updateResearchPost } from '@/lib/api';
import CreatePostModal from '@/components/research/CreatePostModal';

export default function ResearchPage() {
  const searchParams = useSearchParams();
  const tagParam = searchParams.get('tag');
  
  const { posts, isLoading, hasMore, setPosts, appendPosts, setLoading, setHasMore, resetPosts } = useResearchStore();
  const { user } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(tagParam ? [tagParam] : []);
  const [offset, setOffset] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const loadPosts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        resetPosts();
        setOffset(0);
      }
      
      if (isLoading || (!hasMore && !reset)) return;
      
      setLoading(true);
      const currentOffset = reset ? 0 : offset;
      
      // Get posts from API
      const newPosts = await getResearchPosts({
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        limit: 10,
        offset: currentOffset,
      });
      
      if (reset) {
        setPosts(newPosts);
      } else {
        appendPosts(newPosts);
      }
      
      setOffset(currentOffset + newPosts.length);
      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load and when filters change
  useEffect(() => {
    loadPosts(true);
  }, [selectedTags]);
  
  // When tag param changes
  useEffect(() => {
    if (tagParam) {
      setSelectedTags([tagParam]);
    }
  }, [tagParam]);
  
  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      // Find the post
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      
      // Update engagement count locally first for UI responsiveness
      const updatedPost = {
        ...post,
        engagement_count: post.engagement_count + 1,
      };
      
      // Update in state
      setPosts(posts.map((p) => (p.id === postId ? updatedPost : p)));
      
      // Update in the database
      await updateResearchPost({
        id: postId,
        engagement_count: updatedPost.engagement_count,
      });
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert on error
      loadPosts(true);
    }
  };
  
  const handleBoost = async (postId: string) => {
    // This would open a modal to purchase a boost with Stripe
    alert('Boost feature coming soon!');
  };
  
  // Handle infinite scroll
  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 500
    ) {
      if (!isLoading && hasMore) {
        loadPosts();
      }
    }
  };
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore, offset]);
  
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Research Feed</h1>
        
        <Button 
          onClick={() => setShowCreateModal(true)}
          leftIcon={<FiPlus />}
        >
          Create Post
        </Button>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search research posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            leftIcon={<FiSearch />}
          />
          
          <Button 
            variant="outline" 
            leftIcon={<FiFilter />}
          >
            Filter
          </Button>
        </div>
        
        {/* Tags */}
        {popularTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <FiTag size={14} className="mr-1.5" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Research Posts */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <ResearchPostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onBoost={handleBoost}
            />
          ))
        ) : !isLoading ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">No research posts found</p>
            {selectedTags.length > 0 && (
              <Button variant="ghost" onClick={() => setSelectedTags([])}>
                Clear filters
              </Button>
            )}
          </div>
        ) : null}
        
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
          </div>
        )}
        
        {!isLoading && !hasMore && posts.length > 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No more posts to load
          </p>
        )}
      </div>
      
      {showCreateModal && (
        <CreatePostModal 
          onClose={() => setShowCreateModal(false)} 
          onPostCreated={() => {
            setShowCreateModal(false);
            loadPosts(true);
          }}
        />
      )}
    </div>
  );
}

// Some popular tags for filtering
const popularTags = [
  'Machine Learning',
  'Computer Science',
  'Physics',
  'Biology',
  'Chemistry',
  'Mathematics',
  'Economics',
  'Psychology',
  'Neuroscience',
]; 