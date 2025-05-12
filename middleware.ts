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
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Logic for redirecting logged-in users away from auth paths has been removed from here.
  // It will be handled in AuthProvider.

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 