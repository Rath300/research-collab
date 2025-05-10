import { SupabaseClient } from '@supabase/supabase-js';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { type Session } from '@supabase/auth-helpers-nextjs';

interface CreateContextOptions {
  session: Session | null;
  supabase: SupabaseClient;
}

/**
 * Inner context with DB
 */
export function createContextInner({ session, supabase }: CreateContextOptions) {
  return {
    session,
    supabase,
  };
}

/**
 * Context for API routes
 */
export function createContext(opts: CreateNextContextOptions) {
  const { req } = opts;
  
  // Get the session and supabase client from your auth setup
  // This is a placeholder - implement according to your auth setup
  const session = null; // Get from your auth setup
  const supabase = null; // Initialize your Supabase client
  
  return createContextInner({ session, supabase });
}

export type Context = ReturnType<typeof createContextInner>; 