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
  '/api/auth/csrf',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[MIDDLEWARE] Processing request for: ${pathname}`);

  // Check if the request is from Electron
  const isElectronRequest = request.headers.get('x-electron-app') === 'true';
  console.log(`[MIDDLEWARE] Request from Electron: ${isElectronRequest}`);

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const isPublicApiPath = publicApiPaths.some(path => pathname.startsWith(path));
  console.log(`[MIDDLEWARE] Path ${pathname} is public: ${isPublicPath || isPublicApiPath}`);

  // If the path is public, allow access
  if (isPublicPath || isPublicApiPath) {
    console.log(`[MIDDLEWARE] Request allowed to proceed (public path)`);
    return NextResponse.next();
  }

  // For Electron requests, check the auth token in the header
  if (isElectronRequest) {
    const authTokenHeader = request.headers.get('x-auth-token');
    console.log(`[MIDDLEWARE] Electron auth token exists: ${!!authTokenHeader}`);

    // If there's no auth token, redirect to login
    if (!authTokenHeader) {
      console.log(`[MIDDLEWARE] No auth token found, redirecting to login from: ${pathname}`);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }

    try {
      // Parse the token
      const token = JSON.parse(authTokenHeader);
      console.log(`[MIDDLEWARE] Parsed Electron auth token: ${!!token}`);

      // Check if token is expired
      if (token && token.expires && new Date(token.expires).getTime() > Date.now()) {
        console.log(`[MIDDLEWARE] Electron auth token is valid`);
        return NextResponse.next();
      } else {
        console.log(`[MIDDLEWARE] Electron auth token is expired`);
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
      }
    } catch (error) {
      console.error(`[MIDDLEWARE] Error parsing Electron auth token:`, error);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
    }
  }

  // For web requests, check NextAuth token
  console.log(`[MIDDLEWARE] Checking NextAuth token`);
  const token = await getToken({ req: request });
  console.log(`[MIDDLEWARE] NextAuth token exists: ${!!token}`);

  // If there's no token and the path is not public, redirect to login
  if (!token) {
    console.log(`[MIDDLEWARE] Redirecting unauthenticated user to login from: ${pathname}`);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, request.url));
  }

  // Allow authenticated users to access protected routes
  console.log(`[MIDDLEWARE] Authenticated user allowed to proceed`);
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