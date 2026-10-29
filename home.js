// CyberCompanion home helpers: module rows, the "continue" pick, last-module storage.
// Pure data only; renderer.js owns the DOM. Browser: window.CCHome. Node: module.exports (tests).
(function () {
  'use strict';

  const LAST_KEY = 'cybercompanion_last_module';
  const STEP_MS = 24;
  const BUDGET_MS = 380;

  function homeRows(modules) {
    if (!Array.isArray(modules)) return [];
    return modules.map((m, index) => ({
      index,
      id: m.id,
      track: m.track,
      num: m.num,
      short: m.short || m.id,
      title: m.title,
      summary: m.subtitle || ''
    }));
  }

  // Rows split by track, each keeping its array order (and its array index).
  function trackGroups(modules) {
    const groups = { red: [], blue: [] };
    homeRows(modules).forEach((r) => { if (groups[r.track]) groups[r.track].push(r); });
    return groups;
  }

  // Defences grouped by source module: red path first, then blue, each by num. Modules with no defence items and the defenses page itself are skipped.
  function buildDefenseSections(modules) {
    if (!Array.isArray(modules)) return [];
    const out = [];
    ['red', 'blue'].forEach((track) => {
      modules.slice().sort((a, b) => String(a && a.num).localeCompare(String(b && b.num), 'en', { numeric: true })).forEach((m) => {
        if (!m || m.track !== track || m.id === 'defenses') return;
        if (!Array.isArray(m.defense) || m.defense.length === 0) return;
        out.push({ id: m.id, title: m.title, items: m.defense });
      });
    });
    return out;
  }

  // The module to offer under "continue", or null when the stored id is unknown.
  function pickContinue(modules, storedId) {
    if (!Array.isArray(modules) || typeof storedId !== 'string' || !storedId) return null;
    const index = modules.findIndex((m) => m && m.id === storedId);
    return index < 0 ? null : { index, module: modules[index] };
  }

  function readLast(storage) {
    try { return storage ? storage.getItem(LAST_KEY) : null; } catch (e) { return null; }
  }

  function writeLast(storage, id) {
    try { if (storage) storage.setItem(LAST_KEY, id); } catch (e) { /* storage unavailable: skip */ }
  }

  // Per-row reveal delays; the last row still finishes inside BUDGET_MS.
  function rowDelays(count, durMs) {
    const max = Math.max(0, BUDGET_MS - durMs);
    return Array.from({ length: Math.max(0, count) }, (_, i) => Math.min(i * STEP_MS, max));
  }

  const CCHome = { LAST_KEY, homeRows, trackGroups, buildDefenseSections, pickContinue, readLast, writeLast, rowDelays };

  if (typeof window !== 'undefined') window.CCHome = CCHome;
  if (typeof module !== 'undefined' && module.exports) module.exports = CCHome;
})();
