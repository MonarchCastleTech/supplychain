# Phase 11: Multi-Hop Scenario Cascade - Context

**Gathered:** 2026-06-22
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous) — v1.1

<domain>
## Phase Boundary

Extend the v1.0 single-hop `runScenario` engine so a disruption propagates beyond DIRECT dependents to
second-order downstream effects over the REAL supply-chain graph — bounded and cycle-safe — and surface a
per-hop breakdown in the scenario panel with honest derived provenance. In scope: multi-hop traversal in
`js/analytics`, scenario-panel hop breakdown, Methodology copy update, tests. Out of scope: Phase 12's
FK-integrity/workflow work; any fabricated data; volume-weighted HHI (deferred, no real volume data).
</domain>

<decisions>
## Implementation Decisions

### Multi-hop engine (CASC-01/02), real-graph + honest
- Extend `runScenario(disruption, ctx)` with bounded multi-hop propagation: disrupt supplier(s) → direct
  dependents (hop 1) → if a dependent is itself an input/supplier to other companies, those are hop-2
  impacted, etc. Traversal MUST be cycle-safe (visited set) and bounded (a `maxHops` param, sensible default).
- **Honesty rule:** the cascade traverses ONLY real edges in the graph. If the real data is shallow (few or
  no company-as-supplier edges), multi-hop legitimately equals single-hop for those cases — that is the
  honest result, documented, NOT padded. multiHop impacted set ⊇ singleHop set always.
- Output gains per-hop structure: `{impactedCompanies:[{...,hop}], byHop:{1:[...],2:[...]}, maxHopReached, totalMarketCapExposed,...}`. Pure/DOM-free; backward-compatible (single-hop = maxHops:1 behavior unchanged so v1.0 fixtures/tests stay green).

### Scenario UI (CASC-02/03)
- Scenario panel shows a direct-vs-indirect hop breakdown; impacted count + market-cap exposed reflect the
  full multi-hop result, derived live (NO hardcoded 7 / $11.36T). Keep the honest `Derived` badge.
- Methodology copy: replace the v1.0 "single-hop only" note with the multi-hop model, its termination bound,
  and assumptions.

### Tests (CASC-04)
- Pure unit tests: cycle termination (synthetic cyclic fixture terminates), hop-count accuracy, multiHop ⊇
  singleHop on the real dataset, maxHops bound respected, backward-compat (default/maxHops:1 reproduces the
  v1.0 Taiwan result: 7 firms / $11.36T). Register new test file(s) in package.json scripts.test. Keep the
  full 301-suite green.
</decisions>

<code_context>
## Existing Code Insights
- js/analytics/index.js: runScenario + SCENARIO_PRESETS.TAIWAN_SEMI + companyConcentration (excludeSuppliers) + buildSupplierFanIn + the per-session _memo cache (cache key must include maxHops).
- js/data/index.js: supplierToSymbols (supplier→companies), profiles[].nodes (kind supplier/service/channel/demand), links. The researcher must determine whether real 2nd-order edges exist (a company that is also a supplier/input to other companies) — this decides whether multi-hop yields a true superset or honestly equals single-hop.
- js/ui/index.js: #scenarioPanel render (impact list, headline), Methodology modal copy.
- js/trust/index.js: derived provenance badge.
- Gate: `npm test` (301) runs only files in package.json scripts.test — register new ones. Buildless; data frozen.
</code_context>

<specifics>
## Specific Ideas
- Panel: "N companies impacted across H hops · $X.XT exposed", with a small direct/indirect split.
- maxHops default small (e.g. 3) with the visited-set cycle guard as the real termination guarantee.
</specifics>

<deferred>
## Deferred Ideas
- Probabilistic / weighted cascade severity → future (needs real volume data).
- FK integrity + workflow fix → Phase 12.
</deferred>
