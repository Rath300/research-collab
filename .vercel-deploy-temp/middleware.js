// Edge-compatible middleware for Vercel deployment
import { NextResponse } from 'next/server';

// This middleware is compatible with Vercel's Edge Runtime
export async function middleware(request) {
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
    '/vercel.svg',
    '/next.svg',
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

  // Check for auth cookie using native Request/Response methods
  // This avoids using Supabase directly in the middleware which can cause Edge Runtime errors
  const authCookie = request.cookies.get('sb-auth-token') || 
                    request.cookies.get('supabase-auth-token');
  
  // If no session for protected routes, redirect to login
  if (!authCookie && !path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
