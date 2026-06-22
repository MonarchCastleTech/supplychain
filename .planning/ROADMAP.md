# Roadmap: Monarch Castle Technologies — Market Intelligence

## Milestones

- ✅ **v1.0 Best-in-World Investor Market Intelligence** — Phases 1–10 (shipped 2026-06-21) — [archive](milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 Depth & Integrity Polish** — Phases 11–12 (in progress, started 2026-06-22)

## Phases

<details>
<summary>✅ v1.0 Best-in-World Investor Market Intelligence (Phases 1–10) — SHIPPED 2026-06-21</summary>

- [x] Phase 1: Foundation (Safety-Net Modularization) (3/3 plans) — 2026-06-20
- [x] Phase 2: Provenance & Source Linking (4/4 plans) — 2026-06-20
- [x] Phase 3: Confidence, Methodology & Freshness (4/4 plans) — 2026-06-21
- [x] Phase 4: Design System & Smooth Motion (4/4 plans) — 2026-06-21
- [x] Phase 5: Hero Moment & Investor Narrative (3/3 plans) — 2026-06-21
- [x] Phase 6: Concentration & Risk Analytics (3/3 plans) — 2026-06-21
- [x] Phase 7: Scenario Stress-Tests (3/3 plans) — 2026-06-21
- [x] Phase 8: Interaction Performance (4/4 plans) — 2026-06-21
- [x] Phase 9: Mobile & Keyboard Accessibility (3/3 plans) — 2026-06-21
- [x] Phase 10: SEO, Social Cards & Launch Gate (2/2 plans) — 2026-06-21

Full details: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

### v1.1 Depth & Integrity Polish (Phases 11–12)

- [x] **Phase 11: Multi-Hop Scenario Cascade** — Disruptions propagate through the real graph to second-order dependents, shown with a hop breakdown and honest derived provenance (completed 2026-06-22)
- [ ] **Phase 12: Source-FK Integrity & Workflow Fix** — Reconnect dangling source FKs that resolve to real sources (rest stay honestly Unknown) and fix the auto-update workflow quoting bug

## Phase Details

### Phase 11: Multi-Hop Scenario Cascade
**Goal**: Investors see a disruption propagate beyond direct dependents through the real supply-chain graph to second-order downstream effects, with the impact set, market-cap exposed, and per-hop breakdown derived live and honestly badged Derived
**Mode:** mvp
**Depends on**: Phase 7 (single-hop `runScenario` engine + scenario panel) — v1.0
**Requirements**: CASC-01, CASC-02, CASC-03, CASC-04
**Success Criteria** (what must be TRUE):
  1. Running the Taiwan preset (or any disruption) impacts a SUPERSET of the v1.0 single-hop result — second-order dependents now appear, and the traversal terminates on the real graph with no infinite loop even when the dependency graph contains cycles
  2. The scenario panel shows a hop breakdown (direct vs. indirect impact); the impacted-company count and total market-cap exposed reflect the full multi-hop result and are derived live (no hardcoded 7 / $11.36T literal)
  3. Cascade output renders the honest `Derived` provenance badge (never Observed), and the Methodology view explains the multi-hop model, its termination bound, and its assumptions — replacing the v1.0 "single-hop only" note
  4. New registered unit tests assert cascade correctness (cycle termination, hop-count accuracy, multi-hop impact ⊇ single-hop impact, against real fixtures) and the full suite (301 baseline) stays green
**Plans**: 2 plans
- [x] 11-01-PLAN.md — Extend runScenario with bounded cycle-safe maxHops BFS + 6-bridge selfLabels + cascade unit tests (CASC-01, CASC-04)
- [x] 11-02-PLAN.md — Scenario panel hop breakdown + maxHops:3 call sites + live headline + multi-hop methodology copy + wiring/smoke gate (CASC-02, CASC-03)
**UI hint**: yes

### Phase 12: Source-FK Integrity & Workflow Fix
**Goal**: Figures whose dangling source FK actually resolves to a real existing source gain a real, reachable source link; FKs with no real match stay honestly at the Unknown floor with the count documented; and the weekly auto-update workflow's cosmetic quoting bug is fixed without disturbing the pipeline
**Mode:** mvp
**Depends on**: Phase 2 (provenance + source resolution) — v1.0; independent of Phase 11
**Requirements**: INTG-01, INTG-02, INTG-03, INFRA-01
**Success Criteria** (what must be TRUE):
  1. Dangling source FKs that match a real existing source (by id / normalized match) are reconnected so their figures show a real source link, and the resolved count is reported — with ZERO fabricated sources introduced (no invented weights or sources)
  2. FKs with no real matching source remain at the honest Unknown floor, and the remaining-Unknown count is documented in the Methodology view
  3. New registered tests assert the resolved-vs-remaining counts and that zero fabricated sources were added; the `data/` JSON contract stays intact and the full suite stays green
  4. The `auto-update-data.yml` timestamp-echo quoting bug is fixed, the workflow remains valid, and the weekly cron schedule + GitHub-Pages deploy pipeline keep working (its data-validation tests intact)
**Plans**: TBD

## Progress

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1. Foundation (Safety-Net Modularization) | v1.0 | 3/3 | Complete | 2026-06-20 |
| 2. Provenance & Source Linking | v1.0 | 4/4 | Complete | 2026-06-20 |
| 3. Confidence, Methodology & Freshness | v1.0 | 4/4 | Complete | 2026-06-21 |
| 4. Design System & Smooth Motion | v1.0 | 4/4 | Complete | 2026-06-21 |
| 5. Hero Moment & Investor Narrative | v1.0 | 3/3 | Complete | 2026-06-21 |
| 6. Concentration & Risk Analytics | v1.0 | 3/3 | Complete | 2026-06-21 |
| 7. Scenario Stress-Tests | v1.0 | 3/3 | Complete | 2026-06-21 |
| 8. Interaction Performance | v1.0 | 4/4 | Complete | 2026-06-21 |
| 9. Mobile & Keyboard Accessibility | v1.0 | 3/3 | Complete | 2026-06-21 |
| 10. SEO, Social Cards & Launch Gate | v1.0 | 2/2 | Complete | 2026-06-21 |
| 11. Multi-Hop Scenario Cascade | v1.1 | 2/2 | Complete   | 2026-06-22 |
| 12. Source-FK Integrity & Workflow Fix | v1.1 | 0/? | Not started | - |

---
*Roadmap created: 2026-06-20 · v1.0 milestone shipped: 2026-06-21 · v1.1 phases added: 2026-06-22*
