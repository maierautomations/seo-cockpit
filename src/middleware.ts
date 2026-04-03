import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

// Routes that require Supabase Auth (redirect to /login if not authenticated)
const PROTECTED_ROUTES = ['/dashboard', '/briefing', '/briefings', '/article']

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request)

  // Refresh session — must run on every request to keep cookies alive
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname, searchParams } = request.nextUrl

  // Allow demo mode to bypass auth
  if (searchParams.get('demo') === 'true') {
    return response
  }

  // Check if the current path is protected
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from /login
  if (pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Match all routes except static files, images, and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|landing/|api/auth/).*)',
  ],
}
