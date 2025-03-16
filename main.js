const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const ElectronStore = require('electron-store');

// Initialize the secure store
try {
  ElectronStore.initRenderer();
} catch (error) {
  // Silent fail
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
  
  globalStore = new ElectronStore(storeConfig);
  
  // Test store functionality
  globalStore.set('test-key', 'test-value');
  const testValue = globalStore.get('test-key');
  globalStore.delete('test-key');
} catch (error) {
  // Create a fallback in-memory store
  globalStore = {
    _data: new Map(),
    get: (key) => {
      return globalStore._data.get(key);
    },
    set: (key, value) => {
      globalStore._data.set(key, value);
      return true;
    },
    delete: (key) => {
      return globalStore._data.delete(key);
    }
  };
}

// Register IPC handlers for auth token management
ipcMain.handle('get-auth-token', async () => {
  try {
    if (!globalStore) {
      return null;
    }
    const token = globalStore.get('authToken');
    return token;
  } catch (error) {
    return null;
  }
});

ipcMain.handle('set-auth-token', async (event, token) => {
  try {
    if (!globalStore) {
      return false;
    }
    globalStore.set('authToken', token);
    return true;
  } catch (error) {
    return false;
  }
});

ipcMain.handle('delete-auth-token', async () => {
  try {
    if (!globalStore) {
      return false;
    }
    globalStore.delete('authToken');
    return true;
  } catch (error) {
    return false;
  }
});

function createWindow() {
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
     
  // Set custom headers for all requests
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    { urls: ['*://*/*'] }, // Match all URLs
    (details, callback) => {
      const { requestHeaders } = details;
      
      // Add Electron-specific header to identify requests from Electron
      requestHeaders['x-electron-app'] = 'true';
      
      // Get auth token from store if available
      try {
        if (globalStore) {
          const authToken = globalStore.get('authToken');
          
          if (authToken) {
            requestHeaders['x-auth-token'] = JSON.stringify(authToken);
          }
        }
      } catch (error) {
        // Silent fail
      }
      
      callback({ requestHeaders });
    }
  );
    
  mainWindow.loadURL(startUrl);

  // Open the DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  
  // Log when page has finished loading
  mainWindow.webContents.on('did-finish-load', () => {
    // Inject a script to set a global variable
    mainWindow.webContents.executeJavaScript(`
      window.isElectronApp = true;
      
      // Create a visible indicator that we're in Electron
      if (!document.getElementById('electron-indicator')) {
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
      }
      
      // Force a check of the environment
      if (typeof window.checkElectronEnvironment === 'function') {
        window.checkElectronEnvironment();
      } else {
        window.checkElectronEnvironment = function() {
          return true;
        };
      }
    `).catch(err => {
      // Silent fail
    });
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 