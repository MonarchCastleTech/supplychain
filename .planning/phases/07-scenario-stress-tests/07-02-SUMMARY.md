---
phase: 07-scenario-stress-tests
plan: 02
subsystem: ui
tags: [scenario, runScenario, taiwan-semi, highlightBy, derived-provenance, methodology, depth-03, depth-04]

# Dependency graph
requires:
  - phase: 07-scenario-stress-tests (Plan 01)
    provides: "runScenario(disruption, ctx), SCENARIO_PRESETS.TAIWAN_SEMI, supplierCriticality"
  - phase: 06 (trust core)
    provides: "provenanceFor({derived:true,n}) + badgeHtml → 'Derived' badge"
provides:
  - "#scenarioPanel UI slice: Taiwan preset button + generalized chokepoint <select> + reset"
  - "Live impact headline ('N companies impacted · $X.XXT market cap exposed') derived from runScenario, never hardcoded"
  - "Impact list (lost / suppliers before→after / HHI before→after) escaped before innerHTML"
  - "highlightImpacted(result) → highlightBy(n => impacted.has(n.symbol)) graph highlight"
  - "Phase-6 'Derived' provenance badge on scenario output (never 'Observed') with Methodology link"
  - "Methodology modal scenario block: single-hop, HHI=1/k, exposure-not-loss, TSMC label set"
  - "tests/scenario-wiring.test.mjs registered + green (6 wiring/provenance/copy assertions)"
affects: [phase-08, scenario, ui, methodology]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Scenario UI mirrors #chokepointsPanel exactly (panel + .cActions trio + bootstrap order); append-only, NEW IDs only"
    - "Headline derived live from result.impactedCompanies.length + totalMarketCapExposed (no baked literals; T-07-05)"
    - "<select> options use textContent (inherently safe); innerHTML impact list escaped via escapeHtml (T-07-03)"

key-files:
  created:
    - tests/scenario-wiring.test.mjs
    - .planning/phases/07-scenario-stress-tests/07-02-SUMMARY.md
  modified:
    - index.html
    - js/ui/index.js
    - package.json

key-decisions:
  - "Impact list shows lost-count + suppliers before→after + HHI before→after (per RESEARCH HHI-display recommendation: 2-decimal HHI plus suppliers for legibility)"
  - "#scenarioProv badge lives in the .cSecTitle header (mirrors the company-card concentration badge placement)"
  - "<select> option labels use textContent (not innerHTML), so escapeHtml is reserved for the renderScenario innerHTML path — avoids double-escaping entities while keeping XSS mitigation on the only HTML-parsed sink"
  - "runChokepointScenario(label) uses disableSupplier (single) for the generalized control; Taiwan preset uses the bundled disableSuppliers union"

patterns-established:
  - "Scenario panel is global-mode chrome; highlight only takes effect in global mode (documented in-code, mirrors chokepoints UX)"
  - "resetScenario clears summary/list/prov + resets the select + resetHighlight in one handler"

requirements-completed: [DEPTH-03, DEPTH-04]

# Metrics
duration: ~12 min
completed: 2026-06-21
---

# Phase 7 Plan 02: Scenario UI Slice (#scenarioPanel + derived provenance) Summary

**Interactive what-if disruption UI: a #scenarioPanel mirroring #chokepointsPanel runs the Plan-01 `runScenario` engine, renders a live "7 companies impacted · $11.36T market cap exposed" headline (derived, never hardcoded) + impact list, highlights impacted firms via `highlightBy`, badges output "Derived" with a Methodology link, and ships honest single-hop / HHI / exposure-not-loss methodology copy — full suite green at 257.**

## Performance

- **Duration:** ~12 min
- **Completed:** 2026-06-21T12:44:09Z
- **Tasks:** 3 (RED spec → markup → wiring GREEN)
- **Files modified:** 4 (index.html, js/ui/index.js, package.json, tests/scenario-wiring.test.mjs)

## Accomplishments
- `#scenarioPanel` added as a sibling of `#chokepointsPanel` with all 7 new IDs (`scenarioPanel`, `scenarioSummary`, `scenarioImpactList`, `scenarioProv`, `bScenarioTaiwan`, `scenarioChokepointSelect`, `bScenarioReset`) — NEW IDs only, inline bootstrap + all prior IDs intact (index-ui-integrity stays green at 5/5).
- `renderScenario` / `highlightImpacted` / `runTaiwanScenario` / `runChokepointScenario` / `resetScenario` wired into `js/ui/index.js`; analytics import extended with `runScenario, SCENARIO_PRESETS`.
- Live headline derived from `result.impactedCompanies.length` + `result.totalMarketCapExposed` (`/1e12 .toFixed(2)`) — no `7` / `11.36` literal anywhere (T-07-05 enforced by test).
- Impacted companies highlighted in the global graph via `highlightBy(n => impacted.has(n.symbol))`; reset returns via the already-wired `resetHighlight`.
- Scenario output badged **Derived** (`provenanceFor({derived:true, n})` + `badgeHtml`, Methodology link `#methodology`) into `#scenarioProv` — never "Observed".
- Generalized chokepoint `<select>` populated at bootstrap from `supplierCriticality({profiles, limit:8})`; change → `runChokepointScenario(value)`.
- Methodology modal gained a "Scenario stress-tests (derived)" block: single-hop / direct-dependents, HHI=1/k monotonic delta (composite excluded — non-monotonic), "market cap exposed" = exposure not loss, Taiwan preset disables real TSMC label variants.
- `tests/scenario-wiring.test.mjs` registered in `package.json` and green (6 assertions).

## Task Commits

Each task was committed atomically:

1. **Task 0: Register + failing scenario-wiring spec (RED)** - `0ead830` (test)
2. **Task 1: #scenarioPanel markup + methodology scenario block** - `786b2b4` (feat)
3. **Task 2: Wire render/highlight/preset + chokepoint select (GREEN)** - `d3fd80d` (feat)

## Files Created/Modified
- `tests/scenario-wiring.test.mjs` - 6 string/wiring assertions: 7 new IDs, analytics import, highlightBy impacted predicate, derived badge into #scenarioProv, methodology copy (single-hop + HHI + exposure-not-loss + TSMC), derive-live guard forbidding 7/11.36 literals.
- `index.html` - #scenarioPanel (sibling of #chokepointsPanel) + methodology "Scenario stress-tests (derived)" block.
- `js/ui/index.js` - runScenario/SCENARIO_PRESETS import, 5 scenario DOM refs, renderScenario/highlightImpacted/runTaiwanScenario/runChokepointScenario/resetScenario, bootstrap wiring (select population + 3 listeners), exports.
- `package.json` - registered tests/scenario-wiring.test.mjs in scripts.test.

## Decisions Made
- Impact list shows lost-count + suppliers before→after + HHI before→after (RESEARCH HHI-display recommendation: 2-decimal HHI + suppliers for legibility).
- `<select>` option labels use `textContent` (inherently safe — no HTML parse), so `escapeHtml` is applied only on the `renderScenario` innerHTML path (T-07-03); avoids double-escaping while keeping the XSS mitigation on the one HTML-parsed sink.
- `#scenarioProv` badge placed in the `.cSecTitle` header (mirrors company-card concentration badge placement).

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Threat Surface
- T-07-03 (XSS on impact list / select) — mitigated: `escapeHtml` on every company/supplier label before innerHTML; select uses safe `textContent`.
- T-07-04 (mis-tagged Observed / "loss" copy) — mitigated: `provenanceFor({derived:true})` → "Derived"; summary + methodology say "exposed"/"exposure, not a loss estimate".
- T-07-05 (hardcoded 7/$11.36T headline) — mitigated: headline derived from result fields; scenario-wiring test forbids `11.36` and `7 companies impacted` literals.

No new threat surface beyond the plan's threat_model.

## Known Stubs
None — the panel computes from real `runScenario` output over the frozen dataset.

## Next Phase Readiness
- The Plan-01 engine is now fully user-facing: a real user can run the Taiwan preset or any top-8 chokepoint and see live derived downstream impact + graph highlight + honest provenance.
- Phase 07 (DEPTH-03 + DEPTH-04) complete. Full suite green at 257 (251 prior + 6 new).

## Verification
- `node --test tests/scenario-wiring.test.mjs` → 6/6 pass.
- `npm test` → 257 pass / 0 fail; exit 0.
- `node --test tests/index-ui-integrity.test.mjs` → 5/5 (all prior IDs + inline bootstrap intact).
- `node --check js/ui/index.js` → syntax ok.

## Self-Check: PASSED

- FOUND: tests/scenario-wiring.test.mjs, index.html, js/ui/index.js, 07-02-SUMMARY.md
- FOUND commits: 0ead830 (RED), 786b2b4 (markup), d3fd80d (wiring GREEN)

---
*Phase: 07-scenario-stress-tests*
*Completed: 2026-06-21*
