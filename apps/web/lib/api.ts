import { z } from 'zod';
import { type SupabaseClient, type PostgrestError } from '@supabase/supabase-js';
import { type Database } from '../types/database.types';
// import { 
//   profileSchema, 
//   // researchPostSchema, 
//   // matchSchema, 
//   messageSchema,
//   type Profile, // Assuming Profile is z.infer<typeof profileSchema>
//   type ProfileUpdateData, // Added ProfileUpdateData import
//   type Message as MessageType
//   // type ResearchPost,
//   // type Match,
//   // type Message
// } from './schema'; // Commented out old schema import

import { 
  profileSchema as importedProfileSchema, 
  messageSchema as importedMessageSchema,
  type Profile as DbProfile, 
  type Message as DbMessageType
  // researchPostSchema, // if available and needed
  // matchSchema, // if available and needed
} from '@research-collab/db';

// Import the shared SSR client
import { getBrowserClient } from '@/lib/supabaseClient'; 

// import { generateContentHash } from './utils'; // Not used in simplified version

export class SupabaseError extends Error {
  status: number;
  code?: string;
  
  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.name = 'SupabaseError';
    this.status = status;
    this.code = code;
  }
}

// type TableName = keyof Database['public']['Tables'];
// type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
// type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
// type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

/*
// Temporarily commented out ApiClient
class ApiClient<
  S extends z.ZodType<TableRow<T>, any, TableInsert<T>>,
  T extends TableName
> { 
  // ... ApiClient implementation ...
}

export const profilesApi = new ApiClient<typeof profileSchema, 'profiles'>(profileSchema, 'profiles');
// export const postsApi = new ApiClient<typeof researchPostSchema, 'research_posts'>(researchPostSchema, 'research_posts');
// export const matchesApi = new ApiClient<typeof matchSchema, 'matches'>(matchSchema, 'matches');
// export const messagesApi = new ApiClient<typeof messageSchema, 'messages'>(messageSchema, 'messages');
*/

// Direct Supabase calls for profiles
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Type for Supabase DB update payload for profiles
type ProfileDbUpdatePayload = Database['public']['Tables']['profiles']['Update'];

export const getProfile = async (id: string): Promise<DbProfile | null> => {
    const supabase = getBrowserClient();
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new SupabaseError(`Error fetching profile: ${error.message}`, (error as PostgrestError).code ? parseInt((error as PostgrestError).code) : 500, (error as PostgrestError).code);
    }
    // Validate data against Zod schema before returning
    return importedProfileSchema.parse(data) as DbProfile | null; 
  } catch (error) {
    console.error('Error in getProfile:', error);
    if (error instanceof SupabaseError) throw error;
    if (error instanceof z.ZodError) {
      throw new SupabaseError(`Profile data validation failed: ${error.errors.map(e=>e.message).join(', ')}`, 400);
    }
    throw new SupabaseError((error as Error).message || 'Failed to get profile', (error as { status?: number })?.status || 500);
  }
};

// Use Partial<DbProfile> for updateData input. Stricter Zod schema for input can be made if needed.
export const updateProfile = async (userId: string, updateData: Partial<DbProfile>): Promise<DbProfile | null> => {
    const supabase = getBrowserClient();
  // Zod schema for what parts of DbProfile are updatable by the client
  const updatableProfileFieldsSchema = importedProfileSchema.partial().omit({
    id: true, 
    updated_at: true, 
    email: true, 
    user_id: true, 
  });

  const validatedUpdateData = updatableProfileFieldsSchema.parse(updateData);
  
  // Construct the payload carefully to avoid sending explicit nulls 
  // where undefined might be expected by Supabase types for optional fields that are not nullable in DB
  const payload: ProfileDbUpdatePayload = {};

  // Iterate over validatedUpdateData and add to payload if not undefined
  // This handles cases where Zod parse results in { field: undefined } which is fine.
  // The main concern is explicit { field: null } when DB type is string | undefined (not string | null | undefined)
  for (const key in validatedUpdateData) {
    if (Object.prototype.hasOwnProperty.call(validatedUpdateData, key)) {
      const value = validatedUpdateData[key as keyof typeof validatedUpdateData];
      if (value !== undefined) { // Only add if not undefined. Nulls will pass through if schema allows.
        (payload as any)[key] = value;
      }
    }
  }
  // Always set updated_at
  payload.updated_at = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      throw new SupabaseError(`Error updating profile: ${error.message}`, (error as PostgrestError).code ? parseInt((error as PostgrestError).code) : 500, (error as PostgrestError).code);
    }
    if (!data) throw new SupabaseError('No data returned after updating profile', 500);
    return importedProfileSchema.parse(data) as DbProfile | null;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    if (error instanceof SupabaseError) throw error;
    if (error instanceof z.ZodError) {
      throw new SupabaseError(`Updated profile data validation failed: ${error.errors.map(e=>e.message).join(', ')}`, 400);
    }
    throw new SupabaseError((error as Error).message || 'Failed to update profile', (error as { status?: number })?.status || 500);
  }
};


export const profiles = {
  getById: getProfile,
  // getCurrentUserProfile: ... (can be re-added later if needed)
  // search: ... (can be re-added later)
  update: updateProfile,
  async create(insertData: Omit<DbProfile, 'id' | 'updated_at' | 'user_id'>): Promise<DbProfile | null> { // Refined Omit type for create
    const supabase = getBrowserClient();
    // Schema for creatable fields, omitting auto-generated/auth-linked ones
    const creatableProfileSchema = importedProfileSchema.omit({
      id: true, 
      updated_at: true, 
      user_id: true, // user_id is in the schema, often the same as id if linking to auth.users.id directly
                      // If profile.id is the PK and FK to auth.users.id, then user_id might be nullable or set by trigger.
                      // For creation, we typically want to set fields that are not auto-generated or auth-linked.
                      // Assuming 'id' will be set to auth.uid() when inserting, or is the primary key that auto-generates or is explicitly set.
    });

    // The `insertData` type should align with what the form provides.
    // `validatedInsertData` will be the Zod-parsed version of that.
    // If `id` should be set from `auth.user.id` it should be added to the payload explicitly before insert if not handled by DB trigger/policy.
    const validatedInsertData = creatableProfileSchema.parse(insertData);

    try {
      const { data, error } = await supabase
        .from('profiles')
        // The payload to insert should match Database['public']['Tables']['profiles']['Insert']
        // `validatedInsertData` should conform to this after parsing. Supabase client handles this.
        .insert(validatedInsertData as Database['public']['Tables']['profiles']['Insert']) 
        .select()
        .single();
      
      if (error) {
        throw new SupabaseError(`Error creating profile: ${error.message}`, (error as PostgrestError).code ? parseInt((error as PostgrestError).code) : 500, (error as PostgrestError).code);
      }
      if (!data) throw new SupabaseError('No data returned after creating profile', 500);
      return importedProfileSchema.parse(data) as DbProfile | null;
    } catch (error) {
      console.error('Error in profiles.create:', error);
      if (error instanceof SupabaseError) throw error;
      if (error instanceof z.ZodError) {
        throw new SupabaseError(`Profile creation data validation failed: ${error.errors.map(e=>e.message).join(', ')}`, 400);
      }
      throw new SupabaseError((error as Error).message || 'Failed to create profile', (error as { status?: number })?.status || 500);
    }
  }
};

// Type for inserting a new message, derived from schema, omitting auto-generated fields
// id and created_at are usually auto-generated or set by the server/DB.
// is_read defaults to false and is typically updated by other processes.
export type MessageInsert = Omit<DbMessageType, 'id' | 'created_at' | 'is_read'>;

export const getMessagesForMatch = async (matchId: string): Promise<DbMessageType[]> => {
    const supabase = getBrowserClient();
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_id (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });
      
    if (error) {
      throw new SupabaseError(`Error fetching messages: ${error.message}`, (error as PostgrestError).code ? parseInt((error as PostgrestError).code) : 500, (error as PostgrestError).code);
    }
    // Validate each message if necessary, or trust Supabase types for now
    return (data || []).map(item => importedMessageSchema.parse(item)) as DbMessageType[];
  } catch (error) {
    console.error('Error in getMessagesForMatch:', error);
    if (error instanceof SupabaseError) throw error;
    if (error instanceof z.ZodError) {
      throw new SupabaseError(`Message data validation failed: ${error.errors.map(e=>e.message).join(', ')}`, 400);
    }
    throw new SupabaseError((error as Error).message || 'Failed to get messages', (error as { status?: number })?.status || 500);
  }
};

export const sendMessage = async (payload: MessageInsert): Promise<DbMessageType | null> => {
    const supabase = getBrowserClient();
  // Validate payload before sending to Supabase
  const validatedPayload = importedMessageSchema.omit({ id: true, created_at: true, is_read: true }).parse(payload);
    
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(validatedPayload as DbMessageType) // Cast to MessageType after Zod validation to satisfy Supabase types
      .select('*') // Select all fields of the newly created message
      .single();
      
    if (error) {
      throw new SupabaseError(`Error sending message: ${error.message}`, (error as PostgrestError).code ? parseInt((error as PostgrestError).code) : 500, (error as PostgrestError).code);
    }
    if (!data) throw new SupabaseError('No data returned after sending message', 500);
    return importedMessageSchema.parse(data) as DbMessageType | null;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    if (error instanceof SupabaseError) throw error;
    if (error instanceof z.ZodError) {
      throw new SupabaseError(`Send message data validation failed: ${error.errors.map(e=>e.message).join(', ')}`, 400);
    }
    throw new SupabaseError((error as Error).message || 'Failed to send message', (error as { status?: number })?.status || 500);
  }
};

export const setupMessageListener = (
  matchId: string, 
  callback: (newMessage: DbMessageType) => void
): (() => void) => {
    const supabase = getBrowserClient();
  const channel = supabase
    .channel(`messages-match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
      (payload) => {
        console.log('New message received via listener:', payload);
        try {
          const validatedMessage = importedMessageSchema.parse(payload.new);
          callback(validatedMessage as DbMessageType);
        } catch (error) {
          console.error('Error parsing new message from listener:', error);
          if (error instanceof z.ZodError) {
            console.error('Zod validation errors:', error.errors);
          }
        }
      }
    )
    .subscribe((status, err) => {
      if (err) {
        console.error(`Error subscribing to messages for match ${matchId}:`, err);
      }
      // console.log(`Subscribed to messages for match ${matchId}, status: ${status}`);
    });

    return () => {
    if (channel) {
      supabase.removeChannel(channel);
      // console.log(`Unsubscribed from messages for match ${matchId}`);
    }
  };
};

export const uploadAvatar = async (userId: string, file: File): Promise<{ path: string; url: string } | null> => {
  if (!file) return null;

  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}-${Date.now()}.${fileExt}`;

    const supabase = getBrowserClient();
  try {
    const { data: uploadResult, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Typically false to avoid overwriting unless intended
      });
    
    if (uploadError) {
      throw new SupabaseError(`Avatar upload failed: ${uploadError.message}`, (uploadError as any)?.statusCode || 500); // Storage errors might have statusCode
    }
    if (!uploadResult || !uploadResult.path) {
      throw new SupabaseError('Avatar upload failed to return a path.', 500);
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadResult.path);
    return { path: uploadResult.path, url: urlData.publicUrl };
  } catch (error) {
    console.error('Error uploading avatar in API wrapper:', error);
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError((error as Error).message || 'Failed to upload avatar', (error as { status?: number })?.status || 500);
  }
};

// Schema for individual research post with author and files
const projectFileSchemaForApi = z.object({
  id: z.string().uuid(),
  file_name: z.string(),
  file_path: z.string(),
  file_type: z.string(),
  file_size: z.number().int(),
  description: z.string().nullable().optional(),
  created_at: z.string().datetime().nullable().optional(),
});

const researchPostWithDetailsSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime().nullable().optional(),
  title: z.string(),
  content: z.string(),
  user_id: z.string().uuid(),
  tags: z.array(z.string()).nullable().optional(),
  visibility: z.enum(['public', 'private', 'connections']),
  is_boosted: z.boolean().nullable().optional(),
  engagement_count: z.number().int().nullable().optional(),
  profiles: importedProfileSchema.pick({ // Use the imported schema here
    first_name: true,
    last_name: true,
    avatar_url: true,
    institution: true,
    id: true, // Keep profile id if needed for linking
  }).nullable(),
  project_files: z.array(projectFileSchemaForApi).optional(),
});

export type ResearchPostWithDetails = z.infer<typeof researchPostWithDetailsSchema>;

export const getResearchPostById = async (postId: string): Promise<ResearchPostWithDetails | null> => {
    const supabase = getBrowserClient();
  try {
    const { data: postData, error: postError } = await supabase
      .from('research_posts')
      .select(`
        *,
        profiles (
          id,
          first_name,
          last_name,
          avatar_url,
          institution
        )
      `)
      .eq('id', postId)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') return null; // Not found
      throw new SupabaseError(`Error fetching research post: ${postError.message}`, (postError as PostgrestError).code ? parseInt((postError as PostgrestError).code) : 500, (postError as PostgrestError).code);
    }
    if (!postData) return null;

    const { data: filesData, error: filesError } = await supabase
      .from('project_files')
      .select('*')
      .eq('research_post_id', postId);

    if (filesError) {
      // Log error but don't fail if files can't be fetched, post might exist without files
      console.error(`Error fetching files for post ${postId}:`, filesError);
    }
    
    const combinedData = {
      ...postData,
      project_files: filesData || [],
    };
    
    // Validate the combined data against the Zod schema
    return researchPostWithDetailsSchema.parse(combinedData) as ResearchPostWithDetails;

  } catch (error) {
    console.error(`Error in getResearchPostById for post ${postId}:`, error);
    if (error instanceof SupabaseError) throw error;
    if (error instanceof z.ZodError) {
      throw new SupabaseError(`Research post data validation failed: ${error.errors.map(e => e.message).join(', ')}`, 400, 'ZOD_VALIDATION_ERROR');
    }
    throw new SupabaseError((error as Error).message || 'Failed to get research post', (error as { status?: number })?.status || 500);
  }
};

// Schemas for Post Engagement
const postCommentSchema = z.object({
  id: z.string().uuid(),
  post_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string(),
  created_at: z.string().datetime().nullable().optional(),
  updated_at: z.string().datetime().nullable().optional(),
  profiles: importedProfileSchema.pick({
    id: true,
    first_name: true,
    last_name: true,
    avatar_url: true,
  }).nullable(), // Author of the comment
});
export type PostCommentWithAuthor = z.infer<typeof postCommentSchema>;

export interface PostEngagementData {
  likeCount: number;
  commentCount: number;
  currentUserHasLiked: boolean;
}

export const getPostEngagement = async (postId: string, currentUserId?: string): Promise<PostEngagementData> => {
  const supabase = getBrowserClient();
  try {
    const { count: likeCount, error: likeError } = await supabase
      .from('post_likes')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (likeError) throw new SupabaseError(`Error fetching like count: ${likeError.message}`, 500, likeError.code);

    const { count: commentCount, error: commentError } = await supabase
      .from('post_comments')
      .select('id', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (commentError) throw new SupabaseError(`Error fetching comment count: ${commentError.message}`, 500, commentError.code);

    let currentUserHasLiked = false;
    if (currentUserId) {
      const { data: likeData, error: userLikeError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .limit(1);
      if (userLikeError) throw new SupabaseError(`Error checking user like: ${userLikeError.message}`, 500, userLikeError.code);
      currentUserHasLiked = (likeData && likeData.length > 0) || false;
    }

    return {
      likeCount: likeCount ?? 0,
      commentCount: commentCount ?? 0,
      currentUserHasLiked,
    };
  } catch (error) {
    console.error(`Error in getPostEngagement for post ${postId}:`, error);
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError((error as Error).message || 'Failed to get post engagement', (error as { status?: number })?.status || 500);
  }
};

export const addPostLike = async (postId: string, userId: string): Promise<{ success: boolean }> => {
  const supabase = getBrowserClient();
  try {
    // Check if already liked to prevent duplicates, though DB constraint should handle this
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found, which is good here
      throw new SupabaseError(`Error checking existing like: ${checkError.message}`, 500, checkError.code);
    }

    if (existingLike) {
      return { success: true }; // Already liked
    }

    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId });
    if (error) throw new SupabaseError(`Error adding like: ${error.message}`, 500, error.code);
    return { success: true };
  } catch (error) {
    console.error(`Error in addPostLike for post ${postId} by user ${userId}:`, error);
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError((error as Error).message || 'Failed to add like', (error as { status?: number })?.status || 500);
  }
};

export const removePostLike = async (postId: string, userId: string): Promise<{ success: boolean }> => {
  const supabase = getBrowserClient();
  try {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw new SupabaseError(`Error removing like: ${error.message}`, 500, error.code);
    return { success: true };
  } catch (error) {
    console.error(`Error in removePostLike for post ${postId} by user ${userId}:`, error);
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError((error as Error).message || 'Failed to remove like', (error as { status?: number })?.status || 500);
  }
};

export const getPostComments = async (postId: string): Promise<PostCommentWithAuthor[]> => {
  const supabase = getBrowserClient();
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw new SupabaseError(`Error fetching comments: ${error.message}`, 500, error.code);
    
    return (data || []).map(comment => postCommentSchema.parse(comment)) as PostCommentWithAuthor[];
  } catch (error) {
    console.error(`Error in getPostComments for post ${postId}:`, error);
    if (error instanceof SupabaseError) throw error;
    if (error instanceof z.ZodError) {
      throw new SupabaseError(`Comment data validation failed: ${error.errors.map(e => e.message).join(', ')}`, 400, 'ZOD_VALIDATION_ERROR');
    }
    throw new SupabaseError((error as Error).message || 'Failed to get comments', (error as { status?: number })?.status || 500);
  }
};

export const addPostComment = async (postId: string, userId: string, content: string): Promise<PostCommentWithAuthor | null> => {
  const supabase = getBrowserClient();
  if (!content.trim()) {
    throw new SupabaseError('Comment content cannot be empty.', 400);
  }
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: userId, content: content.trim() })
      .select(`
        *,
        profiles (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single();
      
    if (error) throw new SupabaseError(`Error adding comment: ${error.message}`, 500, error.code);
    if (!data) return null;

    return postCommentSchema.parse(data) as PostCommentWithAuthor;
  } catch (error) {
    console.error(`Error in addPostComment for post ${postId} by user ${userId}:`, error);
    if (error instanceof SupabaseError) throw error;
    if (error instanceof z.ZodError) {
      throw new SupabaseError(`New comment data validation failed: ${error.errors.map(e => e.message).join(', ')}`, 400, 'ZOD_VALIDATION_ERROR');
    }
    throw new SupabaseError((error as Error).message || 'Failed to add comment', (error as { status?: number })?.status || 500);
  }
};

// New schema for conversation list item
export const conversationListItemSchema = z.object({
  matchId: z.string().uuid(),
  otherUserId: z.string().uuid(),
  otherUserFirstName: z.string().nullable().optional(),
  otherUserLastName: z.string().nullable().optional(),
  otherUserAvatarUrl: z.string().url().nullable().optional(),
  lastMessageContent: z.string().nullable().optional(),
  lastMessageSenderId: z.string().uuid().nullable().optional(), // To know if the current user sent the last message
  lastMessageCreatedAt: z.string().datetime().nullable().optional(),
  unreadCount: z.number().int().default(0),
});
export type ConversationListItem = z.infer<typeof conversationListItemSchema>;

// API function to fetch conversations for the current user
export const getConversations = async (): Promise<ConversationListItem[]> => {
  const supabase = getBrowserClient();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return [];

  try {
    // 1. Fetch matches for the current user where status is 'matched'
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('id, user_id_1, user_id_2')
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .eq('status', 'matched');

    if (matchesError) throw new SupabaseError(`Error fetching matches: ${matchesError.message}`, 500, matchesError.code);
    if (!matchesData) return [];

    const conversationItems: ConversationListItem[] = [];

    for (const match of matchesData) {
      const otherUserId = match.user_id_1 === user.id ? match.user_id_2 : match.user_id_1;

      // 2. Fetch profile of the other user
      const { data: otherUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('id', otherUserId)
        .single();
      
      if (profileError) {
        console.error(`Error fetching profile for user ${otherUserId} in match ${match.id}:`, profileError);
        // Continue to next match if a profile fails, or handle as partial data
        continue; 
      }

      // 3. Fetch the last message for the conversation
      const { data: lastMessageData, error: lastMessageError } = await supabase
        .from('messages')
        .select('content, created_at, sender_id')
        .eq('match_id', match.id)
    .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle as there might be no messages yet

      if (lastMessageError) {
        console.error(`Error fetching last message for match ${match.id}:`, lastMessageError);
        // Continue, or handle as partial data (conversation exists but no last message info)
      }
      
      // 4. Fetch unread message count for the current user in this conversation
      const { count: unreadCount, error: unreadError } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('match_id', match.id)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (unreadError) {
        console.error(`Error fetching unread count for match ${match.id}:`, unreadError);
        // Default unreadCount to 0 if error
      }

      conversationItems.push({
        matchId: match.id,
        otherUserId: otherUserProfile?.id || otherUserId, // Fallback to otherUserId if profile fetch failed
        otherUserFirstName: otherUserProfile?.first_name || null,
        otherUserLastName: otherUserProfile?.last_name || null,
        otherUserAvatarUrl: otherUserProfile?.avatar_url || null,
        lastMessageContent: lastMessageData?.content || null,
        lastMessageSenderId: lastMessageData?.sender_id || null,
        lastMessageCreatedAt: lastMessageData?.created_at || null,
        unreadCount: unreadCount || 0,
      });
    }
    
    // Sort conversations by last message timestamp (descending)
    conversationItems.sort((a, b) => {
      if (!a.lastMessageCreatedAt && !b.lastMessageCreatedAt) return 0;
      if (!a.lastMessageCreatedAt) return 1; // b comes first if a has no message
      if (!b.lastMessageCreatedAt) return -1; // a comes first if b has no message
      return new Date(b.lastMessageCreatedAt).getTime() - new Date(a.lastMessageCreatedAt).getTime();
    });

    return conversationItems.map(item => conversationListItemSchema.parse(item));

  } catch (error) {
    console.error('Error in getConversations:', error);
    if (error instanceof SupabaseError) throw error;
    if (error instanceof z.ZodError) {
      throw new SupabaseError(`Conversation data validation failed: ${error.errors.map(e => e.message).join(', ')}`, 400, 'ZOD_VALIDATION_ERROR');
    }
    throw new SupabaseError((error as Error).message || 'Failed to get conversations', (error as { status?: number })?.status || 500);
  }
};

// API function to mark messages as read for a given match and user
export const markMessagesAsRead = async (matchId: string, currentUserId: string): Promise<void> => {
  const supabase = getBrowserClient();
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true, updated_at: new Date().toISOString() }) // Also update updated_at for the message
      .eq('match_id', matchId)
      .eq('receiver_id', currentUserId)
      .eq('is_read', false);

    if (error) {
      throw new SupabaseError(`Error marking messages as read: ${error.message}`, 500, error.code);
    }
    // console.log(`Messages marked as read for match ${matchId} for user ${currentUserId}`);
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error);
    if (error instanceof SupabaseError) throw error;
    throw new SupabaseError((error as Error).message || 'Failed to mark messages as read', (error as { status?: number })?.status || 500);
  }
};

// Other APIs (posts, matches, messages) would be similarly simplified or commented out for now.
// export const posts = { ... };

// No more functions or exports beyond this point to ensure no duplicates. 