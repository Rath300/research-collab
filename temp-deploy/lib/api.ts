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
class ApiClient<T> {
  private schema: ZodType;
  private tableName: string;
  
  constructor(schema: ZodType, tableName: string) {
    this.schema = schema;
    this.tableName = tableName;
  }
  
  /**
   * Validate data against the schema
   */
  validate(data: unknown): unknown {
    try {
      const result = this.schema.safeParse(data);
      
      if (!result.success) {
        // Handle Zod validation error
        const zodError = result.error as ZodError;
        const errorMessage = zodError.errors.map(e => e.message).join(', ');
        throw new SupabaseError(`Validation error: ${errorMessage}`, 400);
      }
      
      return result.data;
    } catch (error) {
      if (typeof error === 'object' &&
          'errors' in error &&
          Array.isArray((error as ZodError).errors)
      ) {
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
    
    // Create a query and cast it to any to bypass TypeScript checks
    let query = supabase
      .from(this.tableName)
      .select('*') as any;
      
    // Apply options
    if (options) {
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset !== undefined) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      
      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending });
      }
      
      // Apply filters
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          if (value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new SupabaseError(`Error fetching data: ${error.message}`, 500, error.code);
    }
    
    return data || [];
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
      .single() as any;
      
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Record not found
      }
      throw new SupabaseError(`Error fetching record: ${error.message}`, 500, error.code);
    }
    
    return data;
  }
  
  /**
   * Create a new record
   */
  async create(data: Record<string, unknown>): Promise<unknown> {
    const supabase = getBrowserClient();
    const validatedData = this.validate(data);
    
    const { data: createdData, error } = await supabase
      .from(this.tableName)
      .insert(validatedData as any)
      .select()
      .single() as any;
      
    if (error) {
      throw new SupabaseError(`Error creating record: ${error.message}`, 500, error.code);
    }
    
    return createdData;
  }
  
  /**
   * Update an existing record
   */
  async update(id: string, data: Record<string, unknown>): Promise<unknown> {
    const supabase = getBrowserClient();
    const validatedData = this.validate(data);
    
    const { data: updatedData, error } = await supabase
      .from(this.tableName)
      .update({
        ...validatedData as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id)
      .select()
      .single() as any;
      
    if (error) {
      throw new SupabaseError(`Error updating record: ${error.message}`, 500, error.code);
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
      .eq('id', id) as any;
      
    if (error) {
      throw new SupabaseError(`Error deleting record: ${error.message}`, 500, error.code);
    }
  }
}

// Create API clients for each entity
export const profilesApi = new ApiClient<Profile>(profileSchema, 'profiles');
export const postsApi = new ApiClient<ResearchPost>(researchPostSchema, 'research_posts');
export const matchesApi = new ApiClient<Match>(matchSchema, 'matches');
export const messagesApi = new ApiClient<Message>(messageSchema, 'messages');

// Specialized API methods for profiles
export const profiles = {
  ...profilesApi,
  
  /**
   * Get a profile by id
   */
  async getById(id: string): Promise<Profile | null> {
    return await profilesApi.getById(id) as Profile | null;
  },
  
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
      .limit(limit) as any;
      
    if (error) {
      throw new SupabaseError(`Error searching profiles: ${error.message}`, 500, error.code);
    }
    
    return data as Profile[];
  },
  
  /**
   * Get profile statistics
   */
  async getStats(userId: string): Promise<any> {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*, research_posts(count), matches(count)')
      .eq('id', userId)
      .single() as any;
      
    if (error) {
      throw new SupabaseError(`Error fetching profile stats: ${error.message}`, 500, error.code);
    }
    
    return {
      id: data.id,
      post_count: data.research_posts?.length || 0,
      match_count: data.matches?.length || 0,
      joined_at: data.created_at
    };
  }
};

// Specialized API methods for research posts
export const posts = {
  ...postsApi,
  
  /**
   * Get a single research post by id
   */
  async getResearchPost(id: string): Promise<ResearchPost> {
    return await postsApi.getById(id) as ResearchPost;
  },
  
  /**
   * Update a research post
   */
  async updateResearchPost(id: string, data: Partial<ResearchPost>): Promise<ResearchPost> {
    return await postsApi.update(id, data) as ResearchPost;
  },
  
  /**
   * Delete a research post
   */
  async deleteResearchPost(id: string): Promise<void> {
    return await postsApi.delete(id);
  },
  
  /**
   * Get posts by user id
   */
  async getByUserId(userId: string, limit = 10): Promise<ResearchPost[]> {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase
      .from('research_posts')
      .select('*, profiles:user_id(first_name, last_name, avatar_url, title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit) as any;
      
    if (error) {
      throw new SupabaseError(`Error fetching user posts: ${error.message}`, 500, error.code);
    }
    
    return data as ResearchPost[];
  },
  
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
      .range(offset, offset + limit - 1) as any;
      
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
      .eq('id', id) as any;
      
    if (error) {
      throw new SupabaseError(`Error updating post engagement: ${error.message}`, 500, error.code);
    }
  },
  
  /**
   * Get research posts
   */
  async getResearchPosts(options: { limit?: number; offset?: number; tags?: string[]; userId?: string } = {}): Promise<ResearchPost[]> {
    const supabase = getBrowserClient();
    
    let query = supabase
      .from('research_posts')
      .select('*, profiles:user_id(first_name, last_name, avatar_url, title)') as any;
      
    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }
    
    if (options.tags && options.tags.length > 0) {
      // This assumes tags are stored as an array in Supabase
      // Adjust if your schema is different
      query = query.contains('tags', options.tags);
    }
    
    query = query.order('created_at', { ascending: false });
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset !== undefined) {
      if (options.limit) {
        query = query.range(options.offset, options.offset + options.limit - 1);
      } else {
        query = query.range(options.offset, options.offset + 9); // Default limit of 10
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new SupabaseError(`Error fetching research posts: ${error.message}`, 500, error.code);
    }
    
    return data as ResearchPost[];
  }
};

// Specialized API methods for matches
export const matches = {
  ...matchesApi,
  
  /**
   * Check if two users are already matched
   */
  async checkIfMatched(user1Id: string, user2Id: string): Promise<{ isMatched: boolean }> {
    const supabase = getBrowserClient();
    
    const { data, error } = await supabase
      .from('matches')
      .select('id, status')
      .or(`and(user_id_1.eq.${user1Id},user_id_2.eq.${user2Id}),and(user_id_1.eq.${user2Id},user_id_2.eq.${user1Id})`)
      .single() as any;
      
    if (error && error.code !== 'PGRST116') {
      throw new SupabaseError(`Error checking match status: ${error.message}`, 500, error.code);
    }
    
    return {
      isMatched: !!data && data.status === 'matched'
    };
  },
  
  /**
   * Get potential matches (profiles not yet matched with)
   */
  async getPotentialMatches(userId: string, limit = 10): Promise<Profile[]> {
    const supabase = getBrowserClient();
    
    // Get existing matches to exclude
    const { data: existingMatches, error: matchError } = await supabase
      .from('matches')
      .select('user_id_1, user_id_2')
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`) as any;
      
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
      .limit(limit) as any;
      
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
      .eq('status', 'matched') as any;
      
    if (error) {
      throw new SupabaseError(`Error fetching matches: ${error.message}`, 500, error.code);
    }
    
    return data as Match[];
  },
  
  /**
   * Get matches
   */
  async getMatches(userId: string, options: { limit?: number } = {}): Promise<Match[]> {
    const supabase = getBrowserClient();
    
    let query = supabase
      .from('matches')
      .select(`
        *,
        user1:user_id_1(id, first_name, last_name, avatar_url, title, institution),
        user2:user_id_2(id, first_name, last_name, avatar_url, title, institution)
      `)
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
      .eq('status', 'matched') as any;
      
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
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
      .limit(limit) as any;
      
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
      .eq('is_read', false) as any;
      
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
      .insert(proof as any)
      .select()
      .single() as any;

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
      .order('created_at', { ascending: false }) as any;

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
      throw new SupabaseError(`Error uploading file: ${error.message}`, 500);
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
      throw new SupabaseError(`Error deleting file: ${error.message}`, 500);
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
    .limit(limit) as any;
    
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
    .eq('id', notificationId) as any;
    
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

// Export standalone functions for chat functionality
export const getConfirmedMatches = async (userId: string): Promise<Match[]> => {
  return await matches.getConfirmedMatches(userId);
};

export const getMessagesForMatch = async (matchId: string, limit = 50): Promise<Message[]> => {
  return await messages.getMessagesForMatch(matchId, limit);
};

export const markMessagesAsRead = async (matchId: string, userId: string): Promise<void> => {
  return await messages.markAsRead(matchId, userId);
};

export const createMessage = async (messageData: Partial<Message>): Promise<Message> => {
  const supabase = getBrowserClient();
  
  // Make sure required fields are present
  if (!messageData.match_id || !messageData.sender_id || !messageData.receiver_id || !messageData.content) {
    throw new SupabaseError('Missing required message fields', 400);
  }
  
  const { data, error } = await supabase
    .from('messages')
    .insert(messageData as any)
    .select()
    .single() as any;
    
  if (error) {
    throw new SupabaseError(`Error creating message: ${error.message}`, 500, error.code);
  }
  
  return data as Message;
};

export const setupMessageListener = (matchId: string, callback: (message: Message) => void): (() => void) => {
  return messages.setupMessageListener(matchId, callback);
};

// Export standalone functions for research posts
export const getResearchPost = async (id: string): Promise<ResearchPost> => {
  return await posts.getResearchPost(id);
};

export const getResearchPosts = async (options: { limit?: number; offset?: number; tags?: string[]; userId?: string } = {}): Promise<ResearchPost[]> => {
  return await posts.getResearchPosts(options);
};

export const updateResearchPost = async (data: Partial<ResearchPost> & { id: string }): Promise<ResearchPost> => {
  const { id, ...updateData } = data;
  return await posts.updateResearchPost(id, updateData);
};

export const deleteResearchPost = async (id: string): Promise<void> => {
  return await posts.deleteResearchPost(id);
};

// Export additional standalone functions
export const getProfile = async (id: string): Promise<Profile> => {
  return await profiles.getById(id) as Profile;
};

export const getProfileStats = async (userId: string): Promise<any> => {
  return await profiles.getStats(userId);
};

export const getUserPosts = async (userId: string, limit = 10): Promise<ResearchPost[]> => {
  return await posts.getByUserId(userId, limit);
};

export const createMatch = async (user1Id: string, user2Id: string): Promise<Match> => {
  return await matchesApi.create({
    user_id_1: user1Id,
    user_id_2: user2Id,
    status: 'pending'
  }) as Match;
};

export const checkIfMatched = async (user1Id: string, user2Id: string): Promise<{ isMatched: boolean }> => {
  return await matches.checkIfMatched(user1Id, user2Id);
}; 