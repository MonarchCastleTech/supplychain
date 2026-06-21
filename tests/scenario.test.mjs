import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  runScenario,
  SCENARIO_PRESETS,
  companyConcentration,
} from "../js/analytics/index.js";

// Rich dataset (test suite reads the JSON; the browser loads the thin .js).
// Mirror tests/criticality-wiring.test.mjs:14 — pass {profiles,nodes} in
// explicitly so the pure engine never depends on `window`. Never mutate.
const data = JSON.parse(readFileSync("data/top100-map.json", "utf8"));
const profiles = data.profiles || {};
const nodes = data.nodes || [];

// The 7 real Taiwan-semiconductor dependents (from 07-RESEARCH "Real Impact Data").
const EXPECTED_IMPACTED = ["NVDA", "AAPL", "AVGO", "000660.KS", "AMD", "AMAT", "KLAC"];

// Derive the expected market-cap exposure DIRECTLY from the fixture nodes so the
// number is proven to come from real data, not a literal baked into the engine.
const EXPECTED_CAP = (() => {
  const mcap = {};
  for (const n of nodes) if (n && n.symbol != null) mcap[n.symbol] = n.marketcap || 0;
  return EXPECTED_IMPACTED.reduce((s, sym) => s + (mcap[sym] || 0), 0);
})();

// --- DEPTH-03: Taiwan preset impacts EXACTLY the 7 real dependents --------

test("runScenario(TAIWAN_SEMI) impacts exactly the 7 real dependents", () => {
  const result = runScenario(SCENARIO_PRESETS.TAIWAN_SEMI.disruption, { profiles, nodes });
  assert.equal(result.impactedCompanies.length, 7);
  const got = result.impactedCompanies.map((c) => c.symbol).sort();
  assert.deepEqual(got, [...EXPECTED_IMPACTED].sort());
});

test("runScenario(TAIWAN_SEMI) totalMarketCapExposed === 11360589871184 (derived from real fixtures)", () => {
  const result = runScenario(SCENARIO_PRESETS.TAIWAN_SEMI.disruption, { profiles, nodes });
  assert.equal(EXPECTED_CAP, 11360589871184); // the fixture-derived sum is the ground truth
  assert.equal(result.totalMarketCapExposed, 11360589871184);
  assert.equal(result.totalMarketCapExposed, EXPECTED_CAP);
});

test("runScenario(TAIWAN_SEMI) supplierCount === 5 (all 5 labels present in graph)", () => {
  const result = runScenario(SCENARIO_PRESETS.TAIWAN_SEMI.disruption, { profiles, nodes });
  assert.equal(result.supplierCount, 5);
});

test("runScenario(TAIWAN_SEMI) every firm goes k=5->4 and HHI 0.20->0.25 monotonically", () => {
  const result = runScenario(SCENARIO_PRESETS.TAIWAN_SEMI.disruption, { profiles, nodes });
  for (const c of result.impactedCompanies) {
    assert.equal(c.suppliersBefore, 5, `${c.symbol} suppliersBefore`);
    assert.equal(c.suppliersAfter, 4, `${c.symbol} suppliersAfter`);
    assert.ok(Math.abs(c.concentrationBefore - 0.2) < 1e-9, `${c.symbol} before HHI ${c.concentrationBefore}`);
    assert.ok(Math.abs(c.concentrationAfter - 0.25) < 1e-9, `${c.symbol} after HHI ${c.concentrationAfter}`);
    assert.ok(c.concentrationAfter >= c.concentrationBefore, `${c.symbol} HHI must not drop`);
  }
});

// --- DEPTH-03: no-op safety ----------------------------------------------

test("runScenario({}) is a safe no-op", () => {
  const result = runScenario({}, { profiles, nodes });
  assert.deepEqual(result.impactedCompanies, []);
  assert.equal(result.totalMarketCapExposed, 0);
  assert.equal(result.supplierCount, 0);
});

test("runScenario({disableSuppliers:[]}) is a safe no-op", () => {
  const result = runScenario({ disableSuppliers: [] }, { profiles, nodes });
  assert.deepEqual(result.impactedCompanies, []);
  assert.equal(result.totalMarketCapExposed, 0);
  assert.equal(result.supplierCount, 0);
});

// --- DEPTH-03: label-fragmentation guard ----------------------------------

test("runScenario({disableSupplier:'tsmc'}) impacts ONLY KLAC", () => {
  const result = runScenario({ disableSupplier: "tsmc" }, { profiles, nodes });
  assert.equal(result.impactedCompanies.length, 1);
  assert.equal(result.impactedCompanies[0].symbol, "KLAC");
});

// --- DEPTH-03: companyConcentration excludeSuppliers is additive ----------

test("companyConcentration excludeSuppliers:undefined deep-equals legacy output (back-compat)", () => {
  const sym = "AAPL";
  const legacy = companyConcentration(sym, { profiles });
  const withUndef = companyConcentration(sym, { profiles, excludeSuppliers: undefined });
  assert.deepEqual(withUndef, legacy);
});

test("companyConcentration excludeSuppliers lowers k by 1 for AAPL when TSMC excluded", () => {
  const base = companyConcentration("AAPL", { profiles });
  const excluded = companyConcentration("AAPL", {
    profiles,
    excludeSuppliers: ["taiwan semiconductor manufacturing company (tsmc)"],
  });
  assert.equal(excluded.suppliers, base.suppliers - 1);
});
