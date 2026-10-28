'use strict';

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const APP_ICON = path.join(__dirname, 'build', 'icon.png');

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Opens only https URLs in the system browser. */
function safeOpenExternal(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol === 'https:') {
      shell.openExternal(u.href);
      return true;
    }
  } catch { /* invalid URL */ }
  return false;
}

// ─── IPC Handlers ───────────────────────────────────────────────────────────────

function registerIpcHandlers() {

  ipcMain.handle('lab:getTutorials', async () => {
    try {
      return JSON.parse(await fs.promises.readFile(path.join(__dirname, 'tutorials.json'), 'utf8'));
    } catch (e) {
      console.error('Failed to read tutorials.json', e);
      return {};
    }
  });

  // ── Standalone Lab Windows ──────────────────────────────────────────────────
  const LAB_WINDOWS = {
    'lab:openBurpLab':               ['burp-lab.html',                'Burp Suite Lab — CyberCompanion'],
    'lab:openPriceTamperingLab':     ['price-tampering-lab.html',     'Price Tampering Lab — CyberCompanion'],
    'lab:openCookieManipulationLab': ['cookie-manipulation-lab.html', 'Cookie Manipulation Lab — CyberCompanion'],
    'lab:openHeaderManipulationLab': ['header-manipulation-lab.html', 'Header Manipulation Lab — CyberCompanion'],
    'lab:openSQLiLab':               ['sqli-lab.html',                'SQL Injection Lab — CyberCompanion']
  };
  Object.entries(LAB_WINDOWS).forEach(([channel, [file, title]]) => {
    ipcMain.handle(channel, () => openLabWindow(file, title));
  });
}

const openLabWindows = new Map(); // file -> BrowserWindow (one window per lab)

function openLabWindow(file, title) {
  const existing = openLabWindows.get(file);
  if (existing && !existing.isDestroyed()) {
    if (existing.isMinimized()) existing.restore();
    existing.focus();
    return true;
  }
  const win = new BrowserWindow({
    width: 1380, height: 860, minWidth: 1100, minHeight: 700,
    backgroundColor: '#080c14', title,
    icon: fs.existsSync(APP_ICON) ? APP_ICON : undefined,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, file));
  openLabWindows.set(file, win);
  win.on('closed', () => openLabWindows.delete(file));
  return true;
}

// ─── Window Creation ────────────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0a0e17',
    title: 'CyberCompanion',
    icon: fs.existsSync(APP_ICON) ? APP_ICON : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

// ─── Global navigation / popup policy ───────────────────────────────────────────

app.on('web-contents-created', (_event, contents) => {
  // Popups never open new Electron windows; safe links go to the system browser.
  contents.setWindowOpenHandler(({ url }) => {
    safeOpenExternal(url);
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, url) => {
    // App windows only ever show local app files.
    if (!url.startsWith('file://')) {
      event.preventDefault();
      safeOpenExternal(url);
    }
  });
});

// ─── App Lifecycle ──────────────────────────────────────────────────────────────

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    registerIpcHandlers();
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
