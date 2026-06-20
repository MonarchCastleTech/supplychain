import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// String-presence wiring guard (mirrors tests/index-ui-integrity.test.mjs convention):
// read each source file as text and regex-assert the trust API is exported AND consumed.
// Added LAST in Phase 2 (wave 3) so prior waves stayed green — it can only pass once
// both viz (02-02) and ui (02-03) call the trust module. This is the second half of the
// GATE LANDMINE fix (T-02-09): an unregistered test silently never runs, so package.json
// scripts.test must list this file (verified by tests/index-ui-integrity-style checks).

const trust = fs.readFileSync("js/trust/index.js", "utf8");
const viz = fs.readFileSync("js/viz/index.js", "utf8");
const ui = fs.readFileSync("js/ui/index.js", "utf8");

test("js/trust/index.js exports provenanceFor, badgeHtml, renderProvenanceBadge", () => {
  assert.match(trust, /export function provenanceFor\b/, "trust must export provenanceFor");
  assert.match(trust, /export function badgeHtml\b/, "trust must export badgeHtml");
  assert.match(trust, /export function renderProvenanceBadge\b/, "trust must export renderProvenanceBadge");
});

test("js/viz/index.js imports from ../trust/index.js and calls provenanceFor", () => {
  assert.match(viz, /from\s+["']\.\.\/trust\/index\.js["']/, "viz must import from ../trust/index.js");
  const calls = (viz.match(/provenanceFor\s*\(/g) || []).length;
  assert.ok(calls >= 1, `viz must call provenanceFor at least once (found ${calls})`);
});

test("js/ui/index.js imports from ../trust/index.js and calls provenanceFor", () => {
  assert.match(ui, /from\s+["']\.\.\/trust\/index\.js["']/, "ui must import from ../trust/index.js");
  const calls = (ui.match(/provenanceFor\s*\(/g) || []).length;
  assert.ok(calls >= 1, `ui must call provenanceFor at least once (found ${calls})`);
});
