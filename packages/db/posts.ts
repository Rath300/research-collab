import { createClient } from './supabaseClient';
import type { Database } from './types/database.types';

type ResearchPost = Database['public']['Tables']['research_posts']['Row'];
type ResearchPostInsert = Database['public']['Tables']['research_posts']['Insert'];
type ResearchPostUpdate = Database['public']['Tables']['research_posts']['Update'];

export async function getResearchPosts(limit = 10, offset = 0, userId?: string) {
  const supabase = createClient();
  
  let query = supabase
    .from('research_posts')
    .select(`
      *,
      profiles:user_id (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
    
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  return query;
}

export async function getResearchPost(id: string) {
  const supabase = createClient();
  
  return supabase
    .from('research_posts')
    .select(`
      *,
      profiles:user_id (
        id,
        first_name,
        last_name,
        avatar_url,
        bio,
        title,
        institution
      )
    `)
    .eq('id', id)
    .single();
}

export async function createResearchPost(post: any) {
  const supabase = createClient();
  return supabase
    .from('projects')
    .insert({
      leader_id: post.leader_id || post.user_id,
      title: post.title,
      description: post.content,
      tags: post.tags,
      is_public: post.visibility === 'public',
    })
    .select()
    .single();
}

export async function updateResearchPost(id: string, post: ResearchPostUpdate) {
  const supabase = createClient();
  
  return supabase
    .from('research_posts')
    .update(post)
    .eq('id', id)
    .select()
    .single();
}

export async function deleteResearchPost(id: string) {
  const supabase = createClient();
  
  return supabase
    .from('research_posts')
    .delete()
    .eq('id', id);
}

export async function incrementEngagement(id: string): Promise<{ data: ResearchPost | null; error: Error | null; }> {
  const supabase = createClient();
  
  // First get the current count
  const { data: post, error: getError } = await supabase
    .from('research_posts')
    .select('engagement_count')
    .eq('id', id)
    .single();
    
  if (getError) {
    return { data: null, error: getError };
  }
  
  // Then increment it
  return supabase
    .from('research_posts')
    .update({ 
      engagement_count: (post.engagement_count || 0) + 1 
    })
    .eq('id', id)
    .select()
    .single();
} 