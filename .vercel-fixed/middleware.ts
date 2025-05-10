// Edge-compatible middleware for Vercel deployment
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = [
    '/login',
    '/signup',
    '/reset-password',
    '/auth/callback',
    '/_next',
    '/api/auth',
    '/images',
    '/fonts',
    '/favicon.ico'
  ];

  const path = request.nextUrl.pathname;
  
  // Allow all public paths
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // Skip auth check for development mode
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  try {
    // Create a Supabase client configured to use cookies
    const response = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res: response });
    
    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession();
    
    // If no session for protected routes, redirect to login
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session && !path.startsWith('/login')) {
      const redirectUrl = new URL('/login', request.url);
      // Add original path as a query param for redirect after login
      redirectUrl.searchParams.set('redirectedFrom', path);
      return NextResponse.redirect(redirectUrl);
    }
    
    return response;
  } catch (error) {
    // If Supabase auth fails, better to let the user continue than block them
    console.error('Auth middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 