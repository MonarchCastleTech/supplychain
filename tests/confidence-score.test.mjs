// Phase 03-02: pure unit coverage for confidenceScore (TRUST-03) + sourceYear.
// confidenceScore is DOM-free and imported directly; sourceYear is the FK->year resolver.
// Asserts bounds, observed>estimated>unknown ordering, monotonic age decay, the unknown
// floor, no-year=>no-decay, and integer/[0,100] across a [-5..50] age fuzz (future guard).
import { test } from "node:test";
import assert from "node:assert/strict";
import { confidenceScore } from "../js/trust/index.js";
import { sourceYear } from "../js/data/index.js";

const NOW = 2026;
const SOURCE = { id: "S1", title: "2025 10-K", url: "https://x" };
const CTX = (year) => ({ sourceIndex: { S1: SOURCE }, sourceYear: year, now: NOW });
const UNKNOWN_FLOOR = 25;

// --- confidenceScore: base weighting + bounds -----------------------------

test("observed (high*) source with a current year scores between 80 and 100", () => {
  const score = confidenceScore({ confidence: "high (company disclosure)", sourceId: "S1" }, CTX(NOW));
  assert.ok(Number.isInteger(score), "score must be an integer");
  assert.ok(score >= 80 && score <= 100, `expected 80..100, got ${score}`);
});

test("an older source decays strictly below the current-year case but stays >= floor", () => {
  const fresh = confidenceScore({ confidence: "high (company disclosure)", sourceId: "S1" }, CTX(NOW));
  const aged = confidenceScore({ confidence: "high (company disclosure)", sourceId: "S1" }, CTX(NOW - 8));
  assert.ok(aged < fresh, `aged (${aged}) must be strictly less than fresh (${fresh})`);
  assert.ok(aged >= UNKNOWN_FLOOR, `aged (${aged}) must stay >= floor (${UNKNOWN_FLOOR})`);
});

test("decay is monotonic non-increasing as the source gets older", () => {
  let prev = Infinity;
  for (let age = 0; age <= 40; age += 1) {
    const score = confidenceScore({ confidence: "high (company disclosure)", sourceId: "S1" }, CTX(NOW - age));
    assert.ok(score <= prev, `age ${age}: ${score} must be <= previous ${prev}`);
    prev = score;
  }
});

test("estimated (medium*) scores strictly below the observed (high*) case at the same age", () => {
  const high = confidenceScore({ confidence: "high (company disclosure)", sourceId: "S1" }, CTX(NOW));
  const medium = confidenceScore({ cf: "medium (source-backed)", sf: "S1" }, CTX(NOW));
  assert.ok(medium < high, `estimated (${medium}) must be < observed (${high})`);
});

test("a figure with no provenance returns exactly the unknown floor, never higher", () => {
  const score = confidenceScore({}, {});
  assert.equal(score, UNKNOWN_FLOOR);
});

test("an observed tag with no resolvable source still returns the unknown floor", () => {
  // dangling FK -> provenanceFor drops the source key -> floor.
  const score = confidenceScore({ confidence: "high (SEC filing)", sourceId: "DANGLING" }, CTX(NOW));
  assert.equal(score, UNKNOWN_FLOOR);
});

test("no parseable year (sourceYear:null) incurs no decay — absence is not staleness", () => {
  const withYear = confidenceScore({ confidence: "high (company disclosure)", sourceId: "S1" }, CTX(NOW));
  const noYear = confidenceScore({ confidence: "high (company disclosure)", sourceId: "S1" }, CTX(null));
  assert.equal(noYear, withYear, "no year must equal the undecayed current-year base");
  assert.ok(noYear >= 80, "no-year base must be the full observed weight");
});

test("no ctx.now also means no decay", () => {
  const score = confidenceScore(
    { confidence: "high (company disclosure)", sourceId: "S1" },
    { sourceIndex: { S1: SOURCE }, sourceYear: NOW - 20 },
  );
  assert.ok(score >= 80, `without ctx.now there must be no decay, got ${score}`);
});

test("fuzz ages [-5..50]: every score is an integer in [0,100] (future years never exceed 100)", () => {
  for (let age = -5; age <= 50; age += 1) {
    const score = confidenceScore({ confidence: "high (company disclosure)", sourceId: "S1" }, CTX(NOW - age));
    assert.ok(Number.isInteger(score), `age ${age}: ${score} must be an integer`);
    assert.ok(score >= 0 && score <= 100, `age ${age}: ${score} out of [0,100]`);
  }
});

// --- sourceYear: FK->usable-year resolver ---------------------------------

test("sourceYear extracts a plausible year from id/title/url text", () => {
  assert.equal(sourceYear({ title: "2024 Annual Report" }, NOW), 2024);
  assert.equal(sourceYear({ id: "S5", url: "https://x/2023/report" }, NOW), 2023);
});

test("sourceYear returns the max plausible year when several are present", () => {
  assert.equal(sourceYear({ id: "2019", title: "updated 2025 filing" }, NOW), 2025);
});

test("sourceYear ignores future years (> nowYear) and years before 1990", () => {
  assert.equal(sourceYear({ title: "2044 PPA" }, NOW), null);
  assert.equal(sourceYear({ title: "1899 archive" }, NOW), null);
});

test("sourceYear returns null when there are no digits", () => {
  assert.equal(sourceYear({ title: "Annual Report" }, NOW), null);
  assert.equal(sourceYear({}, NOW), null);
});
