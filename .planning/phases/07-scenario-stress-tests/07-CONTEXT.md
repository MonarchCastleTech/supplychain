# Phase 7: Scenario Stress-Tests - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous)

<domain>
## Phase Boundary

The signature differentiator: let investors explore "what-if" disruptions and see DOWNSTREAM IMPACT across
the network, on REAL data with full provenance. Deliverables: (1) a pure scenario engine that, given a
disruption (disable a supplier / chokepoint / country-or-layer), computes which companies are affected and
the magnitude (suppliers lost, concentration shift, market-cap exposed); (2) at least one concrete shipped
scenario — "Taiwan semiconductor disruption" (disable TSMC / Taiwan-linked semiconductor suppliers) — with a
UI to run it and an impact view; (3) every derived analytic (concentration, bottleneck, scenario output)
carries honest provenance and is test-covered. Out of scope: performance internals (Phase 8), mobile
(Phase 9), launch/SEO (Phase 10), any data change.
</domain>

<decisions>
## Implementation Decisions

### Scenario engine (DEPTH-03) — pure, real-data
- Add a pure `runScenario(disruption, ctx)` to js/analytics (DOM-free, unit-testable). A disruption targets
  real entities — e.g. `{ disableSuppliers: [normalizedLabel...] }` or `{ disableSupplier: 'tsmc' }`. Output:
  `{ impactedCompanies: [{symbol, lostSuppliers, concentrationBefore, concentrationAfter}], totalMarketCapExposed, supplierCount }`.
  Computed from the real graph (supplierToSymbols / profiles[].nodes / node marketcap). State assumptions
  (e.g. a company is "impacted" if it loses ≥1 supplier; severity by share of suppliers lost) — no fabrication.
- Reuse Phase-6 analytics (buildSupplierFanIn, companyConcentration) for before/after concentration deltas.

### Shipped scenario (DEPTH-03)
- A concrete "Taiwan semiconductor disruption" preset: disable TSMC (and/or Taiwan-linked semiconductor
  suppliers found in real data) → list impacted companies + combined market-cap exposed + concentration
  worsening. Numbers derived live from data (TSMC fan-in etc.), never hardcoded.

### Scenario UI (DEPTH-03)
- A scenario picker/panel: choose a preset (Taiwan semis) or a chokepoint supplier to "disrupt"; show an
  impact panel (affected companies + exposed $cap) and highlight the impacted companies in the graph
  (reuse highlightBy). A "reset" returns to normal. Clear, honest framing.

### Provenance (DEPTH-04)
- Scenario outputs are DERIVED — tag with the Phase-6 `derived` provenance ('derived' badge + "computed from
  N relationships", methodology link). Update Methodology copy to explain the scenario model + assumptions
  + limits. Never present scenario output as observed fact.

### Tests
- Pure unit tests: runScenario impact set correctness (disabling TSMC impacts exactly the real dependents),
  market-cap exposed sums real values, concentration-after ≥ before for impacted firms, empty/no-op
  disruption is safe. Wiring/provenance string tests. Register new test files in package.json scripts.test.
  Keep the full suite (242) green.
</decisions>

<code_context>
## Existing Code Insights
- js/analytics: buildSupplierFanIn/companyConcentration/sectorConcentration/supplierCriticality (Phase 6) — reuse.
- js/data: supplierToSymbols, profiles[].nodes (kind==='supplier'), node marketcap, normalizeEntityLabel.
- Real data supports the scenario: TSMC (40 refs), Taiwan, semiconductor present.
- js/trust: provenanceFor derived branch + badgeHtml "Derived" (Phase 6).
- js/viz highlightBy; js/ui panels + methodology modal.
- Gate: `npm test` (242) runs only files in package.json scripts.test — register new ones. Buildless; data frozen.
</code_context>

<specifics>
## Specific Ideas
- Scenario panel: "Run stress-test ▸ Taiwan semiconductor disruption" → "N companies impacted, $X.XT market cap exposed", list + graph highlight, Derived badge + methodology link.
- Allow disrupting any top chokepoint (from Phase-6 criticality) as the generalized control.
</specifics>

<deferred>
## Deferred Ideas
- Multi-hop cascade / probabilistic propagation → future (v1 = direct dependents impact).
- Perf memoization of repeated scenario runs → Phase 8.
</deferred>
