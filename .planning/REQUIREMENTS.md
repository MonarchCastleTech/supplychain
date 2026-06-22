# Requirements: Monarch Castle Technologies — v1.1 Depth & Integrity Polish

**Defined:** 2026-06-22
**Core Value:** Investors trust every number and instantly grasp supply-chain structure, concentration, and risk — credibility first, then beauty, then unique depth.

## v1.1 Requirements

Requirements for this milestone. Each maps to a roadmap phase. Continues the no-fabrication rule from v1.0.

### Cascade (multi-hop scenario)

- [x] **CASC-01**: `runScenario` propagates a disruption beyond direct dependents to second-order (multi-hop) downstream effects over the REAL graph, with a bounded, terminating traversal (no infinite loops, cycle-safe)
- [x] **CASC-02**: Cascade output distinguishes hop levels (e.g. direct vs. indirect impact) and the scenario panel shows a hop breakdown; impacted set + market-cap exposed reflect the multi-hop result, derived live (not hardcoded)
- [x] **CASC-03**: Cascade output keeps the honest `derived` provenance badge and the Methodology copy is updated to explain the multi-hop model, its bound, and its assumptions (replacing the v1.0 "single-hop only" note)
- [x] **CASC-04**: New unit tests assert cascade correctness — termination on cycles, hop-count accuracy, multi-hop impact ⊇ single-hop impact, real fixtures — and the full suite stays green

### Integrity (dangling source FKs)

- [ ] **INTG-01**: Dangling source FKs that resolve to a real existing source (by id/normalized match) are reconnected so their figures gain a real source link; the resolved count is reported
- [ ] **INTG-02**: FKs with no real matching source remain honestly at the Unknown floor — no fabricated sources are introduced (asserted by test); the remaining-Unknown count is documented in the Methodology view
- [ ] **INTG-03**: New tests assert the resolved-vs-remaining counts and that zero fabricated sources were added; the `data/` JSON contract stays intact

### Infrastructure

- [ ] **INFRA-01**: The `auto-update-data.yml` timestamp-echo quoting bug is fixed and the workflow remains valid (its data-validation tests intact); the weekly schedule + deploy pipeline keep working

## Future Requirements

Deferred — tracked but not in this roadmap.

### Blocked on real data

- **HHI-01**: Per-supplier volume weighting for a true (non-equal-weight) HHI — requires real per-supplier volume data the dataset does not contain; cannot be done without fabricating weights

## Out of Scope

| Feature | Reason |
|---------|--------|
| Fabricated volume weights or sources | Violates the core no-fabrication rule |
| Login / accounts / backend | Unchanged from v1.0 — public buildless static site |
| Framework / build tool | Preserve buildless GitHub-Pages deploy |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CASC-01 | Phase 11 | Complete |
| CASC-02 | Phase 11 | Complete |
| CASC-03 | Phase 11 | Complete |
| CASC-04 | Phase 11 | Complete |
| INTG-01 | Phase 12 | Pending |
| INTG-02 | Phase 12 | Pending |
| INTG-03 | Phase 12 | Pending |
| INFRA-01 | Phase 12 | Pending |

**Coverage:**
- v1.1 requirements: 8 total
- Mapped to phases: 8/8 (100%)
- Unmapped: 0

---
*Requirements defined: 2026-06-22 · Traceability mapped: 2026-06-22*
