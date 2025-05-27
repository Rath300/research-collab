'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getBrowserClient } from '@/lib/supabaseClient';
import { useAuthStore } from '@/lib/store';
import { FileUpload } from '@/components/research/FileUpload';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { FiX, FiUpload, FiSave, FiCheckCircle, FiAlertCircle, FiLoader, FiPaperclip, FiFilePlus, FiFileText, FiTrash2, FiFile } from 'react-icons/fi';

// Define schema for research post form validation (aligned with research_posts table)
const researchPostFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters (plain text equivalent). HTML may be longer.').max(15000, 'Content must be less than 15000 characters (HTML).'),
  visibility: z.enum(['public', 'private', 'connections']).default('public'),
  tags: z.array(z.string()).optional().default([]),
});

type ResearchPostFormData = z.infer<typeof researchPostFormSchema>;

interface UploadedFileData {
  name: string;
  path: string;
  type: string;
  size: number;
}

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper to get file icon
function getFileIcon(fileType: string): React.ReactElement {
  if (fileType.startsWith('image/')) return <FiFilePlus className="text-blue-400" />;
  if (fileType === 'application/pdf') return <FiFileText className="text-red-400" />;
  // Add more specific icons as needed
  return <FiFile className="text-neutral-400" />;
}

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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileData[]>([]); // State for uploaded files list
  const [isRemovingFile, setIsRemovingFile] = useState<string | null>(null); // To track which file is being removed
  
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

  const handleContentChange = (richText: string) => {
    setFormData(prev => ({ ...prev, content: richText }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: undefined }));
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
      setPageSuccess('Project details saved! You can now upload associated files below.');
      // Clear form or keep data? For now, keep data if user wants to revise before uploading files for a *new* post.
      // If navigation happens away, form will reset on next visit naturally.
    } catch (err: any) {
      console.error('Submission error:', err);
      // Check for Supabase specific error codes for duplicate titles if applicable
      if (err.code === '23505') { // PostgreSQL unique violation
        setPageError('A project with this title already exists. Please choose a different title.');
        setErrors(prev => ({...prev, title: 'This title is already taken.'}));
      } else {
      setPageError(err.message || 'Failed to create project. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileUploadComplete = (fileData: UploadedFileData) => {
    setUploadedFiles(prevFiles => [...prevFiles, fileData]);
    setPageSuccess(`File "${fileData.name}" added successfully.`); // Update success message
    setPageError(null); // Clear any previous errors
  };

  // Placeholder for future remove file logic
  const handleRemoveFile = async (filePathToRemove: string) => {
    if (!createdResearchPostId || !user) {
      setPageError("Cannot remove file: Project or user context is missing.");
      return;
    }
    if (isRemovingFile) return; // Prevent multiple removal requests

    setIsRemovingFile(filePathToRemove);
    setPageError(null);
    setPageSuccess(null);

    try {
      // 1. Remove from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('project_files')
        .remove([filePathToRemove]);

      if (storageError) {
        // If storage deletion fails, we might not want to proceed to DB deletion,
        // or we might want to log it and attempt DB deletion anyway, depending on desired consistency.
        // For now, let's throw and stop.
        throw new Error(`Storage error: ${storageError.message}`);
      }

      // 2. Remove from 'project_files' DB table
      // Assuming 'file_path' is unique enough for deletion. If not, might need project_id and uploader_id too.
      const { error: dbError } = await supabase
        .from('project_files')
        .delete()
        .eq('file_path', filePathToRemove)
        .eq('research_post_id', createdResearchPostId); // Ensure we only delete from the current project

      if (dbError) {
        // What if storage was deleted but DB fails? This could leave an orphaned file in storage.
        // Or if DB delete worked but storage didn't, an entry in DB for non-existent file.
        // Robust error handling might involve retry mechanisms or cleanup jobs.
        // For now, we'll report the error.
        throw new Error(`Database error: ${dbError.message}`);
      }

      // 3. Update UI
      const removedFileName = uploadedFiles.find(f => f.path === filePathToRemove)?.name;
      setUploadedFiles(prevFiles => prevFiles.filter(f => f.path !== filePathToRemove));
      setPageSuccess(removedFileName ? `File "${removedFileName}" removed successfully.` : "File removed successfully.");

    } catch (err: any) {
      console.error("File removal error:", err);
      setPageError(err.message || 'Failed to remove file. Please try again.');
    } finally {
      setIsRemovingFile(null);
    }
  };

  const handleFinish = () => {
    router.push(createdResearchPostId ? `/research/${createdResearchPostId}` : '/dashboard');
  };

  // Updated classes for the new design
  const commonLabelClass = "block text-sm font-medium text-neutral-300 mb-1.5 font-sans";
  const tagItemClass = "flex items-center bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-full text-xs font-sans shadow-sm transition-all hover:bg-neutral-600";
  const tagRemoveButtonClass = "ml-2 text-neutral-400 hover:text-white focus:outline-none transition-colors";
  const inputBaseClass = "flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50 font-sans";
  const textareaBaseClass = inputBaseClass.replace('h-10', 'min-h-[80px]').replace('focus-visible:ring-accent-purple', 'focus-visible:ring-accent-purple'); // Ensure textarea also gets accent color

  if (authLoading) {
    return (
      <div className="bg-black min-h-screen text-neutral-300 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin text-neutral-500 text-5xl mb-4" />
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="bg-black min-h-screen text-neutral-100 flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-2xl">
        <Card className="bg-neutral-900 border border-neutral-800 shadow-xl w-full overflow-hidden rounded-lg">
          <CardHeader className="pt-8 pb-6 text-center border-b border-neutral-800">
            <FiFilePlus className="text-5xl text-neutral-500 mx-auto mb-4" />
            <CardTitle className="text-3xl sm:text-4xl font-heading text-neutral-100">
              Create New Project
            </CardTitle>
            <CardDescription className="text-neutral-400 mt-2 text-base px-4 font-sans">
              Share your research ideas, findings, or collaboration requests.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            {pageError && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-md text-red-300 text-sm flex items-start space-x-2.5 font-sans">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
                <div>
                    <h5 className="font-semibold mb-0.5 font-heading">Error</h5>
                    <span>{pageError}</span>
                </div>
              </div>
            )}
            {pageSuccess && !createdResearchPostId && (
              <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-md text-green-300 text-sm flex items-start space-x-2.5 font-sans">
                <FiCheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-green-400" />
                <div>
                    <h5 className="font-semibold mb-0.5 font-heading">Success!</h5>
                    <span>{pageSuccess}</span>
                </div>
              </div>
            )}

            {!createdResearchPostId ? (
              <form onSubmit={handleSubmitDetails} className="space-y-6">
                <div>
                  <label htmlFor="title" className={commonLabelClass}>
                    Title<span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="E.g., AI in Sustainable Agriculture"
                    className={`${inputBaseClass} ${errors.title ? 'border-red-600 focus-visible:ring-red-500' : ''}`}
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? "title-error" : undefined}
                  />
                  {errors.title && <p id="title-error" className="mt-1 text-sm text-red-400 font-sans">{errors.title}</p>}
                </div>
                
                <div>
                  <label htmlFor="content" className={commonLabelClass}>
                    Content / Description<span className="text-red-500 ml-1">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    placeholder="Describe your project in detail... (Use toolbar for formatting)"
                    hasError={!!errors.content}
                  />
                  {errors.content && <p id="content-error" className="mt-1 text-sm text-red-400 font-sans">{errors.content}</p>}
                </div>

                <div>
                  <label htmlFor="tags" className={commonLabelClass}>
                    Tags / Keywords <span className="text-xs text-neutral-500">(up to 10, press Enter or comma to add)</span>
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      id="tag-input"
                      name="tag-input"
                      value={currentTag}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Type a tag and press Enter"
                      className={`${inputBaseClass} flex-grow`}
                    />
                    <Button type="button" onClick={handleTagAdd} variant="secondary" className="font-sans">Add Tag</Button>
                  </div>
                  {errors.tags && <p className="mt-1 text-sm text-red-400 font-sans">{errors.tags}</p>}
                  {(formData.tags && formData.tags.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <div key={tag} className={tagItemClass}>
                          <span>{tag}</span>
                          <button type="button" onClick={() => handleTagRemove(tag)} className={tagRemoveButtonClass} aria-label={`Remove ${tag}`}>
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <label htmlFor="visibility" className={commonLabelClass}>
                    Visibility<span className="text-red-500 ml-1">*</span>
                  </label>
                  <select 
                    id="visibility" 
                    name="visibility" 
                    value={formData.visibility} 
                    onChange={handleInputChange}
                    className={`${inputBaseClass} appearance-none ${errors.visibility ? 'border-red-600 focus-visible:ring-red-500' : ''}`}
                  >
                    <option value="public">Public</option>
                    <option value="connections">Connections Only</option>
                    <option value="private">Private</option>
                  </select>
                  {errors.visibility && <p className="mt-1 text-sm text-red-400 font-sans">{errors.visibility}</p>}
                </div>

                <div className="pt-4">
                <Button 
                  type="submit" 
                    className="w-full font-sans bg-neutral-100 text-black hover:bg-neutral-300 focus-visible:ring-neutral-400"
                    isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Project Details & Next'}
                </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 pt-4">
                <div>
                  <h3 className="text-xl font-heading text-neutral-100 mb-2">Attached Files</h3>
                  {uploadedFiles.length > 0 ? (
                    <ul className="space-y-2 mb-4 border border-neutral-700 rounded-md p-3 bg-neutral-800/40">
                      {uploadedFiles.map((file) => (
                        <li key={file.path} className="flex items-center justify-between p-2 rounded hover:bg-neutral-700/50 transition-colors">
                          <div className="flex items-center gap-2">
                            {getFileIcon(file.type)} 
                            <span className="text-sm text-neutral-200 font-sans truncate max-w-[250px]" title={file.name}>{file.name}</span>
                            <span className="text-xs text-neutral-500">({formatFileSize(file.size)})</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveFile(file.path)} 
                            title="Remove file"
                            className="text-neutral-500 hover:text-red-400 transition-colors p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isRemovingFile === file.path}
                          >
                            {isRemovingFile === file.path ? <FiLoader className="animate-spin" size={16}/> : <FiTrash2 size={16} />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-neutral-500 mb-4 p-3 border border-dashed border-neutral-700 rounded-md text-center font-sans">
                      No files uploaded yet.
                    </p>
                  )}
                  <FileUpload 
                    researchPostId={createdResearchPostId!}
                    onUploadComplete={handleFileUploadComplete}
                  />
                  {pageError && createdResearchPostId && ( // Display errors related to file operations here
                    <div className="mt-4 p-3 bg-red-900/30 border border-red-700/50 rounded-md text-red-300 text-sm flex items-start space-x-2.5 font-sans">
                      <FiAlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
                      <div>
                          <h5 className="font-semibold mb-0.5 font-heading">Error</h5>
                          <span>{pageError}</span>
                      </div>
                    </div>
                  )}
                  {pageSuccess && createdResearchPostId && ( // Display success messages for file operations
                     <div className="mt-4 p-3 bg-green-900/30 border border-green-700/50 rounded-md text-green-300 text-sm flex items-start space-x-2.5 font-sans">
                        <FiCheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-green-400" />
                        <div>
                            <h5 className="font-semibold mb-0.5 font-heading">Success!</h5>
                            <span>{pageSuccess}</span>
                        </div>
                      </div>
                  )}
                </div>
                <div className="pt-6 border-t border-neutral-800 mt-6">
                  <Button 
                    onClick={handleFinish} 
                    className="w-full sm:w-auto font-sans bg-green-600 hover:bg-green-500 text-white"
                  >
                    <FiCheckCircle className="mr-2" /> Finish & View Project
                  </Button>
                  <p className="text-xs text-neutral-500 mt-3 font-sans">
                    You can also skip file upload and view your project directly.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
} 