'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { isElectron } from './environment';
import { api } from './api';

/**
 * Custom hook to handle authentication across both Electron and web environments
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if we're in Electron environment
        if (isElectron()) {
          // For Electron, use our custom auth
          const authenticated = await api.isAuthenticated();
          setIsAuthenticated(authenticated);
        } else {
          // For web, use NextAuth session
          setIsAuthenticated(status === 'authenticated');
        }
      } catch (err) {
        setError('Failed to check authentication status');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [status]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      if (isElectron()) {
        // For Electron, use direct API login
        const result = await api.login({ email, password });
        if (!result.success) {
          throw new Error(result.error || 'Login failed');
        }
        setIsAuthenticated(true);
        return true;
      } else {
        // For web, use NextAuth
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          throw new Error(result.error);
        }
        
        setIsAuthenticated(true);
        return true;
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      if (isElectron()) {
        // For Electron, use direct API logout
        await api.logout();
      } else {
        // For web, use NextAuth
        await signOut({ redirect: false });
      }
      
      setIsAuthenticated(false);
      return true;
    } catch (err) {
      setError('Logout failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    session: isElectron() ? null : session,
  };
}

/**
 * Helper function to get auth headers for API requests
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (isElectron()) {
    // For Electron, add the electron app header
    headers['x-electron-app'] = 'true';
    
    // Add auth token if available
    const token = await api.getAuthToken();
    if (token) {
      headers['x-auth-token'] = JSON.stringify(token);
    }
  }

  return headers;
}

/**
 * Helper function to handle API requests with proper auth
 */
export async function fetchWithAuth(
  url: string, 
  options: RequestInit = {}
) {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
} 