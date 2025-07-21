import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createContext(opts: CreateNextContextOptions) {
  // Patch cookies to always return string
  const cookieStore = cookies();
  const cookieMethods = {
    get: (name: string) => cookieStore.get?.(name)?.value ?? undefined,
    set: () => {},
    remove: () => {},
  };

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, { cookies: cookieMethods });

  // Patch: If Authorization header is present, set the access token
  let accessToken: string | undefined;
  if (opts.req && typeof opts.req.headers?.get === 'function') {
    const authHeader = opts.req.headers.get('authorization');
    console.log('API context Authorization header:', authHeader);
    if (authHeader?.startsWith('Bearer ')) {
      accessToken = authHeader.replace('Bearer ', '');
    }
  } else if (opts.req && typeof opts.req.headers === 'object') {
    const authHeader = (opts.req.headers as any)['authorization'];
    console.log('API context Authorization header:', authHeader);
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.replace('Bearer ', '');
    }
  }
  if (accessToken) {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: '' });
  }
  const { data: { session } } = await supabase.auth.getSession();
  console.log('API context Supabase session:', session);
  return { supabase, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>; 