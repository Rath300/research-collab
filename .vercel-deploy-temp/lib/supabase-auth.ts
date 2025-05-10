import { getSupabaseClient } from './supabaseClient';
import { type Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface User {
  id: string;
  email: string | null;
  profile: Profile | null;
}

/**
 * Get the current user with their profile
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseClient();
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error or no user found:', authError);
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

/**
 * Sign in a user with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

/**
 * Sign up a new user and create their profile
 */
export async function signUp(email: string, password: string, userData: {
  first_name: string;
  last_name: string;
  bio?: string;
  institution?: string;
  location?: string;
  field_of_study?: string;
  availability?: string;
  interests?: string[];
}) {
  const supabase = getSupabaseClient();
  
  try {
    // Create the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name
        }
      }
    });
    
    if (authError || !authData.user) {
      console.error('Auth error during signup:', authError);
      throw new Error(authError?.message || 'Error creating user');
    }
    
    // Create the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: email,
        joining_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        bio: userData.bio || null,
        institution: userData.institution || null,
        location: userData.location || null,
        field_of_study: userData.field_of_study || null,
        availability: userData.availability as any || null,
        interests: userData.interests || []
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

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = getSupabaseClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Send a password reset email
 */
export async function resetPassword(email: string) {
  const supabase = getSupabaseClient();
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    
    if (error) {
      console.error('Reset password error:', error);
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

/**
 * Update the user's password
 */
export async function updatePassword(password: string) {
  const supabase = getSupabaseClient();
  
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    
    if (error) {
      console.error('Update password error:', error);
      throw new Error(error.message);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
} 