'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/trpc';
import { FileUpload } from '@/components/research/FileUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FiX, FiUpload, FiSave, FiCheckCircle, FiAlertCircle, FiLoader, FiPaperclip, FiFilePlus, FiFileText, FiTrash2, FiFile } from 'react-icons/fi';

const projectFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .superRefine((val, ctx) => {
      const plainText = val.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      if (plainText.length < 20) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Description must be at least 20 characters',
        });
      }
      if (plainText.length > 15000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Description must be less than 15000 characters',
        });
      }
    }),
  visibility: z.enum(['public', 'private', 'connections']).default('public'),
  tags: z.array(z.string()).optional().default([]),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface UploadedFileData {
  name: string;
  path: string;
  type: string;
  size: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(fileType: string): React.ReactElement {
  if (fileType.startsWith('image/')) return <FiFilePlus className="text-blue-400" />;
  if (fileType === 'application/pdf') return <FiFileText className="text-red-400" />;
  return <FiFile className="text-neutral-400" />;
}

export default function NewProjectPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    visibility: 'public',
    tags: [],
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageSuccess, setPageSuccess] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [currentTag, setCurrentTag] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileData[]>([]);
  const [isRemovingFile, setIsRemovingFile] = useState<string | null>(null);

  const createProjectMutation = api.project.create.useMutation({
    onSuccess: (data) => {
      console.log('[DEBUG] Project created, returned data:', data);
      setCreatedProjectId(data.id);
      setPageSuccess('Project details saved! You can now upload associated files below.');
    },
    onError: (error) => {
      console.error('Submission error:', error);
      if (error.message.includes('unique constraint')) {
        setPageError('A project with this title already exists. Please choose a different title.');
        setErrors(prev => ({...prev, title: 'This title is already taken.'}));
      } else {
        setPageError(error.message || 'Failed to create project. Please try again.');
      }
    },
  });

  const isSubmitting = createProjectMutation.isPending;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ProjectFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleContentChange = (richText: string) => {
    setFormData(prev => ({ ...prev, description: richText }));
    if (errors.description) {
      setErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTag(e.target.value);
  };

  const handleTagAdd = () => {
    const trimmedTag = currentTag.trim().toLowerCase();
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
    const result = projectFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProjectFormData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ProjectFormData] = err.message;
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
  
  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setPageError(null);
    setPageSuccess(null);
    
    if (!validateForm()) return;
    if (!user) {
      setPageError('User not authenticated. Please log in.');
      return;
    }
    
    console.log('[DEBUG] Creating project with tags:', formData.tags);
    createProjectMutation.mutate({
      title: formData.title,
      content: undefined, // Remove content
      description: formData.description,
      visibility: formData.visibility,
      tags: formData.tags || [],
    });
  };
  
  const handleFileUploadComplete = (fileData: UploadedFileData) => {
    setUploadedFiles(prevFiles => [...prevFiles, fileData]);
    setPageSuccess(`File "${fileData.name}" added successfully.`);
    setPageError(null);
  };

  const handleRemoveFile = async (filePathToRemove: string) => {
    // NOTE: This should be converted to a tRPC mutation.
    // The client-side supabase call is still here as a placeholder.
    console.warn("handleRemoveFile is using a client-side Supabase call and should be updated.");
  };

  const handleFinish = () => {
    router.push(createdProjectId ? `/projects/${createdProjectId}` : '/dashboard');
  };

  const commonLabelClass = "block text-sm font-medium text-neutral-300 mb-1.5 font-sans";
  const tagItemClass = "flex items-center bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-full text-xs font-sans shadow-sm transition-all hover:bg-neutral-600";
  const tagRemoveButtonClass = "ml-2 text-neutral-400 hover:text-white focus:outline-none transition-colors";
  const inputBaseClass = "flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 font-sans";
  const textareaBaseClass = inputBaseClass.replace('h-10', 'min-h-[80px]');

  if (authLoading) {
    return (
      <div className="bg-bg-primary min-h-screen text-text-primary flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-neutral-500 text-5xl mb-4" />
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-bg-primary min-h-screen text-text-primary font-sans p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <Card className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-semibold text-white font-heading">Create New Research Project</CardTitle>
            <CardDescription className="text-neutral-400 mt-2">
              Start by defining the core details of your project. You can add files and other resources after saving.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmitDetails} className="space-y-8">
              {/* Form Fields */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className={commonLabelClass}>Project Title</label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., 'The Impact of AI on Climate Change'"
                    className={inputBaseClass}
                    disabled={isSubmitting || !!createdProjectId}
                  />
                  {errors.title && <p className="mt-2 text-sm text-red-400">{errors.title}</p>}
                </div>

                <div>
                    <label htmlFor="content" className={commonLabelClass}>Project Abstract / Summary</label>
                    <RichTextEditor 
                        value={formData.description}
                        onChange={handleContentChange}
                        editable={!isSubmitting && !createdProjectId}
                    />
                    {errors.description && <p className="mt-2 text-sm text-red-400">{errors.description}</p>}
                </div>
                
                <div>
                  <label htmlFor="tags" className={commonLabelClass}>Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(formData.tags || []).map(tag => (
                      <span key={tag} className={tagItemClass}>
                        {tag}
                        <button
                          type="button"
                          className={tagRemoveButtonClass}
                          onClick={() => handleTagRemove(tag)}
                          aria-label={`Remove tag ${tag}`}
                        >
                          <FiX />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    id="tags"
                    name="tags"
                    value={currentTag}
                    onChange={handleTagInputChange}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add a tag and press Enter"
                    className={inputBaseClass}
                    disabled={isSubmitting || !!createdProjectId}
                  />
                  {errors.tags && <p className="mt-2 text-sm text-red-400">{errors.tags}</p>}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-4">
                <Button type="submit" variant="default" disabled={isSubmitting || !!createdProjectId}>
                  {isSubmitting ? (
                    <>
                      <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2 h-4 w-4" />
                      Save Project Details
                    </>
                  )}
                </Button>
              </div>

               {pageError && (
                <div className="mt-4 flex items-center text-red-400 bg-red-900/20 p-3 rounded-md border border-red-800">
                  <FiAlertCircle className="mr-3 h-5 w-5"/>
                  <span>{pageError}</span>
                </div>
              )}

              {pageSuccess && !createdProjectId && (
                 <div className="mt-4 flex items-center text-green-400 bg-green-900/20 p-3 rounded-md border border-green-800">
                  <FiCheckCircle className="mr-3 h-5 w-5"/>
                  <span>{pageSuccess}</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {createdProjectId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center">
                  <FiPaperclip className="mr-3 text-accent-purple" />
                  Upload Project Files
                </CardTitle>
                <CardDescription className="text-neutral-400 mt-2">
                  Your project details have been saved. Now you can upload supporting documents, images, or datasets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload 
                  projectId={createdProjectId} 
                  onUploadComplete={handleFileUploadComplete} 
                />
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-neutral-200 mb-3">Uploaded Files:</h3>
                  {uploadedFiles.length > 0 ? (
                    <ul className="space-y-3">
                      {uploadedFiles.map(file => (
                        <li key={file.path} className="flex items-center justify-between bg-neutral-800 p-3 rounded-md">
                          <div className="flex items-center">
                            <span className="mr-3 text-2xl">{getFileIcon(file.type)}</span>
                            <div>
                              <p className="text-sm font-medium text-neutral-100">{file.name}</p>
                              <p className="text-xs text-neutral-400">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRemoveFile(file.path)}
                            disabled={isRemovingFile === file.path}
                          >
                            {isRemovingFile === file.path ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-neutral-500">No files uploaded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 flex justify-end">
                <Button onClick={handleFinish} variant="primary" size="lg">
                    Finish & View Project
                </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 