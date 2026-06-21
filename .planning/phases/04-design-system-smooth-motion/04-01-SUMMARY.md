---
phase: 04-design-system-smooth-motion
plan: 01
subsystem: ui
tags: [css, design-tokens, custom-properties, d3, motion, node-test, buildless]

# Dependency graph
requires:
  - phase: 03-confidence-methodology-freshness
    provides: ".confidence-* trust color contract, #methodologyModal/#provenanceDrawer/#companyCard hooks, prov-badge HTML, 178-test gate"
provides:
  - "base.css :root design-token single source of truth (color/type/spacing/radii/elevation/motion)"
  - "Semantic trust tokens --color-observed/estimated/unknown matching the .confidence-* hues"
  - "7 legacy vars (--bg --text --dim --acc --blue --green --purple) retained as aliases (zero visual change)"
  - "tests/design-tokens.test.mjs + tests/viz-motion.test.mjs created and REGISTERED in package.json (GATE LANDMINE closed)"
  - "Wave 0 RED structure gate that Plans 02 (token migration + theme reduced-motion) and 03 (viz build-once refactor) implement against"
affects: [04-02, 04-03, design-system, smooth-motion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Token-with-legacy-alias migration: define new --color-*/--fs-*/etc. and point old names at them so consumers resolve unchanged (zero-risk)"
    - "Wave 0 RED structure tests registered up front so the gate cannot silently skip later waves"

key-files:
  created:
    - tests/design-tokens.test.mjs
    - tests/viz-motion.test.mjs
  modified:
    - styles/base.css
    - package.json

key-decisions:
  - "Tokens live in base.css :root (loads first) per RESEARCH note — cascade resolves for all consumers incl. theme.css, honoring the 'single source of truth in CSS' intent against real load order"
  - "Legacy aliases map to the IDENTICAL resolved values (A3 cross-check) — --green aliases --color-success(#4caf50), not --color-observed(#66bb6a) — preserving current rendered colors exactly"
  - "Both test files registered in Task 0 even though most assertions are RED, so the gate runs from Wave 0 (the documented GATE LANDMINE)"

patterns-established:
  - "Token-with-legacy-alias: additive tokens + alias the 7 old vars; never rename trust hooks"
  - "Register-then-fail Wave 0 tests: new test files appended to scripts.test in the same task that authors them"

requirements-completed: [STORY-01, STORY-03]

# Metrics
duration: ~10min
completed: 2026-06-21
---

# Phase 4 Plan 01: Design Tokens + Wave 0 Test Scaffolding Summary

**Full design-token :root set (color/type/spacing/radii/elevation/motion + semantic trust observed/estimated/unknown) established in base.css with the 7 legacy vars kept as zero-change aliases, plus two registered Wave 0 structure tests that gate the rest of the phase.**

## Performance

- **Duration:** ~10 min
- **Completed:** 2026-06-21T01:13:18Z
- **Tasks:** 2
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- Defined the design-token single source of truth in `styles/base.css :root`: surfaces/text/brand/status colors, semantic trust tokens (`--color-observed` #66bb6a / `--color-estimated` #ffb300 / `--color-unknown` #9e9e9e), full type scale (`--fs-2xs..2xl`, `--fw-*`, `--lh-*`, `--font-mono/display/ui`), spacing (`--space-1..8`), radii (`--radius-xs..2xl`), elevation (`--shadow-sm/md/lg/up`), and motion (`--dur-fastest/fast/base/slow`, `--ease-standard`, `--ease-emphasized`).
- Retained all 7 legacy vars as aliases pointing at the new tokens with byte-identical resolved values — zero rendered-color change this plan; consumers migrate in Plan 02.
- Authored and REGISTERED `tests/design-tokens.test.mjs` and `tests/viz-motion.test.mjs` in `package.json scripts.test` (16 unique `.test.mjs` files; GATE LANDMINE closed).

## Task Commits

Each task was committed atomically:

1. **Task 0: Write + register Wave 0 token/motion structure tests** - `d00e7cd` (test)
2. **Task 1: Define the full design-token :root block in base.css with legacy aliases** - `3021355` (feat)

**Plan metadata:** (final docs commit) — see git log

## Files Created/Modified
- `tests/design-tokens.test.mjs` - Token presence, legacy aliases, semantic-trust tokens, `.confidence-*` hue contract, trust-hook (markup + badge HTML) preservation, and migration-evidence (var(--) >= 10 per file) assertions
- `tests/viz-motion.test.mjs` - Build-once (exactly one `d3.forceSimulation(`), `buildSimulation`/`updateGraph` split, `simulation.nodes(`/`force("link").links(` re-bind, gentle `alphaTarget(` reheat with no `alpha(1)`, mental-map carry, viz `matchMedia` + theme.css `prefers-reduced-motion`, and defensive trust-wiring guards
- `styles/base.css` - Full `:root` token block + 7 legacy aliases (replaced the prior 7-var block; @import / reset / html-body / pageFadeIn untouched)
- `package.json` - Appended both new test files to the end of `scripts.test`, all 14 prior files preserved

## Decisions Made
- Tokens defined in `base.css :root` (loads first) so the cascade resolves for every consumer including `theme.css` (loads last) — honors the "single source of truth in CSS" intent against the actual `<link>` order.
- `--green` aliases `--color-success` (#4caf50), distinct from the trust token `--color-observed` (#66bb6a), exactly matching the previous `--green` value (A3 zero-visual-change cross-check). Same for the other six aliases.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## Test Results

- Baseline before plan: `npm test` = 178 pass / 0 fail.
- After plan: `npm test` = **191 tests, 186 pass, 5 fail**.
  - All 178 pre-existing tests remain green.
  - 8 of the 13 new assertions are GREEN (token presence, legacy aliases, semantic trust tokens, `.confidence-*` hue contract, trust-hook preservation, build-once single-`forceSimulation`, no-`alpha(1)`, defensive trust-wiring).
  - **5 failures are the intended Wave 0 RED gate**, not regressions:
    1. `migration evidence: layout/components/theme each consume tokens (var(--) >= 10)` — layout=9, theme=2 today → satisfied by **Plan 02** (token migration).
    2. `buildSimulation + updateGraph` split — satisfied by **Plan 03** (viz refactor).
    3. `simulation.nodes( / force("link").links(` re-bind — **Plan 03**.
    4. mental-map carry (`prev.get(` / `n.x = p.x`) — **Plan 03**.
    5. reduced-motion (`matchMedia` in viz + `prefers-reduced-motion` in theme.css) — **Plan 03** (viz) + **Plan 02** (theme).

## Next Phase Readiness
- Token contract + RED gate are in place. Plan 02 migrates layout/components/theme literals to `var(--token)` (closes migration-evidence + theme reduced-motion); Plan 03 refactors `js/viz/index.js` to build-once / update-on-change with the mental-map carry, gentle reheat, and `matchMedia` guard (closes the remaining viz-motion assertions).
- No blockers. No new dependencies. Buildless deploy unchanged.

## Self-Check: PASSED

- FOUND: tests/design-tokens.test.mjs
- FOUND: tests/viz-motion.test.mjs
- FOUND: styles/base.css token block (ALL TOKENS PRESENT)
- FOUND: commit d00e7cd (Task 0)
- FOUND: commit 3021355 (Task 1)

---
*Phase: 04-design-system-smooth-motion*
*Completed: 2026-06-21*
