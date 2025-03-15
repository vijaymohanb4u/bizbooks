import { isElectron } from './environment';

// Define the auth token interface
export interface AuthToken {
  id: string;
  email: string;
  name: string;
  role: string;
  expires: number; // Timestamp when the token expires
}

/**
 * Manages authentication in Electron environment
 */
class ElectronAuthManager {
  /**
   * Safely access the electron store
   */
  private getStore() {
    try {
      if (!isElectron()) {
        console.log('[ELECTRON_AUTH] Not in Electron environment');
        return null;
      }
      
      const electronObj = (window as any).electron;
      if (!electronObj) {
        console.log('[ELECTRON_AUTH] Electron object not found in window');
        return null;
      }
      
      const store = electronObj.store;
      if (!store) {
        console.log('[ELECTRON_AUTH] Store not found in electron object');
        return null;
      }
      
      return store;
    } catch (error) {
      console.error('[ELECTRON_AUTH] Error accessing electron store:', error);
      return null;
    }
  }

  /**
   * Stores authentication token
   */
  async setToken(token: AuthToken): Promise<void> {
    console.log('[ELECTRON_AUTH] Setting auth token');
    
    // Use localStorage as fallback if electron store is not available
    const store = this.getStore();
    
    if (store) {
      try {
        const result = await store.set('authToken', token);
        console.log(`[ELECTRON_AUTH] Token set in electron store result: ${result}`);
      } catch (error) {
        console.error('[ELECTRON_AUTH] Error setting token in electron store:', error);
        // Fallback to localStorage
        try {
          localStorage.setItem('authToken', JSON.stringify(token));
          console.log('[ELECTRON_AUTH] Token set in localStorage as fallback');
        } catch (localError) {
          console.error('[ELECTRON_AUTH] Error setting token in localStorage:', localError);
        }
      }
    } else {
      // Fallback to localStorage
      try {
        localStorage.setItem('authToken', JSON.stringify(token));
        console.log('[ELECTRON_AUTH] Token set in localStorage as fallback');
      } catch (error) {
        console.error('[ELECTRON_AUTH] Error setting token in localStorage:', error);
      }
    }
  }

  /**
   * Retrieves the stored authentication token
   */
  async getToken(): Promise<AuthToken | null> {
    console.log('[ELECTRON_AUTH] Getting auth token');
    
    let token: AuthToken | null = null;
    const store = this.getStore();
    
    // Try to get token from electron store
    if (store) {
      try {
        token = await store.get('authToken') as AuthToken | undefined || null;
        console.log(`[ELECTRON_AUTH] Retrieved token from electron store: ${token ? 'exists' : 'not found'}`);
      } catch (error) {
        console.error('[ELECTRON_AUTH] Error getting token from electron store:', error);
      }
    }
    
    // If no token in electron store, try localStorage
    if (!token) {
      try {
        const localToken = localStorage.getItem('authToken');
        if (localToken) {
          token = JSON.parse(localToken) as AuthToken;
          console.log('[ELECTRON_AUTH] Retrieved token from localStorage');
        }
      } catch (error) {
        console.error('[ELECTRON_AUTH] Error getting token from localStorage:', error);
      }
    }
    
    // Check if token exists and is not expired
    if (token && token.expires > Date.now()) {
      console.log('[ELECTRON_AUTH] Token is valid');
      return token;
    }
    
    // Token is expired or doesn't exist
    console.log('[ELECTRON_AUTH] Token is expired or not found');
    await this.clearToken();
    return null;
  }

  /**
   * Clears the stored authentication token
   */
  async clearToken(): Promise<void> {
    console.log('[ELECTRON_AUTH] Clearing auth token');
    
    const store = this.getStore();
    
    // Clear from electron store
    if (store) {
      try {
        const result = await store.delete('authToken');
        console.log(`[ELECTRON_AUTH] Token delete from electron store result: ${result}`);
      } catch (error) {
        console.error('[ELECTRON_AUTH] Error clearing token from electron store:', error);
      }
    }
    
    // Also clear from localStorage
    try {
      localStorage.removeItem('authToken');
      console.log('[ELECTRON_AUTH] Token cleared from localStorage');
    } catch (error) {
      console.error('[ELECTRON_AUTH] Error clearing token from localStorage:', error);
    }
  }

  /**
   * Checks if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    console.log('[ELECTRON_AUTH] Checking if authenticated');
    const token = await this.getToken();
    const result = token !== null;
    console.log(`[ELECTRON_AUTH] Is authenticated: ${result}`);
    return result;
  }
}

// Export a singleton instance
export const electronAuth = new ElectronAuthManager(); 