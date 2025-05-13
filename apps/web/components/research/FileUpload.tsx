'use client'

import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'

interface FileUploadProps {
  researchPostId: string
  onUploadComplete?: (filePath: string) => void
}

export function FileUpload({ researchPostId, onUploadComplete }: FileUploadProps) {
  const supabase = getBrowserClient()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setUploadedFilePath(null)
    setError(null)

    try {
      setUploading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const randomFileName = `${Math.random().toString(36).slice(2)}.${fileExt}`
      const filePath = `research-posts/${researchPostId}/${user.id}/${randomFileName}`

      const { error: uploadError } = await supabase.storage
        .from('project_files')
        .upload(filePath, file, { 
            cacheControl: '3600',
            upsert: false
        })

      if (uploadError) throw uploadError
      setUploadedFilePath(filePath)

      // Record file in database
      const { error: dbError } = await supabase
        .from('project_files')
        .insert({
          research_post_id: researchPostId,
          uploader_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
        })

      if (dbError) {
        await supabase.storage.from('project-files').remove([filePath])
        throw dbError
      }
      
      if (onUploadComplete) onUploadComplete(filePath)

    } catch (err) {
      console.error("File upload error:", err)
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

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
          onChange={handleFileUpload}
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