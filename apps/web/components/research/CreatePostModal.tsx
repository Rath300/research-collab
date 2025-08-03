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
      return;
    }
    
    if (!user) {
      return;
    }
    
    createPostMutation.mutate({
      title,
      description: content,
      tags: tags.length > 0 ? tags : undefined,
      is_public: visibility === 'public',
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white border border-border-light">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-text-primary">Create New Research Project</CardTitle>
            <p className="text-text-secondary text-sm mt-1">Start by defining the core details of your project. You can add files and other resources after saving.</p>
          </div>
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
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{createPostMutation.error.message}</span>
              </div>
            )}
            
            <Input
              label="Project Title"
              placeholder="The Art of Making Websites"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
            
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Project Abstract / Summary
              </label>
              <textarea
                className="flex w-full rounded-md border border-border-light bg-white px-3 py-2 text-sm placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent min-h-[200px] disabled:cursor-not-allowed disabled:opacity-50 text-text-primary"
                placeholder="Making cool Websites for everyone"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Tags
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add a tag and press Enter"
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
                      className="bg-text-secondary/10 text-text-secondary px-2 py-1 rounded-full text-sm flex items-center space-x-1"
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