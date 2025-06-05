'use client'

import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabaseClient'
import { FiUploadCloud } from 'react-icons/fi';

interface FileUploadProps {
  researchPostId: string
  onUploadComplete?: (fileData: { name: string; path: string; type: string; size: number }) => void;
}

// Define classes similar to our Button variant="outline" for dark theme
const labelButtonClasses = 
  "inline-flex items-center justify-center rounded-md text-sm font-sans font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-neutral-100 h-10 px-4 py-2 cursor-pointer";

export function FileUpload({ researchPostId, onUploadComplete }: FileUploadProps) {
  const supabase = getBrowserClient()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      handleFileUpload(file);
    } else {
      setSelectedFileName(null);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setError(null);

    try {
      setUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const randomFileName = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `research-posts/${researchPostId}/${user.id}/${randomFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project_files')
        .upload(filePath, file, { 
            cacheControl: '3600',
            upsert: false
        });

      if (uploadError) throw uploadError;

      // Record file in database
      const fileMetadata = {
          research_post_id: researchPostId,
          uploader_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
      };
      const { error: dbError } = await supabase
        .from('project_files')
        .insert(fileMetadata);

      if (dbError) {
        await supabase.storage.from('project_files').remove([filePath]);
        throw dbError;
      }
      
      if (onUploadComplete) {
        onUploadComplete({ 
          name: file.name, 
          path: filePath, 
          type: file.type,
          size: file.size 
        });
      }
      setSelectedFileName(null);

    } catch (err) {
      console.error("File upload error:", err);
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 border border-neutral-700 rounded-lg bg-neutral-800/30">
      <div className="flex items-center gap-3">
      <label
        htmlFor={`file-upload-${researchPostId}`}
          className={`${labelButtonClasses} ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
          <FiUploadCloud className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : (selectedFileName ? 'Change File' : 'Choose File')}
        </label>
        <input
          id={`file-upload-${researchPostId}`}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        {selectedFileName && !uploading && (
            <p className="text-sm text-neutral-400 font-sans truncate max-w-[200px]" title={selectedFileName}>Selected: {selectedFileName}</p>
      )}
      </div>
      
      {error && (
        <p className="text-sm text-red-400 font-sans">Error: {error}</p>
      )}
    </div>
  );
} 