import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Profile, profileSchema } from '@research-collab/db';
import type { PostgrestError } from '@supabase/supabase-js';

// Query key factory
const profileKeys = {
  all: () => ['profiles'] as const,
  lists: () => [...profileKeys.all(), 'list'] as const,
  list: (filters: Record<string, any>) => [...profileKeys.lists(), filters] as const,
  details: () => [...profileKeys.all(), 'detail'] as const,
  detail: (id: string) => [...profileKeys.details(), id] as const,
};

/**
 * Hook to fetch a user profile by ID
 */
export function useProfile(id: string) {
  return useQuery({
    queryKey: profileKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch multiple profiles with optional filters
 */
export function useProfiles(
  filters: {
    interests?: string[];
    is_mentor?: boolean;
    availability?: string;
    location?: string;
    searchQuery?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { interests, is_mentor, availability, location, searchQuery, limit = 10, offset = 0 } = filters;
  
  return useQuery({
    queryKey: profileKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*');
      
      // Apply filters if they exist
      if (interests && interests.length > 0) {
        query = query.contains('interests', interests);
      }
      
      if (is_mentor !== undefined) {
        query = query.eq('is_mentor', is_mentor);
      }
      
      if (availability) {
        query = query.eq('availability', availability);
      }
      
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }
      
      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,institution.ilike.%${searchQuery}%`);
      }
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Profile[];
    },
  });
}

/**
 * Hook to get a random set of profiles (for collaborator matching)
 */
export function useRandomProfiles(limit = 10, excludeIds: string[] = []) {
  return useQuery({
    queryKey: [...profileKeys.lists(), { random: true, limit, excludeIds }],
    queryFn: async () => {
      // Supabase doesn't have a direct "random" function, so we'll use a common workaround
      let query = supabase
        .from('profiles')
        .select('*');
      
      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }
      
      const { data, error } = await query.order('created_at').limit(limit);
      
      if (error) throw error;
      
      // Shuffle the results in the client
      return data?.sort(() => Math.random() - 0.5) as Profile[];
    },
  });
}

/**
 * Hook to update a user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profile: Partial<Profile> & { id: string }) => {
      // Validate with Zod
      const validated = profileSchema.partial().extend({ id: profileSchema.shape.id }).parse(profile);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(validated)
        .eq('id', profile.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
    },
  });
}

/**
 * Hook to search profiles by interests or other criteria
 */
export function useSearchProfiles(searchQuery: string, limit = 10) {
  return useQuery({
    queryKey: [...profileKeys.lists(), { search: searchQuery, limit }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,institution.ilike.%${searchQuery}%,field_of_study.ilike.%${searchQuery}%`)
        .limit(limit);
      
      if (error) throw error;
      return data as Profile[];
    },
    enabled: searchQuery.length > 0,
  });
} 