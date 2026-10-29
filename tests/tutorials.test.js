const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const rendererSrc = read('renderer.js');
const indexSrc = read('index.html');
const tutorials = JSON.parse(read('tutorials.json'));

function loadModuleIds() {
  const start = rendererSrc.indexOf('const MODULES = [');
  const m = /\r?\n\];/.exec(rendererSrc.slice(start));
  const literal = rendererSrc.slice(start + 'const MODULES = '.length, start + m.index + m[0].length - 1);
  return vm.runInNewContext('(' + literal + ')').map((x) => x.id);
}
const MODULE_IDS = loadModuleIds();

const LAB_FLAGS = ['requiresSQLiLab', 'requiresHeaderManipulation', 'requiresCookieManipulation',
  'requiresPriceTampering', 'requiresBurpLab'];

test('tutorials.json: every tutorial is structurally valid and names a real module', () => {
  for (const [key, tut] of Object.entries(tutorials)) {
    assert.equal(typeof tut.name, 'string', key + ' name');
    assert.equal(typeof tut.description, 'string', key + ' description');
    assert.ok(MODULE_IDS.includes(tut.module), key + ' module ' + tut.module);
    const flags = LAB_FLAGS.filter((f) => tut[f]);
    for (const k of Object.keys(tut)) {
      if (k.startsWith('requires')) assert.ok(LAB_FLAGS.includes(k), key + ' unknown flag ' + k);
    }
    if (flags.length) {
      assert.equal(flags.length, 1, key + ' has exactly one lab flag');
      assert.equal(tut.steps, undefined, key + ' lab launcher has no steps');
    } else {
      assert.ok(Array.isArray(tut.steps) && tut.steps.length > 0, key + ' steps');
      tut.steps.forEach((st, i) => {
        const id = key + ' step ' + i;
        assert.equal(typeof st.text, 'string', id + ' text');
        assert.equal(typeof st.selector, 'string', id + ' selector');
        assert.ok(['click', 'input', 'enter', 'next', 'none'].includes(st.action) || st.action === undefined, id + ' action ' + st.action);
        assert.ok(!st.selector.startsWith('iframe:'), id + ' no iframe selectors');
        if (st.action === 'input') assert.equal(typeof st.waitForValue, 'string', id + ' waitForValue');
      });
    }
  }
});

function hasId(hay, name) {
  return new RegExp(String.raw`id=\\?["']${name}\\?["']|\.id\s*=\s*['"]${name}['"]`).test(hay);
}
function hasClass(hay, name) {
  return new RegExp(String.raw`class=\\?["'][^"']*\b${name}\b`).test(hay);
}

test('selector helpers find real ids/classes and reject missing ones', () => {
  const hay = rendererSrc + indexSrc;
  assert.ok(hasId(hay, 'hydraSimInput'));
  assert.ok(!hasId(hay, 'noSuchIdZzz'));
  assert.ok(hasClass(hay, 'challenge-row'));
  assert.ok(!hasClass(hay, 'no-such-class-zzz'));
});

test('tutorials.json: every step selector id/class exists in index.html or renderer templates', () => {
  const hay = rendererSrc + indexSrc;
  for (const [key, tut] of Object.entries(tutorials)) {
    (tut.steps || []).forEach((st, i) => {
      if (st.selector === 'body') return;
      const tokens = st.selector.match(/[#.][A-Za-z_][\w-]*/g) || [];
      assert.ok(tokens.length, key + ' step ' + i + ' selector has a token: ' + st.selector);
      for (const tok of tokens) {
        const name = tok.slice(1);
        const found = tok[0] === '#' ? hasId(hay, name) : hasClass(hay, name);
        assert.ok(found, key + ' step ' + i + ' selector ' + tok + ' not found');
      }
    });
  }
});

test('tutorials.json: no legacy lab, target or dead-field wording', () => {
  const raw = read('tutorials.json');
  assert.ok(!/docker|dvwa|juice|cybermart|localhost:3000|:8080|challengeKey|requiresWebview|mini proxy|lab mode|\bxp\b|achievement/i.test(raw));
});

test('every lab flag maps to a labAPI launcher exposed by preload.js', () => {
  const block = /const LAB_BTN_MAP = \[([\s\S]*?)\];/.exec(rendererSrc)[1];
  const entries = [...block.matchAll(/flag:\s*'(\w+)',\s*fn:\s*'(\w+)'/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(entries.map((e) => e[0]).sort(), [...LAB_FLAGS].sort());
  const preload = read('preload.js');
  for (const [flag, fn] of entries) {
    assert.ok(preload.includes(fn + ':'), flag + ' -> ' + fn + ' exposed');
    assert.ok(rendererSrc.includes("tut." + flag), flag + ' handled by startTutorial');
  }
});

test('preload.js bridge channels equal main.js ipcMain handle channels', () => {
  const preload = read('preload.js');
  const main = read('main.js');
  const bridge = [...preload.matchAll(/ipcRenderer\.invoke\('([^']+)'/g)].map((m) => m[1]).sort();
  const handled = [...main.matchAll(/ipcMain\.handle\('([^']+)'/g)].map((m) => m[1]);
  const labBlock = /const LAB_WINDOWS = \{([\s\S]*?)\};/.exec(main)[1];
  const labKeys = [...labBlock.matchAll(/'(lab:[^']+)'\s*:/g)].map((m) => m[1]);
  assert.ok(labKeys.length >= 5, 'LAB_WINDOWS keys found');
  assert.deepEqual([...handled, ...labKeys].sort(), bridge);
});

// ── Simulator dispatch ──────────────────────────────────────────────────────
function extractFn(name) {
  const start = rendererSrc.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' found');
  const ends = [rendererSrc.indexOf('\nfunction ', start + 1), rendererSrc.indexOf('\n/* ', start + 1)]
    .filter((x) => x > 0);
  return rendererSrc.slice(start, Math.min(...ends));
}
function runSim(name, cmd) {
  const out = { innerHTML: '', scrollTop: 0, scrollHeight: 0, remove() {} };
  const ctx = {
    document: { getElementById: () => out },
    setTimeout: (fn) => fn(),
    escapeHtml: (x) => String(x),
    Date,
  };
  vm.runInNewContext(extractFn(name) + '\n' + name + '(' + JSON.stringify(cmd) + ');', ctx);
  return out.innerHTML;
}

test('hydra http host parsing handles -s before and after the target', () => {
  const form = '"/login:u=^USER^&p=^PASS^:Invalid"';
  const a = runSim('handleHydraCommand', 'hydra -l admin -P rockyou.txt shop.local http-post-form ' + form);
  assert.match(a, /host: shop\.local/);
  const b = runSim('handleHydraCommand', 'hydra -l admin -P rockyou.txt localhost -s 8000 http-post-form ' + form);
  assert.match(b, /host: localhost/);
  assert.doesNotMatch(b, /host: 8000/);
});

test('sqlmap simulator: --batch is not mistaken for -b/--banner', () => {
  const base = 'sqlmap -u "http://shop.local/item?id=1"';
  const withBatch = runSim('handleSqlmapCommand', base + ' --batch');
  assert.doesNotMatch(withBatch, /fetching banner/, '--batch must not trigger the banner branch');
  const withBannerShort = runSim('handleSqlmapCommand', base + ' -b');
  assert.match(withBannerShort, /fetching banner/, '-b must still trigger the banner branch');
  const withBannerLong = runSim('handleSqlmapCommand', base + ' --banner');
  assert.match(withBannerLong, /fetching banner/, '--banner must still trigger the banner branch');
});

test('hydra/sqlmap/nmap tutorial waitForValues are accepted by their simulators', () => {
  let checked = 0;
  for (const [key, tut] of Object.entries(tutorials)) {
    for (const st of tut.steps || []) {
      if (st.action !== 'input' || !st.waitForValue) continue;
      const cmd = st.waitForValue;
      if (tut.module === 'hydra') {
        assert.match(cmd, /^hydra/, key);
        assert.doesNotMatch(runSim('handleHydraCommand', cmd), /Command not found|No valid target service/, key + ': ' + cmd);
        checked++;
      } else if (tut.module === 'sqlmap') {
        assert.match(cmd, /^sqlmap/, key);
        assert.doesNotMatch(runSim('handleSqlmapCommand', cmd), /Command not found|No target URL/, key + ': ' + cmd);
        checked++;
      } else if (tut.module === 'nmap') {
        assert.match(cmd, /^(nmap|ping)/, key);
        checked++;
      }
    }
  }
  assert.ok(checked >= 10, 'checked ' + checked);
});
