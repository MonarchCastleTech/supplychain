import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const hash = (relativePath) =>
  crypto.createHash('sha256').update(fs.readFileSync(path.join(root, relativePath))).digest('hex');

test('header uses the official dark Supply Chain lockup', () => {
  const html = read('index.html');
  const css = read('styles/layout.css');
  assert.match(html, /src="\.\/assets\/supplychain-logo-dark\.png"/);
  assert.match(html, /alt="Supply Chain Intelligence"/);
  assert.equal(
    hash('assets/supplychain-logo-dark.png'),
    '35dd5ba80c2768aec9942e1af64910871328bf24d55a04afbfba1c0f8146e01b',
  );
  assert.doesNotMatch(css, /#title:hover\{filter:brightness/);
});

test('rich dataset retains stable schema, provenance, and parseable update timestamps', () => {
  const data = JSON.parse(read('data/top100-map.json'));

  assert.deepEqual(
    Object.keys(data).sort(),
    ['countries', 'layers', 'links', 'meta', 'nodes', 'profiles'].sort(),
  );
  assert.deepEqual(
    Object.keys(data.meta).sort(),
    ['count', 'generatedAt', 'lastUpdated', 'profileCount', 'source'].sort(),
  );
  assert.equal(Number.isNaN(Date.parse(data.meta.generatedAt)), false);
  assert.equal(Number.isNaN(Date.parse(data.meta.lastUpdated)), false);
  assert.match(data.meta.source, /^https:\/\//);
  assert.equal(data.meta.count, data.nodes.filter((node) => node.symbol).length);
  assert.equal(data.meta.profileCount, Object.keys(data.profiles).length);
});

test('scenario, estimate, and forecast language states the deterministic boundary', () => {
  const html = read('index.html');

  assert.match(html, /Scenario stress-tests \(derived\)/);
  assert.match(html, /structural what-if over the graph, not a forecast/i);
  assert.match(html, /exposure, not a loss estimate/i);
  assert.match(html, /Deterministic scenario — not a prediction\./);
  assert.match(html, /Estimated relationships are labeled and source-linked when evidence is available\./);
  assert.doesNotMatch(html, /predictive accuracy|accurate forecast|will (?:cause|lose|disrupt)/i);
});

test('runtime displays the approved lockup and product endorsement', () => {
  assert.equal(
    hash('assets/supplychain-logo-dark.png'),
    '35dd5ba80c2768aec9942e1af64910871328bf24d55a04afbfba1c0f8146e01b',
  );

  const html = read('index.html');
  assert.match(
    html,
    /<img[^>]+src=["']\.\/assets\/supplychain-logo-dark\.png["'][^>]+alt=["']Supply Chain Intelligence["']/i,
  );
  assert.match(html, /<h1[^>]*>Supply Chain Intelligence<\/h1>/);
  assert.match(html, /Part of Monarch Castle Technologies\./);
});

test('application exposes semantic landmarks and accessible D3 controls', () => {
  const html = read('index.html');
  const viz = read('js/viz/index.js');

  assert.match(html, /<header[^>]+id=["']top["']/i);
  assert.match(html, /<main[^>]+id=["']application["']/i);
  assert.match(html, /<footer[^>]+id=["']footer["']/i);
  assert.match(html, /id=["']fConfidence["'][^>]+aria-label=/i);
  assert.match(html, /id=["']fType["'][^>]+aria-label=/i);
  assert.match(html, /id=["']fVerified["'][^>]+aria-label=/i);
  assert.match(
    html,
    /<svg[^>]+id=["']canvas["'][^>]+role=["']group["'][^>]+aria-describedby=["']networkInstructions["']/i,
  );
  assert.match(viz, /\.attr\(["']role["'], ["']button["']\)/);
  assert.match(viz, /\.attr\(["']tabindex["'], 0\)/);
  assert.match(viz, /\.attr\(["']aria-label["']/);
  assert.match(viz, /\.on\(["']keydown["']/);
  assert.match(viz, /Enter/);
});

test('shared portfolio tokens and mobile containment are explicit', () => {
  const base = read('styles/base.css');
  const layout = read('styles/layout.css');

  assert.match(base, /--color-bg:\s*#15130f/i);
  assert.match(base, /--color-surface:\s*#191711/i);
  assert.match(base, /--color-text:\s*#ece6d8/i);
  assert.match(base, /--color-accent:\s*#c9a24b/i);
  assert.match(base, /--font-display:\s*'Spectral'/i);
  assert.match(base, /--font-ui:\s*'IBM Plex Sans'/i);
  assert.match(layout, /overflow-x:\s*(?:clip|hidden)/);
  assert.match(layout, /@media\s*\(\s*max-width:\s*640px\s*\)/);
  assert.match(base, /:focus-visible/);
});

test('data updater has a deterministic no-write dry-run contract', () => {
  const packageJson = JSON.parse(read('package.json'));
  const updater = read('scripts/update-marketcap-data.mjs');
  const workflow = read('.github/workflows/auto-update-data.yml');

  assert.equal(
    packageJson.scripts['update:data:dry'],
    'node scripts/update-marketcap-data.mjs --dry-run --fixture=data/top100-marketcap.csv',
  );
  assert.match(updater, /--dry-run/);
  assert.match(updater, /--fixture=/);
  assert.match(updater, /Dry run complete; no files were written\./);
  assert.match(workflow, /node scripts\/update-marketcap-data\.mjs/);
  assert.match(workflow, /git diff --quiet data\//);
});

test('production build preserves the Pages artifact contract', () => {
  const packageJson = JSON.parse(read('package.json'));
  const workflow = read('.github/workflows/deploy-pages.yml');

  assert.equal(packageJson.scripts.build, 'node scripts/build-static.mjs');
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /path:\s*_site/);
});
