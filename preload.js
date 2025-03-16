// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Expose secure APIs to renderer
try {
  // Directly expose isElectronApp to window object
  if (typeof window !== 'undefined') {
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
        try {
          const value = await ipcRenderer.invoke('get-auth-token');
          return value;
        } catch (error) {
          return null;
        }
      },
      set: async (key, value) => {
        try {
          const result = await ipcRenderer.invoke('set-auth-token', value);
          return result;
        } catch (error) {
          return false;
        }
      },
      delete: async (key) => {
        try {
          const result = await ipcRenderer.invoke('delete-auth-token');
          return result;
        } catch (error) {
          return false;
        }
      }
    },
    getVersion: () => {
      return process.versions.electron;
    }
  });
} catch (error) {
  // Silent fail
} 