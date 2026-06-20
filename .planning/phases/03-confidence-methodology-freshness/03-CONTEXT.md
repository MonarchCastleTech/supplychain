# Phase 3: Confidence, Methodology & Freshness - Context

**Gathered:** 2026-06-20
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous) — derived from spec + Phase 2 trust foundation

<domain>
## Phase Boundary

Let investors judge HOW MUCH to trust each figure and the dataset overall: (1) a 0–100% confidence score
per figure weighted by source type + age decay, shown in tooltips; (2) a dedicated Methodology view
explaining sources, weighting, and known limits; (3) a visible "last verified / data freshness" indicator
tied to the auto-update pipeline timestamp that stays accurate after a weekly refresh; (4) new tests for
confidence math + provenance. Builds directly on Phase 2's `js/trust` provenance core. Out of scope:
visual-design-system polish (Phase 4), new analytics (Phase 6+), any data-contract change or fabrication.
</domain>

<decisions>
## Implementation Decisions

### Confidence score (TRUST-03) — real-data-derived, no fabrication
- Add `confidenceScore(input, ctx)` → 0–100 (integer) to `js/trust/index.js`, composed from:
  - **Source-type weight**: derived from the existing `confidence` qualifier vocabulary (e.g. "high (company
    disclosure)" > "medium (source-backed)") — map qualifiers to base weights. This is the real
    source-type signal present in the data.
  - **Age decay**: derived from source years via the existing `parseYearsFromSources` (older sources decay
    the score). Use the dataset `meta.lastUpdated`/`generated` as "now" reference.
  - **Unknown handling**: figures with no provenance get a low/explicit-uncertain score (never a fabricated
    high score). Score is shown alongside the Phase-2 observed/estimated/unknown badge in tooltips.
- The score function is PURE/DOM-free and unit-tested (weighting + decay math).

### Methodology view (TRUST-04)
- A dedicated, accessible Methodology modal/panel (in `js/ui`) explaining: the real data sources (counts by
  type, the 407 sources), how the confidence weighting + age decay work, the observed/estimated/unknown
  semantics, and known limits (e.g. dangling source FKs, estimated relationships). Reachable from a clear
  entry point (e.g. a "Methodology" button near the stat bar / help). Content is honest about limitations.

### Freshness indicator (TRUST-05)
- A visible "last verified / updated" indicator bound to the dataset `meta.lastUpdated` (and/or `generated`)
  — the value the weekly GitHub-Actions auto-update writes. It MUST read the live value so it stays accurate
  after a refresh (no hardcoded date). Place in the stat bar / header / footer.

### Tests (TRUST-06)
- New `.mjs` tests (REGISTERED in `package.json scripts.test`) covering confidence-score math (weighting +
  age decay, bounds 0–100, unknown→low), the methodology view's presence/wiring, and freshness reading the
  live meta value (not hardcoded). Keep the full suite green.
</decisions>

<code_context>
## Existing Code Insights
- `js/trust/index.js` (Phase 2): provenanceFor/badgeHtml/renderProvenanceBadge — extend with confidenceScore.
- `js/data/index.js`: parseYearsFromSources (age), reads DATA.meta (has `lastUpdated`, `generated`).
- `js/viz/index.js`: tooltips (showTooltip/showLinkTooltip) — add score display next to badge.
- `js/ui/index.js`: modals (help/compare/provenance drawer) — add Methodology modal + freshness indicator.
- Gate: `npm test` (currently 144 pass) runs ONLY files listed in package.json scripts.test — register new files.
- Buildless; data contract frozen; no design-system work.
</code_context>

<specifics>
## Specific Ideas
- Confidence shown as e.g. "Confidence: 82%" in tooltips next to the observed/estimated badge.
- Methodology modal mirrors the existing modal pattern (role=dialog, focus trap, close button) for a11y.
- Freshness like "Data verified: <meta.lastUpdated>" — live-bound.
</specifics>

<deferred>
## Deferred Ideas
- Design-system styling of score/methodology/freshness → Phase 4.
- Per-source confidence dashboards / analytics → Phase 6+.
</deferred>
