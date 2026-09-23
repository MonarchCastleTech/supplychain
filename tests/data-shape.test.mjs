// Phase 03-01: data-shape guard for the browser-served data/top100-map.js.
//
// The served file is the RICH shape: it must assign window.SUPPLY_MAP_DATA an
// object carrying meta + nodes + links + profiles. A prior regression replaced it
// with the FLAT {last_auto_update, companies:[...]} shape (no meta/profiles), which
// silently broke the live app (DATA.meta/DATA.profiles undefined → no paint,
// "Unknown" freshness). This suite fails loudly if that regression returns.
//
// String-presence + light-eval style (the repo convention — no DOM in the Node gate).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVED_PATH = join(__dirname, "..", "data", "top100-map.js");
const SRC = readFileSync(SERVED_PATH, "utf8");

// Evaluate the served assignment against a minimal window shim to recover the object.
function loadServedData() {
  const win = {};
  // eslint-disable-next-line no-new-func
  const fn = new Function("window", SRC);
  fn(win);
  return win.SUPPLY_MAP_DATA;
}

test("served file assigns window.SUPPLY_MAP_DATA and contains the rich keys", () => {
  assert.match(SRC, /window\.SUPPLY_MAP_DATA\s*=/);
  assert.match(SRC, /"meta"\s*:/);
  assert.match(SRC, /"nodes"\s*:/);
  assert.match(SRC, /"links"\s*:/);
  assert.match(SRC, /"profiles"\s*:/);
});

test("served file does NOT carry the flat regression shape", () => {
  assert.doesNotMatch(SRC, /last_auto_update/, "served file must not contain last_auto_update (flat shape)");
  assert.doesNotMatch(SRC, /"companies"\s*:/, "served file must not contain a top-level companies array (flat shape)");
});

test("evaluated SUPPLY_MAP_DATA exposes meta + nodes + links + profiles", () => {
  const data = loadServedData();
  assert.ok(data && typeof data === "object", "window.SUPPLY_MAP_DATA must be an object");

  // meta.generatedAt is a parseable ISO date
  assert.ok(data.meta && typeof data.meta === "object", "missing meta object");
  const generatedAtMs = new Date(data.meta.generatedAt).getTime();
  assert.ok(Number.isFinite(generatedAtMs), "meta.generatedAt must parse to a finite timestamp");

  // meta.lastUpdated is a non-empty display string
  assert.equal(typeof data.meta.lastUpdated, "string", "meta.lastUpdated must be a string");
  assert.ok(data.meta.lastUpdated.trim().length > 0, "meta.lastUpdated must be non-empty");

  // Company nodes exist; global links remain empty until evidence-backed edges exist.
  assert.ok(Array.isArray(data.nodes) && data.nodes.length > 0, "nodes must be a non-empty array");
  assert.ok(Array.isArray(data.links), "links must be an array");
  assert.equal(data.links.length, 0, "unsourced global relationship edges must not be published");

  // profiles has at least one keyed entry
  assert.ok(data.profiles && typeof data.profiles === "object", "missing profiles object");
  assert.ok(Object.keys(data.profiles).length > 0, "profiles must have at least one entry");
});
