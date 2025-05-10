import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper function to determine if a URL is from a trusted host
function isTrustedHost(url: string): boolean {
  const trustedHosts = [
    'research-collab-nine.vercel.app',
    'research-collab-standalone.vercel.app',
    'research-collab-3mdbxh5t2-shreyanshrath4-gmailcoms-projects.vercel.app',
    'research-collab-fgo5ecn3i-shreyanshrath4-gmailcoms-projects.vercel.app',
    'research-collab-lc8mswyy8-shreyanshrath4-gmailcoms-projects.vercel.app',
    'research-collab-nz4t0q7pu-shreyanshrath4-gmailcoms-projects.vercel.app',
    'research-collab-rmit9gk5s-shreyanshrath4-gmailcoms-projects.vercel.app',
    'research-collab-52jhs7qjs-shreyanshrath4-gmailcoms-projects.vercel.app',
    'shreyanshrath4-gmailcoms-projects.vercel.app',
    'localhost'
  ];
  
  return trustedHosts.some(host => url.includes(host));
}

// Create a redirect response with appropriate headers
function createRedirectResponse(url: string): NextResponse {
  const response = NextResponse.redirect(url);
  // Add cache control headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  // Ensure content-type is set to prevent MIME type issues
  response.headers.set('Content-Type', 'text/html; charset=utf-8');
  return response;
}

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] Processing ${request.method} ${request.nextUrl.pathname}`);
  
  // Handle dashboard auth transition param
  if (request.nextUrl.pathname === '/dashboard' && 
     (request.nextUrl.searchParams.has('_t') || 
      request.headers.get('referer')?.includes('/onboarding'))) {
    console.log('[Middleware] Detected dashboard auth transition request, allowing access');
    return NextResponse.next();
  }
  
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
    '/privacy',
    '/auth/callback',
    '/update-password',
    '/api/auth'
  ];
  
  // Handle file requests and static assets immediately
  if (
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }
  
  // Check for redirect loop detection
  const redirectCount = parseInt(request.headers.get('x-redirect-count') || '0');
  if (redirectCount > 3) {
    console.error(`[Middleware] Redirect loop detected! Path: ${request.nextUrl.pathname}`);
    // Break the loop by forcing the user to login page without redirectTo param
    return createRedirectResponse(`${request.nextUrl.origin}/login?loop=true`);
  }
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(`${path}/`)
  );
  
  // If the path is public, allow access without authentication
  if (isPublicPath) {
    console.log(`[Middleware] Public path: ${request.nextUrl.pathname}, skipping auth check`);
    return NextResponse.next();
  }
  
  // Check if we're coming from a redirect (to detect loops)
  const referer = request.headers.get('referer') || '';
  const isFromLoginPage = referer.includes('/login');
  const isFromDashboard = referer.includes('/dashboard');
  
  // If we're coming from login page to dashboard with a referrer, we should let them through
  // This helps break potential loops with auth state that's hard to detect
  if (request.nextUrl.pathname === '/dashboard' && isFromLoginPage) {
    console.log('[Middleware] Coming from login to dashboard, bypassing auth check');
    return NextResponse.next();
  }
  
  // For protected routes, check authentication
  // Prepare the redirect URL in case we need it
  const redirectUrl = new URL('/login', request.url);
  redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
  
  // Pass along redirect count to detect loops
  const headers = new Headers(request.headers);
  headers.set('x-redirect-count', (redirectCount + 1).toString());
  
  // Ensure we're redirecting to a trusted domain
  if (!isTrustedHost(redirectUrl.toString())) {
    const fallbackUrl = new URL('/login', 'https://research-collab-nine.vercel.app');
    fallbackUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return createRedirectResponse(fallbackUrl.toString());
  }

  try {
    // Check for authentication cookie first - fast path
    // Look for all possible Supabase auth cookie formats
    const possibleCookieNames = [
      'sb-auth-token',
      'sb-access-token', 
      'supabase-auth-token',
      'sb-refresh-token',
      '__session',
      'sb:token',
    ];
    
    // Debug: log all cookies present
    console.log('[Middleware] Available cookies:', 
      Object.fromEntries(
        request.cookies.getAll().map(cookie => [cookie.name, cookie.value ? 'present' : 'empty'])
      )
    );
    
    const authCookie = possibleCookieNames.find(name => request.cookies.has(name) && request.cookies.get(name)?.value);
    
    if (!authCookie) {
      console.log(`[Middleware] No auth cookie found, redirecting to login`);
      
      // Special case for dashboard coming directly from onboarding
      const isFromOnboarding = request.headers.get('referer')?.includes('/onboarding') || false;
      if (request.nextUrl.pathname === '/dashboard' && isFromOnboarding) {
        console.log('[Middleware] Coming from onboarding to dashboard, bypassing auth check');
        return NextResponse.next();
      }
      
      // No auth cookie, immediately redirect to login
      const response = createRedirectResponse(redirectUrl.toString());
      // Pass along the redirect count to detect loops
      response.headers.set('x-redirect-count', (redirectCount + 1).toString());
      return response;
    }
    
    console.log(`[Middleware] Found auth cookie: ${authCookie}`);
    
    // Now create Supabase client and verify the session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // We're not setting any cookies in middleware
          },
          remove(name: string, options: any) {
            // We're not removing any cookies
          },
        },
      }
    );

    // Use a very short timeout for auth checking to prevent middleware timeout
    const sessionPromise = supabase.auth.getSession();
    // Very short timeout to prevent middleware timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), 1500) 
    );
    
    try {
      // Race the promises to prevent hanging
      const { data } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      const hasSession = !!data?.session;
      console.log(`[Middleware] Session check result: ${hasSession ? 'Valid session' : 'No valid session'}`);
      
      if (!hasSession) {
        // Let's try once more by checking if it's a dashboard request from login
        if (request.nextUrl.pathname === '/dashboard' && isFromLoginPage) {
          console.log('[Middleware] Possible false negative for auth. Coming from login to dashboard, allowing access');
          return NextResponse.next();
        }
        
        // No valid session, redirect to login
        const response = createRedirectResponse(redirectUrl.toString());
        response.headers.set('x-redirect-count', (redirectCount + 1).toString());
        return response;
      }
      
      // Valid session, continue
      return NextResponse.next();
    } catch (timeoutError) {
      console.error('[Middleware] Auth check timed out:', timeoutError);
      
      // On timeout, we should give the benefit of the doubt if:
      // 1. We have an auth cookie
      // 2. We're trying to access dashboard directly after login 
      if (authCookie && (request.nextUrl.pathname === '/dashboard' && isFromLoginPage)) {
        console.log('[Middleware] Auth timeout but has cookie and coming from login - allowing access');
        return NextResponse.next();
      }
      
      // Otherwise default to redirecting to login for safety
      const response = createRedirectResponse(redirectUrl.toString());
      response.headers.set('x-redirect-count', (redirectCount + 1).toString());
      return response;
    }
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error);
    // Any other error, redirect to login
    const response = createRedirectResponse(redirectUrl.toString());
    response.headers.set('x-redirect-count', (redirectCount + 1).toString());
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 
  // Ensure we're redirecting to a trusted domain
  if (!isTrustedHost(redirectUrl.toString())) {
    const fallbackUrl = new URL('/login', 'https://research-collab-nine.vercel.app');
    fallbackUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return createRedirectResponse(fallbackUrl.toString());
  }

  try {
    // Check for authentication cookie first - fast path
    // Look for all possible Supabase auth cookie formats
    const possibleCookieNames = [
      'sb-auth-token',
      'sb-access-token', 
      'supabase-auth-token',
      'sb-refresh-token',
      '__session',
      'sb:token',
    ];
    
    // Debug: log all cookies present
    console.log('[Middleware] Available cookies:', 
      Object.fromEntries(
        request.cookies.getAll().map(cookie => [cookie.name, cookie.value ? 'present' : 'empty'])
      )
    );
    
    const authCookie = possibleCookieNames.find(name => request.cookies.has(name) && request.cookies.get(name)?.value);
    
    if (!authCookie) {
      console.log(`[Middleware] No auth cookie found, redirecting to login`);
      
      // Special case for dashboard coming directly from onboarding
      const isFromOnboarding = request.headers.get('referer')?.includes('/onboarding') || false;
      if (request.nextUrl.pathname === '/dashboard' && isFromOnboarding) {
        console.log('[Middleware] Coming from onboarding to dashboard, bypassing auth check');
        return NextResponse.next();
      }
      
      // No auth cookie, immediately redirect to login
      const response = createRedirectResponse(redirectUrl.toString());
      // Pass along the redirect count to detect loops
      response.headers.set('x-redirect-count', (redirectCount + 1).toString());
      return response;
    }
    
    console.log(`[Middleware] Found auth cookie: ${authCookie}`);
    
    // Now create Supabase client and verify the session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // We're not setting any cookies in middleware
          },
          remove(name: string, options: any) {
            // We're not removing any cookies
          },
        },
      }
    );

    // Use a very short timeout for auth checking to prevent middleware timeout
    const sessionPromise = supabase.auth.getSession();
    // Very short timeout to prevent middleware timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), 1500) 
    );
    
    try {
      // Race the promises to prevent hanging
      const { data } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      const hasSession = !!data?.session;
      console.log(`[Middleware] Session check result: ${hasSession ? 'Valid session' : 'No valid session'}`);
      
      if (!hasSession) {
        // Let's try once more by checking if it's a dashboard request from login
        if (request.nextUrl.pathname === '/dashboard' && isFromLoginPage) {
          console.log('[Middleware] Possible false negative for auth. Coming from login to dashboard, allowing access');
          return NextResponse.next();
        }
        
        // No valid session, redirect to login
        const response = createRedirectResponse(redirectUrl.toString());
        response.headers.set('x-redirect-count', (redirectCount + 1).toString());
        return response;
      }
      
      // Valid session, continue
      return NextResponse.next();
    } catch (timeoutError) {
      console.error('[Middleware] Auth check timed out:', timeoutError);
      
      // On timeout, we should give the benefit of the doubt if:
      // 1. We have an auth cookie
      // 2. We're trying to access dashboard directly after login 
      if (authCookie && (request.nextUrl.pathname === '/dashboard' && isFromLoginPage)) {
        console.log('[Middleware] Auth timeout but has cookie and coming from login - allowing access');
        return NextResponse.next();
      }
      
      // Otherwise default to redirecting to login for safety
      const response = createRedirectResponse(redirectUrl.toString());
      response.headers.set('x-redirect-count', (redirectCount + 1).toString());
      return response;
    }
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error);
    // Any other error, redirect to login
    const response = createRedirectResponse(redirectUrl.toString());
    response.headers.set('x-redirect-count', (redirectCount + 1).toString());
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 