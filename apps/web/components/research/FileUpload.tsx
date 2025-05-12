'use client'

import React, { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { SupabaseStorageError } from '@/lib/errors';

const supabase = getSupabaseClient();

interface FileUploadProps {
  researchPostId: string
  onUploadSuccess: (url: string) => void;
}

export function FileUpload({ researchPostId, onUploadSuccess }: FileUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const maxFileSizeMB = 10;
  const bucketName = 'project_files';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.size > (maxFileSizeMB * 1024 * 1024)) {
         setUploadError(`File size exceeds ${maxFileSizeMB}MB limit.`);
         setSelectedFile(null);
         event.target.value = '';
         return;
      }
      setSelectedFile(file);
      setUploadError(null);
      setUploadProgress(0);
      setUploadedUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      setUploadError('Please select a file and ensure you are logged in.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    toast.loading('Uploading file...', { id: 'upload-toast' });

    const fileExt = selectedFile.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}-${selectedFile.name}`;

    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw new SupabaseStorageError(error.message);
      }

      console.log('File uploaded successfully:', data);

      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;

      if (!publicUrl) {
        throw new Error('Could not retrieve public URL for the uploaded file.');
      }

      console.log('Public URL:', publicUrl);
      setUploading(false);
      setUploadedUrl(publicUrl);
      onUploadSuccess(publicUrl);
      setUploadProgress(100);
      toast.success('File uploaded successfully!', { id: 'upload-toast' });

    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof SupabaseStorageError ? error.message : 'An unexpected error occurred during upload.';
      setUploadError(errorMessage);
      setUploading(false);
      setUploadProgress(0);
      toast.error('Upload Failed', { description: errorMessage, id: 'upload-toast' });
    }
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={`file-upload-${researchPostId}`}
        className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-sm cursor-pointer"
      >
        {uploading ? 'Uploading...' : 'Choose File'}
        <input
          id={`file-upload-${researchPostId}`}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      {uploadedFilePath && (
        <p className="text-sm text-green-600">Successfully uploaded: {uploadedFilePath.split('/').pop()}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">Error: {error}</p>
      )}
    </div>
  )
} 