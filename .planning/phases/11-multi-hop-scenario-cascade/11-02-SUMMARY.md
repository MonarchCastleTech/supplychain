---
phase: 11-multi-hop-scenario-cascade
plan: 02
subsystem: scenario-ui
tags: [scenario, ui, multi-hop, hop-breakdown, methodology, playwright-smoke, wiring-test]

# Dependency graph
requires:
  - phase: 11-multi-hop-scenario-cascade
    plan: 01
    provides: "runScenario maxHops param + byHop/maxHopReached/per-entry hop on the result"
  - phase: 07-scenario-engine
    provides: "#scenarioPanel markup, renderScenario, runTaiwanScenario/runChokepointScenario, Derived badge, methodology copy"
provides:
  - "#scenarioHopBreakdown panel id rendering a direct-vs-indirect hop split"
  - "live-derived multi-hop scenario headline (impactedCompanies.length + maxHopReached + totalMarketCapExposed)"
  - "runTaiwanScenario + runChokepointScenario opt into maxHops:3"
  - "methodology copy describing the bounded cycle-safe multi-hop model (keeping the literal 'direct dependents')"
  - "extended tests/scenario-wiring.test.mjs (hop-breakdown id + maxHops/byHop/maxHopReached + multi-hop methodology asserts)"
  - "docs/perf/_scenario-smoke-1102.cjs multi-hop Playwright smoke over real served data"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Additive panel id (#scenarioHopBreakdown) — preserves existing IDs + inline bootstrap (index-ui-integrity green)"
    - "Headline derived live from the multi-hop result; no hardcoded 8 / $13.28T / 7 / $11.36T literal in the UI path"
    - "escapeHtml on every label including the new per-row hop tag (T-11-03 / T-07-03)"

key-files:
  created:
    - docs/perf/_scenario-smoke-1102.cjs
  modified:
    - index.html
    - js/ui/index.js
    - tests/scenario-wiring.test.mjs

key-decisions:
  - "UI opts into maxHops:3 at both call sites; engine default stays 1 (11-01) so v1.0 fixtures stay byte-identical"
  - "Headline reads 'N companies impacted across H hop(s) · $X.XT exposed'; hop count from maxHopReached (= 2 for Taiwan)"
  - "Hop breakdown = byHop[1].length (direct) vs impactedCompanies.length - direct (indirect); Taiwan = 7 direct · 1 indirect (TSM at hop 2)"
  - "Methodology bullet retitled 'Bounded multi-hop cascade' but keeps the literal 'direct dependents' so the scenario-wiring /single-hop|direct dependents/i regex stays green"

requirements-completed: [CASC-02, CASC-03]

# Metrics
duration: 5min
completed: 2026-06-22
---

# Phase 11 Plan 02: Multi-Hop Scenario Panel + Methodology Summary

**The scenario panel now surfaces the bounded multi-hop cascade live: running the Taiwan preset (maxHops:3) renders "8 companies impacted across 2 hop(s) · $13.28T exposed" with a "7 direct · 1 indirect" hop split and the Derived badge, all derived from the engine result with no hardcoded numbers, and the Methodology copy explains the bounded cycle-safe model while keeping the literal phrase "direct dependents".**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-22T03:23Z
- **Completed:** 2026-06-22T03:29Z
- **Tasks:** 3 (Task 1 panel + wiring + methodology, Task 2 extended wiring tests + full-suite gate, Task 3 auto-approved human-verify smoke)
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments
- `#scenarioPanel` gained `#scenarioHopBreakdown` (additive id) rendering a direct-vs-indirect split; the subtitle now reads "multi-hop downstream cascade (bounded, cycle-safe)".
- `renderScenario` derives the headline live from `impactedCompanies.length` + `maxHopReached` + `totalMarketCapExposed` ("8 companies impacted across 2 hop(s) · $13.28T exposed"); the breakdown reads `byHop[1].length` direct vs the remainder indirect; each impact row is tagged `hop N`, escapeHtml on every label.
- `runTaiwanScenario` passes `{ ...TAIWAN_SEMI.disruption, maxHops: 3 }`; `runChokepointScenario` passes `{ disableSupplier: label, maxHops: 3 }`. `resetScenario` clears `#scenarioHopBreakdown`.
- Methodology bullet rewritten to "Bounded multi-hop cascade" — describes the hop-1 direct dependents, hop-2+ propagation, cycle-safe termination (visited set), and the at-most-N-hops bound (N=3), keeping the literal "direct dependents" and leaving the exposure-not-loss / HHI / TSMC bullets intact.
- Extended `tests/scenario-wiring.test.mjs` with 3 new asserts (hop-breakdown id; maxHops:3 + byHop + maxHopReached; multi-hop methodology signal + retained "direct dependents") without weakening existing forbidden-literal / single-hop asserts. Full suite: **313 pass / 0 fail** (310 baseline + 3 new).
- New `docs/perf/_scenario-smoke-1102.cjs` Playwright smoke over the real served site (http://, never file://) — recorded PASS: headline 8 / 2 hop(s) / $13.28T, breakdown "7 direct · 1 indirect", 8 impact rows, Derived badge (not Observed), 8 of 100 nodes highlighted, zero console/pageerror.

## Task Commits

1. **Task 1: Panel hop breakdown + maxHops:3 call sites + live headline + multi-hop methodology** - `967bf6d` (feat) — index.html, js/ui/index.js
2. **Task 2: Extend scenario-wiring tests; full-suite gate (313 pass / 0 fail)** - `711b169` (test) — tests/scenario-wiring.test.mjs
3. **Task 3: Multi-hop Playwright smoke over real served data (auto-approved human-verify)** - `c81c098` (test) — docs/perf/_scenario-smoke-1102.cjs

**Plan metadata:** (final commit)

## Files Created/Modified
- `index.html` - Added `#scenarioHopBreakdown` after `#scenarioSummary`; retitled subtitle to multi-hop; rewrote the methodology scenario bullet to the bounded cycle-safe multi-hop model (keeps "direct dependents").
- `js/ui/index.js` - Added `scenarioHopBreakdownEl` ref; rewrote `renderScenario` headline + hop split + per-row hop tag; `maxHops:3` at both call sites; cleared the breakdown in `resetScenario`; updated the doc comment.
- `tests/scenario-wiring.test.mjs` - 3 new asserts (hop-breakdown id, maxHops/byHop/maxHopReached wiring, multi-hop methodology + retained literal).
- `docs/perf/_scenario-smoke-1102.cjs` - New multi-hop scenario smoke harness.

## Decisions Made
- **UI opts into maxHops:3, engine default stays 1:** v1.0 fixtures/memo tests remain byte-identical; multi-hop is an explicit UI choice (11-01 contract).
- **Hop split = byHop[1] direct vs remainder indirect:** Taiwan = 7 direct (hop 1) · 1 indirect (TSM at hop 2 via AMAT).
- **Methodology keeps "direct dependents":** required by the scenario-wiring `/single-hop|direct dependents/i` regex; the bullet now describes hop-1 direct dependents then propagation, so the phrase is honest in the multi-hop framing.

## Deviations from Plan

None — plan executed exactly as written. All three tasks delivered the planned artifacts; no auto-fixes (Rules 1-3) were required and no architectural decisions (Rule 4) arose.

## Known Stubs
None — the panel is wired to the live `runScenario` result; no placeholder/mock data in the scenario path.

## Threat Flags
None — no new network endpoints, auth paths, or schema changes. The only new render path (per-row hop tag + hop breakdown) applies the existing `escapeHtml` to every label (T-11-03 mitigated). Headline derives from the engine result; wiring test forbids the 11.36 / "7 companies impacted" literals (T-11-04 mitigated).

## Issues Encountered
- None. The base 07-03 smoke asserted the old single-hop values (7 / $11.36T / 7 rows); rather than weaken it, a dedicated 11-02 multi-hop smoke was added asserting the new derived values.

## User Setup Required
None — buildless, frozen data, zero new packages (playwright + http-server already present).

## Next Phase Readiness
- Phase 11 (multi-hop scenario cascade) is complete: engine (11-01) + UI/methodology (11-02). CASC-01..04 all satisfied.
- No blockers. Full suite green at 313 pass / 0 fail; live multi-hop behavior verified via smoke.

## Self-Check: PASSED

- FOUND: index.html (#scenarioHopBreakdown)
- FOUND: js/ui/index.js (maxHops:3 + renderScenario hop split)
- FOUND: tests/scenario-wiring.test.mjs (extended asserts)
- FOUND: docs/perf/_scenario-smoke-1102.cjs
- FOUND: .planning/phases/11-multi-hop-scenario-cascade/11-02-SUMMARY.md
- FOUND commit: 967bf6d (feat)
- FOUND commit: 711b169 (test)
- FOUND commit: c81c098 (test)

---
*Phase: 11-multi-hop-scenario-cascade*
*Completed: 2026-06-22*
