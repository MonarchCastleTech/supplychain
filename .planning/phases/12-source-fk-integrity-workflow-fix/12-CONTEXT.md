# Phase 12: Source-FK Integrity & Workflow Fix - Context

**Gathered:** 2026-06-22
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous) — v1.1, final phase

<domain>
## Phase Boundary

Two independent integrity fixes, both honest: (1) reconnect dangling source FKs that actually resolve to a
REAL existing source so those figures gain a reachable source link; FKs with no real match stay honestly at
the Unknown floor (count documented in Methodology) — NO fabricated sources. (2) Fix the cosmetic
`auto-update-data.yml` timestamp-echo quoting bug without disturbing the weekly pipeline. Out of scope:
multi-hop cascade (Phase 11, done); volume-weighted HHI (deferred — no real volume data); any fabricated data.
</domain>

<decisions>
## Implementation Decisions

### Dangling-FK cleanup (INTG-01/02/03) — honest only
- The data has dangling `sourceId`/`sf` FKs (per Phase-2/3 research, ~33–75 referenced ids with no matching
  entry in the sources table). For each dangling FK, attempt to resolve it to a REAL existing source by
  id / normalized match. The researcher must determine HOW MANY are genuinely resolvable (e.g. a near-miss id,
  a normalized-label match to an existing real source) vs. truly orphaned.
- Resolvable FKs → reconnect (the figure gains a real, reachable source link). Unresolvable FKs → leave at the
  honest Unknown floor (provenanceFor already does this). Report resolved count + remaining-Unknown count;
  document remaining-Unknown in the Methodology view.
- **Hard rule:** never invent a source or point a FK at a wrong/unrelated source to "reduce the count." If the
  honest answer is "0 resolvable", that's the result — the value is the verified integrity check + documentation,
  not a cosmetic count reduction.
- Prefer a code-level resolver/normalization in `js/data` (or a one-time data correction that only maps to
  REAL existing sources) — keep the `data/` JSON contract intact and tests green.

### Workflow fix (INFRA-01)
- Fix `.github/workflows/auto-update-data.yml` "Create backup timestamp" step: the line
  `echo "timestamp=$(date +%Y%m%d-%H%M%S) >> $GITHUB_OUTPUT"` has the closing quote misplaced so the redirection
  is captured inside the string. Correct to `echo "timestamp=$(date +%Y%m%d-%H%M%S)" >> "$GITHUB_OUTPUT"`.
  The workflow must stay valid; its data-validation tests + the weekly cron + deploy pipeline must keep working.

### Tests
- New `.mjs` tests (REGISTERED in package.json scripts.test): assert the resolved-vs-remaining FK counts, that
  ZERO fabricated sources were added (every resolved FK points to a source that already existed in the real
  sources table), and that the `data/` contract is unchanged. A test/asserting the workflow line is fixed
  (no `>> $GITHUB_OUTPUT` captured inside the quoted echo). Keep the full 313-suite green.
</decisions>

<code_context>
## Existing Code Insights
- js/data/index.js: sources {id,title,url,note}, supplierToSymbols, normalizeEntityLabel, sourceIndex; provenanceFor (Unknown floor for dangling).
- js/trust/index.js: provenanceFor/badgeHtml (derived/observed/estimated/unknown).
- js/ui/index.js: Methodology modal copy (currently states ~75 dangling FKs / Unknown floor) — update remaining-Unknown count.
- .github/workflows/auto-update-data.yml: the misquoted timestamp echo (line ~34); weekly cron Mon 06:00; 3 data-validation tests.
- Gate: `npm test` (313) runs only files in package.json scripts.test — register new ones. Buildless; data frozen except honest, real-source-only FK reconnections.
</code_context>

<specifics>
## Specific Ideas
- A pure resolver `resolveSourceId(fkId, ctx)` → real source or null; reconnection only when non-null.
- Methodology: "X of Y previously-dangling source references now resolve to real sources; Z remain at the Unknown floor (honest)."
</specifics>

<deferred>
## Deferred Ideas
- Sourcing brand-new real sources for the truly-orphaned FKs → future (needs real external data).
- Volume-weighted HHI → deferred (no real volume data).
</deferred>
