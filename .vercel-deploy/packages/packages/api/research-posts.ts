import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase, ResearchPost, researchPostSchema } from '@research-collab/db';

// Query key factory
const postKeys = {
  all: () => ['research_posts'] as const,
  lists: () => [...postKeys.all(), 'list'] as const,
  list: (filters: Record<string, any>) => [...postKeys.lists(), filters] as const,
  infiniteList: (filters: Record<string, any>) => [...postKeys.lists(), 'infinite', filters] as const,
  details: () => [...postKeys.all(), 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

/**
 * Hook to fetch a single research post by ID
 */
export function useResearchPost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('research_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url,
            institution
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as ResearchPost & { 
        profiles: { 
          id: string; 
          first_name: string; 
          last_name: string; 
          avatar_url: string | null;
          institution: string | null;
        } 
      };
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch a list of research posts with optional filters
 */
export function useResearchPosts(
  filters: {
    userId?: string;
    tags?: string[];
    visibility?: 'public' | 'private' | 'connections';
    isBoosted?: boolean;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { userId, tags, visibility, isBoosted, searchQuery, limit = 10, offset = 0 } = filters;
  
  return useQuery({
    queryKey: postKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('research_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url,
            institution
          )
        `);
      
      // Apply filters if they exist
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
      }
      
      if (visibility) {
        query = query.eq('visibility', visibility);
      }
      
      if (isBoosted !== undefined) {
        query = query.eq('is_boosted', isBoosted);
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }
      
      // Order by recency, with boosted posts first
      query = query.order('is_boosted', { ascending: false })
                   .order('created_at', { ascending: false });
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Hook to fetch infinite-scrolling research posts feed
 */
export function useInfiniteResearchPosts(
  filters: {
    userId?: string;
    tags?: string[];
    visibility?: 'public' | 'private' | 'connections';
    isBoosted?: boolean;
    searchQuery?: string;
    limit?: number;
  } = {}
) {
  const { userId, tags, visibility, isBoosted, searchQuery, limit = 10 } = filters;
  
  return useInfiniteQuery({
    queryKey: postKeys.infiniteList(filters),
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('research_posts')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            avatar_url,
            institution
          )
        `);
      
      // Apply filters if they exist
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
      }
      
      if (visibility) {
        query = query.eq('visibility', visibility);
      }
      
      if (isBoosted !== undefined) {
        query = query.eq('is_boosted', isBoosted);
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }
      
      // Order by the algorithm: boosted first, then recency, then engagement
      query = query.order('is_boosted', { ascending: false })
                   .order('created_at', { ascending: false })
                   .order('engagement_count', { ascending: false });
      
      // Apply pagination
      query = query.range(pageParam, pageParam + limit - 1);
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Return the data and the next page cursor
      return {
        data,
        nextCursor: data.length === limit ? pageParam + limit : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

/**
 * Hook to create a new research post
 */
export function useCreateResearchPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (post: Omit<ResearchPost, 'id' | 'created_at' | 'updated_at'>) => {
      // Validate with Zod schema
      const validated = researchPostSchema
        .omit({ id: true, created_at: true, updated_at: true })
        .parse(post);
      
      const { data, error } = await supabase
        .from('research_posts')
        .insert(validated)
        .select()
        .single();
      
      if (error) throw error;
      return data as ResearchPost;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

/**
 * Hook to update a research post
 */
export function useUpdateResearchPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (post: Partial<ResearchPost> & { id: string }) => {
      // Validate with Zod schema
      const validated = researchPostSchema
        .partial()
        .extend({ id: researchPostSchema.shape.id })
        .parse(post);
      
      const { data, error } = await supabase
        .from('research_posts')
        .update(validated)
        .eq('id', post.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as ResearchPost;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: postKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

/**
 * Hook to delete a research post
 */
export function useDeleteResearchPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('research_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: postKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

/**
 * Hook to update engagement count
 */
export function useUpdateEngagement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, increment = 1 }: { id: string; increment?: number }) => {
      // First get the current engagement count
      const { data: post, error: fetchError } = await supabase
        .from('research_posts')
        .select('engagement_count')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Then update with the new value
      const { data, error: updateError } = await supabase
        .from('research_posts')
        .update({ engagement_count: (post.engagement_count || 0) + increment })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      return data as ResearchPost;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: postKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
} 