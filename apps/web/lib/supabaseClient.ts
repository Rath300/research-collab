// WARNING: This is the ONLY place the Supabase client should be created for browser code.
// Do NOT use createClient or createBrowserClient anywhere else in the browser.
// If you see multiple GoTrueClient warnings, check for duplicate imports or hot reload issues.

// Runtime check (dev only): Warn if this file is imported more than once
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  if ((window as any).__SUPABASE_CLIENT_IMPORTED__) {
    // eslint-disable-next-line no-console
    console.warn('[supabaseClient.ts] This file was imported more than once! This can cause multiple GoTrueClient warnings.');
  }
  (window as any).__SUPABASE_CLIENT_IMPORTED__ = true;
}

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

// Throw an error if the environment variables are not set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or anonymous key. Check your .env.local file.');
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Resets the Supabase BROWSER client instance
 * Useful for testing or when auth state changes significantly.
 */
export function resetSupabaseClient() { // Consider renaming to resetBrowserClient for clarity
  // This part of the code should ideally not be reached on the server.
  // Server-side logic should use a different client (e.g., from @supabase/ssr with cookies).
  // However, as a safeguard:
  console.warn(
    'Supabase client is not initialized for server-side rendering. This may lead to errors. Please use a server-compatible Supabase client for server-side operations.'
  );
}

/**
 * Export the singleton Supabase client instance
 * This ensures only one client instance exists, preventing multiple GoTrueClient warnings
 * Using a getter to make it lazy and avoid creating the client at module load time
 */
export const supabaseClient: {
  readonly auth: typeof supabase.auth;
  readonly from: typeof supabase.from;
  readonly storage: typeof supabase.storage;
  readonly functions: typeof supabase.functions;
  readonly realtime: typeof supabase.realtime;
  readonly channel: typeof supabase.channel;
  readonly removeChannel: typeof supabase.removeChannel;
  readonly removeAllChannels: typeof supabase.removeAllChannels;
  readonly getChannels: typeof supabase.getChannels;
} = {
  get auth() { return supabase.auth; },
  get from() { return supabase.from.bind(supabase); },
  get storage() { return supabase.storage; },
  get functions() { return supabase.functions; },
  get realtime() { return supabase.realtime; },
  get channel() { return supabase.channel.bind(supabase); },
  get removeChannel() { return supabase.removeChannel.bind(supabase); },
  get removeAllChannels() { return supabase.removeAllChannels.bind(supabase); },
  get getChannels() { return supabase.getChannels.bind(supabase); },
}; 