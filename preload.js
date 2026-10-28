'use strict';

const { contextBridge, ipcRenderer } = require('electron');

/**
 * CyberCompanion — Secure Preload Bridge
 *
 * Exposes a minimal, typed API to the renderer process.
 * No raw Node.js modules (fs, child_process, etc.) are leaked.
 */
/** Registers a listener and returns an unsubscribe function (prevents duplicate listeners). */
function subscribe(channel, callback) {
  if (typeof callback !== 'function') return () => {};
  const handler = (_event, data) => callback(data);
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

contextBridge.exposeInMainWorld('labAPI', {
  /** Fetch tutorials from main process to bypass cache */
  getTutorials:  () => ipcRenderer.invoke('lab:getTutorials'),

  /** Boot Juice Shop + DVWA containers. */
  bootLab:       () => ipcRenderer.invoke('lab:boot'),

  /** Stop and remove all lab containers. */
  stopLab:       () => ipcRenderer.invoke('lab:stop'),

  /** Query running status of each container. */
  getStatus:     () => ipcRenderer.invoke('lab:status'),

  /** Check if Docker is installed. Returns { installed, version, platform, error }. */
  checkDocker:   () => ipcRenderer.invoke('lab:checkDocker'),

  /** Clear the embedded lab browser storage (Factory Reset). */
  clearLabSession: () => ipcRenderer.invoke('lab:clearLabSession'),

  /** Open a URL in the system default browser (https or the local lab only). */
  openUrl:       (url) => ipcRenderer.invoke('lab:openUrl', url),

  /** Open the Docker Desktop download page for the current platform. */
  downloadDocker:() => ipcRenderer.invoke('lab:downloadDocker'),

  // ── Overlay System ──────────────────────────────────────────────────────────
  /** Listen for Juice Shop API hits detected at the network level (main process). */
  onJuiceshopApiHit: (callback) => subscribe('juiceshop:api-hit', callback),

  // ── Proxy Simulator ─────────────────────────────────────────────────────────
  forwardProxyRequest: (body) => ipcRenderer.send('proxy:forward', body),
  dropProxyRequest: () => ipcRenderer.send('proxy:drop'),
  toggleProxy: (isOn) => ipcRenderer.invoke('proxy:toggle', isOn),
  onProxyIntercepted: (callback) => subscribe('proxy:intercepted', callback),

  /** Open the standalone Burp Suite Lab window */
  openBurpLab: () => ipcRenderer.invoke('lab:openBurpLab'),

  /** Open the Price Tampering Lab window */
  openPriceTamperingLab: () => ipcRenderer.invoke('lab:openPriceTamperingLab'),

  /** Open the Cookie Manipulation Lab window */
  openCookieManipulationLab: () => ipcRenderer.invoke('lab:openCookieManipulationLab'),

  /** Open the Header Manipulation Lab window */
  openHeaderManipulationLab: () => ipcRenderer.invoke('lab:openHeaderManipulationLab'),

  /** Open the SQL Injection Lab window */
  openSQLiLab: () => ipcRenderer.invoke('lab:openSQLiLab')
});
