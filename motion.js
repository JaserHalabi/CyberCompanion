// CyberCompanion motion helpers: typed prompt lines, staggered reveal, flash, boot.
// Pairs with motion.css. Browser: window.CCMotion. Node: module.exports (tests).
(function () {
  'use strict';

  const PROMPT_MS = 300;
  const BOOT_MS = 1100;
  const FLASH_MS = 600;
  const noop = () => {};

  function reduced() {
    if (typeof matchMedia !== 'function') return false;
    try { return !!matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  function typeSchedule(text, cps) {
    const step = 1000 / cps;
    return Array.from(text || '', (_, i) => i * step);
  }

  function staggerDelays(count, stepMs, maxMs) {
    return Array.from({ length: Math.max(0, count) }, (_, i) => Math.min(i * stepMs, maxMs));
  }

  // Types text into el.textContent with one live timer at a time.
  // cancel() is idempotent and leaves the full text in place.
  function typeLine(el, text, opts) {
    text = String(text == null ? '' : text);
    if (!el) return { cancel: noop, done: Promise.resolve() };
    if (reduced() || !text) {
      el.textContent = text;
      return { cancel: noop, done: Promise.resolve() };
    }
    const cps = (opts && opts.cps) || 40;
    const chars = Array.from(text);
    const times = typeSchedule(text, cps);
    let timer = null;
    let finished = false;
    let resolve;
    const done = new Promise((r) => { resolve = r; });
    const finish = () => {
      if (finished) return;
      finished = true;
      if (timer !== null) clearTimeout(timer);
      timer = null;
      el.textContent = text;
      resolve();
    };
    const start = Date.now();
    let i = 0;
    const tick = () => {
      timer = null;
      if (finished) return;
      i++;
      el.textContent = chars.slice(0, i).join('');
      if (i >= chars.length) return finish();
      timer = setTimeout(tick, Math.max(0, times[i] - (Date.now() - start)));
    };
    timer = setTimeout(tick, 0);
    return { cancel: finish, done };
  }

  // Only one openModule run is live at a time.
  let current = null;

  function cancelAll() {
    const run = current;
    current = null;
    if (!run) return;
    run.typing.cancel();
    if (run.cursor) run.cursor.remove();
    run.prompt.remove();
  }

  function openModule(contentEl, promptText) {
    cancelAll();
    if (!contentEl) return;
    const doc = contentEl.ownerDocument || (typeof document !== 'undefined' ? document : null);
    if (!doc) return;

    const kids = Array.from(contentEl.children || []);
    staggerDelays(kids.length, 60, 240).forEach((ms, i) => {
      if (kids[i].style) kids[i].style.setProperty('--i', ms + 'ms');
    });

    const prompt = doc.createElement('div');
    prompt.className = 'cc-prompt'; // "$ " comes from .cc-prompt::before
    prompt.setAttribute('dir', 'ltr');
    const textEl = doc.createElement('span');
    textEl.className = 'cc-text';
    prompt.appendChild(textEl);
    contentEl.prepend(prompt);

    const text = String(promptText == null ? '' : promptText);
    const cps = Math.min(120, Math.max(15, text.length / (PROMPT_MS / 1000)));
    let cursor = null;
    if (!reduced()) {
      cursor = doc.createElement('span');
      cursor.className = 'cc-cursor';
      prompt.appendChild(cursor);
    }
    const typing = typeLine(textEl, text, { cps });
    const run = { prompt, typing, cursor };
    current = run;
    typing.done.then(() => {
      if (cursor) cursor.remove();
      if (current === run) current = null;
    });
  }

  function flash(el, kind) {
    if (!el || !el.classList || reduced()) return;
    el.classList.remove('cc-flash');
    void el.offsetWidth; // restart the animation
    if (kind && el.setAttribute) el.setAttribute('data-flash', kind);
    el.classList.add('cc-flash');
    clearTimeout(el._ccFlash);
    el._ccFlash = setTimeout(() => el.classList.remove('cc-flash'), FLASH_MS);
  }

  function boot(splashEl, lines) {
    lines = Array.isArray(lines) ? lines : [];
    if (!splashEl || !lines.length) return Promise.resolve();
    let box = splashEl.querySelector('.splash-lines');
    if (!box) {
      box = splashEl.ownerDocument.createElement('div');
      box.className = 'splash-lines';
      splashEl.appendChild(box);
    }
    const total = lines.reduce((n, l) => n + String(l).length, 0) || 1;
    const cps = total / (BOOT_MS / 1000);
    let chain = Promise.resolve();
    lines.forEach((line) => {
      chain = chain.then(() => {
        const row = box.ownerDocument.createElement('div');
        box.appendChild(row);
        return typeLine(row, line, { cps }).done;
      });
    });
    return chain;
  }

  const CCMotion = { reduced, typeSchedule, staggerDelays, typeLine, openModule, flash, boot, cancelAll };

  if (typeof window !== 'undefined') window.CCMotion = CCMotion;
  if (typeof module !== 'undefined' && module.exports) module.exports = CCMotion;
})();
