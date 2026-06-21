// Phase 05-01 (STORY-04/STORY-05): pure-module contract for buildNarrative(data).
// These assertions go GREEN this plan — js/ui/narrative.js is the deliverable.
// No DOM, no d3: buildNarrative is a pure data->step-list function imported in Node.

import test from "node:test";
import assert from "node:assert/strict";
import { buildNarrative } from "../js/ui/narrative.js";

// A tiny fake dataset. Two layers (y=0 dominant with 3 nodes, y=1 with 1),
// two bottlenecks (bn:true), and a clear highest-marketcap-and-bn node (BBB).
function fixtureA() {
  return {
    meta: { count: 4, source: "companiesmarketcap.com" },
    layers: { "0": "Semiconductors & Components", "1": "Software & Platforms" },
    nodes: [
      { symbol: "AAA", company: "Alpha", marketcap: 1_000_000_000_000, rank: 3, bn: true, y: 0 },
      { symbol: "BBB", company: "Beta", marketcap: 3_000_000_000_000, rank: 1, bn: true, y: 0 },
      { symbol: "CCC", company: "Gamma", marketcap: 2_000_000_000_000, rank: 2, bn: false, y: 0 },
      { symbol: "DDD", company: "Delta", marketcap: 500_000_000_000, rank: 4, bn: false, y: 1 },
    ],
  };
}

// A DIFFERENT dataset: different combined cap, different bn count, different count.
function fixtureB() {
  return {
    meta: { count: 2, source: "companiesmarketcap.com" },
    layers: { "5": "Healthcare & Life Sciences", "1": "Software & Platforms" },
    nodes: [
      { symbol: "ZZZ", company: "Zeta", marketcap: 7_000_000_000_000, rank: 1, bn: true, y: 5 },
      { symbol: "YYY", company: "Yotta", marketcap: 1_000_000_000_000, rank: 2, bn: false, y: 1 },
    ],
  };
}

function spyControls() {
  const calls = [];
  return {
    calls,
    openGlobal: () => calls.push({ name: "openGlobal", args: [] }),
    openProfile: (symbol) => calls.push({ name: "openProfile", args: [symbol] }),
    highlightBy: (fn) => calls.push({ name: "highlightBy", args: [fn] }),
    resetHighlight: () => calls.push({ name: "resetHighlight", args: [] }),
  };
}

test("buildNarrative returns 4 steps ordered market -> concentration -> risk -> opportunity", () => {
  const steps = buildNarrative(fixtureA());
  assert.equal(steps.length, 4, "expected exactly 4 steps");
  assert.deepEqual(
    steps.map((s) => s.id),
    ["market", "concentration", "risk", "opportunity"],
    "step ids must be in narrative order",
  );
});

test("every step has a non-empty title, non-empty caption, and a function apply", () => {
  for (const s of buildNarrative(fixtureA())) {
    assert.equal(typeof s.title, "string", `${s.id} title must be a string`);
    assert.ok(s.title.trim().length > 0, `${s.id} title must be non-empty`);
    assert.equal(typeof s.caption, "string", `${s.id} caption must be a string`);
    assert.ok(s.caption.trim().length > 0, `${s.id} caption must be non-empty`);
    assert.equal(typeof s.apply, "function", `${s.id} apply must be a function`);
  }
});

test("each step.apply calls the correct injected control", () => {
  const [market, concentration, risk, opportunity] = buildNarrative(fixtureA());

  const c1 = spyControls();
  market.apply(c1);
  assert.deepEqual(c1.calls.map((x) => x.name), ["openGlobal"], "market -> openGlobal");

  const c2 = spyControls();
  concentration.apply(c2);
  assert.deepEqual(c2.calls.map((x) => x.name), ["highlightBy"], "concentration -> highlightBy");

  const c3 = spyControls();
  risk.apply(c3);
  assert.deepEqual(c3.calls.map((x) => x.name), ["highlightBy"], "risk -> highlightBy");

  const c4 = spyControls();
  opportunity.apply(c4);
  assert.deepEqual(c4.calls.map((x) => x.name), ["openProfile"], "opportunity -> openProfile");
  // The opportunity symbol must be the highest-marketcap node that is also bn (BBB),
  // NOT the global highest (BBB happens to be both here) and NOT a literal.
  assert.equal(c4.calls[0].args[0], "BBB", "opportunity must open the top-cap bottleneck symbol");
});

test("risk.apply predicate selects exactly the bn nodes", () => {
  const [, , risk] = buildNarrative(fixtureA());
  const c = spyControls();
  risk.apply(c);
  const predicate = c.calls[0].args[0];
  assert.equal(typeof predicate, "function", "highlightBy must receive a predicate fn");
  assert.equal(predicate({ bn: true }), true);
  assert.equal(predicate({ bn: false }), false);
});

test("concentration.apply predicate selects the dominant layer index", () => {
  const [, concentration] = buildNarrative(fixtureA());
  const c = spyControls();
  concentration.apply(c);
  const predicate = c.calls[0].args[0];
  assert.equal(typeof predicate, "function", "highlightBy must receive a predicate fn");
  // Dominant layer in fixtureA is y=0 (3 nodes).
  assert.equal(predicate({ y: 0 }), true);
  assert.equal(predicate({ y: 1 }), false);
});

test("captions are computed from the data fixture, not hardcoded literals", () => {
  const a = buildNarrative(fixtureA());
  const b = buildNarrative(fixtureB());

  const marketA = a[0].caption;
  const marketB = b[0].caption;
  const riskA = a[2].caption;
  const riskB = b[2].caption;

  // Different fixtures (different combined cap + count + bn counts) MUST yield
  // different captions — proves recomputation, not a constant string.
  assert.notEqual(marketA, marketB, "market caption must differ across fixtures");
  assert.notEqual(riskA, riskB, "risk caption must differ across fixtures");

  // The market caption must contain the fixture-derived combined cap and meta.count.
  // fixtureA: (1+3+2+0.5)T = 6.5T -> "6.5", count 4.
  assert.match(marketA, /6\.5/, "market caption must contain fixtureA combined cap (6.5T)");
  assert.match(marketA, /\b4\b/, "market caption must contain fixtureA meta.count (4)");
  // fixtureB: (7+1)T = 8.0T -> "8.0", count 2.
  assert.match(marketB, /8\.0/, "market caption must contain fixtureB combined cap (8.0T)");
  assert.match(marketB, /\b2\b/, "market caption must contain fixtureB meta.count (2)");

  // Risk caption reflects the bn count of each fixture (A: 2 bn, B: 1 bn).
  assert.match(riskA, /\b2\b/, "risk caption must contain fixtureA bn count (2)");
  assert.match(riskB, /\b1\b/, "risk caption must contain fixtureB bn count (1)");
});

test("opportunity prefers the highest-marketcap bottleneck, falling back to top cap when none flagged", () => {
  // No bn nodes flagged -> falls back to global highest marketcap (PQR).
  const data = {
    meta: { count: 2, source: "companiesmarketcap.com" },
    layers: { "0": "Semiconductors & Components" },
    nodes: [
      { symbol: "PQR", company: "Pqr", marketcap: 5_000_000_000_000, rank: 1, bn: false, y: 0 },
      { symbol: "STU", company: "Stu", marketcap: 2_000_000_000_000, rank: 2, bn: false, y: 0 },
    ],
  };
  const opportunity = buildNarrative(data)[3];
  const c = spyControls();
  opportunity.apply(c);
  assert.equal(c.calls[0].args[0], "PQR", "fallback to highest-marketcap overall when no bn node");
});
