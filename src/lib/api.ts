/**
 * API service for direct authentication in Electron
 */

import { electronAuth, AuthToken } from './electronAuth';
import { isElectron } from './environment';

// Define the login credentials interface
interface LoginCredentials {
  email: string;
  password: string;
}

// Define the API response interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Handles direct API authentication for Electron
 */
export const api = {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthToken>> {
    console.log('[API] Login attempt with email:', credentials.email);
    
    // Force Electron mode for debugging if needed
    const forceElectronMode = true; // Set to false in production
    const inElectron = isElectron() || forceElectronMode;
    
    console.log(`[API] Is Electron environment: ${inElectron} (forced: ${forceElectronMode})`);
    
    if (!inElectron) {
      console.log('[API] Not in Electron environment, login should use NextAuth instead');
      return {
        success: false,
        error: 'Not in Electron environment',
      };
    }
    
    try {
      console.log('[API] Sending login request to /api/auth/electron-login');
      const response = await fetch('/api/auth/electron-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-electron-app': 'true',
        },
        body: JSON.stringify(credentials),
        // Ensure credentials are included
        credentials: 'include',
      });

      console.log(`[API] Login response status: ${response.status}`);
      const data = await response.json();
      console.log('[API] Login response data:', data);

      if (!response.ok) {
        console.error('[API] Login failed:', data.error);
        return {
          success: false,
          error: data.error || 'Authentication failed',
        };
      }

      // Create token with expiration (24 hours)
      const token: AuthToken = {
        ...data.user,
        expires: Date.now() + 24 * 60 * 60 * 1000,
      };

      console.log('[API] Login successful, storing token');
      // Store the token
      await electronAuth.setToken(token);
      
      // Double-check that token was stored
      const storedToken = await electronAuth.getToken();
      console.log(`[API] Token stored successfully: ${!!storedToken}`);

      return {
        success: true,
        data: token,
      };
    } catch (error) {
      console.error('[API] Login error:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  },

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    console.log('[API] Logging out user');
    await electronAuth.clearToken();
  },

  /**
   * Get the current authentication token
   */
  async getAuthToken(): Promise<AuthToken | null> {
    console.log('[API] Getting auth token');
    return await electronAuth.getToken();
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    console.log('[API] Checking if authenticated');
    const result = await electronAuth.getToken() !== null;
    console.log(`[API] Is authenticated: ${result}`);
    return result;
  },
}; 