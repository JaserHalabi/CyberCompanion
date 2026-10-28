/**
 * CyberCompanion — Webview Preload (Tracking Engine)
 *
 * Injected into the Juice Shop <webview> guest page.
 * Intercepts socket.io events and fetch responses, forwarding
 * challenge-related data to the host renderer via IPC.
 *
 * Channels sent to host:
 *   'challenge:solved'  — real-time, from socket.io "challenge solved" event
 *   'challenges:sync'   — bulk, from GET /api/Challenges response
 *   'page:changed'      — navigation, from URL/hash changes
 *   'juiceshop:ready'   — fired once when the page finishes initial load
 */

const { ipcRenderer } = require('electron');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. WebSocket Interception — socket.io "challenge solved" events
// ═══════════════════════════════════════════════════════════════════════════════

const OriginalWebSocket = window.WebSocket;

window.WebSocket = function (...args) {
  const ws = new OriginalWebSocket(...args);

  ws.addEventListener('message', (event) => {
    try {
      const raw = event.data;
      if (typeof raw !== 'string') return;

      // socket.io v4 wire format:
      //   Optional length prefix: "215:"
      //   Message type: "42" = EVENT
      //   Payload: ["event name", {data}]
      //
      // Example: 215:42["challenge solved",{"key":"scoreBoardChallenge","name":"Score Board",...}]

      // Strip optional length prefix (e.g., "215:")
      const stripped = raw.replace(/^\d+:/, '');

      // Only interested in socket.io EVENT messages (type "42")
      if (!stripped.startsWith('42')) return;

      const jsonPart = stripped.substring(2);
      const parsed = JSON.parse(jsonPart);

      if (!Array.isArray(parsed) || parsed.length < 2) return;

      const [eventName, payload] = parsed;

      // Juice Shop emits "challenge solved" (with space)
      if (eventName === 'challenge solved' && payload) {
        ipcRenderer.sendToHost('challenge:solved', {
          key: payload.key || null,
          name: payload.name || null,
          challenge: payload.challenge || null,
          flag: payload.flag || null,
          hidden: payload.hidden || false
        });
      }
    } catch (e) {
      // Silently ignore non-JSON or malformed frames
    }
  });

  return ws;
};

// Preserve prototype chain so instanceof checks still work
window.WebSocket.prototype = OriginalWebSocket.prototype;
window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
window.WebSocket.OPEN = OriginalWebSocket.OPEN;
window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;


// ═══════════════════════════════════════════════════════════════════════════════
// 2. Fetch Interception — /api/Challenges bulk sync
// ═══════════════════════════════════════════════════════════════════════════════

const originalFetch = window.fetch;

window.fetch = async function (...args) {
  const response = await originalFetch.apply(this, args);

  try {
    // Determine the request URL
    const url = typeof args[0] === 'string'
      ? args[0]
      : (args[0] && args[0].url) || '';

    // Intercept /api/Challenges responses to bulk-sync solved state
    if (url.includes('/api/Challenges')) {
      const clone = response.clone();
      clone.json().then((data) => {
        if (data && data.data && Array.isArray(data.data)) {
          ipcRenderer.sendToHost('challenges:sync', {
            challenges: data.data.map((ch) => ({
              id: ch.id,
              key: ch.key,
              name: ch.name,
              category: ch.category,
              difficulty: ch.difficulty,
              description: ch.description,
              solved: ch.solved,
              hint: ch.hint,
              hintUrl: ch.hintUrl
            }))
          });
        }
      }).catch(() => {});
    }
  } catch (e) {
    // Never break the original fetch flow
  }

  return response;
};


// ═══════════════════════════════════════════════════════════════════════════════
// 3. XMLHttpRequest Interception — fallback for older Juice Shop versions
// ═══════════════════════════════════════════════════════════════════════════════

const OriginalXHR = window.XMLHttpRequest;
const origOpen = OriginalXHR.prototype.open;
const origSend = OriginalXHR.prototype.send;

OriginalXHR.prototype.open = function (method, url, ...rest) {
  this._cyberURL = url;
  return origOpen.call(this, method, url, ...rest);
};

OriginalXHR.prototype.send = function (...args) {
  this.addEventListener('load', function () {
    try {
      if (this._cyberURL && this._cyberURL.includes('/api/Challenges')) {
        const data = JSON.parse(this.responseText);
        if (data && data.data && Array.isArray(data.data)) {
          ipcRenderer.sendToHost('challenges:sync', {
            challenges: data.data.map((ch) => ({
              id: ch.id,
              key: ch.key,
              name: ch.name,
              category: ch.category,
              difficulty: ch.difficulty,
              description: ch.description,
              solved: ch.solved,
              hint: ch.hint,
              hintUrl: ch.hintUrl
            }))
          });
        }
      }
    } catch (e) {}
  });
  return origSend.apply(this, args);
};


// ═══════════════════════════════════════════════════════════════════════════════
// 4. Page Navigation Detection
// ═══════════════════════════════════════════════════════════════════════════════

let lastHash = '';

function checkNavigation() {
  const currentHash = window.location.hash;
  if (currentHash !== lastHash) {
    lastHash = currentHash;
    ipcRenderer.sendToHost('page:changed', {
      url: window.location.href,
      hash: currentHash
    });
  }
}

// Poll for hash changes (Angular apps use hash routing)
setInterval(checkNavigation, 500);

// Also listen for popstate
window.addEventListener('popstate', checkNavigation);
window.addEventListener('hashchange', checkNavigation);


// ═══════════════════════════════════════════════════════════════════════════════
// 5. Ready Signal
// ═══════════════════════════════════════════════════════════════════════════════

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.sendToHost('juiceshop:ready', {
    url: window.location.href,
    title: document.title
  });
});

// Backup: if DOMContentLoaded already fired
if (document.readyState !== 'loading') {
  setTimeout(() => {
    ipcRenderer.sendToHost('juiceshop:ready', {
      url: window.location.href,
      title: document.title
    });
  }, 100);
}


// ═══════════════════════════════════════════════════════════════════════════════
// 6. CyberMart Proxy Bridge
// ═══════════════════════════════════════════════════════════════════════════════
// When the embedded page fires a 'proxy-request' CustomEvent, forward it to the
// host renderer via IPC so the Mini Burp panel can show it.
// When the host sends back 'cybermart:proxy-response', dispatch it into the
// page so the pending promise resolves and the action continues.

window.addEventListener('proxy-request', (e) => {
  try {
    ipcRenderer.sendToHost('cybermart:proxy-request', e.detail);
  } catch (err) {}
});

ipcRenderer.on('cybermart:proxy-response', (_event, detail) => {
  try {
    window.dispatchEvent(new CustomEvent('proxy-response', { detail }));
  } catch (err) {}
});


// ═══════════════════════════════════════════════════════════════════════════════
// 7. Tutorial Engine — INJECTED AT RUNTIME
// ═══════════════════════════════════════════════════════════════════════════════
// The interactive tutorial engine is injected directly into the page's main
// world via webview.executeJavaScript() from renderer.js. This is necessary
// because this preload script runs in an isolated context and cannot share
// its window object with code injected via executeJavaScript.
