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
 * Resets the Supabase BROWSER client instance
 * Useful for testing or when auth state changes significantly.
 */
export function resetSupabaseClient() { // Consider renaming to resetBrowserClient for clarity
  browserClientInstance = null;
}

// /**
//  * DEPRECATED/REMOVE: If a standard client is needed (e.g., for server-only actions without SSR context),
//  * create it explicitly where needed, perhaps using a different utility function.
//  * Creates a new Supabase client instance
//  * Useful for server-side operations that need isolated clients
//  */
// export function createNewClient() {
//   // ... old implementation using createClient ...
// } 

function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase environment variables');
    throw new Error('CRITICAL: Missing Supabase environment variables');
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Creates a new Supabase browser client.
 * This function is internal to this module and ensures env vars are present.
 */
function createSingletonBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // This will only be logged on the client, which is fine
    console.error('CRITICAL: Missing Supabase environment variables');
    throw new Error('CRITICAL: Missing Supabase environment variables');
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * The singleton instance of the Supabase browser client.
 * This ensures that only one instance of the client exists in the browser,
 * preventing issues like multiple GoTrueClient instances.
 */
export const supabase = createClient(); 