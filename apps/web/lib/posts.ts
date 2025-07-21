import { getSupabaseClient } from './supabaseClient';
import { type Database } from '../types/database.types';

type ResearchPost = Database['public']['Tables']['research_posts']['Row'];
type InsertResearchPost = Database['public']['Tables']['research_posts']['Insert'];
type UpdateResearchPost = Database['public']['Tables']['research_posts']['Update'];

export async function getResearchPosts(limit = 10, offset = 0, userId?: string): Promise<ResearchPost[]> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('research_posts')
    .select('*, profiles:user_id(first_name, last_name, avatar_url, title)')
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
    
  // If userId is provided, filter by user_id
  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    // Otherwise only show public posts
    query = query.eq('visibility', 'public');
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching research posts:', error);
    throw error;
  }
  
  return data as ResearchPost[];
}

export async function getResearchPost(id: string): Promise<ResearchPost | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('research_posts')
    .select('*, profiles:user_id(first_name, last_name, avatar_url, title)')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching research post:', error);
    return null;
  }
  
  return data as ResearchPost;
}

export async function createResearchPost(post: any): Promise<any> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
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
  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }
  return data;
}

export async function updateResearchPost(id: string, post: UpdateResearchPost): Promise<ResearchPost> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('research_posts')
    .update(post)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating research post:', error);
    throw error;
  }
  
  return data as ResearchPost;
}

export async function deleteResearchPost(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('research_posts')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting research post:', error);
    throw error;
  }
  
  return true;
}

export async function incrementEngagement(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  // First get the current engagement count
  const { data, error: fetchError } = await supabase
    .from('research_posts')
    .select('engagement_count')
    .eq('id', id)
    .single();
    
  if (fetchError) {
    console.error('Error fetching research post engagement:', fetchError);
    throw fetchError;
  }
  
  const currentEngagement = data.engagement_count || 0;
  
  // Then update with incremented count
  const { error: updateError } = await supabase
    .from('research_posts')
    .update({ engagement_count: currentEngagement + 1 })
    .eq('id', id);
    
  if (updateError) {
    console.error('Error updating research post engagement:', updateError);
    throw updateError;
  }
} 