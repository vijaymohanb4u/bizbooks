const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const ElectronStore = require('electron-store');

console.log('[MAIN] Starting Electron application...');

// Initialize the secure store
try {
  ElectronStore.initRenderer();
  console.log('[MAIN] Electron store initialized for renderer');
} catch (error) {
  console.error('[MAIN] Failed to initialize electron-store for renderer:', error);
}

// Create a global store instance
let globalStore = null;
try {
  // Configure the store
  const storeConfig = {
    name: 'bizbooks-auth',
    encryptionKey: 'your-encryption-key',
    clearInvalidConfig: true
  };
  
  console.log('[MAIN] Creating global electron store with config:', storeConfig);
  globalStore = new ElectronStore(storeConfig);
  
  // Test store functionality
  globalStore.set('test-key', 'test-value');
  const testValue = globalStore.get('test-key');
  console.log(`[MAIN] Test store value: ${testValue}`);
  globalStore.delete('test-key');
  
  console.log('[MAIN] Global electron store created successfully');
} catch (error) {
  console.error('[MAIN] Failed to create global electron store:', error);
  // Create a fallback in-memory store
  console.log('[MAIN] Creating in-memory fallback store');
  globalStore = {
    _data: new Map(),
    get: (key) => {
      console.log(`[MAIN] Getting from fallback store: ${key}`);
      return globalStore._data.get(key);
    },
    set: (key, value) => {
      console.log(`[MAIN] Setting in fallback store: ${key}`);
      globalStore._data.set(key, value);
      return true;
    },
    delete: (key) => {
      console.log(`[MAIN] Deleting from fallback store: ${key}`);
      return globalStore._data.delete(key);
    }
  };
}

// Register IPC handlers for auth token management
ipcMain.handle('get-auth-token', async () => {
  console.log('[MAIN] IPC: Handling get-auth-token request');
  try {
    if (!globalStore) {
      console.log('[MAIN] IPC: Global store not available for get-auth-token');
      return null;
    }
    const token = globalStore.get('authToken');
    console.log(`[MAIN] IPC: Retrieved auth token: ${token ? 'exists' : 'not found'}`);
    return token;
  } catch (error) {
    console.error('[MAIN] IPC: Error getting auth token:', error);
    return null;
  }
});

ipcMain.handle('set-auth-token', async (event, token) => {
  console.log('[MAIN] IPC: Handling set-auth-token request');
  try {
    if (!globalStore) {
      console.log('[MAIN] IPC: Global store not available for set-auth-token');
      return false;
    }
    globalStore.set('authToken', token);
    console.log('[MAIN] IPC: Auth token set successfully');
    return true;
  } catch (error) {
    console.error('[MAIN] IPC: Error setting auth token:', error);
    return false;
  }
});

ipcMain.handle('delete-auth-token', async () => {
  console.log('[MAIN] IPC: Handling delete-auth-token request');
  try {
    if (!globalStore) {
      console.log('[MAIN] IPC: Global store not available for delete-auth-token');
      return false;
    }
    globalStore.delete('authToken');
    console.log('[MAIN] IPC: Auth token deleted successfully');
    return true;
  } catch (error) {
    console.error('[MAIN] IPC: Error deleting auth token:', error);
    return false;
  }
});

function createWindow() {
  console.log('[MAIN] Creating browser window...');
  
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the Next.js app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, './out/index.html')}`;
    
  console.log(`[MAIN] Loading URL: ${startUrl}`);
     
  // Set custom headers for all requests
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    { urls: ['*://*/*'] }, // Match all URLs
    (details, callback) => {
      console.log(`[MAIN] Request to: ${details.url}`);
      const { requestHeaders } = details;
      
      // Add Electron-specific header to identify requests from Electron
      requestHeaders['x-electron-app'] = 'true';
      console.log('[MAIN] Added x-electron-app header');
      
      // Get auth token from store if available
      try {
        if (globalStore) {
          const authToken = globalStore.get('authToken');
          
          if (authToken) {
            console.log('[MAIN] Adding auth token to request headers');
            requestHeaders['x-auth-token'] = JSON.stringify(authToken);
          } else {
            console.log('[MAIN] No auth token found in store');
          }
        } else {
          console.log('[MAIN] Global store not available');
        }
      } catch (error) {
        console.error('[MAIN] Error accessing auth token:', error);
      }
      
      callback({ requestHeaders });
    }
  );
    
  mainWindow.loadURL(startUrl);

  // Open the DevTools in development mode
  if (isDev) {
    console.log('[MAIN] Opening DevTools in development mode');
    mainWindow.webContents.openDevTools();
  }
  
  // Log when page has finished loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[MAIN] Page loaded successfully');
    
    // Inject a script to set a global variable
    mainWindow.webContents.executeJavaScript(`
      console.log('[MAIN_INJECT] Setting global isElectronApp variable');
      window.isElectronApp = true;
      
      // Create a visible indicator that we're in Electron
      if (!document.getElementById('electron-indicator')) {
        console.log('[MAIN_INJECT] Creating electron indicator');
        const electronIndicator = document.createElement('div');
        electronIndicator.id = 'electron-indicator';
        electronIndicator.style.position = 'fixed';
        electronIndicator.style.bottom = '10px';
        electronIndicator.style.right = '10px';
        electronIndicator.style.backgroundColor = 'rgba(0, 128, 255, 0.7)';
        electronIndicator.style.color = 'white';
        electronIndicator.style.padding = '5px 10px';
        electronIndicator.style.borderRadius = '4px';
        electronIndicator.style.fontSize = '12px';
        electronIndicator.style.zIndex = '9999';
        electronIndicator.textContent = 'Electron App';
        document.body.appendChild(electronIndicator);
      } else {
        console.log('[MAIN_INJECT] Electron indicator already exists');
      }
      
      // Force a check of the environment
      if (typeof window.checkElectronEnvironment === 'function') {
        console.log('[MAIN_INJECT] Calling checkElectronEnvironment()');
        window.checkElectronEnvironment();
      } else {
        console.log('[MAIN_INJECT] checkElectronEnvironment function not found, will create it');
        window.checkElectronEnvironment = function() {
          console.log('[MAIN_INJECT] Created checkElectronEnvironment function');
          console.log('[MAIN_INJECT] window.isElectronApp =', window.isElectronApp);
          console.log('[MAIN_INJECT] window.electron =', window.electron);
          return true;
        };
      }
    `).catch(err => {
      console.error('[MAIN] Error injecting script:', err);
    });
  });
  
  // Log any load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error(`[MAIN] Page load failed: ${errorDescription} (${errorCode})`);
  });
}

app.whenReady().then(() => {
  console.log('[MAIN] Electron app is ready');
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('[MAIN] All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('[MAIN] App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 