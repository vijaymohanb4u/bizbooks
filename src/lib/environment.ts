/**
 * Utility functions to detect the runtime environment
 */

// Create a global function to check the environment
if (typeof window !== 'undefined') {
  (window as any).checkElectronEnvironment = function() {
    console.log('[ENV_GLOBAL] Checking Electron environment');
    console.log('[ENV_GLOBAL] window.isElectronApp =', (window as any).isElectronApp);
    console.log('[ENV_GLOBAL] window.electron =', (window as any).electron);
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
  
  console.log(`[ENV] isElectron check result: ${result}`);
  console.log(`[ENV] hasElectronObject: ${hasElectronObject}`);
  console.log(`[ENV] hasIsElectronAppFlag: ${hasIsElectronAppFlag}`);
  console.log(`[ENV] hasElectronInUserAgent: ${hasElectronInUserAgent}`);
  console.log(`[ENV] navigator.userAgent: ${navigator.userAgent}`);
  
  // Force the result to true if we're in Electron (for debugging)
  if (hasElectronInUserAgent) {
    console.log('[ENV] Forcing isElectron to true based on userAgent');
    return true;
  }
  
  return result;
};

/**
 * Checks if the application is running in a web browser (not Electron)
 * @returns boolean indicating if running in a web browser
 */
export const isBrowser = (): boolean => {
  const result = typeof window !== 'undefined' && !isElectron();
  console.log(`[ENV] isBrowser check: ${result}`);
  return result;
}; 