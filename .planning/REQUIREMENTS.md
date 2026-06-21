# Requirements: Monarch Castle Technologies — Market Intelligence

**Defined:** 2026-06-20
**Core Value:** Investors trust every number and instantly grasp supply-chain structure, concentration, and risk — credibility first, then beauty, then unique depth.

## v1 Requirements

Requirements for this milestone ("best in the world"). Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Inline CSS is extracted into versioned `styles/` files with no visual change to the rendered site
- [x] **FOUND-02**: Inline JavaScript is extracted into ES modules under `js/` (data, viz, ui, trust, state) with `index.html` reduced to a semantic shell
- [x] **FOUND-03**: The full existing test suite (103 tests) passes unchanged after modularization
- [x] **FOUND-04**: A performance + Lighthouse baseline is captured and recorded in the repo
- [x] **FOUND-05**: The site renders byte-for-byte equivalently (no user-visible regression) and the GitHub-Pages static deploy still works

### Trust

- [x] **TRUST-01**: Every displayed major figure shows a provenance badge tagging it `observed` or `estimated`
- [x] **TRUST-02**: Each figure exposes a reachable inline source link (e.g., SEC filing, annual report) on hover or click
- [x] **TRUST-03**: A confidence score (0–100%) is computed per figure, weighted by source type and age decay, and shown in tooltips
- [x] **TRUST-04**: A dedicated Methodology view explains data sources, confidence weighting, and known limits
- [x] **TRUST-05**: A visible "last verified / data freshness" indicator is tied to the auto-update pipeline timestamp
- [x] **TRUST-06**: New tests cover provenance tagging and confidence-scoring math

### Storytelling

- [x] **STORY-01**: A consistent design system (typography scale, color, depth, motion tokens) is applied site-wide
- [x] **STORY-02**: A first-time visitor sees a "first 30 seconds" guided hero moment that auto-reveals the global map with narration
- [x] **STORY-03**: D3 transitions are smooth with no jarring full-simulation restart on view changes
- [x] **STORY-04**: An investor narrative flow guides the user market → concentration → risk → opportunity
- [x] **STORY-05**: Storytelling/hero behavior is covered by non-regression tests

### Depth

- [x] **DEPTH-01**: A supply-chain concentration score is computed and displayed per company/sector on real data
- [x] **DEPTH-02**: Risk and bottleneck analytics highlight critical single points of failure in the network
- [x] **DEPTH-03**: At least one scenario stress-test (e.g., "Taiwan semiconductor disruption") runs over real data and shows downstream impact
- [x] **DEPTH-04**: Every derived analytic carries provenance and is covered by tests

### Performance & Launch

- [x] **PERF-01**: Filter and style interactions are memoized — no full simulation restart for simple filter/style changes
- [x] **PERF-02**: The site is fully usable on mobile (responsive layout, touch interactions)
- [x] **PERF-03**: A complete keyboard-only journey covers search → filter → select → reset
- [ ] **PERF-04**: SEO/meta tags and social share cards are present and valid
- [ ] **PERF-05**: A final verification gate confirms Lighthouse targets met and all tests green before launch

## v2 Requirements

Deferred to future milestones.

### Future

- **FUT-01**: Real-time streaming macro updates
- **FUT-02**: Saved/collaborative workspaces
- **FUT-03**: Expanded universe beyond top-100 companies

## Out of Scope

| Feature | Reason |
|---------|--------|
| Login / user accounts | Audience is public investors; no auth needed |
| Backend / API migration | Preserve buildless static GitHub-Pages deploy |
| Real-time streaming updates | Weekly auto-update is sufficient |
| Fabricated / unsourced data | Credibility is the core value |
| Heavy framework / build tool | Preserve simple static deploy |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| TRUST-01 | Phase 2 | Complete |
| TRUST-02 | Phase 2 | Complete |
| TRUST-03 | Phase 3 | Complete |
| TRUST-04 | Phase 3 | Complete |
| TRUST-05 | Phase 3 | Complete |
| TRUST-06 | Phase 3 | Complete |
| STORY-01 | Phase 4 | Complete |
| STORY-03 | Phase 4 | Complete |
| STORY-02 | Phase 5 | Complete |
| STORY-04 | Phase 5 | Complete |
| STORY-05 | Phase 5 | Complete |
| DEPTH-01 | Phase 6 | Complete |
| DEPTH-02 | Phase 6 | Complete |
| DEPTH-03 | Phase 7 | Complete |
| DEPTH-04 | Phase 7 | Complete |
| PERF-01 | Phase 8 | Complete |
| PERF-02 | Phase 9 | Complete |
| PERF-03 | Phase 9 | Complete |
| PERF-04 | Phase 10 | Pending |
| PERF-05 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25/25 ✓
- Unmapped: 0

---
*Requirements defined: 2026-06-20*
*Last updated: 2026-06-20 after roadmap creation (traceability mapped)*
