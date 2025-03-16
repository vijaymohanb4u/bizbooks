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
        return null;
      }
      
      const electronObj = (window as any).electron;
      if (!electronObj) {
        return null;
      }
      
      const store = electronObj.store;
      if (!store) {
        return null;
      }
      
      return store;
    } catch (error) {
      return null;
    }
  }

  /**
   * Stores authentication token
   */
  async setToken(token: AuthToken): Promise<void> {
    // Use localStorage as fallback if electron store is not available
    const store = this.getStore();
    
    if (store) {
      try {
        await store.set('authToken', token);
      } catch (error) {
        // Fallback to localStorage
        try {
          localStorage.setItem('authToken', JSON.stringify(token));
        } catch (localError) {
          // Silent fail
        }
      }
    } else {
      // Fallback to localStorage
      try {
        localStorage.setItem('authToken', JSON.stringify(token));
      } catch (error) {
        // Silent fail
      }
    }
  }

  /**
   * Retrieves the stored authentication token
   */
  async getToken(): Promise<AuthToken | null> {
    let token: AuthToken | null = null;
    const store = this.getStore();
    
    // Try to get token from electron store
    if (store) {
      try {
        token = await store.get('authToken') as AuthToken | undefined || null;
      } catch (error) {
        // Silent fail
      }
    }
    
    // If no token in electron store, try localStorage
    if (!token) {
      try {
        const localToken = localStorage.getItem('authToken');
        if (localToken) {
          token = JSON.parse(localToken) as AuthToken;
        }
      } catch (error) {
        // Silent fail
      }
    }
    
    // Check if token exists and is not expired
    if (token && token.expires > Date.now()) {
      return token;
    }
    
    // Token is expired or doesn't exist
    await this.clearToken();
    return null;
  }

  /**
   * Clears the stored authentication token
   */
  async clearToken(): Promise<void> {
    const store = this.getStore();
    
    // Clear from electron store
    if (store) {
      try {
        await store.delete('authToken');
      } catch (error) {
        // Silent fail
      }
    }
    
    // Also clear from localStorage
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      // Silent fail
    }
  }

  /**
   * Checks if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }
}

// Export a singleton instance
export const electronAuth = new ElectronAuthManager(); 