import { getSupabaseClient } from './supabaseClient';
import { type Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface User {
  id: string;
  email: string | null;
  profile: Profile | null;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }
    
    // Fetch the user's profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    
    return {
      id: user.id,
      email: user.email ?? null,
      profile: profile || null,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function signUp(email: string, password: string, userData: Partial<Profile>) {
  const supabase = getSupabaseClient();
  
  try {
    // Create the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Error creating user');
    }
    
    // Prepare profile data for insert, adhering to the ProfileInsert type
    const profileDataForInsert: Database['public']['Tables']['profiles']['Insert'] = {
      id: authData.user.id,
      user_id: authData.user.id,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      email: email,
      created_at: new Date().toISOString(),
      joining_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      
      // Optional fields from userData - use ?? null to convert undefined to null
      availability: userData.availability ?? null,
      availability_hours: userData.availability_hours ?? null,
      avatar_url: userData.avatar_url ?? null,
      bio: userData.bio ?? null,
      collaboration_pitch: userData.collaboration_pitch ?? null,
      education: userData.education ?? null,
      field_of_study: userData.field_of_study ?? null,
      full_name: userData.full_name ?? null,
      institution: userData.institution ?? null,
      interests: userData.interests ?? null,
      location: userData.location ?? null,
      looking_for: userData.looking_for ?? null,
      project_preference: userData.project_preference ?? null,
      skills: userData.skills ?? null,
      title: userData.title ?? null,
      visibility: userData.visibility ?? null,
      website: userData.website ?? null,
    };
    
    // Create the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert(profileDataForInsert);
      
    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw new Error(profileError.message);
    }
    
    return authData;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

export async function signOut() {
  const supabase = getSupabaseClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
} 