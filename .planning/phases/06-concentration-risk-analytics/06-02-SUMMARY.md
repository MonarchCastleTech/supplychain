---
phase: 06-concentration-risk-analytics
plan: 02
subsystem: trust + ui + viz display wiring
tags: [derived-provenance, concentration, chokepoints, fan-in, badge, highlight, methodology, esm, node-test]

# Dependency graph
requires:
  - phase: 06-concentration-risk-analytics
    provides: js/analytics/index.js (companyConcentration, supplierCriticality, buildSupplierFanIn)
  - phase: 02-trust-provenance
    provides: js/trust/index.js (provenanceFor, badgeHtml, http-only URL guard)
provides:
  - js/trust derived provenance tag (provenanceFor branch-0 + badgeHtml "Derived", never "Observed")
  - Profile-panel supplier-concentration line + Derived badge (#cardConcentration)
  - Critical chokepoints panel (#chokepointsPanel) listing top suppliers by real fan-in + graph highlight via highlightBy
  - Methodology modal copy for both formulas incl. the equal-weight HHI=1/k limit
affects: [future phases consuming derived-tagged figures, any panel reusing the chokepoint highlight]

# Tech tracking
tech-stack:
  added: []  # zero new packages
  patterns:
    - Derived figures honestly tagged via the existing trust vocabulary (extend provenanceFor, never fork)
    - UI imports pure analytics; math stays DOM-free in js/analytics
    - Chokepoint highlight reuses the existing viz highlightBy with a normalized-label predicate

key-files:
  created: []
  modified:
    - js/trust/index.js
    - js/ui/index.js
    - index.html
    - tests/criticality-wiring.test.mjs

key-decisions:
  - "derived is branch-0 of provenanceFor (before marketcap) and maps to label 'Derived' / class confidence-medium — test-enforced to never be 'Observed'"
  - "methodologyUrl defaults to the in-page '#methodology' anchor; per the existing http-only guard a non-http anchor degrades the badge to label-only (no <a>) — no new XSS surface"
  - "js/viz needs no change: the existing highlightBy already accepts arbitrary predicates; the chokepoint predicate (kind==='supplier' && normalizeEntityLabel match) lives in js/ui"
  - "index.html gains NEW IDs only (#cardConcentration, #chokepointsPanel/#chokepointsList, #bChokepoints/#bChokepointsReset); all prior IDs + inline bootstrap preserved (index-ui-integrity green)"

requirements-completed: [DEPTH-01, DEPTH-02]

# Metrics
duration: ~15min
completed: 2026-06-21
---

# Phase 6 Plan 02: Concentration Display & Derived Provenance Summary

**A `derived` provenance tag was added to js/trust (provenanceFor branch-0 + badgeHtml "Derived", never "Observed"), then the Plan-01 analytics were wired into the UI: a "Supplier concentration: NN/100" line with a Derived badge in the profile, a Critical chokepoints panel ranking suppliers by real fan-in with a graph highlight, and Methodology copy documenting both formulas plus the equal-weight HHI=1/k limit.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-06-21
- **Tasks:** 2 (Task 1 TDD: derived provenance; Task 2: UI/viz/html wiring)
- **Files modified:** 4

## Accomplishments
- **Derived provenance (js/trust):** `provenanceFor({derived:true, n})` returns `{tag:'derived', note:'computed from N relationship(s)', source?}` — singular/plural note, `n` defaults to 0 for missing/non-finite, source only when `ctx.methodologyUrl` is present (never throws). `badgeHtml` maps `derived → "Derived"` (confidence-medium), reusing the existing `url.startsWith('http')` guard + `rel="noopener noreferrer"`. A derived number can NEVER render as "Observed" (asserted via `doesNotMatch`).
- **Profile concentration line (js/ui):** `renderCardInsights` computes `companyConcentration(symbol, {profiles: DATA.profiles})` and renders "Supplier concentration NN/100 (HHI-based)" + the Derived badge into the new `#cardConcentration` host.
- **Chokepoints panel (js/ui + index.html):** `renderChokepoints()` lists `supplierCriticality({limit:8})` rows (every supplier label escaped, integer fan-in shown) into `#chokepointsList`; `#bChokepoints` calls `highlightBy` with a predicate matching global supplier nodes whose normalized label is in the chokepoint set; `#bChokepointsReset` calls `resetHighlight`.
- **Methodology copy (index.html):** new "Supplier concentration (derived)" section with `C = round(100·(0.6·HHI + 0.4·sharedFrac))` and an explicit statement of the equal-weight limit (no per-supplier volume; `l.v=2` constant → HHI=1/k), plus a "Critical chokepoints (derived)" section explaining fan-in (top = 4).
- **Tests:** 11 new assertions in `tests/criticality-wiring.test.mjs` (6 derived-provenance + 5 ui/viz/html string-wiring). Full suite: **242 pass / 0 fail** (231 prior + 11 new).

## Task Commits

1. **Task 1 RED: failing derived-provenance assertions** - `aee630b` (test)
2. **Task 1 GREEN: derived provenance branch in js/trust** - `a0b60a7` (feat)
3. **Task 2: concentration + chokepoints + methodology wiring** - `0c3870c` (feat)

## Files Created/Modified
- `js/trust/index.js` - Added branch-0 `derived` to `provenanceFor`; extended `badgeHtml` label/class maps with `derived → "Derived"`/confidence-medium (http-only guard preserved).
- `js/ui/index.js` - Imported `companyConcentration`/`supplierCriticality` + `normalizeEntityLabel`; concentration line in `renderCardInsights`; `renderChokepoints`/`highlightChokepoints`; wired `#bChokepoints`/`#bChokepointsReset` in `wireUI`; exports updated.
- `index.html` - New `#cardConcentration` host; `#chokepointsPanel`/`#chokepointsList` + `#bChokepoints`/`#bChokepointsReset`; Methodology concentration + criticality copy.
- `tests/criticality-wiring.test.mjs` - 11 new derived-provenance + string-wiring assertions.

## Decisions Made
- `derived` placed as branch-0 of `provenanceFor` (before the marketcap check), exactly per RESEARCH Pattern 2.
- js/viz left unchanged — the existing `highlightBy(fn)` already supports arbitrary predicates; the chokepoint predicate is composed in js/ui (which owns DATA + `normalizeEntityLabel`).
- Methodology anchor uses the in-page `#methodology` URL; per the http-only guard the badge degrades to label-only (no `<a>`), which is the honest/safe default for a same-page anchor.

## Deviations from Plan
None - plan executed exactly as written. The js/viz artifact requirement (`contains: "highlightBy"`) was satisfied by the existing export; no source change was required there.

## Threat Surface
- T-06-03 (supplier-label innerHTML): every interpolated supplier label in the chokepoints panel passes through `escapeHtml`; fan-in is an integer from pure math.
- T-06-04 (derived badge link): reuses `badgeHtml`'s existing `url.startsWith("http")` guard + `rel="noopener noreferrer"`; the non-http `#methodology` anchor emits no `<a>`.
- T-06-05 (derived-as-observed spoofing): `provenanceFor` never returns observed for derived input and `badgeHtml` maps derived→"Derived" — both test-enforced (`doesNotMatch(/Observed/)`).
No new threat surface beyond the registered model.

## Known Stubs
None — the concentration score, chokepoint fan-in counts, and Methodology numbers are all real computed/dataset values.

## Issues Encountered
None.

## User Setup Required
None - buildless static site, no external service configuration.

## Next Phase Readiness
- Phase 06 has one plan remaining (06-03, 3 of 3). The analytics engine + derived trust vocabulary are now fully wired into the profile, the chokepoints panel, and the Methodology copy.

## Self-Check: PASSED

---
*Phase: 06-concentration-risk-analytics*
*Completed: 2026-06-21*
