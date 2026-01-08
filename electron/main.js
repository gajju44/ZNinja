const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const koffi = require('koffi');

// --- Stealth Mode Implementation ---
let SetWindowDisplayAffinity;

try {
  const user32 = koffi.load('user32.dll');
  // SetWindowDisplayAffinity(HWND hWnd, DWORD dwAffinity)
  SetWindowDisplayAffinity = user32.func('SetWindowDisplayAffinity', 'bool', ['void *', 'uint32']);
} catch (e) {
  console.error('Failed to load user32.dll or bind SetWindowDisplayAffinity:', e);
}

const WDA_NONE = 0x00000000;
const WDA_EXCLUDEFROMCAPTURE = 0x00000011; // Helper window only
// Note: 0x00000011 is WDA_EXCLUDEFROMCAPTURE (Windows 10 Version 2004+)

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false, // Frameless for custom UI
    transparent: true, // Transparent background
    alwaysOnTop: true, // Keep it visible to user
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load Vite dev server or build
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // --- IPC Handlers ---
  
  ipcMain.handle('toggle-stealth', (event, shouldEnable) => {
    if (!SetWindowDisplayAffinity) {
        console.warn('Stealth mode not supported on this platform/configuration.');
        return false;
    }

    try {
        const hwnd = win.getNativeWindowHandle(); // Returns Buffer
        // koffi expects the pointer/buffer for 'void *'
        const affinity = shouldEnable ? WDA_EXCLUDEFROMCAPTURE : WDA_NONE;
        const result = SetWindowDisplayAffinity(hwnd, affinity);
        console.log(`Stealth mode ${shouldEnable ? 'ENABLED' : 'DISABLED'}: ${result}`);
        return result;
    } catch (error) {
        console.error('Error toggling stealth mode:', error);
        return false;
    }
  });

  ipcMain.on('close-app', () => {
    app.quit();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
