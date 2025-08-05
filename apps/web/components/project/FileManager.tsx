'use client';

import { api } from '@/lib/trpc';
import { FiFile, FiDownload, FiTrash, FiUpload, FiLoader } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/research/FileUpload';
import { useState } from 'react';

interface FileManagerProps {
  projectId: string;
  userRole: 'owner' | 'editor' | 'viewer';
}

export function FileManager({ projectId, userRole }: FileManagerProps) {
  const [showUpload, setShowUpload] = useState(false);
  
  const { data: files, isLoading, error } = api.project.listFiles.useQuery({ projectId });
  const deleteFileMutation = api.project.deleteFile.useMutation();
  const utils = api.useUtils();

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await deleteFileMutation.mutateAsync({ projectId, fileId });
      utils.project.listFiles.invalidate({ projectId });
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('doc')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    return '📁';
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-border-light">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <FiLoader className="animate-spin text-2xl" />
            <span className="ml-2">Loading files...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border-border-light">
        <CardContent className="p-6">
          <div className="text-red-500">Error loading files: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-border-light">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <FiFile className="mr-2" />
            Project Files ({files?.length || 0})
          </CardTitle>
          {userRole !== 'viewer' && (
            <Button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2"
            >
              <FiUpload />
              Upload File
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showUpload && userRole !== 'viewer' && (
          <div className="mb-6 p-4 border border-border-light rounded-lg bg-gray-50">
            <FileUpload 
              projectId={projectId} 
              onUploadComplete={() => setShowUpload(false)}
            />
          </div>
        )}

        {!files || files.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <FiFile className="mx-auto text-4xl mb-4" />
            <p>No files uploaded yet.</p>
            {userRole !== 'viewer' && (
              <p className="text-sm">Upload your first file to get started!</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-2xl">{getFileTypeIcon(file.file_type)}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{file.file_name}</h4>
                    <div className="text-sm text-neutral-400">
                      <span>By {file.uploader_name}</span>
                      <span className="mx-2">•</span>
                      <span>{formatFileSize(file.file_size)}</span>
                      <span className="mx-2">•</span>
                      <span>{file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Unknown date'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Create download link
                      const link = document.createElement('a');
                      link.href = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project_files/${file.file_path}`;
                      link.download = file.file_name;
                      link.click();
                    }}
                  >
                    <FiDownload className="w-4 h-4" />
                  </Button>
                  
                  {(userRole === 'owner' || userRole === 'editor') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={deleteFileMutation.isPending}
                      className="text-red-400 hover:text-red-300 border-red-600 hover:border-red-500"
                    >
                      {deleteFileMutation.isPending ? (
                        <FiLoader className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiTrash className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}



 
 


