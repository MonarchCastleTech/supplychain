---
phase: 08-interaction-performance
plan: 01
subsystem: testing
tags: [memoization, performance, analytics, node-test, caching]

# Dependency graph
requires:
  - phase: 06/07-analytics
    provides: pure DOM-free analytics engine (companyConcentration, supplierCriticality, runScenario, buildSupplierFanIn)
provides:
  - Per-session Map-based memo layer (_caches/_memo/_stats) in js/analytics/index.js
  - Memoized buildSupplierFanIn (fan-in built ONCE per session, shared by all hotspots)
  - Memoized companyConcentration / supplierCriticality / runScenario keyed on value-affecting inputs
  - Test seams __resetAnalyticsCache() + __memoStats()
  - tests/analytics-memo.test.mjs (value-equality + cache-hit + reset)
  - package.json scripts.test registers both phase test files (Wave-0 gate)
affects: [08-02 no-restart-invariant, 08 interaction performance, PERF-01]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Frozen-data per-session memoization: Map<bucket, Map<key,value>> keyed on a stable string signature of value-affecting inputs"
    - "Memoize the shared hot dependency FIRST so eager default-arg evaluation becomes O(1)"
    - "Test-only seams (__resetAnalyticsCache/__memoStats) for deterministic cache-hit proofs without ESM mocking"
    - "WeakMap-assigned per-object identity tag to disambiguate distinct non-default profiles fixtures in cache keys"

key-files:
  created:
    - tests/analytics-memo.test.mjs
  modified:
    - js/analytics/index.js
    - package.json

key-decisions:
  - "Memoize buildSupplierFanIn first — it is the shared dependency defaulted into the param lists of the other three functions, so wrapping it fixes the eager per-call rebuild"
  - "companyConcentration cache key includes the SORTED excludeSuppliers set (the #1 correctness risk: runScenario reads excluded scores)"
  - "runScenario cache key is computed AFTER normalization so disableSuppliers:['tsmc'] and disableSupplier:'tsmc' collide on one entry"
  - "Non-default profiles objects get a per-object WeakMap identity tag (X1, X2, ...) instead of a single 'X' bucket, preventing cross-fixture key collisions"
  - "__memoStats() returns a shallow copy so callers cannot mutate live counters"

patterns-established:
  - "Pattern: per-session Map memo with build/hit counters exposed via a test seam"
  - "Pattern: cache key built from EVERY value-affecting input (weights, threshold, profiles-identity, sorted exclude/disabled set)"

requirements-completed: [PERF-01]

# Metrics
duration: 4min
completed: 2026-06-21
---

# Phase 8 Plan 01: Analytics Memoization Summary

**Per-session Map-based memo over the four analytics hotspots (buildSupplierFanIn first, then companyConcentration / supplierCriticality / runScenario) that makes repeated interactions O(1) while keeping every computed value byte-identical (GILD=36, NVDA=12, top fan-in=4, Taiwan 7 firms / $11.36T).**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-21T13:17:33Z
- **Completed:** 2026-06-21T13:21:11Z
- **Tasks:** 3 (Task 0 register, Task 1 RED, Task 2 GREEN)
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- Added a ~50-line `_caches`/`_bucket`/`_memo` memo layer plus parallel `_stats` build/hit counters to `js/analytics/index.js`.
- Memoized `buildSupplierFanIn` first (key `"default"` for frozen `DATA.profiles`) so the eager default-arg fan-in rebuild at the other three call sites is now O(1) after the first build.
- Memoized `companyConcentration` (key includes sorted `excludeSuppliers`), `supplierCriticality` (key = profiles-tag|limit), and `runScenario` (key = normalized sorted disabled set, computed post-normalization so single-vs-array shapes collide).
- Exposed `__resetAnalyticsCache()` (clears caches + zeroes stats) and `__memoStats()` (returns a shallow copy of build/hit counters) test seams.
- Authored `tests/analytics-memo.test.mjs`: value-equality with anchors, cache-hit proof (fan-in builds===1 / hits>=1 across two calls), reset re-arm, and single-vs-array scenario key collision.
- Registered both `tests/analytics-memo.test.mjs` and `tests/no-restart-invariant.test.mjs` (the latter authored in Plan 02) in `package.json scripts.test` — Wave-0 gate so the unregistered file does not silently never run.

## Task Commits

1. **Task 0: Register both phase test files in scripts.test** - `703f692` (chore)
2. **Task 1: RED — failing analytics memo tests** - `1150a59` (test)
3. **Task 2: GREEN — _memo + seams + memoize four hotspots** - `e28e3d4` (feat)

_TDD cycle: RED (1150a59) → GREEN (e28e3d4). No separate refactor commit needed — the profiles-tag fix was folded into the GREEN implementation before commit._

## Files Created/Modified
- `js/analytics/index.js` - Added the memo layer, two test seams, and wrapped all four hotspots in `_memo` with value-correct keys; no formula/weight/clamp/sort/return-shape changed.
- `tests/analytics-memo.test.mjs` - Value-equality + cache-hit + reset + scenario-key-collision unit tests.
- `package.json` - `scripts.test` now lists 24 test files (both phase files registered).

## Decisions Made
- buildSupplierFanIn memoized FIRST (shared default-arg dependency).
- companyConcentration key includes the sorted excludeSuppliers set; runScenario key built after normalization.
- Non-default profiles objects get a WeakMap per-object identity tag to avoid cross-fixture collisions (see Deviations Rule 1).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Per-object identity tag for non-default profiles to prevent cache-key collisions**
- **Found during:** Task 2 (GREEN — full suite run)
- **Issue:** The plan's specified profiles-identity tag (`profiles===DATA.profiles ? "D" : "X"`) bucketed ALL non-default profiles objects under a single `"X"` tag. `tests/concentration.test.mjs:73` (monotonic-in-sharedFrac) passes its own synthetic profiles fixture, and an earlier suite test passing a different non-default fixture had already populated `symbol|...|X|` cache entries — so company "B" returned a collided score of 12 instead of 36. This is a correctness bug in the key derivation, directly caused by this task's memoization change.
- **Fix:** Replaced the static `"X"` tag with a `WeakMap`-assigned per-object id (`X1`, `X2`, ...) so each distinct non-default profiles object gets its own cache namespace. Identity-based (not structural) keying is safe because callers pass the same frozen object repeatedly. `"D"` for the frozen default and `"N"` for null/non-object are preserved.
- **Files modified:** js/analytics/index.js
- **Verification:** Full `npm test` went from 1 failing (concentration.test.mjs:73) to 263/263 passing; memo test still GREEN.
- **Committed in:** e28e3d4 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug).
**Impact on plan:** The fix was essential for value-correctness (the plan's literal tag would have returned wrong cached values for any non-default profiles caller). It strengthens, not changes, the plan's intent ("cache key MUST include value-affecting inputs"). No scope creep.

## Issues Encountered
- node:test treats a registered-but-not-yet-created test file (`tests/no-restart-invariant.test.mjs`, authored in Plan 02) as a skipped suite — it does NOT fail the run or emit MODULE_NOT_FOUND, so `npm test` exits 0. This is the intended Wave-0 gate behavior.

## Known Stubs
None. The registered-but-absent `tests/no-restart-invariant.test.mjs` is an intentional Wave-0 gate registration, authored in Plan 02 — not a stub in product code.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Memo layer + seams in place; Plan 02 can author `tests/no-restart-invariant.test.mjs` (already registered) against the source-guard skeleton in 08-RESEARCH.md.
- All anchors verified unchanged; 263/263 tests green (257 prior + 6 new memo tests).
- No blockers.

## Self-Check: PASSED

All created/modified files present (js/analytics/index.js, tests/analytics-memo.test.mjs, package.json, 08-01-SUMMARY.md); all task commits present (703f692, 1150a59, e28e3d4); `__resetAnalyticsCache` seam present in source.

---
*Phase: 08-interaction-performance*
*Completed: 2026-06-21*
