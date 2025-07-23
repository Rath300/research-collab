import { supabaseClient } from './supabaseClient';
import { type Database } from '../types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type InsertProject = Database['public']['Tables']['projects']['Insert'];
type UpdateProject = Database['public']['Tables']['projects']['Update'];

export async function getProjects(limit = 10, offset = 0, userId?: string): Promise<Project[]> {
  const supabase = supabaseClient;
  let query = supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);
  if (userId) {
    query = query.eq('leader_id', userId);
  } else {
    query = query.eq('is_public', true);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
  return data as Project[];
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = supabaseClient;
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles:leader_id(first_name, last_name, avatar_url, title)')
    .eq('id', id)
    .single();
  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }
  return data as Project;
}

export async function createProject(post: any): Promise<any> {
  const supabase = supabaseClient;
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

export async function updateProject(id: string, post: UpdateProject): Promise<Project> {
  const supabase = supabaseClient;
  
  const { data, error } = await supabase
    .from('projects')
    .update(post)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }
  
  return data as Project;
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = supabaseClient;
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
  
  return true;
} 