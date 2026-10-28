'use strict';

const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

// ─── Container Configuration ───────────────────────────────────────────────────
// Ports are bound to 127.0.0.1 so the intentionally vulnerable apps are never
// reachable from other machines on the network.
const CONTAINERS = {
  juiceshop: { name: 'cyber-juiceshop', image: 'bkimminich/juice-shop', port: '127.0.0.1:3000:3000', label: 'Juice Shop' },
  dvwa:      { name: 'cyber-dvwa',      image: 'vulnerables/web-dvwa',  port: '127.0.0.1:8080:80',   label: 'DVWA' }
};

const LAB_ORIGINS = new Set([
  'http://localhost:3000', 'http://127.0.0.1:3000',
  'http://localhost:8080', 'http://127.0.0.1:8080'
]);

// ─── Docker Download URLs ───────────────────────────────────────────────────────
const DOCKER_URLS = {
  win32:  'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe',
  darwin: process.arch === 'arm64'
    ? 'https://desktop.docker.com/mac/main/arm64/Docker.dmg'
    : 'https://desktop.docker.com/mac/main/amd64/Docker.dmg',
  linux:  'https://docs.docker.com/engine/install/'
};

const APP_ICON = path.join(__dirname, 'build', 'icon.png');
const WEBVIEW_PRELOAD = path.join(__dirname, 'webview-preload.js');

// ─── Helpers ────────────────────────────────────────────────────────────────────

function isLabUrl(raw) {
  try { return LAB_ORIGINS.has(new URL(raw).origin); } catch { return false; }
}

/** Opens only https URLs or the local lab targets in the system browser. */
function safeOpenExternal(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol === 'https:' || isLabUrl(u.href)) {
      shell.openExternal(u.href);
      return true;
    }
  } catch { /* invalid URL */ }
  return false;
}

function classifyDockerError(err, stderr) {
  if (err && err.code === 'ENOENT') return 'DOCKER_NOT_FOUND';
  const text = String(stderr || (err && err.message) || '').trim();
  const msg = text.toLowerCase();
  if (msg.includes('permission denied')) {
    return 'Permission denied. On Linux, add your user to the docker group:\nsudo usermod -aG docker $USER\nThen log out and back in.';
  }
  if (msg.includes('cannot connect') || msg.includes('is the docker daemon running') ||
      msg.includes('error during connect') || msg.includes('docker_engine') ||
      msg.includes('dockerdesktoplinuxengine')) {
    return 'Docker is installed but not running. Start Docker Desktop, wait until it says "running", then try again.';
  }
  if (msg.includes('port is already allocated') || msg.includes('address already in use')) {
    return 'Port 3000 or 8080 is already used by another program. Close it and try again.';
  }
  if (err && err.killed) return 'The Docker command timed out. Check your internet connection and try again.';
  return text || 'Unknown Docker error';
}

/** Runs docker with an argument array — no shell, so no quoting or injection issues. */
function docker(args, timeout = 60_000) {
  return new Promise((resolve) => {
    execFile('docker', args, { timeout, windowsHide: true, maxBuffer: 8 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) resolve({ ok: false, error: classifyDockerError(err, stderr), raw: String(stderr || '') });
      else resolve({ ok: true, data: String(stdout).trim() });
    });
  });
}

const isNoSuchContainer = (r) => !r.ok && /no such container/i.test(r.raw || r.error || '');

async function bootContainer(c) {
  await docker(['rm', '-f', c.name]); // "no such container" is fine here
  const inspect = await docker(['image', 'inspect', c.image], 30_000);
  if (!inspect.ok) {
    if (inspect.error === 'DOCKER_NOT_FOUND') return inspect;
    const pull = await docker(['pull', c.image], 30 * 60_000); // first download can be slow
    if (!pull.ok) return pull;
  }
  return docker(['run', '-d', '--name', c.name, '-p', c.port, c.image], 120_000);
}

// ─── IPC Handlers ───────────────────────────────────────────────────────────────

let labBusy = false;

function registerIpcHandlers() {

  ipcMain.handle('lab:getTutorials', async () => {
    try {
      return JSON.parse(await fs.promises.readFile(path.join(__dirname, 'tutorials.json'), 'utf8'));
    } catch (e) {
      console.error('Failed to read tutorials.json', e);
      return {};
    }
  });

  // ── Check Docker Installation ───────────────────────────────────────────────
  ipcMain.handle('lab:checkDocker', async () => {
    const r = await docker(['--version'], 15_000);
    return { installed: r.ok, version: r.ok ? r.data : null, error: r.ok ? null : r.error, platform: process.platform };
  });

  // ── Open External URL ───────────────────────────────────────────────────────
  ipcMain.handle('lab:openUrl', (_event, url) =>
    (typeof url === 'string' && safeOpenExternal(url))
      ? { ok: true }
      : { ok: false, error: 'Invalid or insecure URL.' });

  // ── Download Docker ─────────────────────────────────────────────────────────
  ipcMain.handle('lab:downloadDocker', async () => {
    const url = DOCKER_URLS[process.platform] || DOCKER_URLS.linux;
    await shell.openExternal(url);
    return { ok: true, url, platform: process.platform };
  });

  // ── Boot Lab ────────────────────────────────────────────────────────────────
  ipcMain.handle('lab:boot', async () => {
    if (labBusy) return { busy: { label: 'Lab', ok: false, error: 'A lab operation is already running. Please wait.' } };
    labBusy = true;
    try {
      const daemon = await docker(['info', '--format', '{{.ServerVersion}}'], 30_000);
      if (!daemon.ok) {
        return Object.fromEntries(Object.entries(CONTAINERS).map(([k, c]) => [k, { label: c.label, ok: false, error: daemon.error }]));
      }
      const entries = await Promise.all(Object.entries(CONTAINERS).map(async ([k, c]) => {
        const r = await bootContainer(c);
        return [k, { label: c.label, ok: r.ok, data: r.data, error: r.ok ? null : r.error }];
      }));
      return Object.fromEntries(entries);
    } finally {
      labBusy = false;
    }
  });

  // ── Stop Lab ────────────────────────────────────────────────────────────────
  ipcMain.handle('lab:stop', async () => {
    const entries = await Promise.all(Object.entries(CONTAINERS).map(async ([k, c]) => {
      const r = await docker(['rm', '-f', c.name]);
      const ok = r.ok || isNoSuchContainer(r);
      return [k, { label: c.label, ok, error: ok ? null : r.error }];
    }));
    return Object.fromEntries(entries);
  });

  // ── Status (one docker call for all containers) ─────────────────────────────
  ipcMain.handle('lab:status', async () => {
    const r = await docker(['ps', '-a', '--filter', 'name=^cyber-', '--format', '{{.Names}}\t{{.Status}}'], 20_000);
    const rows = new Map();
    if (r.ok) {
      r.data.split('\n').filter(Boolean).forEach((line) => {
        const [name, status = ''] = line.split('\t');
        rows.set(name.trim(), status.trim());
      });
    }
    return Object.fromEntries(Object.entries(CONTAINERS).map(([k, c]) => {
      if (!r.ok) return [k, { label: c.label, running: false, error: r.error }];
      const status = rows.get(c.name) || '';
      return [k, { label: c.label, running: /^up/i.test(status), status: status || 'Not running' }];
    }));
  });

  // ── Clear the embedded lab's browser storage (used by Factory Reset) ────────
  ipcMain.handle('lab:clearLabSession', async () => {
    try {
      for (const origin of LAB_ORIGINS) {
        await session.defaultSession.clearStorageData({ origin });
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
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

// ─── Mini Burp Proxy — Session-Level Interception ───────────────────────────────
let isProxyInterceptOn = true;
let proxyQueue = [];

function sendNextProxyRequest() {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow && proxyQueue.length > 0) {
    const nextReq = proxyQueue[0];
    mainWindow.webContents.send('proxy:intercepted', {
      method: nextReq.details.method,
      url: nextReq.details.url,
      body: nextReq.rawRequest
    });
  }
}

function setupProxyIpc() {
  ipcMain.on('proxy:forward', (_event, _modifiedRawRequest) => {
    if (proxyQueue.length > 0) {
      const req = proxyQueue.shift();
      req.callback({ cancel: false });
      sendNextProxyRequest();
    }
  });

  ipcMain.on('proxy:drop', (_event) => {
    if (proxyQueue.length > 0) {
      const req = proxyQueue.shift();
      req.callback({ cancel: true });
      sendNextProxyRequest();
    }
  });

  ipcMain.handle('proxy:toggle', (_event, isOn) => {
    isProxyInterceptOn = isOn;
    // If turning off intercept, release ALL pending requests
    if (!isOn) {
      while (proxyQueue.length > 0) {
        const req = proxyQueue.shift();
        req.callback({ cancel: false });
      }
    }
    return isProxyInterceptOn;
  });
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
      sandbox: true,
      webviewTag: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  // ── Webview hardening: the page cannot choose its own preload or options ──
  win.webContents.on('will-attach-webview', (event, webPreferences, params) => {
    delete webPreferences.preloadURL;
    webPreferences.preload = WEBVIEW_PRELOAD;
    webPreferences.nodeIntegration = false;
    webPreferences.nodeIntegrationInSubFrames = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = true;
    webPreferences.webSecurity = true;
    if (params.src && params.src !== 'about:blank' && !isLabUrl(params.src)) {
      event.preventDefault();
    }
  });

  // ── Intercept webview traffic using session.webRequest ────────────────────
  win.webContents.on('did-attach-webview', (_event, webContents) => {
    const session = webContents.session;

    // Use onBeforeRequest to intercept ALL requests from the webview
    session.webRequest.onBeforeRequest(
      { urls: ['http://localhost:3000/*', 'http://localhost:8080/*'] },
      (details, callback) => {
        // Only intercept when toggle is ON
        if (!isProxyInterceptOn) {
          callback({ cancel: false });
          return;
        }

        // Skip static assets — only intercept API/REST/login calls
        const url = details.url;
        const isApiCall = url.includes('/api/') || url.includes('/rest/') || url.includes('/login');

        if (!isApiCall) {
          callback({ cancel: false });
          return;
        }

        // Build a raw HTTP request string for display
        const parsedUrl = new URL(details.url);
        let rawRequest = `${details.method} ${parsedUrl.pathname}${parsedUrl.search} HTTP/1.1\r\n`;
        rawRequest += `Host: ${parsedUrl.host}\r\n`;

        // Add common headers
        if (details.referrer) {
          rawRequest += `Referer: ${details.referrer}\r\n`;
        }
        rawRequest += `Origin: ${parsedUrl.origin}\r\n`;

        // Add upload data if present
        let bodyStr = '';
        if (details.uploadData && details.uploadData.length > 0) {
          for (const chunk of details.uploadData) {
            if (chunk.bytes) {
              bodyStr += Buffer.from(chunk.bytes).toString('utf-8');
            }
          }
          rawRequest += `Content-Type: ${details.resourceType === 'xhr' ? 'application/json' : 'application/x-www-form-urlencoded'}\r\n`;
          rawRequest += `Content-Length: ${Buffer.byteLength(bodyStr)}\r\n`;
        }

        rawRequest += `\r\n${bodyStr}`;

        // Add to the queue
        const isQueueEmpty = proxyQueue.length === 0;
        proxyQueue.push({ details, callback, rawRequest });

        // If it was the first item in the queue, notify the UI immediately
        if (isQueueEmpty) {
          sendNextProxyRequest();
        }
      }
    );

    // Also monitor completed requests for the overlay system
    session.webRequest.onCompleted(
      { urls: ['http://localhost:3000/api/Challenges/*'] },
      (details) => {
        win.webContents.send('juiceshop:api-hit', {
          url: details.url,
          statusCode: details.statusCode
        });
      }
    );
  });
}

// ─── Global navigation / popup policy ───────────────────────────────────────────

app.on('web-contents-created', (_event, contents) => {
  // Popups never open new Electron windows; safe links go to the system browser.
  contents.setWindowOpenHandler(({ url }) => {
    safeOpenExternal(url);
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, url) => {
    const type = contents.getType();
    if (type === 'webview') {
      if (!isLabUrl(url) && url !== 'about:blank') {
        event.preventDefault();
        safeOpenExternal(url);
      }
      return;
    }
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
    setupProxyIpc();
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  // Release any pending proxy requests to avoid hanging callbacks
  while (proxyQueue.length > 0) {
    const req = proxyQueue.shift();
    try { req.callback({ cancel: true }); } catch (e) {}
  }
});
