'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { FiX, FiHash, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { api } from '@/lib/trpc';
import { type Database } from '@/lib/database.types';

type ResearchPost = Database['public']['Tables']['research_posts']['Row'];
type Visibility = 'public' | 'private' | 'connections';

function toVisibility(value: string | null | undefined): Visibility {
    if (value === 'public' || value === 'private' || value === 'connections') {
        return value;
    }
    return 'public';
}

interface EditPostModalProps {
  post: ResearchPost;
  onClose: () => void;
}

export default function EditPostModal({ post, onClose }: EditPostModalProps) {
  const utils = api.useUtils();
  
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [visibility, setVisibility] = useState<Visibility>(toVisibility(post.visibility));

  const updatePostMutation = api.project.update.useMutation({
    onSuccess: () => {
      // Invalidate the specific post query as well as any list views
      utils.project.getById.invalidate({ id: post.id });
      utils.project.listMyProjects.invalidate();
      onClose();
    },
    onError: (error) => {
      console.error('Failed to update post:', error);
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePostMutation.mutate({
      id: post.id,
      title,
      content,
      tags,
      visibility,
    });
  };
  
  useEffect(() => {
    setTitle(post.title);
    setContent(post.content);
    setTags(post.tags || []);
    setVisibility(toVisibility(post.visibility));
  }, [post]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Research Post</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}><FiX size={18} /></Button>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {updatePostMutation.error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center space-x-2 text-sm">
                <FiAlertCircle className="h-5 w-5" />
                <span>{updatePostMutation.error.message}</span>
              </div>
            )}
            
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            
            <div>
              <label>Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            
            {/* Tag and Visibility inputs would be here, similar to CreatePostModal */}

          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={updatePostMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePostMutation.isPending}>
              {updatePostMutation.isPending ? <FiLoader className="animate-spin mr-2"/> : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 