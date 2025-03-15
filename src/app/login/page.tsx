'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, FormEvent, Suspense, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { isElectron } from '@/lib/environment';
import { api } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const searchError = searchParams.get('error');
  const registered = searchParams.get('registered');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isElectronApp, setIsElectronApp] = useState(false);
  
  // Check environment on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[LOGIN] Component mounted, checking authentication');
      const electronEnv = isElectron();
      console.log(`[LOGIN] Running in Electron: ${electronEnv}`);
      setIsElectronApp(electronEnv);
      
      // Force Electron mode for debugging if needed
      const forceElectronMode = true; // Set to false in production
      if (forceElectronMode && !electronEnv) {
        console.log('[LOGIN] Forcing Electron mode for debugging');
        setIsElectronApp(true);
      }
      
      console.log(`[LOGIN] Callback URL: ${callbackUrl}`);
      
      // Check if already authenticated in Electron
      if (electronEnv || forceElectronMode) {
        console.log('[LOGIN] Checking if authenticated in Electron');
        try {
          const isAuth = await api.isAuthenticated();
          console.log(`[LOGIN] Is authenticated in Electron: ${isAuth}`);
          
          if (isAuth) {
            console.log(`[LOGIN] Already authenticated, redirecting to ${callbackUrl}`);
            router.push(callbackUrl);
          }
        } catch (error) {
          console.error('[LOGIN] Error checking authentication:', error);
        }
      }
    };
    
    checkAuth();
  }, [callbackUrl, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear any previous errors

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log(`[LOGIN] Login attempt for email: ${email}`);
    console.log(`[LOGIN] Is Electron environment: ${isElectronApp}`);

    try {
      // Use different authentication methods based on environment
      if (isElectronApp) {
        console.log('[LOGIN] Using Electron authentication');
        // Use direct API authentication for Electron
        const result = await api.login({ email, password });
        
        console.log(`[LOGIN] Electron auth result: ${result.success ? 'success' : 'failed'}`);
        
        if (result.success) {
          console.log(`[LOGIN] Electron auth successful, redirecting to ${callbackUrl}`);
          // Force a delay to ensure token is stored before redirect
          setTimeout(() => {
            router.push(callbackUrl);
          }, 1000);
        } else {
          console.error(`[LOGIN] Electron auth failed: ${result.error}`);
          setError(result.error || 'Authentication failed');
        }
      } else {
        console.log('[LOGIN] Using NextAuth authentication');
        // Use NextAuth for web browser
        const result = await signIn('credentials', {
          email,
          password,
          callbackUrl,
          redirect: false, // Don't redirect automatically
        });
        
        console.log('[LOGIN] NextAuth result:', result);
        
        if (result?.error) {
          setError(result.error === 'CredentialsSignin' 
            ? 'Invalid email or password' 
            : 'An error occurred during sign in');
        } else if (result?.url) {
          router.push(result.url);
        }
      }
    } catch (err) {
      console.error('[LOGIN] Authentication error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white bg-grid-pattern">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">BizBooks</Link>
          <Link 
            href="/signup" 
            className="text-primary-600 hover:text-primary-700 transition-colors"
          >
            Don't have an account? Sign up
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
              <p className="text-gray-600">Sign in to your account to continue</p>
              {isElectronApp && (
                <p className="text-blue-600 mt-2">Running in Electron mode</p>
              )}
            </div>

            {registered && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">
                  Account created successfully! Please log in with your credentials.
                </p>
              </div>
            )}

            {(error || searchError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">
                  {error || (searchError === 'CredentialsSignin' 
                    ? 'Invalid email or password' 
                    : 'An error occurred during sign in')}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder:text-gray-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-900 placeholder:text-gray-500"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  console.log('[LOGIN_PAGE] Rendering login page');
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
} 