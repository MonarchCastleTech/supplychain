---
phase: 03-confidence-methodology-freshness
plan: 03
subsystem: ui
tags: [methodology-modal, accessibility, dialog, focus-trap, freshness, single-owner, trust]

# Dependency graph
requires:
  - phase: 03-confidence-methodology-freshness (plan 01)
    provides: "Rich served data shape (meta.generatedAt/lastUpdated) + registered Phase-3 test slots"
  - phase: 03-confidence-methodology-freshness (plan 02)
    provides: "viz-side freshness fix — js/viz render() no longer writes #lastUpdated"
provides:
  - "Accessible #methodologyModal (role=dialog, aria-modal, focus trap, ESC + close) with honest real-fact copy"
  - "Reachable #bMethodology entry button in the control bar next to Help"
  - "openMethodology/closeMethodology in js/ui + wireUI bindings + ESC branch + exports"
  - "Confirmed js/ui updateStatusIndicator is the SOLE live #lastUpdated owner"
  - "tests/methodology-wiring.test.mjs (7 cases) + tests/freshness-wiring.test.mjs (5 cases)"
affects: [phase-4-design-system, methodology, freshness]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Methodology modal reuses the existing openModal/closeModal/trapFocus + global ESC/Tab keydown infra (no new modal logic)"
    - "Modal close wired via addEventListener in wireUI (no inline-onclick window shim needed)"
    - "Modal CSS reuses #helpModal selectors (appended #methodologyModal to each rule) — minimal accessible styling, no design-system polish"
    - "Single-owner freshness: js/ui updateStatusIndicator reads live window.SUPPLY_MAP_DATA.meta each call; js/viz writes 0 times"

key-files:
  created:
    - tests/freshness-wiring.test.mjs
  modified:
    - index.html
    - js/ui/index.js
    - styles/components.css
    - styles/theme.css
    - tests/methodology-wiring.test.mjs

key-decisions:
  - "Wired the modal close via addEventListener in wireUI (preferred path) instead of an inline onclick, avoiding a new window.* shim entry."
  - "No js/ui freshness code change needed — updateStatusIndicator already reads live meta.generatedAt and is the sole #lastUpdated writer (viz duplicate removed in 03-02). Plan 03-03 only regression-guards it."
  - "Reused #helpModal CSS selectors for #methodologyModal so the modal is hidden by default (display:none) and styled consistently — no new design tokens."

patterns-established:
  - "New modals append their selector to existing helpModal CSS rules rather than introducing bespoke styles"
  - "Modal a11y is centralized in js/ui (openModal/trapFocus/ESC branch); new modals add one ref + one ESC branch + wireUI bindings"

requirements-completed: [TRUST-04, TRUST-05, TRUST-06]

# Metrics
duration: ~12min
completed: 2026-06-21
---

# Phase 3 Plan 03: Methodology Modal + Freshness Single-Owner Summary

**Accessible Methodology modal (role=dialog, focus trap, ESC/close) stating the real dataset facts (407 sources, 120 high / 3,447 medium qualifiers, ~131 dated sources, 75 dangling FKs, weighting + age-decay + observed/estimated/unknown), reachable from a #bMethodology control-bar button, plus a regression test proving js/ui is the sole live #lastUpdated owner.**

## Performance

- **Duration:** ~12 min
- **Completed:** 2026-06-21
- **Tasks:** 2
- **Files modified:** 5 (1 created, 4 modified)

## Accomplishments
- Added `#methodologyModal` (role=dialog, aria-modal, aria-labelledby, tabindex=-1) mirroring `#helpModal`, with honest sections: Data sources, Confidence weighting, Age decay, Badge semantics, Known limits.
- Added a reachable `#bMethodology` entry button in the control bar next to Help.
- Wired `openMethodology`/`closeMethodology` in `js/ui`, registered click bindings + backdrop-close in `wireUI`, added a methodology branch to the global ESC keydown handler, and exported both functions.
- Confirmed `js/ui updateStatusIndicator` is the single live `#lastUpdated` owner (reads `window.SUPPLY_MAP_DATA.meta.generatedAt`; `js/viz` writes it 0 times) and regression-guarded it.
- Authored `tests/methodology-wiring.test.mjs` (7 cases) + `tests/freshness-wiring.test.mjs` (5 cases), replacing the Plan-01 placeholders.

## Task Commits

Each task was committed atomically:

1. **Task 1: Methodology modal + openMethodology wiring + real-fact copy** - `c174b18` (feat)
2. **Task 2: Freshness single-owner confirmation + freshness/methodology tests** - `eea71c3` (test)

## Files Created/Modified
- `index.html` - Added `#methodologyModal` dialog with real-fact copy + `#bMethodology` entry button.
- `js/ui/index.js` - `methodologyModalEl` ref, `openMethodology`/`closeMethodology`, wireUI bindings (button + close + backdrop), ESC branch, exports.
- `styles/components.css` - Appended `#methodologyModal` to the `#helpModal` selector group (hidden by default + styled).
- `styles/theme.css` - Added `#methodologyModal` to the print-hide rule.
- `tests/methodology-wiring.test.mjs` - Modal a11y + real-fact copy + entry-point/ESC wiring assertions (7 cases).
- `tests/freshness-wiring.test.mjs` - Live meta binding + single #lastUpdated owner (viz write absent) + no-hardcoded-date assertions (5 cases).

## Decisions Made
- Close wired via `addEventListener` (avoids an inline-onclick window shim).
- No freshness code change required — owner was already correct after 03-02; this plan only proves it via test.
- Methodology CSS reuses helpModal selectors (no new design system work, per Phase-4 deferral).

## Deviations from Plan

None - plan executed exactly as written. (The freshness owner was already single + live after Plan 02; Plan 03 added only the confirming regression test, exactly as the plan's Task 2(a) anticipated.)

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Methodology modal + freshness indicator are honest, accessible, and regression-guarded.
- Phase-4 may apply design-system styling to the modal/freshness (currently minimal, reusing helpModal styles).
- Full suite: 178 pass / 0 fail.

## Self-Check: PASSED

---
*Phase: 03-confidence-methodology-freshness*
*Completed: 2026-06-21*
