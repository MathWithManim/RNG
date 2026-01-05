import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/services/auth-client';
import { getUserData } from '@/services/auth';

// Middleware to protect admin routes
export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Check if this is an admin route (including dynamic ones)
  if (pathname.startsWith('/admin')) {
    // Get session information
    const session = getSession();
    if (!session) {
      // Redirect to login if no session
      url.pathname = '/login';
      url.search = `?callbackUrl=${encodeURIComponent(request.url)}`;
      return NextResponse.redirect(url);
    }

    // Verify user is an admin
    const user = await getUserData(session.id);
    if (!user || !user.is_admin) {
      // Return 403 for non-admins
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // For the base /admin path, redirect to a dynamic admin path
    if (pathname === '/admin') {
      // Generate a dynamic path based on session and timestamp
      const timestamp = Date.now().toString(36);
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const dynamicAdminPath = `/admin-${timestamp}-${randomSuffix}`;

      url.pathname = dynamicAdminPath;
      return NextResponse.redirect(url);
    }

    // For dynamic admin paths like /admin-[timestamp]-[random]
    // Validate the format: /admin-[timestamp]-[random]
    const pathPattern = /^\/admin-[a-z0-9]+-[a-z0-9]+$/;
    if (pathPattern.test(pathname)) {
      // Path format is valid, allow access
      return NextResponse.next();
    } else {
      // Invalid path format, return 404 to hide the actual admin path
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }
  }

  // Allow all other requests to pass through
  return NextResponse.next();
}

// Apply middleware to all routes except API routes and static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};