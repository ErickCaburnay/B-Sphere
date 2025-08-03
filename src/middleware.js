import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check if the request is for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Get token from cookies or authorization header
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    // OPTIMIZATION: Removed excessive debug logging for better performance
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware check:', {
        pathname: request.nextUrl.pathname,
        hasToken: !!token
      });
    }

    if (!token) {
      // Allow client-side navigation to proceed (user-agent includes 'Mozilla')
      const userAgent = request.headers.get('user-agent') || '';
      if (userAgent.includes('Mozilla')) {
        return NextResponse.next();
      }
      // Redirect to login if no token for server-side requests
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