// Import the Supabase client from the standard package
import { createClient } from '@supabase/supabase-js';
import { type Database } from '../types/database.types';

/**
 * Custom error class for Supabase operations
 * Provides consistent error handling across the application
 */
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

// Environment variables with proper validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Early validation of required environment variables
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables. Please check your .env.local file or deployment environment variables.');
}

// Singleton instance for the Supabase client
let instance: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Creates a properly configured Supabase client with type safety
 */
function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new SupabaseError('Missing Supabase environment variables. Please check your .env.local file or deployment environment variables.', 500);
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'supabase-auth',
    },
    global: {
      headers: {
        'x-application-name': 'ResearchCollab',
      },
    },
    db: {
      schema: 'public',
    },
  });
}

/**
 * Returns the singleton Supabase client instance or creates it if it doesn't exist
 */
export function getSupabaseClient() {
  if (instance) return instance;
  
  try {
    instance = createSupabaseClient();
    return instance;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw new SupabaseError('Failed to initialize Supabase client', 500);
  }
}

/**
 * Returns the singleton browser-side Supabase client
 * Alias for getSupabaseClient for API compatibility
 */
export function getBrowserClient() {
  return getSupabaseClient();
}

/**
 * Resets the Supabase client instance
 * Useful for testing or when auth state changes
 */
export function resetSupabaseClient() {
  instance = null;
}

/**
 * Creates a new Supabase client instance
 * Useful for server-side operations that need isolated clients
 */
export function createNewClient() {
  return createSupabaseClient();
} 