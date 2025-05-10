import { createClient } from '@supabase/supabase-js';
import { type Database } from '../types/database.types';

// This module should only be imported in server components or API routes
// Validate we're on the server before accessing sensitive environment variables
if (typeof window !== 'undefined') {
  // In browser context, we should not have access to service role key
  // This is a defensive measure against import in client components
  throw new Error('supabaseAdmin should only be imported in server-side code');
}

// Server-side only variables - use type assertion for strict TypeScript checking
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Validate required server environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase admin credentials. Please check your server environment variables.');
}

// Separate from the client-side Supabase client to avoid variable naming conflicts
let adminInstance: ReturnType<typeof createSupabaseAdmin> | null = null;

function createSupabaseAdmin() {
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'x-application-name': 'ResearchCollab-Admin'
        }
      }
    }
  );
}

// Get the admin client for server-side operations
export function getSupabaseAdmin() {
  // Secondary check to ensure we're on the server
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseAdmin should only be used on the server');
  }
  
  if (adminInstance) return adminInstance;
  
  adminInstance = createSupabaseAdmin();
  return adminInstance;
}

// Create a research project with proper naming and prevent conflicts
export async function createResearchProject({
  title,
  content,
  userId,
  tags,
  visibility = 'public'
}: {
  title: string;
  content: string;
  userId: string;
  tags?: string[];
  visibility?: 'public' | 'private' | 'connections';
}) {
  // Extra security check
  if (typeof window !== 'undefined') {
    throw new Error('Server-side function called in browser context');
  }

  const admin = getSupabaseAdmin();
  
  try {
    // Check if a project with the same title exists for this user
    const { data: existingProjects } = await admin
      .from('research_posts')
      .select('id, title')
      .eq('user_id', userId)
      .eq('title', title)
      .limit(1);
      
    // If a project with the same title exists, add a timestamp to make it unique
    let uniqueTitle = title;
    if (existingProjects && existingProjects.length > 0) {
      uniqueTitle = `${title} (${new Date().toISOString().slice(0, 19).replace('T', ' ')})`;
    }
    
    // Create the project with the unique title - using type safe approach
    const { data, error } = await admin
      .from('research_posts')
      .insert({
        title: uniqueTitle,
        content,
        user_id: userId,
        tags,
        visibility,
        is_boosted: false,
        engagement_count: 0,
      } as any) // Type assertion to bypass strict checking
      .select()
      .single();
    
    if (error) {
      console.error('Error creating research project:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in createResearchProject:', error);
    return { data: null, error };
  }
} 