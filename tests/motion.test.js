'use strict';

const test = require('node:test');
const assert = require('node:assert');
const CCMotion = require('../motion.js');

// Minimal DOM stub: just enough surface for CCMotion.
function fakeEl(tag) {
  const el = {
    tag,
    children: [],
    parent: null,
    textContent: '',
    attrs: {},
    vars: {},
    classes: new Set(),
    style: { setProperty(k, v) { el.vars[k] = v; } },
    classList: {
      add(c) { el.classes.add(c); },
      remove(c) { el.classes.delete(c); },
      contains(c) { return el.classes.has(c); }
    },
    setAttribute(k, v) { el.attrs[k] = v; if (k === 'class') el.classes = new Set(v.split(' ')); },
    removeAttribute(k) { delete el.attrs[k]; },
    appendChild(c) { c.parent = el; el.children.push(c); return c; },
    prepend(c) { c.parent = el; el.children.unshift(c); },
    remove() { if (el.parent) el.parent.children = el.parent.children.filter((c) => c !== el); el.parent = null; },
    get firstChild() { return el.children[0] || null; },
    querySelector(sel) {
      const cls = sel.slice(1);
      return el.children.find((c) => c.classes.has(cls)) || null;
    }
  };
  Object.defineProperty(el, 'className', {
    get() { return [...el.classes].join(' '); },
    set(v) { el.classes = new Set(v.split(' ').filter(Boolean)); }
  });
  el.ownerDocument = { createElement: fakeEl };
  return el;
}

function withMatchMedia(matches, fn) {
  const prev = globalThis.matchMedia;
  globalThis.matchMedia = () => ({ matches });
  try { return fn(); } finally {
    if (prev === undefined) delete globalThis.matchMedia; else globalThis.matchMedia = prev;
  }
}

test('typeSchedule spaces characters evenly', () => {
  assert.deepStrictEqual(CCMotion.typeSchedule('abc', 100), [0, 10, 20]);
});

test('typeSchedule returns [] for empty text', () => {
  assert.deepStrictEqual(CCMotion.typeSchedule('', 30), []);
});

test('staggerDelays caps at maxMs', () => {
  const d = CCMotion.staggerDelays(10, 60, 240);
  assert.strictEqual(d.length, 10);
  assert.strictEqual(d[0], 0);
  assert.strictEqual(d[9], 240);
  assert.strictEqual(d[3], 180);
});

test('reduced() is false when matchMedia is undefined', () => {
  assert.strictEqual(typeof globalThis.matchMedia, 'undefined');
  assert.strictEqual(CCMotion.reduced(), false);
});

test('reduced() reflects matchMedia', () => {
  assert.strictEqual(withMatchMedia(true, () => CCMotion.reduced()), true);
  assert.strictEqual(withMatchMedia(false, () => CCMotion.reduced()), false);
});

test('DOM functions no-op safely on null', async () => {
  const h = CCMotion.typeLine(null, 'x');
  h.cancel();
  await h.done;
  CCMotion.openModule(null, 'x');
  CCMotion.flash(null);
  await CCMotion.boot(null, ['a']);
});

test('typeLine under reduced motion writes full text, resolves, cancel is idempotent', async () => {
  await withMatchMedia(true, async () => {
    const el = { textContent: '' };
    const h = CCMotion.typeLine(el, 'hello');
    assert.strictEqual(el.textContent, 'hello');
    await h.done;
    h.cancel();
    h.cancel();
    assert.strictEqual(el.textContent, 'hello');
  });
});

test('typeLine cancel mid-type leaves full text', async () => {
  const el = { textContent: '' };
  const h = CCMotion.typeLine(el, 'hello world', { cps: 5 });
  h.cancel();
  h.cancel();
  await h.done;
  assert.strictEqual(el.textContent, 'hello world');
});

test('openModule x6 leaves one prompt and no live timers from earlier runs', () => {
  const live = new Set();
  const realSet = globalThis.setTimeout;
  const realClear = globalThis.clearTimeout;
  globalThis.setTimeout = (fn, ms) => { const t = realSet(() => { live.delete(t); fn(); }, ms); live.add(t); return t; };
  globalThis.clearTimeout = (t) => { live.delete(t); realClear(t); };
  try {
    const content = fakeEl('div');
    content.appendChild(fakeEl('section'));
    content.appendChild(fakeEl('section'));
    for (let i = 0; i < 6; i++) CCMotion.openModule(content, 'open m' + i);
    const prompts = content.children.filter((c) => c.classes.has('cc-prompt'));
    assert.strictEqual(prompts.length, 1);
    assert.strictEqual(prompts[0].attrs.dir, 'ltr');
    assert.strictEqual(content.children[0], prompts[0]);
    assert.strictEqual(live.size, 1, 'only the latest run owns a timer');
    CCMotion.openModule(null, 'x'); // must not cancel-crash
    // section stagger variable set on non-prompt children
    assert.ok('--i' in content.children[1].vars);
  } finally {
    CCMotion.cancelAll();
    assert.strictEqual(live.size, 0);
    globalThis.setTimeout = realSet;
    globalThis.clearTimeout = realClear;
  }
});

test('openModule under reduced motion shows final text and no cursor', () => {
  withMatchMedia(true, () => {
    const content = fakeEl('div');
    CCMotion.openModule(content, 'open sqli');
    const p = content.children[0];
    assert.strictEqual(p.querySelector('.cc-text').textContent, 'open sqli');
    assert.strictEqual(p.querySelector('.cc-cursor'), null);
  });
});

const prompts = (el) => el.children.filter((c) => c.classes.has('cc-prompt'));

test('openModule after a completed run leaves exactly one (new) prompt', async () => {
  const content = fakeEl('div');
  CCMotion.openModule(content, 'one');
  await new Promise((r) => setTimeout(r, 450));
  const first = prompts(content)[0];
  CCMotion.openModule(content, 'two');
  assert.strictEqual(prompts(content).length, 1);
  assert.notStrictEqual(prompts(content)[0], first);
  CCMotion.cancelAll();
});

test('openModule under reduced motion does not stack prompts', async () => {
  const prev = globalThis.matchMedia;
  globalThis.matchMedia = () => ({ matches: true });
  try {
    const content = fakeEl('div');
    CCMotion.openModule(content, 'one');
    await new Promise((r) => setTimeout(r, 5));
    CCMotion.openModule(content, 'two');
    assert.strictEqual(prompts(content).length, 1);
    assert.strictEqual(prompts(content)[0].querySelector('.cc-text').textContent, 'two');
  } finally {
    if (prev === undefined) delete globalThis.matchMedia; else globalThis.matchMedia = prev;
  }
});

test('openModule preserves other children and only staggers non-prompt ones', async () => {
  const content = fakeEl('div');
  const a = content.appendChild(fakeEl('section'));
  const b = content.appendChild(fakeEl('section'));
  CCMotion.openModule(content, 'one');
  await Promise.resolve();
  CCMotion.openModule(content, 'two');
  assert.deepStrictEqual(content.children.slice(1), [a, b]);
  assert.strictEqual(prompts(content)[0].vars['--i'], undefined);
  assert.ok('--i' in a.vars && '--i' in b.vars);
  CCMotion.cancelAll();
});

test('flash clears stale data-flash', () => {
  const el = fakeEl('div');
  el.offsetWidth = 0;
  CCMotion.flash(el, 'warn');
  assert.strictEqual(el.attrs['data-flash'], 'warn');
  CCMotion.flash(el);
  assert.strictEqual(el.attrs['data-flash'], undefined);
  clearTimeout(el._ccFlash);
});

test('boot marks only the final row with is-last', async () => {
  // Reduced motion so every row fills instantly. Restored only after boot resolves.
  const prev = globalThis.matchMedia;
  globalThis.matchMedia = () => ({ matches: true });
  try {
    const splash = fakeEl('div');
    await CCMotion.boot(splash, ['> one', '> two', '> three', '> ready']);
    const box = splash.querySelector('.splash-lines');
    assert.strictEqual(box.children.length, 4);
    const marked = box.children.filter((r) => r.classes.has('is-last'));
    assert.strictEqual(marked.length, 1);
    assert.strictEqual(marked[0], box.children[3]);
    assert.strictEqual(marked[0].textContent, '> ready');
  } finally {
    if (prev === undefined) delete globalThis.matchMedia; else globalThis.matchMedia = prev;
  }
});
