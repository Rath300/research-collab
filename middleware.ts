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
  const authPaths = ['/login', '/signup', '/reset-password']
  const isAuthPath = authPaths.includes(pathname) || pathname.startsWith('/auth')

  // Redirect to /login if not logged in AND not on an auth-related path
  if (!session && !isAuthPath) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login' // Changed target to /login as it seems to be the main login page
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to /dashboard if logged in AND on an auth-related path
  if (session && isAuthPath && pathname !== '/auth/check-email') { // Allow staying on check-email page
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 