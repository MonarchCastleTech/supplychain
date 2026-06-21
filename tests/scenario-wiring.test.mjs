import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// String/wiring tests (mirror tests/criticality-wiring.test.mjs): assert the
// scenario UI slice is wired into index.html + js/ui — the panel markup, the
// analytics import, the highlightBy predicate, the derived provenance badge,
// and the honest methodology copy. These are static-source assertions, not
// runtime — the browser is buildless and these guard the wiring contract.

const UI = readFileSync("js/ui/index.js", "utf8");
const HTML = readFileSync("index.html", "utf8");

// --- DEPTH-03/04: #scenarioPanel markup (new IDs only) -------------------

test("index.html declares #scenarioPanel + all 7 new scenario IDs", () => {
  for (const id of [
    "scenarioPanel",
    "scenarioSummary",
    "scenarioImpactList",
    "scenarioProv",
    "bScenarioTaiwan",
    "scenarioChokepointSelect",
    "bScenarioReset",
  ]) {
    assert.match(HTML, new RegExp(`id="${id}"`), `index.html missing id="${id}"`);
  }
});

// --- DEPTH-03: js/ui imports the engine from ../analytics ----------------

test("js/ui imports runScenario + SCENARIO_PRESETS from ../analytics/index.js", () => {
  assert.match(UI, /runScenario/, "ui must reference runScenario");
  assert.match(UI, /SCENARIO_PRESETS/, "ui must reference SCENARIO_PRESETS");
  assert.match(UI, /from\s+["']\.\.\/analytics\/index\.js["']/, "ui must import from ../analytics/index.js");
});

// --- DEPTH-03: graph highlight via highlightBy(impacted predicate) --------

test("js/ui highlights impacted companies via highlightBy with an impacted-symbol predicate", () => {
  assert.match(UI, /highlightBy\(/, "ui must call highlightBy for the scenario graph highlight");
  // an impacted Set predicate keyed on n.symbol (highlightImpacted)
  assert.match(UI, /impacted[\s\S]{0,80}\.symbol/, "ui must build an impacted-symbol predicate");
  assert.match(UI, /highlightImpacted/, "ui must define highlightImpacted");
});

// --- DEPTH-04: derived provenance badge on scenario output ---------------

test("js/ui renders the derived badge for scenario output into #scenarioProv", () => {
  assert.match(UI, /derived\s*:\s*true/, "ui must build derived provenance for the scenario output");
  assert.match(UI, /badgeHtml/, "ui must render the derived badge via badgeHtml");
  assert.match(UI, /scenarioProv/, "ui must target #scenarioProv with the derived badge");
});

// --- DEPTH-04: methodology copy explains the honest scenario model --------

test("index.html methodology modal documents the scenario model (single-hop + HHI + exposure-not-loss + TSMC)", () => {
  assert.match(HTML, /single-hop|direct dependents/i, "methodology must state the single-hop limit");
  assert.match(HTML, /HHI/, "methodology must mention HHI");
  assert.match(HTML, /exposure/i, "methodology must say 'exposure' (not loss)");
  assert.match(HTML, /not a loss|exposure, not/i, "methodology must clarify exposure is NOT a loss estimate");
  assert.match(HTML, /tsmc|taiwan/i, "methodology must reference the Taiwan/TSMC label set");
});

// --- T-07-05: headline derived live, NOT hardcoded -----------------------

test("js/ui derives the scenario headline live (no hardcoded 7 / 11.36 literals)", () => {
  assert.match(UI, /impactedCompanies\.length/, "headline count must derive from impactedCompanies.length");
  assert.match(UI, /totalMarketCapExposed/, "headline cap must derive from totalMarketCapExposed");
  // Forbid the baked-in headline literals coupled to the summary.
  assert.doesNotMatch(UI, /11\.36/, "scenario headline must NOT hardcode 11.36");
  // "7 companies" baked into a template string is forbidden; the count comes from .length.
  assert.doesNotMatch(UI, /7\s+companies\s+impacted/i, "scenario headline must NOT hardcode '7 companies impacted'");
});
