import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define public paths that don't require authentication
const publicPaths = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/auth',
  '/',
  '/about',
  '/contact',
  '/pricing',
  '/features',
  '/terms',
  '/privacy',
];

// Define API paths that don't require authentication
const publicApiPaths = [
  '/api/auth/electron-login',
  '/api/auth/signup',
  '/api/auth/reset-password',
  '/api/auth/signout',
  '/api/auth/session',
  '/api/auth/session/',
  '/api/auth/csrf',
  '/api/auth/_log',
  '/api/auth/providers',
  '/api/auth/callback',
  '/api/auth/signin',
  // Add transaction API routes
  '/api/transactions',
  '/api/transactions/',
  '/api/transactions/categories',
  '/api/transactions/categories/',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is from Electron
  const isElectronRequest = request.headers.get('x-electron-app') === 'true';

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Check if the path is a public API path (including dynamic routes)
  const isPublicApiPath = publicApiPaths.some(path => {
    // For exact matches
    if (pathname === path) return true;
    
    // For dynamic routes like /api/transactions/123
    if (path.endsWith('/') && pathname.startsWith(path)) return true;
    
    // Special case for categories with IDs
    if (pathname.match(/^\/api\/transactions\/categories\/\d+$/)) return true;
    
    // Special case for transactions with IDs
    if (pathname.match(/^\/api\/transactions\/\d+$/)) return true;
    
    return false;
  });
  
  const isApiRoute = pathname.startsWith('/api/');

  // If the path is public, allow access
  if (isPublicPath || isPublicApiPath) {
    return NextResponse.next();
  }

  // For Electron requests to API routes, allow access during development
  if (isElectronRequest && isApiRoute) {
    return NextResponse.next();
  }

  // For Electron requests, check the auth token in the header
  if (isElectronRequest) {
    const authTokenHeader = request.headers.get('x-auth-token');

    // If there's no auth token, redirect to login
    if (!authTokenHeader) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }

    try {
      // Parse the token
      const token = JSON.parse(authTokenHeader);

      // Check if token is expired
      if (token && token.expires && new Date(token.expires).getTime() > Date.now()) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  // For web requests, check NextAuth token
  const token = await getToken({ req: request });

  // If there's no token and the path is not public, handle accordingly
  if (!token) {
    // For API routes, return a 401 Unauthorized response instead of redirecting
    if (isApiRoute) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // For non-API routes, redirect to login
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
  }

  // Allow authenticated users to access protected routes
  return NextResponse.next();
}

// Configure middleware to match all request paths except for static files, images, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 