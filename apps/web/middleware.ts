import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const PROTECTED_PATHS = ['/dashboard', '/settings', '/profile', '/projects', '/collaborators', '/chats', '/research', '/onboarding']; // Add other paths that need auth
const AUTH_PATHS = ['/login', '/signup', '/reset-password', '/update-password', '/auth/check-email']; // Paths for unauthenticated users

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

  if (isProtectedRoute && !isUserAuthenticated) {
    // Redirect unauthenticated users from protected routes to login
    let redirectUrl = '/login';
    if (pathname !== '/') {
        // Preserve the intended destination for redirection after login, unless it's an API route
        if (!pathname.startsWith('/api')) {
            redirectUrl += `?redirect_to=${encodeURIComponent(pathname + request.nextUrl.search)}`;
        }
    }
    return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

  if (isAuthRoute && isUserAuthenticated) {
    // Redirect authenticated users from auth routes (login, signup) to dashboard
    // Exception for /auth/check-email and /update-password which might be accessed by authenticated users in specific flows
    if (pathname !== '/auth/check-email' && pathname !== '/update-password') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Handle root path for authenticated users
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
} 