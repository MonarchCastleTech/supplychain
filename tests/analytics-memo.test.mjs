// tests/analytics-memo.test.mjs — PERF-01 memoization unit tests.
//
// Memoization changes COST, never VALUE. These tests pin the anchors
// (GILD=36, NVDA=12, top fan-in "credit and risk data inputs"=4, Taiwan 7
// firms / $11,360,589,871,184) AND prove the cache actually serves repeated
// calls without rebuilding the shared fan-in map. Test seams:
//   __resetAnalyticsCache() — clears caches + zeroes stats (per-test isolation)
//   __memoStats()           — { fanIn:{builds,hits}, concentration:{...}, ... }
//
// Fixture: tests/fixtures/top100-map-2026-02.json (real frozen dataset; nodes + profiles). Never mutate.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  companyConcentration,
  supplierCriticality,
  runScenario,
  buildSupplierFanIn,
  SCENARIO_PRESETS,
  __resetAnalyticsCache,
  __memoStats,
} from "../js/analytics/index.js";

const data = JSON.parse(readFileSync("tests/fixtures/top100-map-2026-02.json", "utf8"));
const profiles = data.profiles || {};
const nodes = data.nodes || [];

// --- Value-equality: a cache hit is byte-identical to a fresh compute --------
test("companyConcentration is byte-identical across repeated calls (anchors hold)", () => {
  __resetAnalyticsCache();
  const a = companyConcentration("GILD", { profiles });
  const b = companyConcentration("GILD", { profiles }); // cache hit
  assert.deepEqual(a, b);
  assert.equal(a.score, 36); // anchor preserved
  assert.equal(companyConcentration("NVDA", { profiles }).score, 12); // anchor preserved
});

// --- Cache hit: fan-in built once, served from cache on the second call ------
test("two supplierCriticality calls build the fan-in once (build=1, hits>=1)", () => {
  __resetAnalyticsCache();
  supplierCriticality({ profiles });
  supplierCriticality({ profiles }); // served from cache; fan-in not rebuilt
  const stats = __memoStats();
  assert.equal(stats.fanIn.builds, 1, "fan-in must be built exactly once");
  assert.ok(stats.fanIn.hits >= 1, "second call must hit the fan-in cache");
});

// --- Reset seam re-arms the cache; post-reset recompute is identical ---------
test("__resetAnalyticsCache forces a recompute that still returns identical values", () => {
  __resetAnalyticsCache();
  const before = supplierCriticality({ profiles, limit: 3 });
  __resetAnalyticsCache();
  const after = supplierCriticality({ profiles, limit: 3 });
  assert.deepEqual(after, before);
  assert.equal(after[0].supplier, "credit and risk data inputs"); // anchor
  assert.equal(after[0].fanIn, 4); // anchor: top chokepoint fan-in
});

// --- runScenario: anchors hold + single-vs-array shapes hit the same key -----
test("runScenario(TAIWAN_SEMI) anchors hold (7 firms / $11.36T)", () => {
  __resetAnalyticsCache();
  const r = runScenario(SCENARIO_PRESETS.TAIWAN_SEMI.disruption, { profiles, nodes });
  assert.equal(r.impactedCompanies.length, 7);
  assert.equal(r.totalMarketCapExposed, 11360589871184);
});

test("runScenario keys on the normalized sorted disabled set (single vs array collide)", () => {
  __resetAnalyticsCache();
  runScenario({ disableSuppliers: ["tsmc"] }, { profiles, nodes });
  runScenario({ disableSupplier: "tsmc" }, { profiles, nodes }); // equivalent shape
  const stats = __memoStats();
  assert.equal(stats.scenario.builds, 1, "equivalent disruption shapes must share one cache entry");
  assert.ok(stats.scenario.hits >= 1, "second equivalent shape must be a cache hit");
});

// --- buildSupplierFanIn default-arg path is the shared memoized dependency ---
test("buildSupplierFanIn(default) is built once and shared", () => {
  __resetAnalyticsCache();
  buildSupplierFanIn(); // default profiles
  buildSupplierFanIn(); // cache hit
  const stats = __memoStats();
  assert.equal(stats.fanIn.builds, 1);
  assert.ok(stats.fanIn.hits >= 1);
});
