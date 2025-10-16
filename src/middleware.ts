import { NextRequest, NextResponse } from 'next/server';

// Helper to check the session cookie
function hasSessionCookie(req: NextRequest) {
  const cookie = req.cookies.get('session');
  return cookie !== undefined && cookie.value !== '';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoggedIn = hasSessionCookie(request);

  console.log(`Middleware: ${pathname}, logged in: ${isLoggedIn}`);

  if (pathname === '/') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/calendars', request.url));
    }
  }

  if (
    pathname.startsWith('/calendars') ||
    pathname.startsWith('/premium') ||
    pathname.startsWith('/edit')
  ) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!\\.well-known|_next/static|favicon\\.).*)'],
};
