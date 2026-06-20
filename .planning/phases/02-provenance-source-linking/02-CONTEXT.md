# Phase 2: Provenance & Source Linking - Context

**Gathered:** 2026-06-20
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous) — decisions derived from approved spec and Phase 1 foundation

<domain>
## Phase Boundary

Make provenance visible: every major displayed figure must show an `observed` vs `estimated` badge and
expose a reachable inline source link on hover/click. This is the credibility foundation, built on the
real `data/` JSON contract (which carries `confidence`, `provenance`, `observed`/`estimated`, and source
references already — verified present). In scope: a provenance/source-link UI layer driven by existing
data fields, populated into the `js/trust/` module that Phase 1 stubbed. Out of scope: confidence
SCORING math, methodology view, freshness indicator (those are Phase 3); any data-contract change; any
fabricated data.
</domain>

<decisions>
## Implementation Decisions

### Data-driven, real sources only (hard constraint)
- Provenance comes ONLY from existing data fields (`confidence`, `provenance`, source refs). Do NOT
  invent sources or tags. If a figure lacks provenance data, show an explicit "unsourced/unknown" state
  rather than a fabricated `observed`/`estimated` label.

### Where badges appear
- Tag the "major figures": node/company stats (market cap, the top stat bar `$xT cap`, node confidence),
  tooltip figures, and profile-panel figures. Use a small, consistent badge component (e.g. a dot/pill +
  label) rendered next to each figure.

### Module placement
- Implement in `js/trust/index.js` (the Phase 1 placeholder): export `provenanceFor(datum/field)` → returns
  `{ tag: 'observed'|'estimated'|'unknown', source?: {label, url} }`, plus a `renderProvenanceBadge(el, prov)`
  helper. `js/viz` and `js/ui` import these to attach badges to tooltips, the stat bar, and the profile panel.

### Source link behavior
- Each badge with a source exposes a reachable link (opens the SEC filing / annual report / source URL in a
  new tab) on hover (tooltip) or click (profile). Links must resolve to a real source value from the data.

### Tests
- Keep all existing tests green. Add new `.mjs` tests asserting: every major-figure render path attaches a
  provenance tag; the tag value is derived from data (never hardcoded); a sourced figure produces a
  reachable link; an unsourced figure shows the explicit unknown state (no fabricated label).
</decisions>

<code_context>
## Existing Code Insights
- Phase 1 produced `js/trust/index.js` as an empty `export {}` placeholder — populate it here.
- `js/data/index.js` reads `window.SUPPLY_MAP_DATA`/`window.CREDIT_RATINGS` and holds normalization/ratings
  helpers; provenance fields live on the data records.
- `js/viz/index.js` renders tooltips/nodes; `js/ui/index.js` renders the profile panel and stat bar — these
  are the badge attachment points.
- `d.confidence` was the legacy source-verification field (see WEBSITE_IMPROVEMENTS notes).
- Gate: `npm test` (116 pass). Buildless; data contract frozen.
</code_context>

<specifics>
## Specific Ideas
- Provenance badge: tiny accessible pill — `observed` (e.g., solid/green), `estimated` (e.g., hollow/amber),
  `unknown` (neutral/grey) — with `aria-label` and `title`. Keep visual styling minimal here; the full
  design system is Phase 4.
</specifics>

<deferred>
## Deferred Ideas
- Confidence 0–100% scoring + age decay → Phase 3.
- Methodology view + freshness indicator → Phase 3.
- Visual/design-system polish of the badges → Phase 4.
</deferred>
