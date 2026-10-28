const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const rendererSrc = fs.readFileSync(path.join(root, 'renderer.js'), 'utf8');

// classifySqliAttempt is DOM-free, so it can be extracted and run in isolation
// the same way tests/tutorials.test.js extracts the terminal-simulator handlers.
function extractFn(name) {
  const start = rendererSrc.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name + ' found');
  const ends = [rendererSrc.indexOf('\nfunction ', start + 1), rendererSrc.indexOf('\n/* ', start + 1)]
    .filter((x) => x > 0);
  return rendererSrc.slice(start, Math.min(...ends));
}

function classify(email, pass) {
  const ctx = {};
  vm.runInNewContext(extractFn('classifySqliAttempt') + '\nthis.__result = classifySqliAttempt(' + JSON.stringify(email) + ', ' + JSON.stringify(pass) + ');', ctx);
  return ctx.__result;
}

test('classifySqliAttempt: existing tautology bypass is unchanged', () => {
  const r = classify("' OR 1=1--", 'anything');
  assert.equal(r.state, 'danger');
  assert.match(r.html, /Authentication Bypassed/);
});

test('classifySqliAttempt: existing targeted-account comment bypass is unchanged', () => {
  const r = classify("admin@site.com'--", 'anything');
  assert.equal(r.state, 'danger');
  assert.match(r.html, /Authentication Bypassed/);
});

test('classifySqliAttempt: existing UNION SELECT behaviour is unchanged', () => {
  const r = classify("' UNION SELECT username, password FROM users--", 'x');
  assert.equal(r.state, 'warning');
  assert.match(r.html, /UNION-based Injection Detected/);
});

test('classifySqliAttempt: existing valid login is unchanged', () => {
  const r = classify('normal@user.com', 'correctpassword');
  assert.equal(r.state, 'success');
  assert.match(r.html, /Login Successful/);
});

test('classifySqliAttempt: existing plain failed login is unchanged', () => {
  const r = classify('nobody@user.com', 'wrong');
  assert.equal(r.state, null);
  assert.match(r.html, /401 Unauthorized/);
});

test('classifySqliAttempt: a bare single quote reports a SQL syntax error, not a silent 401', () => {
  const r = classify("'", 'anything');
  assert.equal(r.state, 'warning');
  assert.match(r.html, /error in your SQL syntax/);
});

test('classifySqliAttempt: ORDER BY within the real column count reports no SQL error', () => {
  const r = classify("' ORDER BY 1--", 'anything');
  assert.equal(r.state, null);
  assert.doesNotMatch(r.html, /Unknown column/);
  assert.doesNotMatch(r.html, /Authentication Bypassed/);
});

test('classifySqliAttempt: ORDER BY past the real column count reports Unknown column, not a bypass', () => {
  const r = classify("' ORDER BY 3--", 'anything');
  assert.equal(r.state, 'warning');
  assert.match(r.html, /Unknown column/);
  assert.doesNotMatch(r.html, /Authentication Bypassed/);
});
