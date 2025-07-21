import { createClient } from './supabaseClient';
import type { Database } from './types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export async function getCurrentUser() {
  const supabase = createClient();
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return null;
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return null;
  }
  
  return {
    ...session.user,
    profile,
  };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(
  email: string, 
  password: string, 
  userData: { 
    first_name: string; 
    last_name: string; 
    [key: string]: any 
  }
) {
  const supabase = createClient();
  
  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError || !authData.user) {
    return { data: null, error: authError };
  }
  
  // 2. Create a profile for the user
  const { first_name, last_name, ...otherUserData } = userData;
  
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      first_name,
      last_name,
      ...otherUserData,
    })
    .select()
    .single();
    
  if (profileError) {
    return { data: null, error: profileError };
  }
  
  return { 
    data: { 
      user: authData.user, 
      profile: profileData 
    }, 
    error: null 
  };
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

export async function updateProfile(profile: Partial<Profile>): Promise<{ data: Profile | null; error: Error | null; }> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { data: null, error: new Error('Not authenticated') };
  }
  
  return supabase
    .from('profiles')
    .update(profile)
    .eq('id', session.user.id)
    .select()
    .single();
} 