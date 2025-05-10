'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  FiUser, 
  FiThumbsUp, 
  FiMessageSquare, 
  FiShare2, 
  FiClock, 
  FiZap, 
  FiTag, 
  FiArrowLeft 
} from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { getResearchPost, updateResearchPost, deleteResearchPost } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

export default function ResearchPostPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const loadPost = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const postData = await getResearchPost(params.id as string);
      setPost(postData);
    } catch (err: any) {
      console.error('Error loading post:', err);
      setError(err.message || 'Failed to load research post');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadPost();
  }, [params.id]);
  
  const handleLike = async () => {
    if (!post || !user) return;
    
    try {
      // Update engagement count locally first for UI responsiveness
      const updatedPost = {
        ...post,
        engagement_count: post.engagement_count + 1,
      };
      
      setPost(updatedPost);
      
      // Update in the database
      await updateResearchPost(post.id, {
        engagement_count: updatedPost.engagement_count,
      });
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert on error
      loadPost();
    }
  };
  
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };
  
  const handleDeletePost = async () => {
    if (!post || !user) return;
    
    try {
      setIsLoading(true);
      
      // Delete the post
      await deleteResearchPost(post.id);
      
      // Redirect to research feed
      router.push('/research');
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. Please try again.');
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
          <p className="text-red-500 dark:text-red-400 mb-4">{error || 'Post not found'}</p>
          <Button variant="outline" onClick={() => router.push('/research')}>
            Back to Research Feed
          </Button>
        </div>
      </div>
    );
  }
  
  const createdAt = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : '';
  const isAuthor = user && post.user_id === user.id;
  const fullName = post.profiles ? `${post.profiles.first_name} ${post.profiles.last_name}` : 'Unknown User';
  const institution = post.profiles?.institution || 'Independent Researcher';
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4">
        <Button
          variant="ghost"
          className="px-0 py-0 h-auto text-primary-600 dark:text-primary-400"
          onClick={() => router.push('/research')}
        >
          <FiArrowLeft className="mr-2" />
          Back to Research Feed
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Post header with user info */}
          <div className="flex items-center space-x-3">
            <Link href={`/profile/${post.user_id}`} className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                {post.profiles?.avatar_url ? (
                  <img 
                    src={post.profiles.avatar_url} 
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FiUser className="text-primary-600" size={24} />
                )}
              </div>
            </Link>
            
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${post.user_id}`} className="hover:underline">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {fullName}
                </p>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {institution} • {createdAt}
              </p>
            </div>
            
            {post.is_boosted && (
              <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center text-sm font-medium dark:bg-yellow-900/30 dark:text-yellow-400">
                <FiZap size={16} className="mr-1.5" />
                Boosted
              </div>
            )}
          </div>
          
          {/* Post title and content */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {post.content}
              </p>
            </div>
          </div>
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/research?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-md flex items-center hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <FiTag size={14} className="mr-1.5" />
                  {tag}
                </Link>
              ))}
            </div>
          )}
          
          {/* Actions */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex flex-wrap justify-between items-center">
            <div className="flex space-x-2 sm:space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLike}
                className="text-gray-600 dark:text-gray-400"
              >
                <FiThumbsUp size={18} className="mr-1.5" />
                <span>{post.engagement_count || 0}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-600 dark:text-gray-400"
              >
                <FiMessageSquare size={18} className="mr-1.5" />
                <span>Comment</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-600 dark:text-gray-400"
                onClick={handleShare}
              >
                <FiShare2 size={18} className="mr-1.5" />
                <span>Share</span>
              </Button>
            </div>
            
            {isAuthor && (
              <div className="flex space-x-2 mt-4 sm:mt-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/research/edit/${post.id}`)}
                >
                  Edit
                </Button>
                
                {showDeleteConfirm ? (
                  <>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDeletePost}
                      isLoading={isLoading}
                    >
                      Confirm
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Comments section could be added here */}
        </CardContent>
      </Card>
    </div>
  );
} 