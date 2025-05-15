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

const PROFILE_FETCH_TIMEOUT_MS = 15000; // 15 seconds

export const getProfile = async (id: string): Promise<DbProfile | null> => {
  const supabase = getBrowserClient();

  const fetchProfilePromise = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Profile not found
      }
      throw new SupabaseError(
        `Error fetching profile: ${error.message}`,
        (error as PostgrestError).code ? parseInt((error as PostgrestError).code) : 500,
        (error as PostgrestError).code
      );
    }
    if (data === null) {
      return null; 
    }
    return importedProfileSchema.parse(data) as DbProfile;
  };

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new SupabaseError('Profile fetch timed out', 408, 'TIMEOUT')), PROFILE_FETCH_TIMEOUT_MS)
  );

  try {
    // Race the actual fetch against the timeout
    return await Promise.race([fetchProfilePromise(), timeoutPromise]);
  } catch (error) {
    console.error('Error in getProfile (or timeout):', error);
    if (error instanceof SupabaseError) throw error; // Re-throw our custom errors (including timeout)
    if (error instanceof z.ZodError) {
      throw new SupabaseError(`Profile data validation failed: ${error.errors.map(e => e.message).join(', ')}`, 400);
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

export const setProfileTourCompleted = async (userId: string): Promise<DbProfile | null> => {
  const supabase = getBrowserClient();
  const updatePayload = {
    has_completed_tour: true,
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new SupabaseError(`Error updating profile tour status: ${error.message}`, (error as PostgrestError).code ? parseInt((error as PostgrestError).code) : 500, (error as PostgrestError).code);
    }
    if (!data) throw new SupabaseError('No data returned after updating profile tour status', 500);
    // Force cast through unknown, relying on Zod to ensure runtime correctness.
    return importedProfileSchema.parse(data as any) as unknown as DbProfile;
  } catch (error) {
    console.error('Error in setProfileTourCompleted:', error);
    if (error instanceof SupabaseError) throw error;
    if (error instanceof z.ZodError) {
      throw new SupabaseError(`Profile data validation failed for tour status update: ${error.errors.map(e=>e.message).join(', ')}`, 400);
    }
    throw new SupabaseError((error as Error).message || 'Failed to update profile tour status', (error as { status?: number })?.status || 500);
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
  created_at: z.string().datetime(),
});

const researchPostWithDetailsSchema = z.object({
  id: z.string().uuid(),
  created_at: z.date({
    errorMap: (issue, ctx) => {
      if (issue.code === z.ZodIssueCode.invalid_type && issue.expected === 'date') {
        return { message: 'created_at was expected to be a Date object, but received something else.' };
      }
      return { message: ctx.defaultError };
    }
  }),
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
    
    const combinedData: any = { // Use 'any' temporarily to allow modification
      ...postData,
      project_files: filesData || [],
    };

    // Manual conversion for created_at
    if (combinedData.created_at && typeof combinedData.created_at === 'string') {
      const parts = combinedData.created_at.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)/i);
      if (parts) {
        const [, month, day, year, hour, minute, second, ampm] = parts;
        let numericHour = parseInt(hour, 10);
        if (ampm.toUpperCase() === 'PM' && numericHour < 12) numericHour += 12;
        if (ampm.toUpperCase() === 'AM' && numericHour === 12) numericHour = 0;
        combinedData.created_at = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          numericHour,
          parseInt(minute, 10),
          parseInt(second, 10)
        );
      } else {
        // If it's not the custom format, try to parse it as a standard ISO string (or other Date.parse compatible format)
        const parsedDate = new Date(combinedData.created_at);
        // Check if parsing was successful, otherwise Zod will catch it as not a Date object
        if (!isNaN(parsedDate.getTime())) {
            combinedData.created_at = parsedDate;
        } else {
            // If parsing fails, set to something that will make Zod fail cleanly or handle error
            // Forcing Zod to fail is better:
            combinedData.created_at = null; // Or undefined, so Zod catches invalid_type
            console.warn(`Could not parse created_at string: ${combinedData.created_at} for post ${postId}`);
        }
      }
    } else if (combinedData.created_at && !(combinedData.created_at instanceof Date)) {
      // If it's not a string and not a Date, Zod will catch it.
      // Or we can force it to null to make the error more predictable.
      console.warn(`created_at for post ${postId} is neither a string nor a Date:`, combinedData.created_at);
      combinedData.created_at = null; 
    }
    
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