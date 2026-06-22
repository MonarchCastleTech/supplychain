// tests/scenario-cascade.test.mjs — CASC-01/CASC-04 multi-hop cascade correctness.
//
// The pure runScenario engine (js/analytics/index.js) gains a bounded, cycle-safe
// multi-hop BFS. Engine default is maxHops:1 so the v1.0 Taiwan anchor (7 firms /
// $11,360,589,871,184) reproduces byte-identically and the 301-suite stays green.
// Multi-hop is a TRUE SUPERSET enabled by exactly 6 real company-as-supplier bridge
// edges (TSM, TCEHY, ASML, AZN, AMAT, LIN) — no edges fabricated.
//
// All real numbers are verified against data/top100-map.json (11-RESEARCH.md).
// Fixture: data/top100-map.json (real frozen dataset). Never mutate.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  runScenario,
  buildSupplierFanIn,
  buildSelfLabels,
  SCENARIO_PRESETS,
  __resetAnalyticsCache,
  __memoStats,
} from "../js/analytics/index.js";

const data = JSON.parse(readFileSync("data/top100-map.json", "utf8"));
const profiles = data.profiles || {};
const nodes = data.nodes || [];

const TAIWAN_V1_CAP = 11360589871184; // v1.0 anchor: 7 firms exposure
const HOP1_SYMBOLS = ["000660.KS", "AAPL", "AMAT", "AMD", "AVGO", "KLAC", "NVDA"];
const SIX_BRIDGES = ["AMAT", "ASML", "AZN", "LIN", "TCEHY", "TSM"];

test.beforeEach(() => __resetAnalyticsCache());

// --- 1. Backward-compat: the default (no maxHops) reproduces v1.0 exactly -----
test("default (no maxHops) reproduces v1.0 Taiwan: 7 firms / $11.36T / maxHopReached 1", () => {
  const r = runScenario(SCENARIO_PRESETS.TAIWAN_SEMI.disruption, { profiles, nodes });
  assert.equal(r.impactedCompanies.length, 7);
  assert.equal(r.totalMarketCapExposed, TAIWAN_V1_CAP);
  assert.equal(r.maxHopReached, 1);
});

// --- 2. Explicit maxHops:1 === the default result -----------------------------
test("explicit maxHops:1 equals the default result (7 firms, only byHop key 1)", () => {
  const r = runScenario(
    { ...SCENARIO_PRESETS.TAIWAN_SEMI.disruption, maxHops: 1 },
    { profiles, nodes }
  );
  assert.equal(r.impactedCompanies.length, 7);
  assert.equal(r.totalMarketCapExposed, TAIWAN_V1_CAP);
  assert.deepEqual(Object.keys(r.byHop).map(Number).sort((a, b) => a - b), [1]);
  assert.equal(r.byHop[1].length, 7);
  assert.equal(r.maxHopReached, 1);
});

// --- 3. Multi-hop maxHops:2 and :3 → 8 firms, byHop {1:7,2:1}, TSM at hop 2 ----
for (const hops of [2, 3]) {
  test(`maxHops:${hops} on Taiwan → 8 firms, byHop {1:7,2:1}, TSM at hop 2, superset cap`, () => {
    const r = runScenario(
      { ...SCENARIO_PRESETS.TAIWAN_SEMI.disruption, maxHops: hops },
      { profiles, nodes }
    );
    assert.equal(r.impactedCompanies.length, 8);
    assert.equal(r.byHop[1].length, 7);
    assert.equal(r.byHop[2].length, 1);
    assert.ok(r.byHop[2].includes("TSM"), "TSM must appear at hop 2");
    assert.equal(r.maxHopReached, 2);
    assert.ok(r.totalMarketCapExposed > TAIWAN_V1_CAP, "multi-hop cap is the $13.28T superset");
    // every impacted entry carries a numeric hop
    for (const c of r.impactedCompanies) {
      assert.equal(typeof c.hop, "number", `${c.symbol} must carry a numeric hop`);
    }
    const tsm = r.impactedCompanies.find((c) => c.symbol === "TSM");
    assert.equal(tsm.hop, 2);
  });
}

// --- 4. Superset: maxHops:3 symbols ⊇ maxHops:1 symbols (TSM added) -----------
test("maxHops:3 impacted set is a superset of maxHops:1 (every hop-1 symbol present; TSM added)", () => {
  const r1 = runScenario(
    { ...SCENARIO_PRESETS.TAIWAN_SEMI.disruption, maxHops: 1 },
    { profiles, nodes }
  );
  const r3 = runScenario(
    { ...SCENARIO_PRESETS.TAIWAN_SEMI.disruption, maxHops: 3 },
    { profiles, nodes }
  );
  const set1 = new Set(r1.impactedCompanies.map((c) => c.symbol));
  const set3 = new Set(r3.impactedCompanies.map((c) => c.symbol));
  for (const s of set1) assert.ok(set3.has(s), `${s} (hop-1) must remain in the multi-hop set`);
  assert.deepEqual([...set1].sort(), [...HOP1_SYMBOLS].sort());
  assert.ok(set3.has("TSM"), "TSM is the hop-2 addition");
  assert.equal(set3.size, set1.size + 1);
});

// --- 5. selfLabels derives exactly the 6 real bridges -------------------------
test("buildSelfLabels yields exactly the 6 real bridge owners {TSM,TCEHY,ASML,AZN,AMAT,LIN}", () => {
  // Build from the JSON-loaded profiles: the thin js/data DATA carries the graph,
  // not the full per-company profiles (those load from data/top100-map.json).
  const fan = buildSupplierFanIn(profiles);
  const selfLabels = buildSelfLabels(profiles, fan);
  const owners = [];
  for (const [sym, labels] of selfLabels) {
    if (labels && labels.length > 0) owners.push(sym);
  }
  assert.deepEqual(owners.sort(), [...SIX_BRIDGES].sort());
});

// --- 6. Cycle termination on a synthetic real 2-cycle fixture ------------------
test("synthetic 2-cycle (A↔B as suppliers) terminates at maxHops:5, visiting each once", () => {
  // Company A lists B as a supplier; company B lists A as a supplier — a real 2-cycle.
  const cyc = {
    profiles: {
      A: { company: "Alpha (A)", nodes: [{ kind: "supplier", l: "b" }] },
      B: { company: "Beta (B)", nodes: [{ kind: "supplier", l: "a" }] },
    },
    nodes: [
      { symbol: "A", marketcap: 1000 },
      { symbol: "B", marketcap: 2000 },
    ],
  };
  // Disable label "a" (A as a supplier) → impacts B (hop1) → B's selfLabel "b" → impacts A (hop2)
  // → A's selfLabel "a" is already disabled (re-disable guard) → terminate.
  const r = runScenario({ disableSupplier: "a", maxHops: 5 }, cyc);
  // Returns (did not hang) and each company appears exactly once.
  const syms = r.impactedCompanies.map((c) => c.symbol);
  assert.deepEqual([...new Set(syms)].sort(), syms.slice().sort(), "no duplicate symbol");
  assert.ok(r.maxHopReached <= 5, "bounded");
  assert.ok(syms.includes("B"), "B impacted at hop 1");
  assert.ok(syms.includes("A"), "A impacted at hop 2 via the cycle bridge");
});

// --- 7. maxHops bound respected on the synthetic fixture ----------------------
test("maxHops bound: maxHops:1 stops at hop 1; deeper maxHops reaches further", () => {
  const cyc = {
    profiles: {
      A: { company: "Alpha (A)", nodes: [{ kind: "supplier", l: "b" }] },
      B: { company: "Beta (B)", nodes: [{ kind: "supplier", l: "a" }] },
    },
    nodes: [
      { symbol: "A", marketcap: 1000 },
      { symbol: "B", marketcap: 2000 },
    ],
  };
  const shallow = runScenario({ disableSupplier: "a", maxHops: 1 }, cyc);
  assert.equal(shallow.maxHopReached, 1);
  assert.deepEqual(shallow.impactedCompanies.map((c) => c.symbol).sort(), ["B"]);

  const deep = runScenario({ disableSupplier: "a", maxHops: 5 }, cyc);
  assert.ok(deep.maxHopReached > shallow.maxHopReached, "deeper bound reaches further");
});

// --- 8. Memo key includes maxHops (distinct cache entries per depth) -----------
test("memo key includes maxHops: maxHops:1 and maxHops:3 are distinct builds", () => {
  __resetAnalyticsCache();
  const r1 = runScenario(
    { ...SCENARIO_PRESETS.TAIWAN_SEMI.disruption, maxHops: 1 },
    { profiles, nodes }
  );
  const r3 = runScenario(
    { ...SCENARIO_PRESETS.TAIWAN_SEMI.disruption, maxHops: 3 },
    { profiles, nodes }
  );
  assert.equal(r1.impactedCompanies.length, 7);
  assert.equal(r3.impactedCompanies.length, 8);
  assert.equal(__memoStats().scenario.builds, 2, "two distinct depth entries built");

  // a second maxHops:1 call is a cache hit (no third build)
  runScenario(
    { ...SCENARIO_PRESETS.TAIWAN_SEMI.disruption, maxHops: 1 },
    { profiles, nodes }
  );
  const stats = __memoStats();
  assert.equal(stats.scenario.builds, 2, "repeat maxHops:1 must not rebuild");
  assert.ok(stats.scenario.hits >= 1, "repeat maxHops:1 must hit the cache");
});
