import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { cookies } from 'next/headers';
import { createServerClient } from '@research-collab/db/supabaseClient';

/**
 * Inner context with DB
 */
export async function createContextInner(supabaseClient: ReturnType<typeof createServerClient>) {
  const { data: { session }} = await supabaseClient.auth.getSession();
  return {
    session,
    supabase: supabaseClient,
  };
}

/**
 * Context for API routes
 */
export async function createContext(opts: CreateNextContextOptions) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);
  return await createContextInner(supabase);
}

export type Context = Awaited<ReturnType<typeof createContextInner>>; 