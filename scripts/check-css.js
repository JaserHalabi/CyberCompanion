'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const files = ['styles.css', 'overlay.css'];

// Replace comment characters with spaces, keeping newlines so line numbers stay accurate.
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
}

const violations = [];

for (const file of files) {
  const full = path.join(root, file);
  const lines = stripComments(fs.readFileSync(full, 'utf8')).split('\n');
  const isStyles = file === 'styles.css';

  let depth = 0;
  let reducedDepth = -1; // brace depth at which a reduced-motion block was opened

  lines.forEach((line, i) => {
    const n = i + 1;
    if (/transition\s*:\s*all\b/i.test(line)) {
      violations.push({ rule: 'a', msg: `${file}:${n}: transition: all is not allowed` });
    }
    if (/@keyframes\b/i.test(line)) {
      violations.push({ rule: 'b', msg: `${file}:${n}: @keyframes is not allowed` });
    }

    if (reducedDepth < 0 && /@media[^{]*prefers-reduced-motion/i.test(line)) {
      reducedDepth = depth;
    }
    if (isStyles && reducedDepth < 0 && /!\s*important/i.test(line)) {
      violations.push({ rule: 'c', msg: `${file}:${n}: !important outside prefers-reduced-motion` });
    }

    for (const ch of line) {
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (reducedDepth >= 0 && depth <= reducedDepth) reducedDepth = -1;
      }
    }
  });
}

for (const v of violations) console.log(v.msg);
const counts = { a: 0, b: 0, c: 0 };
violations.forEach((v) => counts[v.rule]++);
console.log(`\n${violations.length} violation(s): transition-all=${counts.a}, keyframes=${counts.b}, important=${counts.c}`);
process.exit(violations.length ? 1 : 0);
