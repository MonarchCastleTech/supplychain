---
phase: 07-scenario-stress-tests
verified: 2026-06-21T00:00:00Z
status: passed
score: 3/3 must-haves verified
overrides_applied: 0
re_verification: null
gaps: []
deferred: []
human_verification: []
---

# Phase 7: Scenario Stress-Tests Verification Report

**Phase Goal:** Investors can explore "what if" disruptions and see downstream impact — the uniquely deep capability that distinguishes the site, on real data with full provenance.
**Verified:** 2026-06-21
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | At least one scenario stress-test runs over real data and shows downstream impact | VERIFIED | `runScenario` engine + `TAIWAN_SEMI` preset implemented; 7 companies impacted, `totalMarketCapExposed === 11360589871184` derived live from `data/top100-map.json`; test asserts exact match. |
| 2 | Every derived analytic carries provenance and is covered by tests | VERIFIED | Scenario output badged `derived: true` via `provenanceFor({derived:true,n})` + `badgeHtml` into `#scenarioProv`; wiring test asserts `derived: true` + `badgeHtml` + `scenarioProv`; methodology copy states "exposure, not a loss estimate". |
| 3 | The full suite, including new analytic tests, stays green | VERIFIED | `npm test` = **257 pass / 0 fail**, exit 0; includes 9 scenario unit tests (`tests/scenario.test.mjs`) and 6 scenario-wiring tests (`tests/scenario-wiring.test.mjs`). |

**Score:** 3/3 truths verified

---

## DEPTH-03 Verification (Scenario Engine + Preset)

### runScenario engine

| Check | Evidence | Status |
|-------|----------|--------|
| `export function runScenario` present | `js/analytics/index.js` line 157 | PASS |
| Single-hop, DOM-free, pure | Module comment explicitly states single-hop only; no `window`/`document` token | PASS |
| `TAIWAN_SEMI` preset has 5 real TSMC labels | Lines 221-228: `taiwan semiconductor manufacturing company (tsmc)`, `tsmc foundry capacity`, `tsmc (hbm4 and cowos collaboration)`, `tsmc n2 process technology`, `tsmc` | PASS |
| Exactly 7 companies impacted by TAIWAN_SEMI | Test `scenario.test.mjs` line 31-35: `assert.equal(result.impactedCompanies.length, 7)` — PASSES | PASS |
| `totalMarketCapExposed === 11360589871184` | Test derives sum from fixture nodes, asserts `=== 11360589871184` — PASSES | PASS |
| HHI 0.20→0.25 (k=5→4) for every firm | Test lines 49-58: all 7 firms assert `suppliersBefore=5`, `suppliersAfter=4`, `concentrationBefore≈0.2`, `concentrationAfter≈0.25` — PASSES | PASS |
| `excludeSuppliers` additive (undefined = legacy) | Test lines 86-99: `deepEqual(withUndef, legacy)` and `excluded.suppliers === base.suppliers - 1` — PASSES | PASS |
| Single `'tsmc'` label hits only KLAC | Test line 78-82: `assert.equal(result.impactedCompanies[0].symbol, "KLAC")` — PASSES | PASS |

### Scenario UI (#scenarioPanel)

| Check | Evidence | Status |
|-------|----------|--------|
| `#scenarioPanel` in index.html | Line 293: `<div id="scenarioPanel" role="region" ...>` | PASS |
| All 7 new IDs present | `scenarioPanel`, `scenarioSummary`, `scenarioImpactList`, `scenarioProv`, `bScenarioTaiwan`, `scenarioChokepointSelect`, `bScenarioReset` all found in index.html lines 293-303 | PASS |
| Headline derived live (no hardcoded 7/11.36 literals) | `js/ui/index.js` line 677-679: `result.impactedCompanies.length` + `result.totalMarketCapExposed / 1e12`; grep confirms no `11.36` or `7 companies impacted` literals; wiring test asserts both | PASS |
| `runScenario` + `SCENARIO_PRESETS` imported in ui | `js/ui/index.js` line 16: `import { companyConcentration, supplierCriticality, runScenario, SCENARIO_PRESETS } from "../analytics/index.js"` | PASS |
| `highlightImpacted` via `highlightBy(n => impacted.has(n.symbol))` | Lines 706-709 of `js/ui/index.js` | PASS |
| Taiwan preset button wired | Line 969: `document.getElementById("bScenarioTaiwan")?.addEventListener("click", runTaiwanScenario)` | PASS |
| Generalized chokepoint select populated + wired | Lines 956-968: `supplierCriticality({limit:8})` populates `<option>` elements via `textContent`; change event fires `runChokepointScenario` | PASS |
| Reset clears panel + graph | Lines 732-739: `resetHighlight()` + clear `scenarioSummary`/`scenarioImpactList`/`scenarioProv`/`select.value` | PASS |

---

## DEPTH-04 Verification (Provenance + Methodology)

| Check | Evidence | Status |
|-------|----------|--------|
| Scenario output carries `derived` provenance (never "Observed") | `js/ui/index.js` line 698: `provenanceFor({ derived: true, n }, { methodologyUrl: "#methodology" })` into `#scenarioProv` | PASS |
| `derived: true` path never produces "Observed" tag | Trust core routes `derived:true` to "Derived" badge; wiring test line 49-53 asserts `derived: true` in the UI code | PASS |
| Methodology modal documents single-hop limit | `index.html` line 123: "Single-hop only. The model reports direct dependents..." | PASS |
| Methodology documents HHI=1/k as monotonic delta | `index.html` line 124: "Concentration shift is reported as HHI = 1/k, which rises when a supplier is removed" | PASS |
| Methodology states exposure-not-loss | `index.html` line 125: "Market cap exposed is exposure, not a loss estimate" | PASS |
| Methodology documents TSMC label fragmentation | `index.html` line 126: "Taiwan semiconductor preset disables the real TSMC supplier-label variants" | PASS |

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `js/analytics/index.js` | `runScenario` + `SCENARIO_PRESETS.TAIWAN_SEMI` + `excludeSuppliers` opt | VERIFIED | All three present; 230 lines, fully substantive |
| `js/ui/index.js` | Scenario UI wiring (5 functions + bootstrap) | VERIFIED | `renderScenario`, `highlightImpacted`, `runTaiwanScenario`, `runChokepointScenario`, `resetScenario` all present and exported |
| `index.html` | `#scenarioPanel` markup + methodology block | VERIFIED | 7 new IDs at lines 293-303; methodology scenario block at lines 123-126 |
| `tests/scenario.test.mjs` | 9 assertions pinned to real fixtures | VERIFIED | 9/9 pass |
| `tests/scenario-wiring.test.mjs` | 6 wiring/provenance assertions | VERIFIED | 6/6 pass |
| `package.json` | Both test files registered in `scripts.test` | VERIFIED | Line 11 includes `tests/scenario.test.mjs tests/scenario-wiring.test.mjs` |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `js/ui/index.js` | `js/analytics/index.js` | `import { runScenario, SCENARIO_PRESETS }` | WIRED | Line 16 |
| `#bScenarioTaiwan` button | `runTaiwanScenario()` | `addEventListener("click")` | WIRED | Line 969 |
| `runTaiwanScenario` | `runScenario(TAIWAN_SEMI.disruption, ...)` | direct call | WIRED | Lines 713-719 |
| `renderScenario(result)` | `result.impactedCompanies.length` + `totalMarketCapExposed` | `textContent` assignment | WIRED | Lines 677-679 |
| `highlightImpacted(result)` | `highlightBy(n => impacted.has(n.symbol))` | `highlightBy` import | WIRED | Lines 706-709 |
| `#scenarioProv` | `provenanceFor({derived:true})` + `badgeHtml` | `innerHTML` | WIRED | Lines 697-700 |
| `scenarioChokepointSelect` | `runChokepointScenario(value)` | `change` event | WIRED | Lines 965-967 |
| `#bScenarioReset` | `resetScenario()` | `addEventListener("click")` | WIRED | Line 970 |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `renderScenario` | `result.impactedCompanies`, `result.totalMarketCapExposed` | `runScenario(disruption, {profiles:DATA.profiles, nodes:DATA.nodes})` | Yes — derived from `data/top100-map.json` profiles + nodes; test confirms `totalMarketCapExposed === 11360589871184` from fixture | FLOWING |
| `scenarioChokepointSelect` | `supplierCriticality({profiles, limit:8})` | `DATA.profiles` fan-in ranking | Yes — real fan-in count from actual supplier nodes | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `runScenario(TAIWAN_SEMI)` impacts exactly 7 companies | `node --test tests/scenario.test.mjs` | 9/9 PASS | PASS |
| `totalMarketCapExposed === 11360589871184` | Same run | PASS | PASS |
| HHI 0.20→0.25 monotonically for all 7 | Same run | PASS | PASS |
| UI wiring assertions (7 IDs, derived badge, no hardcoded literals) | `node --test tests/scenario-wiring.test.mjs` | 6/6 PASS | PASS |
| Full suite green at 257 | `npm test` | **257 pass / 0 fail** | PASS |

---

### Requirements Coverage

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| DEPTH-03 | At least one scenario stress-test runs over real data and shows downstream impact | SATISFIED | `runScenario` + `TAIWAN_SEMI` preset; 7 impacted companies; $11.36T exposed; UI panel live; 9 unit + 6 wiring tests green |
| DEPTH-04 | Every derived analytic carries provenance and is covered by tests | SATISFIED | `provenanceFor({derived:true})` → "Derived" badge on scenario output; methodology copy documents model limits; wiring test asserts provenance path; 257 total tests green |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | — |

No `TBD`, `FIXME`, `XXX`, `TODO`, `PLACEHOLDER`, `return null`, hardcoded empty arrays/objects, or stub implementations found in Phase 7 artifacts. The headline derives dynamically from `result.impactedCompanies.length` and `result.totalMarketCapExposed`; no `7` or `11.36` literals baked into the rendering path.

---

### Human Verification Required

None. All must-haves are programmatically verified:
- Engine correctness: unit tests pinned to frozen fixtures
- UI wiring: static-source string assertions
- Provenance: derived badge confirmed in source
- Test suite: 257/257 green

The Playwright smoke (`docs/perf/_scenario-smoke-0703.cjs`) was run by the executor and recorded PASS results for the full UI flow (live headline, 7 impact rows, Derived badge, graph highlight, reset, 0 console errors). That runtime evidence is in `07-03-SUMMARY.md`. No additional human verification items remain.

---

### Gaps Summary

None. All 3 success criteria verified against actual codebase artifacts with passing tests.

---

_Verified: 2026-06-21_
_Verifier: Claude (gsd-verifier)_
