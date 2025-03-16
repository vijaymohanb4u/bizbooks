'use client';

import { isElectron } from './environment';
import { api } from './api';

/**
 * Custom API client that handles authentication in both Electron and web environments
 */
export const apiClient = {
  /**
   * Make an authenticated API request
   */
  async fetch<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add Electron-specific headers if in Electron environment
      if (isElectron()) {
        headers['x-electron-app'] = 'true';
        
        // Add auth token if available
        const token = await api.getAuthToken();
        if (token) {
          headers['x-auth-token'] = JSON.stringify(token);
        }
      }

      // Make the request
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for web auth
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      // Parse and return the response
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a GET request
   */
  async get<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    return await this.fetch(url, { ...options, method: 'GET' }) as T;
  },

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, data: any, options: RequestInit = {}): Promise<T> {
    return await this.fetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }) as T;
  },

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, data: any, options: RequestInit = {}): Promise<T> {
    return await this.fetch(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }) as T;
  },

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    return await this.fetch(url, { ...options, method: 'DELETE' }) as T;
  },
}; 