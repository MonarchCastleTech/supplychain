---
phase: 09-mobile-keyboard-accessibility
plan: 01
subsystem: ui-responsive
tags: [responsive, mobile, a11y, css, perf-02]
requires:
  - "Phase 5-7 panels (#chokepointsPanel/#scenarioPanel), toolbar buttons, #mobileSheet, wireMobile"
provides:
  - "position:fixed token layout for #chokepointsPanel/#scenarioPanel (no header overlap)"
  - "@media(max-width:768px) responsive rules for new panels + filter + hero + modals"
  - "4 wired mobile-sheet controls (mMethodology/mTour/mChokepoints/mScenario)"
  - "registered Node static a11y test + Playwright placeholder spec"
affects: [styles/layout.css, styles/theme.css, index.html, js/ui/index.js, package.json]
tech-stack:
  added: []
  patterns: ["token-anchored position:fixed panels", "extend existing @media block (no duplicate)", "wireMobile delegation to toolbar buttons"]
key-files:
  created:
    - tests/mobile-keyboard-a11y.test.mjs
    - tests/mobile-keyboard.spec.mjs
  modified:
    - styles/layout.css
    - styles/theme.css
    - index.html
    - js/ui/index.js
    - package.json
decisions:
  - "Docked panels bottom-left on desktop, left/right-inset bottom-anchored on mobile (RESEARCH A1)"
  - "Registered Playwright spec as a skipped placeholder so both files are in scripts.test without breaking the suite (full journey deferred to 09-03)"
metrics:
  duration: "~3 min"
  completed: 2026-06-21
---

# Phase 9 Plan 01: Mobile Responsive Layout + Mobile-Sheet Controls Summary

PERF-02 fix: gave the previously-unstyled `#chokepointsPanel`/`#scenarioPanel` real `position:fixed` token-anchored layout (no more static-flow overlap of the fixed `#top`/`#bar` on any viewport), extended the existing `@media(max-width:768px)` block to make the new panels, `#filterPanel`, `#heroOverlay`, and the help/methodology/compare modals usable on a phone, and added the 4 missing controls (Methodology/Tour/Chokepoints/Scenario) to `#mobileSheet` wired through the existing `wireMobile` helper so they are reachable when the toolbar is hidden ≤768px.

## What Was Built

| Task | Description | Commit |
|------|-------------|--------|
| 0 | Author + register Node static a11y test (RED on panel/sheet/css asserts) + Playwright placeholder spec | 141f483 |
| A | `position:fixed` layout for new panels + `@media(max-width:768px)` rules for panels/filter/hero/modals | 357036d |
| B | 4 new `#mobileSheet` buttons + `wireMobile` wiring | 598fd57 |

## Key Implementation Details

- **layout.css**: `#chokepointsPanel,#scenarioPanel{position:fixed;left:var(--space-6);z-index:95;width:280px;max-height:38vh;overflow-y:auto;...}` with distinct `bottom` offsets so the two panels never overlap each other or the header. Uses only Phase-4 tokens (`--space-5/6`, `--radius-lg`, `--color-surface-raised`).
- **theme.css**: extended (not duplicated) the existing `@media(max-width:768px)` block — panels become left/right-inset bottom-anchored with bounded `max-height`; `#filterPanel` and `#heroOverlay` get usable full-width insets; help/methodology modals get mobile content width and `#compareModal .grid` collapses to a single column.
- **index.html**: 4 static `<button type="button">` elements with `textContent` labels only (T-09-01 mitigation — no raw innerHTML).
- **js/ui/index.js**: `wireMobile("mMethodology"/"mTour"/"mChokepoints"/"mScenario", …)` delegating to `#bMethodology`/`#bTour`/`#bChokepoints`/`#bScenarioTaiwan`; reuses the existing auto-close.
- **package.json**: both new test files appended to the explicit `scripts.test` list (Pitfall 5).

## Deviations from Plan

### Rule 3 - Blocking issue: Playwright spec registration

- **Found during:** Task 0
- **Issue:** The non-negotiable requires BOTH test files registered in `scripts.test`, but `tests/mobile-keyboard.spec.mjs` (the full Playwright journey) is not authored until Phase 09-03. Registering a non-existent file makes `node --test` fail at module resolution and breaks `npm test`.
- **Fix:** Created `tests/mobile-keyboard.spec.mjs` as a registered no-op (`{ skip: true }`) placeholder. This satisfies "both files registered" while keeping the suite green; the real Playwright journey replaces the body in 09-03.
- **Files:** tests/mobile-keyboard.spec.mjs, package.json
- **Commit:** 141f483

## Verification

- `node --test tests/mobile-keyboard-a11y.test.mjs` → 8/8 pass (positioning, @media coverage, sheet controls, ARIA, focus ring)
- `node --test tests/index-ui-integrity.test.mjs` → green (existing IDs + inline bootstrap preserved; NEW IDs only added)
- `node --test tests/design-tokens.test.mjs` → 6/6 pass (token usage valid)
- `npm test` → **283 tests, 282 pass, 0 fail, 1 skipped** (the deferred Playwright placeholder). Original 275 preserved; `no-restart-invariant` and `macro-site-accessibility` (not in run list) untouched.

## Known Stubs

- `tests/mobile-keyboard.spec.mjs` — registered skipped placeholder; full Playwright 390×844 mobile + keyboard journey authored in Phase 09-03 (tracked in 09-RESEARCH "Wave 0 Gaps").

## Self-Check: PASSED

- FOUND: tests/mobile-keyboard-a11y.test.mjs
- FOUND: tests/mobile-keyboard.spec.mjs
- FOUND: commits 141f483, 357036d, 598fd57
