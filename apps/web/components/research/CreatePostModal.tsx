'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { FiX, FiHash, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/trpc';
import { useRouter } from 'next/navigation';

interface CreatePostModalProps {
  onClose: () => void;
}

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const utils = api.useUtils();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'private' | 'connections'>('public');

  const createPostMutation = api.project.create.useMutation({
    onSuccess: (newPost) => {
      // Invalidate queries that fetch lists of projects to show the new post
      utils.project.listMyProjects.invalidate();
      // You might also want to invalidate dashboard queries or other feeds
      
      onClose(); // Close the modal on success
      router.push(`/projects/${newPost.id}`); // Redirect to the new project page
    },
    onError: (error) => {
      // The error state from the hook will be used to display the message
      console.error('Failed to create post:', error);
    }
  });
  
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      createPostMutation.reset(); // Clear any previous error states
      createPostMutation.mutate(undefined, {
          onError: () => {} // Prevent unhandled rejection
      });
      return;
    }
    
    if (!user) {
      return;
    }
    
    createPostMutation.mutate({
      title,
      content,
      tags: tags.length > 0 ? tags : undefined,
      visibility,
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create Research Post</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 p-0"
          >
            <FiX size={18} />
          </Button>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {createPostMutation.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm dark:bg-red-900/20 dark:text-red-400">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{createPostMutation.error.message}</span>
              </div>
            )}
            
            <Input
              label="Title"
              placeholder="Enter your research title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Content
              </label>
              <textarea
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[200px] disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
                placeholder="Describe your research, findings, or questions..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Tags (up to 5)
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add a tag (e.g., Machine Learning)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                >
                  Add
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-sm flex items-center space-x-1 dark:bg-primary-900/20 dark:text-primary-300"
                    >
                      <FiHash size={12} />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500 focus:outline-none"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Visibility
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={() => setVisibility('public')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">Public</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="connections"
                    checked={visibility === 'connections'}
                    onChange={() => setVisibility('connections')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">Connections Only</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={() => setVisibility('private')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">Private</span>
                </label>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createPostMutation.isPending}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={createPostMutation.isPending}
            >
              {createPostMutation.isPending ? <FiLoader className="animate-spin mr-2"/> : null}
              {createPostMutation.isPending ? 'Publishing...' : 'Publish'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 