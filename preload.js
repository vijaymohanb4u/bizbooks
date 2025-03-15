// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

console.log('[PRELOAD] Script starting...');

// Expose secure APIs to renderer
try {
  // Directly expose isElectronApp to window object
  if (typeof window !== 'undefined') {
    console.log('[PRELOAD] Directly setting window.isElectronApp');
    window.isElectronApp = true;
  }

  // Expose isElectronApp globally
  contextBridge.exposeInMainWorld('isElectronApp', true);
  
  // Expose electron object with store methods
  contextBridge.exposeInMainWorld('electron', {
    isElectron: true,
    isElectronApp: true,
    store: {
      get: async (key) => {
        console.log(`[PRELOAD] Getting key from store via IPC: ${key}`);
        try {
          const value = await ipcRenderer.invoke('get-auth-token');
          console.log(`[PRELOAD] Retrieved value via IPC: ${value ? 'exists' : 'not found'}`);
          return value;
        } catch (error) {
          console.error(`[PRELOAD] Error getting key via IPC: ${key}:`, error);
          return null;
        }
      },
      set: async (key, value) => {
        console.log(`[PRELOAD] Setting key in store via IPC: ${key}`);
        try {
          const result = await ipcRenderer.invoke('set-auth-token', value);
          console.log(`[PRELOAD] Set value via IPC result: ${result}`);
          return result;
        } catch (error) {
          console.error(`[PRELOAD] Error setting key via IPC: ${key}:`, error);
          return false;
        }
      },
      delete: async (key) => {
        console.log(`[PRELOAD] Deleting key from store via IPC: ${key}`);
        try {
          const result = await ipcRenderer.invoke('delete-auth-token');
          console.log(`[PRELOAD] Delete key via IPC result: ${result}`);
          return result;
        } catch (error) {
          console.error(`[PRELOAD] Error deleting key via IPC: ${key}:`, error);
          return false;
        }
      }
    },
    getVersion: () => {
      console.log('[PRELOAD] Getting Electron version');
      return process.versions.electron;
    }
  });
  console.log('[PRELOAD] Successfully exposed electron API to renderer');
} catch (error) {
  console.error('[PRELOAD] Failed to expose electron API:', error);
}

console.log('[PRELOAD] Script loaded successfully'); 