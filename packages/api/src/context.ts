import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Inner context with DB
 */
export async function createContextInner(supabaseClient: ReturnType<typeof createServerClient>) {
  const { data: { session }} = await supabaseClient.auth.getSession();
  console.log('Supabase session in context:', session);
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
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, { cookies: cookieStore });
  return await createContextInner(supabase);
}

export type Context = Awaited<ReturnType<typeof createContextInner>>; 