/**
 * Utility functions to detect the runtime environment
 */

// Create a global function to check the environment
if (typeof window !== 'undefined') {
  (window as any).checkElectronEnvironment = function() {
    return true;
  };
}

/**
 * Checks if the application is running in an Electron environment
 * @returns boolean indicating if running in Electron
 */
export const isElectron = (): boolean => {
  // Check if window exists (for SSR compatibility)
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Multiple ways to detect Electron
  const hasElectronObject = Boolean((window as any).electron);
  const hasIsElectronAppFlag = Boolean((window as any).isElectronApp);
  const hasElectronInUserAgent = navigator.userAgent.toLowerCase().includes('electron');
  
  const result = hasElectronObject || hasIsElectronAppFlag || hasElectronInUserAgent;
  
  // Force the result to true if we're in Electron (for debugging)
  if (hasElectronInUserAgent) {
    return true;
  }
  
  return result;
};

/**
 * Checks if the application is running in a web browser (not Electron)
 * @returns boolean indicating if running in a web browser
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && !isElectron();
}; 