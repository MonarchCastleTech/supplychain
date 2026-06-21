# Phase 8: Interaction Performance - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous)

<domain>
## Phase Boundary

Make filtering and styling feel immediate: simple filter/style changes must NEVER trigger an expensive full
simulation restart, and repeated analytic computations are memoized. Deliverables: (1) memoize the pure
recompute hotspots (companyConcentration, supplierCriticality / fan-in, overlap index, scenario results)
so repeated interactions are O(1) cache hits; (2) guarantee + assert that simple filter/style changes go
through the opacity-only highlight path (no updateGraph/forceSimulation restart); (3) a measurable latency
improvement vs the Phase-1 baseline, recorded. Builds on Phase-4 (sim build-once) and Phase-6/7 analytics.
Out of scope: new features, mobile (Phase 9), launch/SEO (Phase 10), data changes.
</domain>

<decisions>
## Implementation Decisions

### Memoization (PERF-01) — correctness-preserving
- Add small, pure memo caches for the deterministic analytics that are recomputed on interaction:
  - companyConcentration(symbol) — cache by symbol (+ opts signature) since data is frozen per session.
  - supplierCriticality / buildSupplierFanIn — compute once per session (cache).
  - shared-supplier overlap / getTopOverlap — already built once; ensure no per-interaction rebuild.
  - runScenario — cache by disruption key (preset/supplier set).
- Memoization must be invalidation-safe: keyed on inputs; since DATA is frozen at load, a per-session cache
  is correct. Provide a clear cache-reset seam for tests. NO change to computed VALUES (tests still assert
  the same real numbers: GILD=36, NVDA=12, Taiwan 7/$11.36T, etc.).

### No full restart on simple changes (PERF-01)
- Verify and lock the invariant: applyFilters / style toggles / highlight use the opacity-only highlightBy
  path and do NOT call updateGraph()/render() or recreate/alpha(1)-restart the simulation. Add a guard/test
  proving simple filter/style interactions don't restart the sim (only legitimate view/data changes do).

### Latency measurement (PERF-01 SC2)
- Re-run the Phase-1/4 Playwright/perf harness to capture interaction latency (e.g. time to apply a filter,
  open N profiles) before vs after memoization, and record the improvement in docs/perf/. Honest numbers.

### Tests
- Unit tests: memoized fns return identical values to non-memoized (same real anchors), second call is a
  cache hit (e.g. underlying compute called once via a spy/counter), cache-reset seam works. A guard test
  that applyFilters/style path contains no simulation-restart call. Register new test files in
  package.json scripts.test. Keep the full suite (257) green.
</decisions>

<code_context>
## Existing Code Insights
- Hotspots: js/ui applyFilters (L523), companyConcentration per profile (L472), supplierCriticality per chokepoint (L638); js/analytics pure fns; js/data overlap built once at module load.
- Phase 4: simulation build-once (buildSimulation idempotent L437), updateGraph for view changes, highlightBy opacity-only — confirm applyFilters routes through highlightBy.
- Phase-1 baseline: docs/perf/baseline-2026-06-20.md + _perf-capture.cjs harness.
- Gate: `npm test` (257) runs only files in package.json scripts.test — register new ones. Buildless; data frozen; values must not change.
</code_context>

<specifics>
## Specific Ideas
- Lightweight memoize helper (Map keyed by stable string) in js/analytics; expose a `__resetAnalyticsCache()` for tests.
- Guard test: read applyFilters + style-toggle source, assert no `forceSimulation(`/`alpha(1)`/`updateGraph(`/`render(` call in that path.
</specifics>

<deferred>
## Deferred Ideas
- Web-worker offload / virtualization for very large graphs → future.
- Mobile interaction perf → Phase 9.
</deferred>
