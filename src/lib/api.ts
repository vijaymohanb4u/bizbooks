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
    // Force Electron mode for debugging if needed
    const forceElectronMode = false; // Set to false in production
    const inElectron = isElectron() || forceElectronMode;
    
    if (!inElectron) {
      return {
        success: false,
        error: 'Not in Electron environment',
      };
    }
    
    try {
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

      const data = await response.json();

      if (!response.ok) {
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

      // Store the token
      await electronAuth.setToken(token);
      
      // Double-check that token was stored
      const storedToken = await electronAuth.getToken();

      return {
        success: true,
        data: token,
      };
    } catch (error) {
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
    await electronAuth.clearToken();
  },

  /**
   * Get the current authentication token
   */
  async getAuthToken(): Promise<AuthToken | null> {
    return await electronAuth.getToken();
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const result = await electronAuth.getToken() !== null;
    return result;
  },
}; 