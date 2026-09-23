import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  companyConcentration,
  sectorConcentration,
  buildSupplierFanIn,
} from "../js/analytics/index.js";

// Rich dataset (test suite reads the JSON; the browser loads the thin .js).
// Mirror tests/provenance.test.mjs:9 — pass profiles/nodes/layers in explicitly
// so the pure functions never depend on `window`.
const data = JSON.parse(fs.readFileSync("tests/fixtures/top100-map-2026-02.json", "utf8"));
const profiles = data.profiles || {};
const nodes = data.nodes || [];
const layers = data.layers || {};

// --- DEPTH-01: companyConcentration bounds -------------------------------

test("companyConcentration returns an integer in [0,100] for every profile", () => {
  for (const symbol of Object.keys(profiles)) {
    const r = companyConcentration(symbol, { profiles });
    assert.ok(r, `expected a result for ${symbol}`);
    assert.ok(Number.isInteger(r.score), `${symbol} score not integer: ${r.score}`);
    assert.ok(r.score >= 0 && r.score <= 100, `${symbol} score out of bounds: ${r.score}`);
  }
});

test("companyConcentration unknown symbol returns null", () => {
  assert.equal(companyConcentration("__NOT_A_SYMBOL__", { profiles }), null);
});

// --- DEPTH-01: real anchors (computed from tests/fixtures/top100-map-2026-02.json) ----------

test("companyConcentration real anchors: GILD=36, NVDA=12", () => {
  const gild = companyConcentration("GILD", { profiles });
  const nvda = companyConcentration("NVDA", { profiles });
  assert.equal(gild.score, 36, `GILD expected 36, got ${gild.score}`);
  assert.equal(nvda.score, 12, `NVDA expected 12, got ${nvda.score}`);
  // anchor the structure: GILD k=5, sharedFrac=0.6 ; NVDA k=5, sharedFrac=0
  assert.equal(gild.suppliers, 5);
  assert.equal(gild.sharedCount, 3);
  assert.equal(nvda.suppliers, 5);
  assert.equal(nvda.sharedCount, 0);
});

// --- DEPTH-01: monotonicity in k (sharedFrac fixed) ----------------------

test("companyConcentration is monotonic in k (fewer suppliers => not-lower score)", () => {
  // Synthetic profiles, no shared suppliers (each label is globally unique).
  const synthetic = {
    SMALL: { nodes: [
      { kind: "supplier", l: "small-unique-a" },
      { kind: "supplier", l: "small-unique-b" },
    ] }, // k=2, shared=0
    BIG: { nodes: [
      { kind: "supplier", l: "big-unique-a" },
      { kind: "supplier", l: "big-unique-b" },
      { kind: "supplier", l: "big-unique-c" },
      { kind: "supplier", l: "big-unique-d" },
      { kind: "supplier", l: "big-unique-e" },
    ] }, // k=5, shared=0
  };
  const small = companyConcentration("SMALL", { profiles: synthetic });
  const big = companyConcentration("BIG", { profiles: synthetic });
  assert.equal(small.score, 30); // 100*(0.6*0.5) = 30
  assert.equal(big.score, 12); // 100*(0.6*0.2) = 12
  assert.ok(small.score >= big.score, "smaller k must not score lower");
});

// --- DEPTH-01: monotonicity in sharedFrac (k fixed at 5) -----------------

test("companyConcentration is monotonic in sharedFrac (more shared => not-lower score)", () => {
  // Build three k=5 companies whose suppliers are shared with peers to force
  // sharedFrac 0.0, 0.6, 1.0. A supplier is "shared" when fan-in > 1, so we add
  // peers that also use the same labels.
  function k5(prefix, sharedLabels) {
    const nodes = [];
    for (let i = 0; i < sharedLabels.length; i++) nodes.push({ kind: "supplier", l: sharedLabels[i] });
    for (let i = sharedLabels.length; i < 5; i++) nodes.push({ kind: "supplier", l: `${prefix}-unique-${i}` });
    return { nodes };
  }
  const synthetic = {
    A: k5("A", []), // sharedFrac 0
    B: k5("B", ["shared-1", "shared-2", "shared-3"]), // 3/5 = 0.6 (if peers reuse)
    C: k5("C", ["pair-1", "pair-2", "pair-3", "pair-4", "pair-5"]), // 5/5 = 1.0
    // peers that make B's and C's labels shared (fan-in > 1):
    BP: { nodes: ["shared-1", "shared-2", "shared-3"].map((l) => ({ kind: "supplier", l })) },
    CP: { nodes: ["pair-1", "pair-2", "pair-3", "pair-4", "pair-5"].map((l) => ({ kind: "supplier", l })) },
  };
  const a = companyConcentration("A", { profiles: synthetic });
  const b = companyConcentration("B", { profiles: synthetic });
  const c = companyConcentration("C", { profiles: synthetic });
  assert.equal(a.score, 12); // 100*(0.6*0.2 + 0.4*0) = 12
  assert.equal(b.score, 36); // 100*(0.6*0.2 + 0.4*0.6) = 36
  assert.equal(c.score, 52); // 100*(0.6*0.2 + 0.4*1.0) = 52
  assert.ok(b.score >= a.score && c.score >= b.score, "higher sharedFrac must not score lower");
});

// --- DEPTH-01: tunable threshold + weights -------------------------------

test("companyConcentration honors opts weights and sharedFrac threshold", () => {
  // fan-in>1 default vs threshold 3: changes sharedCount classification.
  const r = companyConcentration("GILD", { profiles, wHHI: 1, wShared: 0 });
  // pure HHI weighting: 100 * 1 * (1/5) = 20
  assert.equal(r.score, 20);
});

// --- DEPTH-01: sectorConcentration ---------------------------------------

test("sectorConcentration groups by layers[node.y] and reports reuse% + effective suppliers", () => {
  const hc = sectorConcentration("Healthcare & Life Sciences", { profiles, nodes, layers });
  assert.equal(hc.sector, "Healthcare & Life Sciences");
  assert.ok(hc.companies > 0, "expected companies in sector");
  // Healthcare reuse% ≈ 12 (within ±1) — computed from real data.
  assert.ok(Math.abs(hc.reusePct - 12) <= 1, `Healthcare reuse% expected ~12, got ${hc.reusePct}`);
  // effective suppliers = 1/HHI, finite and > 0.
  assert.ok(Number.isFinite(hc.effectiveSuppliers) && hc.effectiveSuppliers > 0,
    `effectiveSuppliers not finite>0: ${hc.effectiveSuppliers}`);
  // distinctSuppliers <= slots (reuse means slots >= distinct).
  assert.ok(hc.slots >= hc.distinctSuppliers);
});

test("sectorConcentration uses layers[node.y], not profile.category", () => {
  // Finance & Payments has real reuse 9% — verifies layer grouping picks up the
  // 19-company Finance sector, which would be impossible via per-company category.
  const fin = sectorConcentration("Finance & Payments", { profiles, nodes, layers });
  assert.ok(fin.companies >= 10, `expected many Finance companies, got ${fin.companies}`);
  assert.ok(Math.abs(fin.reusePct - 9) <= 1, `Finance reuse% expected ~9, got ${fin.reusePct}`);
});

test("sectorConcentration unknown sector returns zeroed bounded result", () => {
  const r = sectorConcentration("__NO_SECTOR__", { profiles, nodes, layers });
  assert.equal(r.companies, 0);
  assert.equal(r.reusePct, 0);
});

// --- buildSupplierFanIn sanity (shared by both metrics) ------------------

test("buildSupplierFanIn returns Map<label, Set<symbol>> with real max fan-in 4", () => {
  const fan = buildSupplierFanIn(profiles);
  assert.ok(fan instanceof Map);
  const max = Math.max(...[...fan.values()].map((s) => s.size));
  assert.equal(max, 4, `expected max fan-in 4, got ${max}`);
  assert.equal(fan.get("credit and risk data inputs").size, 4);
});
