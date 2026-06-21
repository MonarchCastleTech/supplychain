---
phase: 6
plan: 06-03
title: Phase-6 gate + integration smoke
status: complete
completed: 2026-06-21
requirements: [DEPTH-01, DEPTH-02]
---

# 06-03 — Full-Suite Gate + Integration Smoke (SUMMARY)

**Note:** The original executor for this plan was interrupted by a session usage limit after creating the
smoke harness (`docs/perf/_render-smoke-0603.cjs`) but before committing. The orchestrator finalized the
plan inline from the clean state.

## Result

- **Full suite gate:** `npm test` = **242 / 242 pass, 0 fail** (re-run by the orchestrator).
- **Integration smoke (http-server :8099 + Playwright/chromium over REAL frozen data, never file://):**
  - App paints: **119 circles / 100 nodes**, stat bar `100` nodes, `$55T` cap, freshness `Feb 22, 2026`.
  - **First-30s hero** auto-plays with the real caption "The top 100 public companies — about $55.8T in
    combined market cap (source: companiesmarketcap.com)" (Step 1/4).
  - **Concentration (DEPTH-01):** opening NVDA's profile shows "Supplier concentration (HHI-based) **12/100**"
    — matching the locked real anchor — with a **Derived** badge (DEPTH-02 honest provenance).
  - **Chokepoints (DEPTH-02):** `#chokepointsPanel` present; methodology + tour entry points present.
  - **Zero console/page errors** in both runs.
- Screenshots committed: `docs/perf/site-screenshot.png` (hero), `docs/perf/site-profile-shot.png` (profile concentration).

## Verdict

DEPTH-01 and DEPTH-02 are demonstrated end-to-end on real data with honest derived provenance. Phase 6 complete (3/3 plans).
