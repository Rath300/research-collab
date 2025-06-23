// Use the SSR version for the browser client
// import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { type Database } from '../types/database.types';
// Import the specific client type for explicit typing
import { type SupabaseClient } from '@supabase/supabase-js';

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
  console.error('Missing Supabase environment variables');
}

// Singleton instance for the BROWSER client - Explicitly typed
let browserClientInstance: SupabaseClient<Database> | null = null;

// Function to create the SSR-compatible browser client
function createSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Ensure this runs only client-side or variables are available server-side if needed elsewhere
    throw new SupabaseError('Missing Supabase environment variables for browser client', 500);
  }
  // Use createBrowserClient from @supabase/ssr
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Export the function to get the singleton browser client instance
export function getBrowserClient(): SupabaseClient<Database> {
  // Ensure this function is only called client-side or handled appropriately if called server-side
  // For server components, different strategies (cookies, server client) are needed.
  if (browserClientInstance) return browserClientInstance;
  browserClientInstance = createSupabaseBrowserClient();
  return browserClientInstance;
}

/**
 * Get the singleton Supabase client instance.
 * This is the recommended way to access the client to avoid multiple instances.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  return getBrowserClient();
}

/**
 * Resets the Supabase BROWSER client instance
 * Useful for testing or when auth state changes significantly.
 */
export function resetSupabaseClient() { // Consider renaming to resetBrowserClient for clarity
  browserClientInstance = null;
}

/**
 * Export the singleton Supabase client instance
 * This ensures only one client instance exists, preventing multiple GoTrueClient warnings
 * Using a getter to make it lazy and avoid creating the client at module load time
 */
export const supabase = {
  // Use getters to make all methods lazy
  get auth() { return getBrowserClient().auth; },
  get from() { return getBrowserClient().from.bind(getBrowserClient()); },
  get storage() { return getBrowserClient().storage; },
  get functions() { return getBrowserClient().functions; },
  get realtime() { return getBrowserClient().realtime; },
  get rest() { return getBrowserClient().rest; },
  get channel() { return getBrowserClient().channel.bind(getBrowserClient()); },
  get removeChannel() { return getBrowserClient().removeChannel.bind(getBrowserClient()); },
  get removeAllChannels() { return getBrowserClient().removeAllChannels.bind(getBrowserClient()); },
  get getChannels() { return getBrowserClient().getChannels.bind(getBrowserClient()); },
}; 