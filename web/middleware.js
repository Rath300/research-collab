import { NextResponse } from 'next/server';

export function middleware(request) {
  // List of public paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/reset-password',
    '/onboarding',
    '/test',
    '/about',
    '/contact',
    '/pricing',
    '/terms',
    '/privacy'
  ];
  
  const pathname = request.nextUrl.pathname;
  
  // Check if it's a public path
  if (publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }
  
  // Check if we have a session
  const authCookie = request.cookies.get('sb-auth-token');
  
  // If there's no session cookie, redirect to login
  if (!authCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // User has a cookie, proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)'
  ]
}; 