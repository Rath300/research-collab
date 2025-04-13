import { createClient } from '@supabase/supabase-js';
import { Database } from '@research-collab/db';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Custom error handling for Supabase operations
export class SupabaseError extends Error {
  status: number;
  code?: string;
  
  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.name = 'SupabaseError';
    this.status = status;
    this.code = code;
  }
}

// Create a single Supabase client for the browser
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient<Database>(supabaseUrl, supabaseKey);
};

// Singleton instance of the Supabase client for browser
let browserInstance: ReturnType<typeof createBrowserClient> | null = null;

// Get the browser client (or create it if it doesn't exist)
export const getBrowserClient = () => {
  return createClientComponentClient();
};

// Authentication helper functions
export const signIn = async (email: string, password: string) => {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw new SupabaseError(error.message, error.status || 400, error.code);
  }
  
  return data;
};

export const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  
  if (error) {
    throw new SupabaseError(error.message, error.status || 400, error.code);
  }
  
  return data;
};

export const signOut = async () => {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new SupabaseError(error.message, error.status || 400, error.code);
  }
  
  return true;
};

export const getSession = async () => {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    throw new SupabaseError(error.message, error.status || 400);
  }
  
  return data.session;
};

export const getUser = async () => {
  const supabase = getBrowserClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new SupabaseError(error.message, error.status || 400);
  }
  
  return data.user;
};

export const resetPassword = async (email: string) => {
  const supabase = getBrowserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  });
  
  if (error) {
    throw new SupabaseError(error.message, 400, error.code);
  }
};

export const updatePassword = async (newPassword: string) => {
  const supabase = getBrowserClient();
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) {
    throw new SupabaseError(error.message, 400, error.code);
  }
}; 