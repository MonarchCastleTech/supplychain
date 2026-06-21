// Phase 04-01 (STORY-03): assert the smooth-motion refactor contract for the D3
// force simulation in js/viz/index.js plus the reduced-motion gates in viz + theme.css.
// These assertions are intentionally RED in Wave 0 — they are satisfied by Plan 03
// (build-once / update-on-change viz refactor) and Plan 02 (theme.css reduced-motion
// block). The defensive trust-wiring assertions guard against the refactor dropping
// provenance/confidence output. String-presence style (repo convention — no browser).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (...p) => readFileSync(join(__dirname, "..", ...p), "utf8");

const VIZ = read("js", "viz", "index.js");
const THEME = read("styles", "theme.css");

test("simulation is built once: exactly one d3.forceSimulation( occurrence", () => {
  const n = (VIZ.match(/d3\.forceSimulation\(/g) || []).length;
  assert.equal(n, 1, `expected exactly one d3.forceSimulation( (got ${n})`);
});

test("the build/update split exists (buildSimulation + updateGraph)", () => {
  assert.match(VIZ, /function buildSimulation/, "buildSimulation() must be defined");
  assert.match(VIZ, /function updateGraph/, "updateGraph() must be defined");
});

test("nodes/links are re-bound on view change (not recreated)", () => {
  assert.match(VIZ, /simulation\.nodes\(/, "simulation.nodes(...) re-bind required");
  assert.match(VIZ, /force\(["']link["']\)\.links\(/, "force('link').links(...) re-bind required");
});

test("gentle reheat only — alphaTarget present, no full alpha(1) restart", () => {
  assert.match(VIZ, /alphaTarget\(/, "gentle alphaTarget( reheat required");
  assert.doesNotMatch(VIZ, /\balpha\(1\)/, "must not use a from-scratch alpha(1) restart");
});

test("mental map preserved: node positions carried across rebind", () => {
  assert.ok(
    /prev\.get\(/.test(VIZ) || /\.x\s*=\s*p\.x/.test(VIZ),
    "a position-carry pattern (prev.get(...) or n.x = p.x) is required",
  );
});

test("reduced-motion honored in viz (matchMedia) and theme.css (@media)", () => {
  assert.match(VIZ, /matchMedia\(['"]\(prefers-reduced-motion/, "viz matchMedia guard required");
  assert.match(THEME, /prefers-reduced-motion/, "theme.css reduced-motion media block required");
});

test("trust wiring preserved through the motion refactor", () => {
  assert.match(VIZ, /provenanceFor\(/, "provenanceFor( must remain wired");
  assert.match(VIZ, /confidenceScore\(/, "confidenceScore( must remain wired");
  assert.match(VIZ, /Confidence:\s*\$\{\s*score\s*\}\s*%/, "literal 'Confidence: ${score}%' must remain");
});
