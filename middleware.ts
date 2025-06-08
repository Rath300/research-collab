import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // Define paths considered as authentication-related
  const authPaths = ['/login', '/signup', '/reset-password', '/update-password', '/auth/check-email']
  const isAuthPath = authPaths.includes(pathname) || pathname.startsWith('/auth/') // Check general /auth/ too

  // If user is logged IN and tries to access an auth path, redirect to dashboard
  if (session && isAuthPath) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    console.log('Middleware: Logged in user on auth path, redirecting to dashboard');
    return NextResponse.redirect(redirectUrl)
  }

  // If user is NOT logged in AND is trying to access a protected path (not an auth path and not root for now)
  if (!session && !isAuthPath && pathname !== '/') { // Exclude root path from this specific redirect
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    console.log('Middleware: Not logged in on protected path, redirecting to login');
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  // This matcher ensures the middleware runs on all paths except for static files, images, and API routes.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
} 