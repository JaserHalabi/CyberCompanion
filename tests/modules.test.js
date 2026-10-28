const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const H = require('../home.js');

// Pull the MODULES literal out of renderer.js (it needs a DOM to load whole).
function loadModules() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'renderer.js'), 'utf8');
  const start = src.indexOf('const MODULES = [');
  const m = /\r?\n\];/.exec(src.slice(start));
  assert.ok(start >= 0 && m, 'MODULES literal found');
  const literal = src.slice(start + 'const MODULES = '.length, start + m.index + m[0].length - 1);
  return JSON.parse(JSON.stringify(vm.runInNewContext('(' + literal + ')')));
}

const MODULES = loadModules();
const ORDER = ['nmap', 'sqli', 'xss', 'sqlmap', 'burp-proxy', 'hydra', 'soc-simulator', 'net-analyst', 'defenses'];

test('MODULES has exactly the nine expected ids in the learning order', () => {
  assert.deepEqual(MODULES.map((m) => m.id), ORDER);
});

test('every module has a red/blue track and num is unique within a track', () => {
  MODULES.forEach((m) => assert.ok(m.track === 'red' || m.track === 'blue', m.id + ' track'));
  for (const track of ['red', 'blue']) {
    const nums = MODULES.filter((m) => m.track === track).map((m) => m.num);
    assert.equal(new Set(nums).size, nums.length, track + ' nums unique');
  }
});

test('tracks and nums match the binding table', () => {
  const got = MODULES.map((m) => `${m.track}-${m.num}-${m.short}`);
  assert.deepEqual(got, [
    'red-01-nmap', 'red-02-sqli', 'red-03-xss', 'red-04-sqlmap', 'red-05-burp', 'red-06-hydra',
    'blue-B1-soc', 'blue-B2-net', 'blue-B3-defend'
  ]);
});

test('trackGroups splits by track, in array order, keeping array indexes', () => {
  const g = H.trackGroups(MODULES);
  assert.deepEqual(g.red.map((r) => r.id), ORDER.slice(0, 6));
  assert.deepEqual(g.blue.map((r) => r.id), ORDER.slice(6));
  assert.deepEqual(g.blue.map((r) => r.index), [6, 7, 8]);
});

test('trackGroups ignores unknown tracks and bad input', () => {
  assert.deepEqual(H.trackGroups([{ id: 'x', track: 'green' }]), { red: [], blue: [] });
  assert.deepEqual(H.trackGroups(null), { red: [], blue: [] });
});
