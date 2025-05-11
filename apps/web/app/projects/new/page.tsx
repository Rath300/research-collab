'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import { FileUpload } from '@/components/research/FileUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FiX, FiUpload, FiSave, FiCheckCircle, FiAlertCircle, FiLoader, FiPaperclip, FiTag } from 'react-icons/fi';
import { PageContainer } from '@/components/layout/PageContainer';

// Define schema for research post form validation (aligned with research_posts table)
const researchPostFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters').max(10000, 'Content must be less than 10000 characters'),
  visibility: z.enum(['public', 'private', 'connections']).default('public'),
  tags: z.array(z.string()).optional().default([]),
});

type ResearchPostFormData = z.infer<typeof researchPostFormSchema>;

// Unused constants PROJECT_CATEGORIES and SKILLS_NEEDED are removed.

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = getBrowserClient();
  const { user, isLoading: authLoading } = useAuthStore();
  
  const [formData, setFormData] = useState<ResearchPostFormData>({
    title: '',
    content: '',
    visibility: 'public',
    tags: [],
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ResearchPostFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null); // For general page errors or submit errors
  const [pageSuccess, setPageSuccess] = useState<string | null>(null); // For success messages
  const [createdResearchPostId, setCreatedResearchPostId] = useState<string | null>(null);
  const [currentTag, setCurrentTag] = useState('');
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ResearchPostFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTag(e.target.value);
  };

  const handleTagAdd = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !(formData.tags || []).includes(trimmedTag) && (formData.tags || []).length < 10) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), trimmedTag] }));
      setCurrentTag('');
      if(errors.tags) setErrors(prev => ({ ...prev, tags: undefined }));
    }
  };
  
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: (prev.tags || []).filter(tag => tag !== tagToRemove) }));
  };
  
  const validateForm = () => {
    const result = researchPostFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResearchPostFormData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ResearchPostFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      setPageError('Please correct the errors in the form.');
      setPageSuccess(null);
      return false;
    }
    setErrors({});
    return true;
  };
  
  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageError(null);
    setPageSuccess(null);
    
    if (!validateForm()) return;
    if (!user) {
      setPageError('User not authenticated. Please log in.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const insertPayload = {
        user_id: user.id,
        title: formData.title,
        content: formData.content,
        visibility: formData.visibility,
        tags: formData.tags || [],
      };

      const { data, error: postError } = await supabase
        .from('research_posts')
        .insert(insertPayload)
        .select('id') // Only select id, other fields can be refetched if needed
        .single();
      
      if (postError) throw postError;
      if (!data || !data.id) throw new Error('Failed to create post or ID missing.');
      
      setCreatedResearchPostId(data.id);
      setPageSuccess('Post details saved! You can now upload associated files below.');
      // Clear form or keep data? For now, keep data if user wants to revise before uploading files for a *new* post.
      // If navigation happens away, form will reset on next visit naturally.
    } catch (err: any) {
      console.error('Submission error:', err);
      setPageError(err.message || 'Failed to create research post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileUploadComplete = (filePath: string) => {
    setPageSuccess(`File uploaded: ${filePath.split('/').pop()}. You can upload more or finish.`);
    // Consider adding a list of uploaded files here.
  }

  const handleFinish = () => {
    router.push(createdResearchPostId ? `/research/${createdResearchPostId}` : '/dashboard');
  };

  const commonLabelClass = "block text-sm font-medium text-gray-200 mb-1.5";
  const tagItemClass = "flex items-center bg-researchbee-yellow/20 text-researchbee-yellow px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-researchbee-yellow/30 shadow-sm transition-all hover:bg-researchbee-yellow/30";
  const tagRemoveButtonClass = "ml-2 text-researchbee-yellow/70 hover:text-white focus:outline-none transition-colors";

  if (authLoading) {
    return (
      <PageContainer title="New Post" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-researchbee-yellow text-6xl mb-4" />
          <p className="text-xl text-gray-300">Loading...</p>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer title="Create New Research Post" className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 min-h-screen text-white flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-3xl">
        <Card className="glass-card shadow-xl w-full overflow-hidden">
          <CardHeader className="pt-8 pb-6 text-center border-b border-white/10">
            <FiPaperclip className="text-5xl text-researchbee-yellow mx-auto mb-4" />
            <CardTitle className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
              Create New Research Post
            </CardTitle>
            <CardDescription className="text-gray-300 mt-2 text-lg px-4">
              Share your research ideas, findings, or collaboration requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Error and Success Messages Styling */}
            {pageError && (
              <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-sm backdrop-blur-sm flex items-start space-x-3">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-300" />
                <div>
                    <h5 className="font-semibold mb-0.5">Error</h5>
                    <span>{pageError}</span>
                </div>
              </div>
            )}
            {pageSuccess && (
              <div className="p-4 bg-green-500/20 border border-green-500/40 rounded-lg text-green-200 text-sm backdrop-blur-sm flex items-start space-x-3">
                <FiCheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-green-300" />
                <div>
                    <h5 className="font-semibold mb-0.5">Success!</h5>
                    <span>{pageSuccess}</span>
                </div>
              </div>
            )}

            {!createdResearchPostId ? (
              <form onSubmit={handleSubmitDetails} className="space-y-6">
                <div>
                  <label htmlFor="title" className={commonLabelClass}>
                    Title<span className="text-red-400 ml-1">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="E.g., AI in Sustainable Agriculture"
                    error={!!errors.title}
                    className="bg-white/5 border-white/20 placeholder-gray-400/60 text-white"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-300">{errors.title}</p>}
                </div>
                
                <div>
                  <label htmlFor="content" className={commonLabelClass}>
                    Content / Description<span className="text-red-400 ml-1">*</span>
                  </label>
                  <Input
                    id="content"
                    name="content"
                    type="textarea"
                    rows={6}
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Describe your project in detail..."
                    error={!!errors.content}
                    className="bg-white/5 border-white/20 placeholder-gray-400/60 text-white"
                  />
                  {errors.content && <p className="mt-1 text-sm text-red-300">{errors.content}</p>}
                </div>

                <div>
                  <label htmlFor="tags" className={commonLabelClass}>
                    Tags / Keywords (up to 10)
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      id="tag-input"
                      name="tag-input"
                      value={currentTag}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add relevant tags (e.g., AI, Healthcare)"
                      className="flex-grow bg-white/5 border-white/20 placeholder-gray-400/60 text-white"
                    />
                    <Button type="button" onClick={handleTagAdd} variant="secondary" className="bg-researchbee-yellow/80 hover:bg-researchbee-yellow text-black flex-shrink-0">
                      <FiTag className="mr-2"/> Add Tag
                    </Button>
                  </div>
                  {errors.tags && <p className="mt-1 text-sm text-red-300">{errors.tags}</p>}
                  {(formData.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(formData.tags || []).map(tag => (
                        <span key={tag} className={tagItemClass}>
                          {tag}
                          <button type="button" onClick={() => handleTagRemove(tag)} className={tagRemoveButtonClass}>
                            <FiX size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="visibility" className={commonLabelClass}>
                    Visibility
                  </label>
                  <select 
                    id="visibility" 
                    name="visibility" 
                    value={formData.visibility} 
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white focus:ring-2 focus:ring-researchbee-yellow focus:border-researchbee-yellow outline-none transition-all duration-150 ease-in-out shadow-sm"
                  >
                    <option value="public" className="bg-gray-800 text-white">Public (Visible to everyone)</option>
                    <option value="connections" className="bg-gray-800 text-white">Connections Only (Visible to your matches/connections)</option>
                    <option value="private" className="bg-gray-800 text-white">Private (Only visible to you)</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-researchbee-yellow hover:bg-researchbee-darkyellow text-black py-3 text-base font-semibold tracking-wide flex items-center justify-center"
                >
                  {isSubmitting ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />} 
                  {isSubmitting ? 'Saving Details...' : 'Save Post Details'}
                </Button>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <h3 className="text-2xl font-semibold text-white">Upload Project Files (Optional)</h3>
                <p className="text-gray-300">
                  Your post details have been saved. You can now upload any relevant documents, images, or datasets.
                </p>
                <div className="p-4 rounded-lg bg-black/20 border border-white/10 shadow-md">
                    <FileUpload researchPostId={createdResearchPostId} onUploadComplete={handleFileUploadComplete} />
                </div>
                <Button onClick={handleFinish} variant="primary" className="w-full max-w-xs mx-auto bg-green-500 hover:bg-green-600 text-white py-3 text-base">
                  <FiCheckCircle className="mr-2"/> Finish & View Post / Go to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
} 