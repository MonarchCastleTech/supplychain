---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-06-20T20:03:08.951Z"
progress:
  total_phases: 10
  completed_phases: 0
  total_plans: 3
  completed_plans: 2
  percent: 67
---

# Project State: Monarch Castle Technologies — Market Intelligence

## Project Reference

**Core Value:** Investors trust every number and instantly grasp supply-chain structure, concentration, and risk — credibility first, then beauty, then unique depth.

**Current Focus:** Phase 01 — Foundation (Safety-Net Modularization)

**Mode:** mvp | **Granularity:** fine

## Current Position

Phase: 01 (Foundation (Safety-Net Modularization)) — EXECUTING
Plan: 3 of 3
**Phase:** 1 — Foundation (Safety-Net Modularization)
**Plan:** 01-02 complete (core CSS/JS extraction) — next: 01-03
**Status:** Executing Phase 01
**Progress:** [███████░░░] 67%

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases complete | 0/10 |
| v1 requirements mapped | 25/25 |
| Test suite baseline | 103 passing |
| Pre-extraction regression anchor (01-01) | npm test = 116 pass / 0 fail |
| Plan 01-01 | 2 tasks, 4 files, ~12 min |
| Plan 01-02 | 3 tasks, 11 files, ~125 min |
| Post-extraction regression (01-02) | npm test = 116 pass / 0 fail (unchanged) |

## Accumulated Context

### Key Decisions

- Trust before visual wow — investors bounce on unsourced numbers (spec risk register).
- Hybrid approach: thin, safe modularization (Phase 1) before any phased value work.
- Real-data-only — every major figure tagged observed/estimated with a reachable source.
- Keep buildless static GitHub-Pages deploy + weekly auto-update Actions pipeline.
- No login — public investor audience.
- Authoritative gate is `npm test` (116 pass / 0 fail), NOT `node --test tests/` (resolved research OQ1).
- 01-01: Lighthouse CLI hits NO_FCP in-sandbox; Playwright Navigation/Paint Timing is the recorded perf baseline (plan-sanctioned fallback).
- 01-01: http-server serves .js as application/javascript (valid module MIME); no --mimetypes override needed (A1 resolved).
- 01-02: CSS split as contiguous document-order slices (base->layout->components->theme) — concat is byte-identical to the original <style>, so cascade is provably unchanged.
- 01-02: each reassigned `let` kept module-local to its owner (ESM imports are read-only); cross-module mutable reads (labelSel/subSel) use ESM live bindings. main.js concentrates all order-sensitive top-level execution + the window.* shim.
- 01-02: openCompanyProfile explicitly added to window (it was the one inline-handler NOT on window in the monolith).
- 01-02: verified ES-module wiring at runtime with a Playwright smoke test (synthetic dataset) because the npm gate is string + node --check only and cannot prove runtime wiring.

### Standing Constraints

- 103-test suite must stay green throughout; new behavior gets new tests.
- `data/` JSON contract and auto-update pipeline must keep working.
- No framework/build tool — preserve buildless static deploy.

### Todos

- (none yet)

### Blockers

- (none) — note for 01-03: local render does not paint because the committed `data/top100-map.js` snapshot lacks `nodes`/`links`/`profiles` (index.html bootstrap guard throws) and the sandbox blocks the Google Fonts CDN. Affects local visual-render verification only.
- FOUND-05 carry-forward (next plan/wave): `.github/workflows/deploy-pages.yml` still copies only index.html/favicon/logo/data/assets/CNAME — it MUST be updated to copy `styles/` and `js/` or the live GitHub-Pages deploy serves an unstyled, non-functional page.

## Session Continuity

**Last action:** Completed 01-02-PLAN.md — extracted inline CSS into styles/*.css (ff8c7b1) and inline JS into js/* ES modules behind js/main.js (e8b5e11), reduced index.html to a 278-line semantic shell with the window.* shim incl. openCompanyProfile + retained inline bootstrap (6358737); npm test = 116/0 unchanged; Playwright runtime smoke PASS.

**Next step:** Execute 01-03-PLAN.md (post-extraction perf comparison + FOUND-05 deploy-pages.yml styles/+js/ copy).

---
*State initialized: 2026-06-20*
