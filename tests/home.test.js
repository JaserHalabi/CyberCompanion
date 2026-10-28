'use strict';

const test = require('node:test');
const assert = require('node:assert');
const CCHome = require('../home.js');

const MODS = [
  { id: 'burp-proxy', num: '01', short: 'burp', title: 'Burp Suite Proxy Interception', subtitle: 'Proxy basics.' },
  { id: 'sqli', num: '02', short: 'sqli', title: 'SQL Injection', subtitle: 'Break queries.' },
  { id: 'xss', num: '06', title: 'Cross-Site Scripting', subtitle: '' }
];

function memStorage(init) {
  const data = Object.assign({}, init);
  return {
    data,
    getItem(k) { return Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null; },
    setItem(k, v) { data[k] = String(v); }
  };
}
const throwing = {
  getItem() { throw new Error('denied'); },
  setItem() { throw new Error('denied'); }
};

test('the storage key is cybercompanion_last_module', () => {
  assert.strictEqual(CCHome.LAST_KEY, 'cybercompanion_last_module');
});

test('homeRows maps every module in order, keeping index, num, short, title and summary', () => {
  const rows = CCHome.homeRows(MODS);
  assert.strictEqual(rows.length, 3);
  assert.deepStrictEqual(rows[0], {
    index: 0, id: 'burp-proxy', num: '01', short: 'burp',
    title: 'Burp Suite Proxy Interception', summary: 'Proxy basics.'
  });
  assert.strictEqual(rows[1].index, 1);
  assert.strictEqual(rows[1].short, 'sqli');
});

test('homeRows falls back to the id when a module has no short label', () => {
  assert.strictEqual(CCHome.homeRows(MODS)[2].short, 'xss');
});

test('homeRows tolerates a missing or non-array input', () => {
  assert.deepStrictEqual(CCHome.homeRows(undefined), []);
  assert.deepStrictEqual(CCHome.homeRows(null), []);
});

test('pickContinue returns the stored module and its index', () => {
  const pick = CCHome.pickContinue(MODS, 'sqli');
  assert.strictEqual(pick.index, 1);
  assert.strictEqual(pick.module.id, 'sqli');
});

test('pickContinue ignores unknown, empty and non-string ids', () => {
  assert.strictEqual(CCHome.pickContinue(MODS, 'nope'), null);
  assert.strictEqual(CCHome.pickContinue(MODS, ''), null);
  assert.strictEqual(CCHome.pickContinue(MODS, null), null);
  assert.strictEqual(CCHome.pickContinue(MODS, 42), null);
  assert.strictEqual(CCHome.pickContinue(undefined, 'sqli'), null);
});

test('readLast / writeLast round-trip through storage', () => {
  const s = memStorage();
  assert.strictEqual(CCHome.readLast(s), null);
  CCHome.writeLast(s, 'xss');
  assert.strictEqual(s.data.cybercompanion_last_module, 'xss');
  assert.strictEqual(CCHome.readLast(s), 'xss');
});

test('readLast / writeLast never throw when storage throws or is missing', () => {
  assert.strictEqual(CCHome.readLast(throwing), null);
  assert.doesNotThrow(() => CCHome.writeLast(throwing, 'sqli'));
  assert.strictEqual(CCHome.readLast(undefined), null);
  assert.doesNotThrow(() => CCHome.writeLast(undefined, 'sqli'));
});

test('rowDelays stay inside the 380ms reveal budget', () => {
  const d = CCHome.rowDelays(8, 200);
  assert.strictEqual(d.length, 8);
  assert.strictEqual(d[0], 0);
  assert.ok(d.every((ms, i) => i === 0 || ms > d[i - 1]), 'increasing');
  assert.ok(d[7] + 200 <= 380, 'last row finishes within 380ms');
  assert.ok(CCHome.rowDelays(40, 200).every((ms) => ms + 200 <= 380), 'capped for long lists');
});
