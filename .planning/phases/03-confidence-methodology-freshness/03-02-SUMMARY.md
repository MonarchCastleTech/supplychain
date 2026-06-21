---
phase: 03-confidence-methodology-freshness
plan: 02
subsystem: trust-confidence
tags: [confidence-score, age-decay, viz-tooltips, freshness-dual-owner, tdd, pure-module]
requires:
  - "Phase-2 provenanceFor(input, ctx) trust core (tag + resolved source)"
  - "Rich served data shape + registered Phase-3 test slots (03-01)"
provides:
  - "Pure, DOM-free confidenceScore(input, ctx) in js/trust (90/65/25 base x half-life-4yr age decay, unknown floor, future/no-year guards)"
  - "sourceYear(src, nowYear) FK->year resolver exported from js/data"
  - "viz node + link tooltips render 'Confidence: NN%' next to the Phase-2 badge with a live nowYear"
  - "viz-side half of the freshness dual-owner fix: #lastUpdated no longer written by viz render()"
affects:
  - js/trust/index.js
  - js/data/index.js
  - js/viz/index.js
  - tests/confidence-score.test.mjs
  - tests/viz-confidence-wiring.test.mjs
tech-stack:
  added: []
  patterns:
    - "confidenceScore reuses provenanceFor (no duplicated tag/source logic); caller supplies ctx.sourceYear + ctx.now so the math stays pure and unit-testable"
    - "Age decay = clamp(0.5^(ageYears/4), 0.5, 1.0); ageYears = max(0, now - year) (future-year guard); no year OR no now => mult 1 (absence != staleness)"
    - "unknown tag OR unresolved source returns the unknown floor (25) directly — never decayed, never fabricated upward"
    - "viz tooltip score interpolated as numeric ${score}% only (T-03-03 control: no user string)"
    - "single-owner freshness: js/ui updateStatusIndicator is the sole #lastUpdated writer"
key-files:
  created: []
  modified:
    - js/trust/index.js
    - js/data/index.js
    - js/viz/index.js
    - tests/confidence-score.test.mjs
    - tests/viz-confidence-wiring.test.mjs
decisions:
  - "Guarded the top-level window reads in js/data/index.js (typeof window !== 'undefined' ? ... : fallback) so sourceYear is importable under node:test. The plan + RESEARCH mandate sourceYear live in js/data AND the unit test import it from there, but the module read window.SUPPLY_MAP_DATA at eval time and threw 'window is not defined' in Node. Browser behavior is unchanged (window exists there); the fallback is a harmless empty-shape object. (Rule 3 blocking fix.)"
  - "Did NOT add a 'low' weight tier — the data vocabulary is only high/medium/(missing); unknown is the explicit floor (per plan + provenanceFor's three-tag contract)."
  - "Kept FK->year resolution in the viz caller (ctx.sourceYear) rather than inside confidenceScore, so the score function is pure and trivially unit-testable (RESEARCH recommendation)."
metrics:
  duration: ~18m
  completed: 2026-06-21
---

# Phase 3 Plan 02: Confidence Score + Viz Wiring + Freshness Dual-Owner Fix Summary

Added a pure, DOM-free `confidenceScore(input, ctx)` to `js/trust` (observed 90 / estimated 65 / unknown 25 base, exponential half-life-4yr age decay floored at 0.5, unknown floor returned directly, future-year and no-year guards), a `sourceYear` FK->year resolver in `js/data`, wired a live "Confidence: NN%" into both viz tooltips next to the Phase-2 badge, and removed the duplicate `#lastUpdated` write from viz `render()` so `js/ui updateStatusIndicator` is the sole freshness owner. Investors can now quantify how much to trust each figure, fully unit-proven (bounds, ordering, monotonic decay, unknown floor, no-year/future-year guards).

## What Was Built

- **Task 1 (`f82a3af`):** `export function confidenceScore(input, ctx={})` + `SOURCE_WEIGHTS`/`HALF_LIFE_YEARS`/`MIN_AGE_MULT` consts in `js/trust/index.js` — calls `provenanceFor` for {tag, source}, returns the unknown floor (25) directly when `tag==='unknown' || !prov.source`, else `clamp(round(base * mult), 0, 100)` where `mult = max(0.5, 0.5^(ageYears/4))` and `ageYears = max(0, now - year)`, applied only when `ctx.sourceYear` is finite AND `ctx.now` is set. Added `sourceYear(src, nowYear)` to `js/data/index.js` (max plausible year in [1990, nowYear] over id+title+url, else null) and exported it. Authored `tests/confidence-score.test.mjs` (13 cases).
- **Task 2 (`bb7ec79`):** Extended the line-8 trust import with `confidenceScore` and the line-6 data import with `sourceYear`. `showTooltip` (node FK `d.sourceId ?? d.sf`) and `showLinkTooltip` (link FK `d.sf`) each derive `nowYear` from `DATA.meta?.generatedAt`, resolve the figure's source via `STATE.sourceIndex`, compute the score, and append ` · Confidence: ${score}%` to the `.tf` line right after `badgeHtml(prov)`. Authored `tests/viz-confidence-wiring.test.mjs` (6 cases).
- **Task 3 (`2ad9c5f`):** Deleted the 4-line `#lastUpdated` write block (the `// Update footer with last updated timestamp` comment + `getElementById('lastUpdated')` write) from viz `render()`, replaced with a one-line ownership comment. `js/ui updateStatusIndicator` (js/ui/index.js:735) is now the sole `#lastUpdated` writer.

## Verification

- `node --test tests/confidence-score.test.mjs`: **13 pass** (bounds 80–100 observed, strict ordering observed>estimated, monotonic decay over ages 0..40, unknown floor 25, observed-with-dangling-FK => floor, no-year/no-now => no decay, [-5..50] integer/[0,100] fuzz, sourceYear extraction/max/future-filter/null).
- `node --test tests/viz-confidence-wiring.test.mjs`: **6 pass** (imports confidenceScore + sourceYear, >=2 confidenceScore calls, >=2 `Confidence: ${score}%` interpolations, live nowYear from `DATA.meta.generatedAt` + `getUTCFullYear()`).
- **`npm test`: 168 pass, 0 fail** (was 151 after 03-01: +13 confidence-score and +5 viz-confidence-wiring real cases, −2 retired placeholders).
- DOM-free gate: `grep -nE "document|window|innerHTML" js/trust/index.js` shows only the pre-existing `renderProvenanceBadge` innerHTML — confidenceScore adds no DOM.
- Single-owner gate: viz `getElementById('lastUpdated')` count == 0; the only remaining writer is `js/ui/index.js:735`.
- `grep -c "confidenceScore(" js/viz/index.js` == 2 (node + link tooltip).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Guarded top-level `window` reads in js/data so the pure helper imports under node:test**
- **Found during:** Task 1 (GREEN)
- **Issue:** `tests/confidence-score.test.mjs` imports `sourceYear` from `../js/data/index.js` (mandated by the plan behavior spec + RESEARCH), but `js/data/index.js` reads `window.SUPPLY_MAP_DATA` / `window.CREDIT_RATINGS` at module eval time, throwing `ReferenceError: window is not defined` in Node. No prior test imported this module directly (provenance tests only touch the window-free `js/trust`).
- **Fix:** Wrapped both top-level reads in `typeof window !== "undefined" ? window.X : undefined`, falling back to a harmless empty-shape object (`{ countries:{}, profiles:{}, nodes:[], links:[], meta:{} }`) / `{ ratingsBySymbol:{}, meta:{} }`. The browser still reads the real `window.*` globals — behavior unchanged; the module-load `buildSharedSupplierOverlapIndex()` iterates the empty `profiles` without throwing under Node.
- **Files modified:** js/data/index.js
- **Commit:** f82a3af

## Self-Check: PASSED

- FOUND: js/trust/index.js (`export function confidenceScore`, calls `provenanceFor`, DOM-free)
- FOUND: js/data/index.js (`sourceYear` defined + exported; window reads guarded)
- FOUND: js/viz/index.js (imports confidenceScore + sourceYear; 2 confidenceScore calls; `Confidence: ${score}%` in both .tf lines; 0 #lastUpdated writes)
- FOUND: tests/confidence-score.test.mjs (13 cases), tests/viz-confidence-wiring.test.mjs (6 cases)
- FOUND commits: f82a3af, bb7ec79, 2ad9c5f
- npm test = 168 pass / 0 fail
