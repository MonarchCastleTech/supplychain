---
phase: 04-design-system-smooth-motion
plan: 02
subsystem: ui
tags: [css, design-tokens, custom-properties, motion, accessibility, prefers-reduced-motion, buildless]

# Dependency graph
requires:
  - phase: 04-design-system-smooth-motion
    plan: 01
    provides: "base.css :root design-token set (color/type/spacing/radii/elevation/motion) + semantic trust tokens + 7 legacy aliases; Wave 0 RED gate"
provides:
  - "layout.css/components.css/theme.css consuming var(--token) (STORY-01 token application complete site-wide)"
  - ".confidence-high/medium/low color: mapped to semantic trust tokens --color-observed/estimated/unknown with byte-identical rgba background/border literals (trust color contract preserved)"
  - "theme.css @media (prefers-reduced-motion: reduce) block (CSS half of STORY-03 accessibility)"
  - "migration-evidence design-tokens assertion now GREEN (>=10 var(--) in each of layout/components/theme)"
affects: [04-03, design-system, smooth-motion, accessibility]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Exact-value-preserving token swap: only replace a literal with var(--token) when the token's resolved value is byte-identical (zero rendered change); leave non-matching literals (e.g. #111, 3px gap, #666) as-is"
    - "Trust-semantic mapping: map only color: to --color-observed/estimated/unknown; keep rgba background/border literals untouched (the contract tests string-match the rgba)"
    - "Reduced-motion block appended to theme.css (loads last) so the cascade override wins"

key-files:
  created: []
  modified:
    - styles/layout.css
    - styles/components.css
    - styles/theme.css

key-decisions:
  - "Conservative exact-match migration: a literal is swapped only when its target token resolves to the identical computed value (A3 cross-check). #111 (no --color-surface match, surface is #0f0f0f), 3px #bar gap (no 3px spacing token), and #666/#777 (no exact dim token) were intentionally LEFT as literals to guarantee zero visual change."
  - "Trust contract: .confidence-* color: -> var(--color-observed/estimated/unknown) (values #66bb6a/#ffb300/#9e9e9e, identical to prior literals); rgba(76,175,80,...)/rgba(255,193,7,...)/rgba(158,158,158,...) backgrounds/borders kept byte-identical (T-04-03 mitigated)."
  - "prefers-reduced-motion block appended to theme.css verbatim per 04-RESEARCH Code Examples: universal *,*::before,*::after duration zeroing + explicit transition:none/animation:none on .node/.link/#companyCard/#tt/.modal (T-04-05 mitigated)."

patterns-established:
  - "Exact-value-preserving token consumption (only swap when resolved value is identical)"
  - "Reduced-motion override appended last so cascade wins"

requirements-completed: [STORY-01, STORY-03]

# Metrics
duration: ~12min
completed: 2026-06-21
---

# Phase 4 Plan 02: Token Migration + Reduced-Motion Summary

**layout.css/components.css/theme.css now consume the base.css design tokens via var() with zero intended visual change (only exact-value-preserving swaps), the .confidence-* trust color contract is preserved exactly (semantic tokens for color:, byte-identical rgba backgrounds/borders), and theme.css gains a prefers-reduced-motion @media block — closing the migration-evidence and theme-reduced-motion Wave 0 REDs.**

## Performance

- **Duration:** ~12 min
- **Completed:** 2026-06-21
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Migrated `styles/layout.css` (19 var(--)) and `styles/components.css` (25 var(--)) to consume tokens for color/size/spacing/radius/shadow/motion, with every swap resolving to a byte-identical computed value.
- Preserved the trust color contract exactly: `.confidence-high/medium/low` `color:` now references `var(--color-observed/estimated/unknown)` (identical hues #66bb6a/#ffb300/#9e9e9e); the `rgba(76,175,80,...)`, `rgba(255,193,7,...)`, `rgba(158,158,158,...)` background/border literals remain byte-identical.
- Migrated `styles/theme.css` (17 var(--)) including the Smooth Transitions block (motion tokens `--dur-base/fast/fastest`, `--ease-standard`) and appended a `@media (prefers-reduced-motion: reduce)` block zeroing animation/transition durations site-wide plus explicit `transition:none/animation:none` on `.node/.link/#companyCard/#tt/.modal`.
- No selector or `#id` renamed across all three files; existing `@media (max-width:768px)` and `@media print` blocks preserved.

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate layout.css and components.css to tokens (preserve trust hues + hooks)** - `f98d66e` (feat)
2. **Task 2: Migrate theme.css to tokens + add prefers-reduced-motion block** - `622a01e` (feat)

## Files Created/Modified
- `styles/layout.css` - Token-consuming `#top/#title/#subtitle/.st/#bar/#searchWrap/#q` rules (19 var(--)); `3px` gap and `9px`/`5px` non-token literals left intact for exact rendering
- `styles/components.css` - Token-consuming `#companyCard/#tt/.credit-rating/.confidence-badge` rules (25 var(--)); `.confidence-*` color mapped to semantic trust tokens with rgba contract literals byte-identical
- `styles/theme.css` - Token-consuming Smooth Transitions / #footer / #top10Sidebar rules (17 var(--)) + new `@media (prefers-reduced-motion: reduce)` block; existing responsive + print media blocks untouched

## Decisions Made
- Only literals whose target token resolves to the identical value were swapped (A3 zero-visual-change cross-check). `#111` (no exact surface token), `3px` `#bar` gap (no 3px spacing token), `#666`/`#777` (no exact dim token) deliberately left as literals.
- `.confidence-*` mapped to SEMANTIC trust tokens (not a generic accent token) per RESEARCH Pitfall 1; rgba background/border literals are the contract and were not touched.
- Reduced-motion block appended to theme.css (loads last) so `!important` overrides win the cascade.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None. (One self-corrected mid-task: an initial `#bar` `gap:3px` -> `var(--space-2)` swap would have changed 3px to 4px; reverted to literal `3px` before committing to preserve exact rendering.)

## Test Results

- Baseline before plan: `npm test` = 191 tests / 186 pass / 5 fail (intended Wave 0 RED).
- After plan: `npm test` = **191 tests / 187 pass / 4 fail**.
  - All prior green tests remain green; trust-hue contract + trust-hook tests still pass.
  - **GREEN now (closed by this plan):** `migration evidence: layout/components/theme each consume tokens (var(--) >= 10)` — layout=19, components=25, theme=17.
  - The theme.css `prefers-reduced-motion` half of the reduced-motion assertion is satisfied (block present, 3 occurrences in theme.css).
  - **Remaining 4 RED (deferred to Plan 03 — viz refactor, NOT regressions):**
    1. `the build/update split exists (buildSimulation + updateGraph)` — Plan 03.
    2. `nodes/links are re-bound on view change (not recreated)` — Plan 03.
    3. `mental map preserved: node positions carried across rebind` — Plan 03.
    4. `reduced-motion honored in viz (matchMedia) and theme.css (@media)` — combined assertion; theme.css half done here, the viz `matchMedia` half is Plan 03.

## Threat Mitigations Applied
- **T-04-03 (Tampering, trust color contract):** `.confidence-*` `color:` -> semantic token; rgba background/border literals kept byte-identical (design-tokens test asserts the rgba strings persist — still GREEN).
- **T-04-04 (Tampering, markup hooks):** No selector/#id renamed; full suite (markup string-match) run after each task — all hook tests GREEN.
- **T-04-05 (DoS a11y, motion-sensitive users):** `@media (prefers-reduced-motion: reduce)` block zeroes transitions/animations site-wide.

## Next Phase Readiness
- STORY-01 token application is complete site-wide; the CSS half of STORY-03 (reduced-motion) is in place.
- Plan 03 closes the remaining 4 REDs: refactor `js/viz/index.js` to build-once / update-on-change (`buildSimulation`/`updateGraph`, `simulation.nodes(`/`force("link").links(` re-bind, mental-map position carry, gentle `alphaTarget` reheat) and add the `matchMedia('(prefers-reduced-motion: reduce)')` guard.
- No blockers. No new dependencies. Buildless deploy unchanged.

## Self-Check: PASSED

- FOUND: styles/layout.css (19 var(--))
- FOUND: styles/components.css (25 var(--), 3 trust rgba literals, 3 .confidence-* selectors)
- FOUND: styles/theme.css (17 var(--), prefers-reduced-motion block present)
- FOUND: commit f98d66e (Task 1)
- FOUND: commit 622a01e (Task 2)

---
*Phase: 04-design-system-smooth-motion*
*Completed: 2026-06-21*
