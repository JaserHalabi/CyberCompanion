'use strict';

const { contextBridge, ipcRenderer } = require('electron');

/**
 * CyberCompanion — Secure Preload Bridge
 *
 * Exposes a minimal, typed API to the renderer process.
 * No raw Node.js modules (fs, child_process, etc.) are leaked.
 */
contextBridge.exposeInMainWorld('labAPI', {
  /** Fetch tutorials from main process to bypass cache */
  getTutorials:  () => ipcRenderer.invoke('lab:getTutorials'),

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
