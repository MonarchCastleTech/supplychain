---
phase: 09-mobile-keyboard-accessibility
plan: 03
subsystem: testing
tags: [playwright, e2e, mobile, keyboard, a11y, focus-trap, touch, d3, perf-02, perf-03]

requires:
  - phase: 09-01
    provides: "position:fixed responsive panels, 4 mobile-sheet controls, registered Playwright placeholder spec"
  - phase: 09-02
    provides: "hero overlay routed through activeModal/trapFocus, openHeroOverlay/closeHeroOverlay helpers, keyboard journey wiring"
provides:
  - "Real Playwright 390x844 hasTouch spec: node tap -> profile, mobile sheet reachable (PERF-02)"
  - "Keyboard-only journey assertion: '/' -> type -> Enter (select) -> Escape (reset), accessible-name gate (PERF-03)"
  - "Hero overlay focus-trap assertion: focus moves inside #heroOverlay on open and Tab stays trapped (never #bReset)"
  - "Touch-tap activation for graph nodes (d3.drag end-handler recovery) — tapping a node now opens its profile on touch"
  - "Reliable hero focus-in on open (next-frame focus so the trap engages)"
  - "Full suite green at 294 pass / 0 fail with both Phase-9 test files running"
affects: [phase-10-launch, tests]

tech-stack:
  added: []
  patterns:
    - "node:test before/after spins a 127.0.0.1 ephemeral http-server; closed in after (no file://)"
    - "chromium.launch wrapped in launchOrSkip -> t.skip with logged note when binary absent (Node a11y is the structural fallback gate)"
    - "returning-visitor baseline via addInitScript (heroSeen/onboardingSeen pre-set) so no auto-overlay covers the canvas before a test acts"
    - "tap an overlay-free node by elementFromPoint hit-test, then Playwright .tap() gesture (not a synthetic coordinate click)"
    - "touch tap -> node activation recovered in the d3.drag end handler (clickDistance + sourceEvent touch check), not a separate touchstart listener (avoids double-fire)"

key-files:
  created: []
  modified:
    - tests/mobile-keyboard.spec.mjs
    - js/viz/index.js
    - js/ui/index.js

key-decisions:
  - "Recover the touch tap inside d3.drag's own end handler rather than adding a competing touchstart/touchend pair — d3.drag stopImmediatePropagation blocks later same-type listeners, so integrating with drag is the only reliable path"
  - "Defer hero focus-in to requestAnimationFrame (microtask fallback) because focusing #heroSkip synchronously, in the same task that un-hides the overlay, silently no-ops in Chromium"
  - "Suppress the first-visit auto-tour/onboarding in tests via init script so the assertions run against a clean canvas (mirrors a returning visitor; the Tour is still replayable on demand)"
  - "package.json scripts.test already registered the spec in 09-01 (no change needed); the placeholder body was replaced in place"

patterns-established:
  - "Served-origin Playwright smoke with graceful chromium-missing skip + Node static fallback gate"
  - "d3.drag end-handler tap detection for touch activation on force-graph nodes"

requirements-completed: [PERF-02, PERF-03]

duration: ~35min
completed: 2026-06-21
---

# Phase 9 Plan 03: Playwright Mobile + Keyboard + Focus-Trap Gate Summary

**A real 390x844 hasTouch Playwright spec that taps a node to open its profile, drives the keyboard-only `/`-type-Enter-Escape journey, and asserts the hero overlay traps focus — plus two real-defect fixes (touch tap on a node did nothing; hero focus-in no-opped) it surfaced, with the full suite green at 294/294.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-06-21T16:38Z
- **Completed:** 2026-06-21T17:13Z
- **Tasks:** 3 (Task A spec+fixes, Task B green gate, Task C human-verify checkpoint — auto-approved)
- **Files modified:** 3

## Accomplishments
- Authored `tests/mobile-keyboard.spec.mjs` (234 lines, replacing the 09-01 skip placeholder) with three browser tests served over a 127.0.0.1 ephemeral http-server: (1) PERF-02 390x844 hasTouch — mobile sheet reachable + 4 new controls present + node tap opens `#companyCard`; (2) PERF-03 keyboard-only — `/` focuses `#q`, type "AAPL", Enter opens the profile, Tab+Escape resets, and every new control has a non-empty `aria-label`; (3) PERF-03 focus trap — opening the Tour moves focus inside `#heroOverlay` and 6× Tab never leaks (never lands on `#bReset`), Escape closes it.
- Fixed a **real mobile defect** (Rule 1): tapping a node did nothing on touch because `d3.drag()` preventDefaults the touchstart and suppresses the synthesized click. Recovered the stationary touch tap inside the drag `end` handler.
- Fixed a **real focus defect** (Rule 1): the hero focus-in silently no-opped because `#heroSkip` was focused synchronously in the same task that un-hides the overlay; deferred focus to the next frame so the trap actually engages.
- Full suite green: **294 pass / 0 fail / 0 skipped** — both Phase-9 test files run; chromium present so the Playwright spec ran (did not skip).
- Graceful degradation preserved: if the chromium binary is absent, each Playwright test logs a note and `t.skip`s, leaving `tests/mobile-keyboard-a11y.test.mjs` as the structural fallback gate (suite stays 0-fail).

## Task Commits

1. **Task A: Author + register the Playwright spec (+ 2 Rule-1 fixes)** — `a8eed80` (test)
2. **Task B: Full-suite green gate** — verification-only, no file change (294/294, see Verification)
3. **Task C: human-verify checkpoint** — auto-approved under AUTO_MODE (no file change)

**Plan metadata:** committed with this SUMMARY + STATE.md + ROADMAP.md + REQUIREMENTS.md.

## Files Created/Modified
- `tests/mobile-keyboard.spec.mjs` - Replaced the skip placeholder with the real 390x844 mobile + keyboard-only + focus-trap smoke (served origin, chromium-skip fallback).
- `js/viz/index.js` - Touch-tap node activation recovered in the d3.drag `end` handler (`.clickDistance(TAP_SLOP)` + `nodeDragStart` tracking + touch-only `sourceEvent` check); extracted shared `activateNode(ev, d)` used by both mouse click and touch tap.
- `js/ui/index.js` - `openHeroOverlay()` now defers the focus-in to `requestAnimationFrame` (microtask fallback) and re-checks `activeModal` before moving focus, so the overlay is rendered before `#heroSkip.focus()` runs.

## Decisions Made
- Integrate touch-tap detection into d3.drag's own `start`/`end` rather than adding a separate `touchstart`/`touchend` pair: d3.drag registers same-type listeners first and `stopImmediatePropagation`s, so a later `.on("touchend")` never fired (verified empirically — the handler's log never printed despite the native event reaching the node).
- Defer hero focus-in by one frame: a synchronous `.focus()` on an element transitioning out of `hidden`/`display:none` is a no-op in Chromium (verified: focus stayed on `#bTour`).
- Tests run as a returning visitor (init script sets `heroSeen`/`onboardingSeen`) so the first-visit auto-tour does not cover the canvas; the Tour is still explicitly replayable for the focus-trap test.
- For the mobile node tap, select an overlay-free node via `elementFromPoint` hit-testing and use the Playwright `.tap()` gesture (a synthetic coordinate `touchscreen.tap` is swallowed by d3-zoom).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Touch tap on a node did not open its profile (mobile)**
- **Found during:** Task A (PERF-02 mobile test)
- **Issue:** `d3.drag()` on each node calls `preventDefault` on touchstart, which suppresses the browser's synthesized `click` on touch devices. The node's `.on("click")` (which calls `openProfile`) therefore never fired on a tap — tapping a node on a phone did nothing. This is exactly the mobile defect the PERF-02 gate exists to catch.
- **Fix:** Extracted the click logic into `activateNode(ev, d)`. Added tap recovery in the d3.drag `end` handler: track the start point in `start`, and on `end` for a TOUCH gesture that moved < `TAP_SLOP` (10px), call `activateNode`. Added `.clickDistance(TAP_SLOP)` so mouse still emits a real click. The branch is touch-only (checks `sourceEvent.type`/`pointerType`) so mouse never double-activates.
- **Files modified:** js/viz/index.js
- **Verification:** PERF-02 test now opens `#companyCard` on tap; `no-restart-invariant`, viz-motion, and all 294 suite tests stay green.
- **Committed in:** a8eed80

**2. [Rule 1 - Bug] Hero overlay focus-in no-opped on open (focus trap did not engage)**
- **Found during:** Task A (PERF-03 focus-trap test)
- **Issue:** `openHeroOverlay()` focused `#heroSkip` synchronously, but `heroRender` flips `hidden` off in the same JS task. An element transitioning out of `display:none` is not focusable until the browser commits the style/layout, so the focus call silently no-opped — focus stayed on `#bTour` and Tab could leak to background controls, defeating the PERF-03 trap.
- **Fix:** Defer the focus-in to `requestAnimationFrame` (Promise microtask fallback for no-rAF contexts), re-checking `activeModal === heroOverlayEl` before moving focus.
- **Files modified:** js/ui/index.js
- **Verification:** PERF-03 focus-trap test passes (focus lands inside `#heroOverlay`, 6× Tab stays trapped, never reaches `#bReset`); hero-wiring (which asserts `#heroSkip` initial focus) and narrative tests stay green (51/51 in the focused run).

---

**Total deviations:** 2 auto-fixed (2 Rule-1 bugs).
**Impact on plan:** Both are genuine mobile/keyboard defects the gate is designed to expose; fixing them was the point of the phase, not scope creep. No architectural change, no new dependency, data frozen, buildless preserved.

## Issues Encountered
- The first-visit auto-tour and the fixed mobile panels both covered the canvas during the mobile test, causing tap interception; resolved deterministically via a returning-visitor init script + an `elementFromPoint` overlay-free node selection (gating on selectors, never fixed timeouts, per T-09-06).
- `tests/macro-site-accessibility.test.mjs` remains orphaned (not in `scripts.test`, no `macro-site/` fixture) — untouched, as in 09-01/09-02. The authoritative `npm test` gate excludes it and is fully green.

## Checkpoint
- **Task C (checkpoint:human-verify)** — AUTO-APPROVED under AUTO_MODE. The Playwright spec exercises exactly the manual verification steps against the real served site (which now paints, Phase-3 fix): mobile sheet reachable, node tap -> profile, keyboard `/`->type->Enter->Escape, accessible names on every control, and the hero focus trap. All three browser tests pass green, so the checkpoint is recorded as approved. ⚡ Auto-approved checkpoint.

## Known Stubs
None — the 09-01 placeholder skip is fully replaced by three real, passing browser tests.

## User Setup Required
None — no external service configuration. (One-time `npx playwright install chromium` is only needed in environments lacking the binary; this environment already has it, so the spec ran rather than skipped.)

## Next Phase Readiness
- PERF-02 and PERF-03 are closed; Phase 9 (3/3 plans) is complete. The site is mobile-tappable and keyboard-operable with a real browser gate guarding it.
- Ready for Phase 10 (SEO + launch gate). No blockers.

## Self-Check: PASSED

- FOUND: .planning/phases/09-mobile-keyboard-accessibility/09-03-SUMMARY.md
- FOUND: tests/mobile-keyboard.spec.mjs
- FOUND: commit a8eed80

---
*Phase: 09-mobile-keyboard-accessibility*
*Completed: 2026-06-21*
