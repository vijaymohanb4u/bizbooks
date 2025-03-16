'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { isElectron } from '@/lib/environment';
import Link from 'next/link';
import { ArrowLeftIcon, HomeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Check if it's a NextAuth client fetch error
      const isNextAuthError = this.state.error?.message?.includes('next-auth') || 
                             this.state.error?.message?.includes('CLIENT_FETCH_ERROR');
      
      // If it's a NextAuth error in Electron, we can safely ignore it
      if (isNextAuthError && isElectron()) {
        // Just render the children and ignore the error
        return this.props.children;
      }

      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">BizBooks</h1>
              <div className="w-16 h-1 bg-blue-500 mx-auto"></div>
            </div>
            
            <div className="flex justify-center mb-4">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Something Went Wrong</h2>
            <p className="text-gray-600 mb-2">
              We're sorry, but there was an error loading this page.
            </p>
            <p className="text-xs text-gray-500 mb-8">
              {this.state.error?.message || 'Unknown error'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Go Back</span>
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span>Try Again</span>
              </button>
              
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <HomeIcon className="w-5 h-5" />
                <span>Go to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 