import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
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

// Custom fetch with timeout to prevent hanging requests
const customFetchWithTimeout = (url: RequestInfo | URL, options: RequestInit = {}) => {
  // Shorter timeout for auth-related endpoints to prevent long waits
  let timeoutMs = 8000; // Default 8 second timeout
  
  // Use shorter timeout for auth and session operations to prevent UI hanging
  if (url.toString().includes('/auth/') || url.toString().includes('/session')) {
    timeoutMs = 3000; // 3 seconds for auth operations
  }
  
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeout = setTimeout(() => {
    console.log(`Request timeout after ${timeoutMs}ms:`, url.toString());
    controller.abort();
  }, timeoutMs);
  
  return fetch(url, {
    ...options,
    signal,
    // Include credentials to ensure cookies are sent
    credentials: 'include',
  })
    .then(response => {
      clearTimeout(timeout);
      return response;
    })
    .catch(error => {
      clearTimeout(timeout);
      console.error('Fetch error:', error);
      throw error;
    });
};

// Create a single Supabase client for the browser with optimized settings
export const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      fetch: customFetchWithTimeout
    }
  });
};

// Singleton instance of the Supabase client for browser
let browserInstance: ReturnType<typeof createBrowserClient> | null = null;

// Get the browser client with timeout handling
export const getBrowserClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('getBrowserClient should only be called in browser context');
  }
  
  return createClientComponentClient<Database>({
    options: {
      global: {
        fetch: customFetchWithTimeout
      }
    }
  });
};

// Authentication helper functions
export const signIn = async (email: string, password: string) => {
  const supabase = getBrowserClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new SupabaseError(error.message, error.status || 400, error.code);
    }
    
    return data;
  } catch (err: any) {
    if (err instanceof SupabaseError) throw err;
    
    if (err.name === 'AbortError') {
      throw new SupabaseError('Login request timed out. Please try again.', 408);
    }
    
    throw new SupabaseError(err.message || 'Authentication failed', 500);
  }
};

export const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
  const supabase = getBrowserClient();
  const redirectUrl = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL || 
    (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: redirectUrl,
      },
    });
    
    if (error) {
      throw new SupabaseError(error.message, error.status || 400, error.code);
    }
    
    return data;
  } catch (err: any) {
    if (err instanceof SupabaseError) throw err;
    
    if (err.name === 'AbortError') {
      throw new SupabaseError('Signup request timed out. Please try again.', 408);
    }
    
    throw new SupabaseError(err.message || 'Signup failed', 500);
  }
};

export const signOut = async () => {
  const supabase = getBrowserClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new SupabaseError(error.message, error.status || 400, error.code);
    }
    
    return true;
  } catch (err: any) {
    if (err instanceof SupabaseError) throw err;
    console.error('Sign out error:', err);
    return true; // Always succeed signout even if there's an error
  }
};

export const getSession = async () => {
  const supabase = getBrowserClient();
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new SupabaseError(error.message, error.status || 400);
    }
    
    return data.session;
  } catch (err: any) {
    if (err instanceof SupabaseError) throw err;
    
    if (err.name === 'AbortError') {
      throw new SupabaseError('Session check timed out. Please try again.', 408);
    }
    
    console.error('Get session error:', err);
    return null; // Return null instead of throwing to handle session checks gracefully
  }
};

export const getUser = async () => {
  const supabase = getBrowserClient();
  
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw new SupabaseError(error.message, error.status || 400);
    }
    
    return data.user;
  } catch (err: any) {
    if (err instanceof SupabaseError) throw err;
    
    if (err.name === 'AbortError') {
      throw new SupabaseError('User fetch timed out. Please try again.', 408);
    }
    
    throw new SupabaseError(err.message || 'Failed to get user', 500);
  }
};

export const resetPassword = async (email: string) => {
  const supabase = getBrowserClient();
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    
    if (error) {
      throw new SupabaseError(error.message, 400, error.code);
    }
  } catch (err: any) {
    if (err instanceof SupabaseError) throw err;
    
    if (err.name === 'AbortError') {
      throw new SupabaseError('Password reset request timed out. Please try again.', 408);
    }
    
    throw new SupabaseError(err.message || 'Failed to reset password', 500);
  }
};

export const updatePassword = async (newPassword: string) => {
  const supabase = getBrowserClient();
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      throw new SupabaseError(error.message, 400, error.code);
    }
  } catch (err: any) {
    if (err instanceof SupabaseError) throw err;
    
    if (err.name === 'AbortError') {
      throw new SupabaseError('Password update timed out. Please try again.', 408);
    }
    
    throw new SupabaseError(err.message || 'Failed to update password', 500);
  }
}; 
  } catch (err: any) {
    if (err instanceof SupabaseError) throw err;
    
    if (err.name === 'AbortError') {
      throw new SupabaseError('Password update timed out. Please try again.', 408);
    }
    
    throw new SupabaseError(err.message || 'Failed to update password', 500);
  }
}; 