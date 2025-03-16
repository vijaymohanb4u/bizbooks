'use client';

import { SessionProvider } from 'next-auth/react';
import { useState, useEffect, ReactNode } from 'react';
import { isElectron } from '@/lib/environment';

interface CustomSessionProviderProps {
  children: ReactNode;
}

export default function CustomSessionProvider({ children }: CustomSessionProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    setMounted(true);
    
    // Add a global error handler for NextAuth fetch errors
    const originalError = console.error;
    console.error = (...args) => {
      // Check if this is a NextAuth client fetch error
      const errorString = args.join(' ');
      if (
        errorString.includes('next-auth') || 
        errorString.includes('CLIENT_FETCH_ERROR')
      ) {
        // In Electron, we can safely ignore these errors
        if (isElectron()) {
          return;
        }
        
        // For web, we'll still log it but handle it gracefully
        setError(new Error(errorString));
      }
      
      // Call the original console.error for other errors
      originalError.apply(console, args);
    };
    
    // Cleanup
    return () => {
      console.error = originalError;
    };
  }, []);

  // In Electron environment, we might want to skip NextAuth session provider
  // to avoid unnecessary fetch errors
  if (isElectron() && mounted) {
    // For Electron, we can use a simplified provider setup
    return <>{children}</>;
  }

  // If we've encountered a NextAuth error but we're not in Electron,
  // we can still render the children but log the error
  if (error && !isElectron()) {
    // Error is handled silently
  }

  // For web environment, use the standard NextAuth SessionProvider
  return (
    <SessionProvider 
      refetchInterval={0} // Disable automatic refetching to reduce errors
      refetchOnWindowFocus={false} // Disable refetch on window focus
    >
      {children}
    </SessionProvider>
  );
} 