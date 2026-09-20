const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'build', 'sw.js');
const buildId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const source = fs.readFileSync(file, 'utf8');

if (!source.includes('__BUILD_ID__')) {
  throw new Error('sw.js has no __BUILD_ID__ placeholder');
}

fs.writeFileSync(file, source.replace('__BUILD_ID__', buildId));
console.log(`Stamped service worker with build ${buildId}`);
