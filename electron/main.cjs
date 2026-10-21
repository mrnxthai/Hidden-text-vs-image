const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 860,
    minHeight: 640,
    title: 'StegoVault - Ẩn & Trích Xuất Thông Điệp Trong Ảnh',
    icon: path.join(__dirname, '../public/icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    backgroundColor: '#f8fafc',
    show: false,
  });

  // Check if running in development mode
  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL(devUrl);
  } else {
    // Production: load static built HTML
    const indexPath = path.join(__dirname, '../dist/index.html');
    mainWindow.loadFile(indexPath).catch(() => {
      // Fallback
      mainWindow.loadURL(devUrl);
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external link clicks
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Application Lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS apps generally remain active until user quits explicitly (Cmd + Q)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
