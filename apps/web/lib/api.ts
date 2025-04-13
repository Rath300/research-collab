import { getBrowserClient, SupabaseError } from './supabaseClient';
import { 
  profileSchema, 
  researchPostSchema, 
  matchSchema, 
  messageSchema,
  type Profile,
  type ResearchPost,
  type Match,
  type Message
} from './schema';
import { generateContentHash } from './utils';

// Import zod types from schema.ts to avoid direct dependency on zod package
type ZodType = typeof profileSchema;
type ZodError = {
  errors: Array<{ message: string }>;
};
type ZodIssue = { message: string };

/**
 * Base API client that handles data validation and error handling
 */
class ApiClient<T extends ZodType> {
  private schema: T;
  private tableName: string;
  
  constructor(schema: T, tableName: string) {
    this.schema = schema;
    this.tableName = tableName;
  }
  
  /**
   * Validate data against the schema
   */
  validate(data: unknown): unknown {
    try {
      return this.schema.parse(data);
    } catch (error: unknown) {
      // Check if the error has the expected structure of a ZodError
      if (error && 
          typeof error === 'object' && 
          'errors' in error && 
          Array.isArray((error as ZodError).errors)) {
        const zodError = error as ZodError;
        const errorMessage = zodError.errors.map(e => e.message).join(', ');
        throw new SupabaseError(`Validation error: ${errorMessage}`, 400);
      }
      throw new SupabaseError('Unknown validation error', 400);
    }
  }
  
  /**
   * Get all records with optional filters
   */
  async getAll(options?: { 
    limit?: number; 
    offset?: number; 
    order?: { column: string; ascending: boolean };
    filter?: Record<string, unknown>;
  }): Promise<unknown[]> {
    const supabase = getBrowserClient();
    
    let query = supabase
      .from(this.tableName)
      .select('*');
      
    // Apply options
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10) - 1));
    }
    
    if (options?.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending });
    }
    
    if (options?.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new SupabaseError(`Error fetching ${this.tableName}: ${error.message}`, 500, error.code);
    }
    
    return data as unknown[];
  }
  
  /**
   * Get a single record by ID
   */
  async getById(id: string): Promise<unknown | null> {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new SupabaseError(`Error fetching ${this.tableName}: ${error.message}`, 500, error.code);
    }
    
    return data;
  }
  
  /**
   * Create a new record
   */
  async create(data: Record<string, unknown>): Promise<unknown> {
    const validatedData = this.validate(data);
    const supabase = getBrowserClient();
    
    const { data: createdData, error } = await supabase
      .from(this.tableName)
      .insert(validatedData)
      .select()
      .single();
      
    if (error) {
      throw new SupabaseError(`Error creating ${this.tableName}: ${error.message}`, 500, error.code);
    }
    
    return createdData;
  }
  
  /**
   * Update an existing record
   */
  async update(id: string, data: Record<string, unknown>): Promise<unknown> {
    const validatedData = this.validate(data);
    const supabase = getBrowserClient();
    
    const { data: updatedData, error } = await supabase
      .from(this.tableName)
      .update({
        ...validatedData as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      throw new SupabaseError(`Error updating ${this.tableName}: ${error.message}`, 500, error.code);
    }
    
    return updatedData;
  }
  
  /**
   * Delete a record
   */
  async delete(id: string): Promise<void> {
    const supabase = getBrowserClient();
    
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
      
    if (error) {
      throw new SupabaseError(`Error deleting ${this.tableName}: ${error.message}`, 500, error.code);
    }
  }
}

// Create API clients for each entity
export const profilesApi = new ApiClient(profileSchema, 'profiles');
export const postsApi = new ApiClient(researchPostSchema, 'research_posts');
export const matchesApi = new ApiClient(matchSchema, 'matches');
export const messagesApi = new ApiClient(messageSchema, 'messages');

// Specialized API methods for profiles
export const profiles = {
  ...profilesApi,
  
  /**
   * Get the current user's profile
   */
  async getCurrentUserProfile(): Promise<Profile | null> {
    const supabase = getBrowserClient();
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return null;
      }
      
      return await profilesApi.getById(user.id) as Profile | null;
    } catch (error) {
      console.error('Error getting current user profile:', error);
      return null;
    }
  },
  
  /**
   * Search profiles by name or interests
   */
  async search(query: string, limit = 10): Promise<Profile[]> {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,institution.ilike.%${query}%`)
      .limit(limit);
      
    if (error) {
      throw new SupabaseError(`Error searching profiles: ${error.message}`, 500, error.code);
    }
    
    return data as Profile[];
  }
};

// Specialized API methods for research posts
export const posts = {
  ...postsApi,
  
  /**
   * Get posts for the feed with user data
   */
  async getFeed(limit = 10, offset = 0): Promise<ResearchPost[]> {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase
      .from('research_posts')
      .select('*, profiles:user_id(first_name, last_name, avatar_url, title)')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) {
      throw new SupabaseError(`Error fetching research posts: ${error.message}`, 500, error.code);
    }
    
    return data as ResearchPost[];
  },
  
  /**
   * Increment engagement count for a post
   */
  async incrementEngagement(id: string): Promise<void> {
    const supabase = getBrowserClient();
    
    // First get the current count
    const post = await postsApi.getById(id) as ResearchPost | null;
    if (!post) {
      throw new SupabaseError('Post not found', 404);
    }
    
    // Then update with incremented count
    const { error } = await supabase
      .from('research_posts')
      .update({ 
        engagement_count: (post.engagement_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) {
      throw new SupabaseError(`Error updating post engagement: ${error.message}`, 500, error.code);
    }
  }
};

// Specialized API methods for matches
export const matches = {
  ...matchesApi,
  
  /**
   * Get potential matches (profiles not yet matched with)
   */
  async getPotentialMatches(userId: string, limit = 10): Promise<Profile[]> {
    const supabase = getBrowserClient();
    
    // Get existing matches to exclude
    const { data: existingMatches, error: matchError } = await supabase
      .from('matches')
      .select('user_id_1, user_id_2')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);
      
    if (matchError) {
      throw new SupabaseError(`Error fetching existing matches: ${matchError.message}`, 500, matchError.code);
    }
    
    // Build exclusion list
    const excludeIds = new Set<string>([userId]);
    existingMatches?.forEach((match: { user_id_1: string; user_id_2: string }) => {
      excludeIds.add(match.user_id_1);
      excludeIds.add(match.user_id_2);
    });
    
    // Get potential matches
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .not('id', 'in', `(${Array.from(excludeIds).join(',')})`)
      .limit(limit);
      
    if (profileError) {
      throw new SupabaseError(`Error fetching potential matches: ${profileError.message}`, 500, profileError.code);
    }
    
    return profiles as Profile[];
  },
  
  /**
   * Get all confirmed matches with profile data
   */
  async getConfirmedMatches(userId: string): Promise<Match[]> {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:user_id_1(id, first_name, last_name, avatar_url, title, institution),
        user2:user_id_2(id, first_name, last_name, avatar_url, title, institution)
      `)
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .eq('status', 'matched');
      
    if (error) {
      throw new SupabaseError(`Error fetching matches: ${error.message}`, 500, error.code);
    }
    
    return data as Match[];
  }
};

// Specialized API methods for messages
export const messages = {
  ...messagesApi,
  
  /**
   * Get messages for a match with sender/receiver data
   */
  async getMessagesForMatch(matchId: string, limit = 50): Promise<Message[]> {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:sender_id(first_name, last_name, avatar_url), receiver:receiver_id(first_name, last_name, avatar_url)')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      throw new SupabaseError(`Error fetching messages: ${error.message}`, 500, error.code);
    }
    
    return data as Message[];
  },
  
  /**
   * Mark messages as read
   */
  async markAsRead(matchId: string, userId: string): Promise<void> {
    const supabase = getBrowserClient();
    
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('match_id', matchId)
      .eq('receiver_id', userId)
      .eq('is_read', false);
      
    if (error) {
      throw new SupabaseError(`Error marking messages as read: ${error.message}`, 500, error.code);
    }
  },
  
  /**
   * Set up real-time message subscription
   */
  setupMessageListener(matchId: string, callback: (message: Message) => void): () => void {
    const supabase = getBrowserClient();
    
    const subscription = supabase
      .channel(`match-${matchId}-messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        },
        (payload: { new: Message }) => {
          callback(payload.new);
        }
      )
      .subscribe();
      
    // Return cleanup function
    return () => {
      supabase.removeChannel(subscription);
    };
  }
};

// Timestamped proofs API for research verification
export const proofs = {
  /**
   * Create a proof of research submission with timestamp
   */
  async createProof(userId: string, projectId: string, content: string) {
    const supabase = getBrowserClient();
    const contentHash = generateContentHash(content);
    
    const proof = {
      user_id: userId,
      project_id: projectId,
      content_hash: contentHash,
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('proofs')
      .insert(proof)
      .select()
      .single();

    if (error) {
      throw new SupabaseError(`Error creating proof: ${error.message}`, 500, error.code);
    }

    return data;
  },

  /**
   * Get all proofs for a project
   */
  async getProofsByProject(projectId: string) {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase
      .from('proofs')
      .select(`
        *,
        profiles:user_id (
          id,
          first_name,
          last_name
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new SupabaseError(`Error fetching proofs: ${error.message}`, 500, error.code);
    }

    return data || [];
  }
};

// Supabase storage utility functions
export const storage = {
  /**
   * Upload a file to Supabase storage
   */
  async uploadFile(bucket: string, path: string, file: File) {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new SupabaseError(`Error uploading file: ${error.message}`, 500, error.code);
    }

    return data;
  },

  /**
   * Get a public URL for a file
   */
  getFileUrl(bucket: string, path: string) {
    const supabase = getBrowserClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string) {
    const supabase = getBrowserClient();
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new SupabaseError(`Error deleting file: ${error.message}`, 500, error.code);
    }

    return true;
  }
};

// Notification functions
export const getNotifications = async (userId: string, limit = 20) => {
  const supabase = getBrowserClient();
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) {
    throw new SupabaseError(`Error fetching notifications: ${error.message}`, 500, error.code);
  }
  
  return data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const supabase = getBrowserClient();
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
    
  if (error) {
    throw new SupabaseError(`Error marking notification as read: ${error.message}`, 500, error.code);
  }
};

export const setupNotificationsListener = (userId: string, callback: (notification: any) => void) => {
  const supabase = getBrowserClient();
  
  // Subscribe to all new notifications for this user
  const subscription = supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, 
      (payload) => {
        // Call the callback with the new notification data
        callback(payload.new);
      }
    )
    .subscribe();
  
  // Return a function to unsubscribe
  return () => {
    supabase.removeChannel(subscription);
  };
}; 