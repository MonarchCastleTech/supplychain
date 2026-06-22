---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Depth & Integrity Polish
status: executing
last_updated: "2026-06-22T03:30:10.880Z"
last_activity: 2026-06-22 -- Completed 11-02 (scenario UI hop breakdown + methodology); npm test 313 pass / 0 fail; multi-hop smoke PASS
progress:
  total_phases: 2
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
  percent: 50
---

# Project State: Monarch Castle Technologies — Market Intelligence

## Project Reference

**Core Value:** Investors trust every number and instantly grasp supply-chain structure, concentration, and risk — credibility first, then beauty, then unique depth.

**Current Focus:** Phase 11 — Multi-Hop Scenario Cascade

**Mode:** mvp | **Granularity:** fine

## Current Position

Phase: 11 (Multi-Hop Scenario Cascade) — COMPLETE (2/2 plans)
Plan: 2 of 2 — DONE
Status: Phase 11 complete; ready for Phase 12 (Source-FK Integrity & Workflow Fix)
Last activity: 2026-06-22 -- Completed 11-02 (scenario UI hop breakdown + methodology); npm test 313 pass / 0 fail; multi-hop smoke PASS

## v1.1 Phases

| Phase | Goal | Requirements |
|-------|------|--------------|
| 11. Multi-Hop Scenario Cascade | Disruptions propagate to second-order dependents over the real graph, bounded/cycle-safe, with a hop breakdown + honest Derived provenance | CASC-01..04 |
| 12. Source-FK Integrity & Workflow Fix | Reconnect dangling FKs resolving to real sources (rest stay honestly Unknown), document counts, fix auto-update quoting bug | INTG-01..03, INFRA-01 |

## Performance Metrics

| Metric | Value |
|--------|-------|
| v1.1 phases complete | 0/2 |
| v1.1 requirements mapped | 8/8 |
| Test suite baseline (start of v1.1) | 301 passing / 0 fail |
| Plan 11-01 | 3 tasks (1 RED, 1 TDD feat, 1 gate), 3 files, ~4 min |
| Multi-hop cascade gate (11-01) | npm test = 310 pass / 0 fail (301 + 9 cascade); Taiwan maxHops:1 = 7/$11.36T, maxHops>=2 = 8/$13.28T byHop{1:7,2:1} |
| v1.0 milestone | 10 phases / 33 plans / 25 requirements — SHIPPED 2026-06-21 |

<details>
<summary>v1.0 plan-by-plan metrics (Phases 1–10) — archived</summary>

| Metric | Value |
|--------|-------|
| Phases complete | 10/10 |
| v1 requirements mapped | 25/25 |
| Test suite baseline | 103 passing |
| Pre-extraction regression anchor (01-01) | npm test = 116 pass / 0 fail |
| Plan 01-01 | 2 tasks, 4 files, ~12 min |
| Plan 01-02 | 3 tasks, 11 files, ~125 min |
| Post-extraction regression (01-02) | npm test = 116 pass / 0 fail (unchanged) |
| Plan 01-03 | 2 tasks + 1 checkpoint, 2 files, ~18 min |
| Post-extraction regression (01-03) | npm test = 116 pass / 0 fail (unchanged) |
| Perf: index.html doc transfer | 104 KB → 12 KB (−88%); no regression (FOUND-04 closed) |
| Plan 02-01 | 2 TDD tasks, 4 files, ~14 min |
| Trust-core regression (02-01) | npm test = 131 pass / 0 fail (116 + 15 new provenance) |
| Plan 02-02 | 2 TDD tasks, 3 files, ~15 min |
| Viz-wiring regression (02-02) | npm test = 136 pass / 0 fail (131 + 5 new viz-wiring) |
| Plan 02-03 | 2 tasks (1 TDD), 3 files, ~10 min |
| UI-wiring regression (02-03) | npm test = 141 pass / 0 fail (136 + 5 new ui-wiring) |
| Phase 03 gate (03-04) | npm test = 178 pass / 0 fail; render smoke PASS |
| Phase 04 gate (04-04) | npm test = 191 pass / 0 fail; design/motion smoke PASS |
| Phase 06 gate (06-02) | npm test = 242 pass / 0 fail; derived badge never renders Observed |
| Scenario engine gate (07-01) | npm test = 251 pass / 0 fail; TAIWAN_SEMI → 7 firms / $11,360,589,871,184 / HHI 0.20→0.25 |
| Scenario integration gate (07-03) | npm test = 257 pass / 0 fail; scenario smoke PASS (7 firms / $11.36T headline, Derived badge, 7-node highlight) |
| Interaction latency (08-03, PERF-01 SC2) | cold ≈166ms → warm ≈2.8ms (≈60× faster); fan-in built once |
| Phase 08 gate (08-04) | npm test = 275 pass / 0 fail |
| Phase 09 gate (09-03) | npm test = 294 pass / 0 fail / 0 skipped (real Playwright mobile/keyboard/focus-trap) |
| Launch gate (10-02, PERF-05) | npm test = 301 pass / 0 fail; Lighthouse Perf 58 / A11y 93 / BP 100 / SEO 100; LAUNCH.md verdict READY |

Full v1.0 decision log and session continuity preserved in `.planning/milestones/v1.0-*`.

</details>
| Phase 11 P02 | 5min | 3 tasks | 4 files |

## Accumulated Context

### Key Decisions (carried into v1.1)

- Multi-hop `runScenario` (11-01): engine default `maxHops=1` reproduces the v1.0 single-hop anchor byte-identically; multi-hop is opt-in. Exactly 6 real bridge edges (TSM, TCEHY, ASML, AZN, AMAT, LIN) derived by `buildSelfLabels` via exact `normalizeEntityLabel` matching — no alias map, no fabricated edges. Memo key appends `|h${maxHops}`. Cycle-safety via a visited `hopOf` set (proven by a synthetic 2-cycle fixture), bound via `maxHops`. hop>=2 `lostSuppliers` = the wave/bridge labels that reached the firm (A2). Result gained `hop`/`byHop`/`maxHopReached` (additive superset).
- Real-data-only — NO fabricated weights or sources. Volume-weighted HHI is DEFERRED (HHI-01, blocked-on-real-data): the dataset has no per-supplier volume, so a true HHI cannot be computed without fabricating weights.
- Cascade output stays honestly `Derived` (never Observed); multi-hop assumptions + termination bound documented in Methodology.
- Keep buildless static GitHub-Pages deploy + weekly auto-update Actions pipeline intact.
- Authoritative gate is `npm test` (301 pass / 0 fail at v1.1 start), NOT `node --test tests/`.
- New behavior gets new registered tests; the 301-test suite stays green throughout.

### v1.1 Engineering Context

- `runScenario(disruption, ctx)` in `js/analytics/index.js` is currently SINGLE-HOP (a firm is impacted iff it loses ≥1 distinct supplier; cascade explicitly deferred). It is pure/DOM-free, memoized, and reports `concentrationBefore/After` as HHI=1/k (the monotonic metric, not the composite score). CASC-01 extends this to bounded multi-hop over the real graph.
- The fan-in graph is `buildSupplierFanIn(profiles)` → `Map<normalizedSupplierLabel, Set<symbol>>`; supplier labels are normalized via `normalizeEntityLabel`. Multi-hop traversal must reuse these keys and stay cycle-safe.
- `SCENARIO_PRESETS.TAIWAN_SEMI` bundles 5 real normalized TSMC label variants; single-hop anchor is 7 firms / $11,360,589,871,184. Multi-hop must produce a SUPERSET of this.
- The scenario UI lives in `js/ui/index.js` (renderScenario) + `index.html` `#scenarioPanel` (NEW-IDs-only discipline); the headline is derived live (no 7 / $11.36T literal anywhere — test-enforced). Methodology copy lives in the `#methodologyModal` block.
- 75 dangling source FKs documented in v1.0 Methodology copy. Provenance/source resolution lives in `js/trust` (`provenanceFor`) + `js/data` (`sourceYear`, source-index lookup). INTG-01/02 partial cleanup operates here; INTG-02 must keep unresolved FKs at the Unknown floor.
- `auto-update-data.yml` known non-blocking line-34 timestamp-echo quoting bug (flagged in v1.0 LAUNCH.md, not yet fixed) — INFRA-01 target. Workflow runs Mon 06:00 UTC cron + 3 data-validation tests + commits `data/`.

### Standing Constraints

- 301-test suite (v1.1 baseline) must stay green throughout; new behavior gets new registered tests.
- Real, sourced data only — nothing fabricated; volume-weighted HHI stays DEFERRED.
- `data/` JSON contract and auto-update pipeline must keep working.
- No framework/build tool — preserve buildless static GitHub-Pages deploy.

### Todos

- (none yet)

### Blockers

- (none) — note: local render still does not paint because the committed `data/top100-map.js` snapshot lacks `nodes`/`links`/`profiles` and the sandbox blocks the Google Fonts CDN. Pre-existing data condition; affects local visual-render verification only. True visual check requires a valid production snapshot or the live deploy.

## Session Continuity

**Last action:** Executed Plan 11-02 (scenario UI hop breakdown + methodology). `#scenarioPanel` gained `#scenarioHopBreakdown` (additive id) rendering a "7 direct · 1 indirect" split; `renderScenario` derives the headline live ("8 companies impacted across 2 hop(s) · $13.28T exposed") from `impactedCompanies.length` + `maxHopReached` + `totalMarketCapExposed`; both call sites opt into `maxHops:3`; Methodology rewritten to the bounded cycle-safe multi-hop model while keeping the literal "direct dependents". Extended `tests/scenario-wiring.test.mjs` (3 new asserts). Added `docs/perf/_scenario-smoke-1102.cjs` multi-hop Playwright smoke — PASS over real served data (8 firms / $13.28T / 7 direct · 1 indirect / Derived badge / 8-node highlight / zero errors). `npm test` = 313 pass / 0 fail (310 + 3 wiring). CASC-02 + CASC-03 complete → Phase 11 done (CASC-01..04 all satisfied).

**Next step:** Plan Phase 12 (Source-FK Integrity & Workflow Fix) with `/gsd:plan-phase 12`.

---
*State initialized: 2026-06-20 · v1.1 position refreshed: 2026-06-22*

## Operator Next Steps

- Plan the first v1.1 phase with `/gsd:plan-phase 11`
