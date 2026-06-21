import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { readFileSync } from "node:fs";
import {
  supplierCriticality,
  buildSupplierFanIn,
} from "../js/analytics/index.js";

// Rich dataset (test suite reads the JSON; the browser loads the thin .js).
// Mirror tests/provenance.test.mjs:9 — pass profiles in explicitly so the pure
// function never depends on `window`.
const data = JSON.parse(fs.readFileSync("data/top100-map.json", "utf8"));
const profiles = data.profiles || {};

// --- DEPTH-02: criticality ranking by real fan-in ------------------------

test("supplierCriticality returns {supplier, fanIn} sorted descending", () => {
  const ranked = supplierCriticality({ profiles });
  assert.ok(Array.isArray(ranked) && ranked.length > 0);
  for (let i = 0; i + 1 < ranked.length; i++) {
    assert.ok(
      ranked[i].fanIn >= ranked[i + 1].fanIn,
      `not sorted at index ${i}: ${ranked[i].fanIn} < ${ranked[i + 1].fanIn}`
    );
  }
});

test("supplierCriticality top chokepoint = 'credit and risk data inputs' with fanIn 4", () => {
  const ranked = supplierCriticality({ profiles });
  assert.equal(ranked[0].supplier, "credit and risk data inputs");
  assert.equal(ranked[0].fanIn, 4);
});

test("supplierCriticality has at least one supplier with fanIn >= 3", () => {
  const ranked = supplierCriticality({ profiles });
  assert.ok(ranked.some((r) => r.fanIn >= 3), "expected a fan-in >= 3 supplier");
});

test("supplierCriticality counts match buildSupplierFanIn sizes exactly", () => {
  const fan = buildSupplierFanIn(profiles);
  const ranked = supplierCriticality({ profiles });
  assert.equal(ranked.length, fan.size, "entry count must match fan-in map size");
  for (const { supplier, fanIn } of ranked) {
    assert.equal(fanIn, fan.get(supplier).size, `fan-in mismatch for ${supplier}`);
  }
});

test("supplierCriticality fan-in histogram matches real distribution {1:439,2:13,3:5,4:1}", () => {
  const ranked = supplierCriticality({ profiles });
  const hist = {};
  for (const { fanIn } of ranked) hist[fanIn] = (hist[fanIn] || 0) + 1;
  assert.deepEqual(hist, { 1: 439, 2: 13, 3: 5, 4: 1 });
});

test("supplierCriticality honors opts.limit", () => {
  const top3 = supplierCriticality({ profiles, limit: 3 });
  assert.equal(top3.length, 3);
  assert.equal(top3[0].supplier, "credit and risk data inputs");
});

// --- DEPTH-02: criticality is fan-in only, NOT the editorial d.bn flag ----

test("supplierCriticality source contains no reference to the editorial d.bn flag", () => {
  // RESEARCH Anti-Pattern: d.bn is a curated company-prominence flag with
  // non-contiguous ranks, NOT derivable from fan-in. The criticality math must
  // not conflate the two.
  const src = readFileSync("js/analytics/index.js", "utf8");
  // Isolate the supplierCriticality function body and assert it never reads .bn
  const start = src.indexOf("export function supplierCriticality");
  assert.ok(start >= 0, "supplierCriticality export not found");
  const body = src.slice(start);
  assert.ok(!/\.bn\b/.test(body), "supplierCriticality must not reference d.bn");
});
