import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check if the request is for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Get token from cookies or authorization header
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // For now, just check if token exists and has the right format
    // We'll do full verification on the server side when needed
    if (token && token.split('.').length === 3) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
}; 