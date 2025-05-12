// Import the Supabase client from the standard package
import { createBrowserClient } from '@supabase/ssr';
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
if (typeof window !== 'undefined') { // Only run this check on the client
  if (!supabaseUrl) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!supabaseAnonKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
}

// Create and export the Supabase client instance directly
// Ensure this runs only once per module load
export const supabase = createBrowserClient<Database>(
  supabaseUrl!, // Use non-null assertion, validation happens above/elsewhere
  supabaseAnonKey! // Use non-null assertion
);

// Optional: Keep the createNewClient function if needed for specific server-side scenarios
// where a completely fresh, non-singleton client might be required (though less common with ssr helpers)
// Consider creating a separate server client utility if needed.

/* 
Removed singleton logic:
- getSupabaseClient
- getBrowserClient
- resetSupabaseClient
- instance variable
*/ 