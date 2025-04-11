import { getSupabaseClient, SupabaseError } from './supabaseClient';

// Avatar storage bucket name
const AVATAR_BUCKET = 'avatars';

/**
 * Uploads a user avatar image to Supabase Storage
 * 
 * @param userId The user ID
 * @param file The file to upload
 * @param fileName Optional custom filename (defaults to a UUID)
 * @returns The URL of the uploaded file
 */
export async function uploadAvatar(
  userId: string, 
  file: File,
  fileName?: string
): Promise<string> {
  const supabase = getSupabaseClient();
  
  // Generate a unique file name if not provided
  const actualFileName = fileName || `${userId}-${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  
  const { data, error } = await supabase
    .storage
    .from(AVATAR_BUCKET)
    .upload(`${userId}/${actualFileName}`, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (error) {
    console.error('Error uploading avatar:', error);
    throw new SupabaseError(`Failed to upload avatar: ${error.message}`);
  }
  
  // Get the public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(`${userId}/${actualFileName}`);
    
  return publicUrl;
}

/**
 * Deletes a user avatar from Supabase Storage
 * 
 * @param path The path of the file to delete
 * @returns True if successful
 */
export async function deleteAvatar(path: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  // Extract the path from a full URL if provided
  const filePath = path.includes(AVATAR_BUCKET) 
    ? path.split(`${AVATAR_BUCKET}/`)[1] 
    : path;
  
  const { error } = await supabase
    .storage
    .from(AVATAR_BUCKET)
    .remove([filePath]);
    
  if (error) {
    console.error('Error deleting avatar:', error);
    throw new SupabaseError(`Failed to delete avatar: ${error.message}`);
  }
  
  return true;
}

/**
 * Lists all avatars for a user
 * 
 * @param userId The user ID
 * @returns Array of file objects
 */
export async function listUserAvatars(userId: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .storage
    .from(AVATAR_BUCKET)
    .list(userId, {
      sortBy: { column: 'created_at', order: 'desc' }
    });
    
  if (error) {
    console.error('Error listing avatars:', error);
    throw new SupabaseError(`Failed to list avatars: ${error.message}`);
  }
  
  return data;
}

/**
 * Updates a user's profile avatar URL
 * 
 * @param userId The user ID
 * @param avatarUrl The new avatar URL
 * @returns True if successful
 */
export async function updateProfileAvatar(
  userId: string, 
  avatarUrl: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', userId);
    
  if (error) {
    console.error('Error updating profile avatar:', error);
    throw new SupabaseError(`Failed to update profile avatar: ${error.message}`);
  }
  
  return true;
} 