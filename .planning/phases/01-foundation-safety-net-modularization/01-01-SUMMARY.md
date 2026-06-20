---
phase: 01-foundation-safety-net-modularization
plan: 01
subsystem: testing
tags: [lighthouse, playwright, http-server, perf-baseline, es-modules, performance-timing]

# Dependency graph
requires: []
provides:
  - "Pre-extraction perf baseline (docs/perf/baseline-2026-06-20.md) as the FOUND-04 comparison anchor"
  - "Recorded pre-extraction regression anchor: npm test = 116 pass / 0 fail"
  - "Confirmed local ES-module MIME serving via http-server (assumption A1 resolved)"
  - "Reusable Playwright timing-capture script (docs/perf/_perf-capture.cjs) for the post-extraction re-run"
affects: [01-02 CSS/JS extraction, 01-03 post-extraction perf comparison, FOUND-04, FOUND-05]

# Tech tracking
tech-stack:
  added: [http-server@14.1.1 (materialized), playwright@1.58.2 (materialized), lighthouse (npx, attempted)]
  patterns:
    - "Serve ES modules over http-server (never file://) for local verification"
    - "Capture Navigation/Paint Timing via Playwright when Lighthouse cannot score headlessly"

key-files:
  created:
    - docs/perf/baseline-2026-06-20.md
    - docs/perf/lighthouse-2026-06-20.report.json
    - docs/perf/lighthouse-2026-06-20.report.html
    - docs/perf/_perf-capture.cjs
  modified: []

key-decisions:
  - "Lighthouse CLI aborted with NO_FCP in this sandbox; used Playwright Navigation/Paint Timing as the authoritative recorded baseline (plan-sanctioned fallback)"
  - "Retained the error Lighthouse reports as honest audit evidence rather than deleting them"
  - "http-server serves .js as application/javascript (a valid module MIME); no --mimetypes override needed"

patterns-established:
  - "Pattern: baseline must be captured under identical data-snapshot + network conditions so 01-03 comparison is apples-to-apples"

requirements-completed: [FOUND-04]

# Metrics
duration: ~12min
completed: 2026-06-20
---

# Phase 1 Plan 01: Pre-Extraction Perf/Lighthouse Baseline Summary

**Pre-extraction FOUND-04 baseline recorded under docs/perf/ via Playwright Navigation/Paint Timing (Lighthouse CLI hit NO_FCP in-sandbox), with npm test = 116 pass / 0 fail captured as the regression anchor and http-server module-MIME serving confirmed.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-06-20T17:51Z
- **Completed:** 2026-06-20T17:59Z
- **Tasks:** 2 auto + 1 checkpoint (auto-approved)
- **Files modified:** 4 created (all under docs/perf/), 0 source files touched

## Accomplishments
- Materialized tooling: `npm install` added http-server + playwright + transitive deps into node_modules.
- **Regression anchor recorded:** `npm test` = **116 tests, 116 pass, 0 fail** BEFORE any extraction. Plans 01-02/01-03 must keep this equal.
- Confirmed local ES-module serving: `http-server` returns `/index.html` 200 (`text/html`) and `.js` 200 (`application/javascript`, a valid module MIME) — **assumption A1 resolved, no `--mimetypes` override needed.**
- Captured a dated PRE-EXTRACTION perf baseline (`docs/perf/baseline-2026-06-20.md`) with timing web-vitals fields (TTFB 321ms, DOMContentLoaded/Load 569ms, First Paint 588ms; FCP/LCP/TBT/CLS recorded as null/not-measured with explicit reasons) plus transfer sizes (doc ~104KB, total ~682KB across 5 resources).
- Provided a reusable capture script (`docs/perf/_perf-capture.cjs`) so plan 01-03 re-runs the identical measurement.

## Task Commits

1. **Task 1: Materialize tooling + record green test anchor + verify module MIME** — no committable source files (tooling install + recorded state; package-lock not tracked). Result recorded in this SUMMARY and the baseline file.
2. **Task 2: Capture and record pre-extraction Lighthouse/perf baseline** — `d7ef67e` (feat)

**Plan metadata:** committed with STATE/ROADMAP update (see final commit).

## Files Created/Modified
- `docs/perf/baseline-2026-06-20.md` — the FOUND-04 pre-extraction baseline (scores attempt, timing metrics, render condition, regression anchor, MIME confirmation, 01-03 comparison checklist).
- `docs/perf/lighthouse-2026-06-20.report.json` — raw Lighthouse output (contains the NO_FCP runtimeError, not scores; retained as audit evidence).
- `docs/perf/lighthouse-2026-06-20.report.html` — corresponding Lighthouse error report.
- `docs/perf/_perf-capture.cjs` — reusable Playwright Navigation/Paint Timing capture script.

## Decisions Made
- **Capture method:** Lighthouse CLI (`npx lighthouse@13.4.0`, both `--headless=new` and legacy `--headless`) aborted with `NO_FCP` PageLoadError, so it produced no category scores or audits. Per the plan's documented fallback, the **Playwright Navigation/Paint Timing capture is the authoritative recorded baseline.** Lighthouse reports kept as honest evidence of the attempt.
- **MIME:** `http-server` serves `.js` as `application/javascript; charset=UTF-8`, which is a spec-valid JavaScript MIME for `<script type="module">` — recorded as A1-resolved.

## Deviations from Plan

None requiring deviation rules — no source files were changed (this plan is docs-only under `docs/perf/`). The Lighthouse fallback to Playwright timing is an explicitly plan-sanctioned alternative ("If `npx lighthouse` cannot run headless on this machine, fall back ... record which method was used"), not an unplanned deviation.

## Issues Encountered
- **Lighthouse NO_FCP / page does not paint (pre-existing, NOT introduced by this plan).** The served `index.html` throws `Missing or invalid data/top100-map.js` at bootstrap because the committed `data/top100-map.js` snapshot sets `window.SUPPLY_MAP_DATA` with `companies`/`change_log` but **no `nodes`/`links`/`profiles`** arrays — the guard at `index.html` (`if (!DATA || !Array.isArray(DATA.nodes) || !Array.isArray(DATA.links) || !DATA.profiles)`) fires and the D3 viz never renders. Additionally the sandbox blocks the Google Fonts CDN (`net::ERR_BLOCKED_BY_ORB`). This is the existing runtime state of the repo + a network-restricted environment. **Resolution:** documented in the baseline file; not fixed here (plan 01-01 must not touch source). Flagged for plans 01-02/01-03: local visual-render verification on this machine needs a data snapshot containing `nodes`/`links`/`profiles` or a non-CDN-blocking environment.

## Deferred Items (for plans 01-02 / 01-03)
- A true Lighthouse score baseline could not be captured because the page does not paint in this environment. If a scored Lighthouse comparison is required for FOUND-04, it must be run where the data snapshot renders the D3 graph and CDN fonts are reachable (e.g. Chrome DevTools Lighthouse panel against a working data set, or a non-sandboxed CI).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Baseline anchor (`npm test` = 116/0, timing metrics) is recorded; plans 01-02 (extraction) and 01-03 (post-extraction comparison) can proceed.
- http-server module-MIME serving is confirmed, so extracted ES modules can be verified locally.
- Awareness flag carried forward: the data snapshot prevents D3 render locally — render-parity checks need a valid `nodes`/`links`/`profiles` dataset or a non-blocking network.

## Self-Check: PASSED

- All 4 docs/perf artifacts exist on disk.
- SUMMARY.md exists.
- Task 2 commit `d7ef67e` exists in git history.

---
*Phase: 01-foundation-safety-net-modularization*
*Completed: 2026-06-20*
