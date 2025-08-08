import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const PROTECTED_PATHS = ['/dashboard', '/settings', '/profile', '/projects', '/chats', '/research', '/onboarding'];
const AUTH_PATHS = ['/login', '/signup', '/reset-password', '/update-password', '/auth/check-email'];
const PROFILE_SETUP_PATH = '/profile-setup';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  const isUserAuthenticated = !!session;

  const isProtectedRoute = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  const isAuthRoute = AUTH_PATHS.includes(pathname);
  const isProfileSetupRoute = pathname === PROFILE_SETUP_PATH;

  // If user is not authenticated and trying to access protected routes
  if (isProtectedRoute && !isUserAuthenticated) {
    let redirectUrl = '/login';
    if (pathname !== '/') {
      if (!pathname.startsWith('/api')) {
        redirectUrl += `?redirect_to=${encodeURIComponent(pathname + request.nextUrl.search)}`;
      }
    }
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // If user is authenticated but trying to access auth routes
  if (isAuthRoute && isUserAuthenticated) {
    if (pathname !== '/auth/check-email' && pathname !== '/update-password') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If user is authenticated, check if they have a profile
  if (isUserAuthenticated && session?.user?.id) {
    try {
      // Check if user has a profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, bio')
        .eq('id', session.user.id)
        .single();

      const hasCompleteProfile = profile && 
        profile.first_name && 
        profile.last_name && 
        profile.first_name !== 'Anonymous' && 
        profile.last_name !== 'User' &&
        profile.bio; // Also check if they have a bio (indicating they've completed profile setup)

      // If user doesn't have a complete profile and is not on profile-setup page
      if (!hasCompleteProfile && !isProfileSetupRoute && !isAuthRoute) {
        // Redirect to profile setup
        return NextResponse.redirect(new URL(PROFILE_SETUP_PATH, request.url));
      }

      // If user has a complete profile and is on profile-setup page, redirect to dashboard
      if (hasCompleteProfile && isProfileSetupRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('Error checking user profile in middleware:', error);
      // If there's an error checking profile, redirect to profile setup to be safe
      if (!isProfileSetupRoute && !isAuthRoute) {
        return NextResponse.redirect(new URL(PROFILE_SETUP_PATH, request.url));
      }
    }
  }
  
  if (pathname === '/' && isUserAuthenticated) {
    // If user is authenticated and on the landing page, consider redirecting to dashboard
    // This is optional based on desired UX. For now, let them stay on landing.
    // return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images folder)
     * - videos (public videos folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|videos).*)',
  ],
}; 