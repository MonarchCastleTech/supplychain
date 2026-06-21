# Roadmap: Monarch Castle Technologies â "Best in the World"

**Created:** 2026-06-20
**Granularity:** fine
**Mode:** mvp
**Core Value:** Investors trust every number and instantly grasp supply-chain structure, concentration, and risk â credibility first, then beauty, then unique depth.

This roadmap preserves the approved spec's mandatory ordering: **Foundation first â Trust â Storytelling/Visual â Depth of intelligence â Performance/Accessibility/Launch last.** Trust precedes all visual polish (credibility-first hard constraint from the spec risk register).

**Standing hard constraints (apply to every phase):**
- The existing 103-test suite stays green throughout; new behavior gets new tests.
- Real, sourced data only â nothing fabricated; every major figure traceable to a reachable source.
- Buildless static site preserved; GitHub-Pages direct serve and the weekly auto-update Actions pipeline keep working.
- No login; public investor audience.

## Phases

- [x] **Phase 1: Foundation (Safety-Net Modularization)** - Extract inline CSS/JS into modules with zero user-visible change, tests green, baseline captured (completed 2026-06-20)
- [x] **Phase 2: Provenance & Source Linking** - Every major figure tagged observed/estimated with a reachable inline source link (completed 2026-06-20)
- [x] **Phase 3: Confidence, Methodology & Freshness** - Confidence scoring, Methodology view, freshness indicator, and trust-math tests (completed 2026-06-21)
- [x] **Phase 4: Design System & Smooth Motion** - Consistent design tokens applied site-wide and jank-free D3 transitions
- [x] **Phase 5: Hero Moment & Investor Narrative** - First-30s guided hero and marketâconcentrationâriskâopportunity flow, with non-regression tests (completed 2026-06-21)
- [x] **Phase 6: Concentration & Risk Analytics** - Per-company/sector concentration scoring and single-point-of-failure bottleneck analytics on real data (completed 2026-06-21)
- [x] **Phase 7: Scenario Stress-Tests** - At least one real-data scenario stress-test with downstream impact, all analytics carrying provenance and tests (completed 2026-06-21)
- [x] **Phase 8: Interaction Performance** - Memoized filter/style interactions with no full simulation restart (completed 2026-06-21)
- [ ] **Phase 9: Mobile & Keyboard Accessibility** - Full mobile usability and a complete keyboard-only journey
- [ ] **Phase 10: SEO, Social Cards & Launch Gate** - Valid SEO/social metadata and a final verification gate before launch

## Phase Details

### Phase 1: Foundation (Safety-Net Modularization)
**Goal**: The monolithic `index.html` becomes a maintainable, modular foundation with no user-visible change, giving every later phase a safe base to build on.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):
  1. Inline CSS is extracted into versioned `styles/` files (base/layout/components/theme) with no visual change to the rendered site.
  2. Inline JavaScript is extracted into ES modules under `js/` (data, viz, ui, trust, state) and `index.html` is reduced to a semantic shell linking those files.
  3. The full existing test suite (103 tests) passes unchanged, and the GitHub-Pages static deploy still serves the site directly with no build step.
  4. The site renders byte-for-byte equivalently to today (no user-visible regression).
  5. A performance + Lighthouse baseline is captured and recorded in the repo for later comparison.
**Plans**: 3 plans
- [x] 01-01-PLAN.md — Pre-extraction Lighthouse/perf baseline + tooling (FOUND-04)
- [x] 01-02-PLAN.md — Extract CSS + JS modules, semantic-shell index.html, window.* shim (FOUND-01/02/03)
- [x] 01-03-PLAN.md — Deploy workflow copies styles/+js/, post-extraction parity + baseline (FOUND-05/04)
**UI hint**: yes

### Phase 2: Provenance & Source Linking
**Goal**: No investor sees a major number without knowing whether it is observed or estimated and where it came from â the credibility foundation laid before any other trust feature.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: TRUST-01, TRUST-02
**Success Criteria** (what must be TRUE):
  1. Every displayed major figure shows a provenance badge tagging it `observed` or `estimated`.
  2. Each figure exposes a reachable inline source link (e.g., SEC filing, annual report) on hover or click that resolves to a real source.
  3. No figure is fabricated or unsourced â provenance is driven by the existing real `data/` JSON contract, which remains unchanged.
  4. The 103-test suite stays green with provenance rendering in place.
**Plans**: 4 plans
- [x] 02-01-PLAN.md — Implement data-driven trust core (provenanceFor/badgeHtml/renderProvenanceBadge) + register provenance test (TRUST-01/02)
- [x] 02-02-PLAN.md — Wire badges into viz: node/link tooltips, $cap stat bar, verified-node class (TRUST-01/02)
- [x] 02-03-PLAN.md — Wire badges into ui: company card, compare grid, source drawer + fix src.t→title bug (TRUST-01/02)
- [x] 02-04-PLAN.md — Register trust-wiring test, full-suite green gate, browser human-verify checkpoint (TRUST-01/02)
**UI hint**: yes

### Phase 3: Confidence, Methodology & Freshness
**Goal**: Investors can judge how much to trust each figure and the dataset as a whole â quantified confidence, an explained methodology, and a verifiable freshness guarantee.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: TRUST-03, TRUST-04, TRUST-05, TRUST-06
**Success Criteria** (what must be TRUE):
  1. A confidence score (0â100%) is computed per figure, weighted by source type and age decay, and shown in tooltips.
  2. A dedicated Methodology view explains data sources, confidence weighting, and known limits.
  3. A visible "last verified / data freshness" indicator is tied to the auto-update pipeline timestamp and stays accurate after a weekly refresh.
  4. New tests cover provenance tagging and confidence-scoring math, and the full suite stays green.
**Plans**: 4 plans
- [x] 03-01-PLAN.md — [BLOCKING] restore rich served data/top100-map.js, quarantine weekly updater, register Phase-3 tests + data-shape guard (TRUST-05/06)
- [x] 03-02-PLAN.md — confidenceScore in js/trust + sourceYear in js/data + viz tooltip score wiring + remove viz #lastUpdated dup (TRUST-03/05/06)
- [x] 03-03-PLAN.md — accessible Methodology modal + freshness single-owner + methodology/freshness tests (TRUST-04/05/06)
- [x] 03-04-PLAN.md — full-suite green gate + render smoke + human visual verify (TRUST-03/04/05/06)
**UI hint**: yes

### Phase 4: Design System & Smooth Motion
**Goal**: The trusted experience looks world-class and moves smoothly â a consistent visual language and jank-free D3 motion that never destroys the user's mental map.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: STORY-01, STORY-03
**Success Criteria** (what must be TRUE):
  1. A consistent design system (typography scale, color, depth, motion tokens) is applied site-wide.
  2. D3 transitions are smooth with no jarring full-simulation restart on view changes.
  3. All existing trust affordances (provenance badges, source links, confidence, freshness) remain visible and correct under the new design system.
  4. The 103-test suite plus the trust tests stay green.
**Plans**: 4 plans
Plans:
- [x] 04-01-PLAN.md — Token set in base.css :root + register design-tokens & viz-motion tests (STORY-01/03)
- [x] 04-02-PLAN.md — Migrate layout/components/theme to tokens + reduced-motion CSS block (STORY-01/03)
- [x] 04-03-PLAN.md — Build-once D3 motion: buildSimulation + updateGraph + position carry + matchMedia guard (STORY-03)
- [x] 04-04-PLAN.md — Full-suite green gate + render/motion smoke + human visual verify (STORY-01/03)
**UI hint**: yes

### Phase 5: Hero Moment & Investor Narrative
**Goal**: A first-time investor reaches a clear "aha" within ~30 seconds and is guided through a coherent story from market to opportunity.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: STORY-02, STORY-04, STORY-05
**Success Criteria** (what must be TRUE):
  1. A first-time visitor sees a "first 30 seconds" guided hero moment that auto-reveals the global map with narration.
  2. An investor narrative flow guides the user market â concentration â risk â opportunity.
  3. Storytelling/hero behavior is covered by non-regression tests, and the full suite stays green.
**Plans**: 3 plans
Plans:
- [x] 05-01-PLAN.md — Wave 0 test gate + pure buildNarrative(data) 4-step data engine (STORY-04, STORY-05)
- [x] 05-02-PLAN.md — createHeroController factory: autoplay/skip/replay/reduced-motion, all deps injected (STORY-02, STORY-05)
- [x] 05-03-PLAN.md — index.html overlay + #bTour + main.js wiring; full suite green (STORY-02, STORY-04, STORY-05)
**UI hint**: yes

### Phase 6: Concentration & Risk Analytics
**Goal**: Investors instantly grasp where supply-chain risk concentrates â quantified concentration and the critical single points of failure in the network, on real data.
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: DEPTH-01, DEPTH-02
**Success Criteria** (what must be TRUE):
  1. A supply-chain concentration score is computed and displayed per company/sector using real data only.
  2. Risk and bottleneck analytics highlight critical single points of failure in the network.
  3. Each displayed analytic carries provenance consistent with the Phase 2â3 trust layer (no unsourced derived numbers).
**Plans**: 3 plans
Plans:
- [x] 06-01-PLAN.md — Wave 0 test gate + pure js/analytics: company/sector concentration + supplier criticality (DEPTH-01, DEPTH-02)
- [x] 06-02-PLAN.md — Derived provenance branch + profile concentration badge, chokepoints panel + graph highlight, Methodology copy (DEPTH-01, DEPTH-02)
- [x] 06-03-PLAN.md — Full-suite green + Playwright integration smoke + human-verify gate (DEPTH-01, DEPTH-02)
**UI hint**: yes

### Phase 7: Scenario Stress-Tests
**Goal**: Investors can explore "what if" disruptions and see downstream impact â the uniquely deep capability that distinguishes the site, on real data with full provenance.
**Mode:** mvp
**Depends on**: Phase 6
**Requirements**: DEPTH-03, DEPTH-04
**Success Criteria** (what must be TRUE):
  1. At least one scenario stress-test (e.g., "Taiwan semiconductor disruption") runs over real data and shows downstream impact across the network.
  2. Every derived analytic (concentration, bottleneck, scenario output) carries provenance and is covered by tests.
  3. The full suite, including the new analytic tests, stays green.
**Plans**: 3 plans
Plans:
- [x] 07-01-PLAN.md — Wave 0 test gate + pure runScenario engine + TAIWAN_SEMI preset + excludeSuppliers opt (DEPTH-03)
- [x] 07-02-PLAN.md — Scenario UI panel + Taiwan preset/chokepoint select + graph highlight + derived provenance + methodology copy (DEPTH-03, DEPTH-04)
- [x] 07-03-PLAN.md — Full-suite green + Playwright scenario smoke + human-verify gate (DEPTH-03, DEPTH-04)
**UI hint**: yes

### Phase 8: Interaction Performance
**Goal**: Filtering and styling the visualization feels immediate â simple changes never trigger an expensive full simulation restart.
**Mode:** mvp
**Depends on**: Phase 7
**Requirements**: PERF-01
**Success Criteria** (what must be TRUE):
  1. Filter and style interactions are memoized â no full simulation restart for simple filter/style changes.
  2. Interaction latency improves measurably against the Phase 1 performance baseline.
  3. The 103-test suite plus all phase tests stay green after the performance refactor.
**Plans**: 4 plans
Plans:
- [x] 08-01-PLAN.md — Wave 0 register tests + _memo helper/seams + memoize fan-in/concentration/criticality/scenario (PERF-01)
- [x] 08-02-PLAN.md — No-restart invariant guard over simple filter/style/highlight handlers; bReset allow-listed (PERF-01)
- [x] 08-03-PLAN.md — Node micro-bench (cold vs warm) + recorded latency improvement under docs/perf/ (PERF-01 SC2)
- [x] 08-04-PLAN.md — Full-suite green gate + registration proof + human-verify immediacy checkpoint (PERF-01)
**UI hint**: yes

### Phase 9: Mobile & Keyboard Accessibility
**Goal**: Every investor can use the full experience â whether on a phone or entirely from the keyboard.
**Mode:** mvp
**Depends on**: Phase 8
**Requirements**: PERF-02, PERF-03
**Success Criteria** (what must be TRUE):
  1. The site is fully usable on mobile (responsive layout, working touch interactions).
  2. A complete keyboard-only journey covers search â filter â select â reset.
  3. The full test suite stays green and the accessibility (ARIA) baseline is preserved or improved.
**Plans**: TBD
**UI hint**: yes

### Phase 10: SEO, Social Cards & Launch Gate
**Goal**: The site is discoverable, shareable, and verifiably ready â a final gate confirms credibility, quality, and performance targets before launch.
**Mode:** mvp
**Depends on**: Phase 9
**Requirements**: PERF-04, PERF-05
**Success Criteria** (what must be TRUE):
  1. SEO/meta tags and social share cards are present and valid (verified by preview tooling).
  2. A final verification gate confirms Lighthouse targets met and all tests green before launch.
  3. The buildless static GitHub-Pages deploy and weekly auto-update pipeline are confirmed still working at launch.
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation (Safety-Net Modularization) | 3/3 | Complete   | 2026-06-20 |
| 2. Provenance & Source Linking | 4/4 | Complete   | 2026-06-20 |
| 3. Confidence, Methodology & Freshness | 4/4 | Complete   | 2026-06-21 |
| 4. Design System & Smooth Motion | 4/4 | Complete   | 2026-06-21 |
| 5. Hero Moment & Investor Narrative | 3/3 | Complete   | 2026-06-21 |
| 6. Concentration & Risk Analytics | 3/3 | Complete   | 2026-06-21 |
| 7. Scenario Stress-Tests | 3/3 | Complete   | 2026-06-21 |
| 8. Interaction Performance | 4/4 | Complete   | 2026-06-21 |
| 9. Mobile & Keyboard Accessibility | 0/0 | Not started | - |
| 10. SEO, Social Cards & Launch Gate | 0/0 | Not started | - |

---
*Roadmap created: 2026-06-20*
