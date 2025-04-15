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
      email: user.email,
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
    
    // Create the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: email,
        joining_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...userData,
      });
      
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