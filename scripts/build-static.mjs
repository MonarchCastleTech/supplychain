#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, '_site');
const files = [
  'index.html',
  'favicon.ico',
  'favicon.svg',
  'apple-touch-icon.png',
  'site.webmanifest',
  'og-image.png',
  'logo.png',
  'CNAME',
];
const directories = ['data', 'assets', 'styles', 'js'];

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const relativePath of files) {
  const source = join(root, relativePath);
  if (existsSync(source)) cpSync(source, join(output, relativePath));
}

for (const relativePath of directories) {
  const source = join(root, relativePath);
  if (existsSync(source)) cpSync(source, join(output, relativePath), { recursive: true });
}

writeFileSync(join(output, '.nojekyll'), '');
console.log('Built static Pages artifact in _site.');
