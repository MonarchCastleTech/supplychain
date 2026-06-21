# Phase 4: Design System & Smooth Motion - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous) — serves as the UI design contract for this phase

<domain>
## Phase Boundary

Make the trusted experience look world-class and move smoothly. Two deliverables: (1) a consistent
design SYSTEM — typography scale, color, depth/elevation, spacing, radii, and motion tokens — defined
once and applied site-wide by refactoring the existing CSS to consume tokens; (2) jank-free D3 motion
— view changes (mode switch, filter, highlight) must NOT tear down and recreate the whole force
simulation; transitions should preserve the user's mental map. Refine the EXISTING dark "market
intelligence" aesthetic — this is systematization + polish, not a redesign. Out of scope: the
first-30s hero/narrative (Phase 5), new analytics (Phase 6+), memoized-filter perf internals (Phase 8,
though motion smoothness overlaps), any data change.
</domain>

<decisions>
## Implementation Decisions

### Design tokens (STORY-01) — define once, apply everywhere
- Create a single source of truth for tokens in `styles/theme.css` `:root` (the project currently has only
  ~7 ad-hoc vars). Define a coherent token set:
  - **Color**: background layers (bg, surface, surface-raised), text (primary/secondary/muted), border,
    accent/brand, and SEMANTIC trust colors that MATCH the existing provenance classes
    (observed=green-ish, estimated=amber-ish, unknown=neutral) so badges stay correct.
  - **Typography**: a modular type scale (e.g. step variables --fs-xs..--fs-2xl), font-weights, line-heights.
  - **Spacing**: a consistent spacing scale (--space-1..--space-8).
  - **Radii** and **elevation/shadow** tokens for depth.
  - **Motion**: duration tokens (--dur-fast/base/slow) and easing tokens (--ease-standard/emphasized).
- Refactor base/layout/components/theme CSS to CONSUME these tokens. Keep all existing class names and IDs
  the tests assert (provenance `.confidence-*`/`.prov-badge`/`.source-link`, modal IDs, container IDs) —
  tokens are additive; restyle via tokens, do not rename hooks.
- Result: visually refined and consistent, but the trust affordances (badges, source links, confidence,
  freshness, methodology) remain visible and correct.

### Smooth D3 motion (STORY-03)
- Stop recreating `d3.forceSimulation` on every render (viz currently stops at L174 and creates a new
  simulation at L589 — the jank). Approach: build the simulation ONCE; on view changes update nodes/links
  data and use D3 enter/update/exit with transitions (duration/easing from motion tokens) and a gentle
  `alphaTarget` nudge rather than a from-scratch restart. Preserve node positions across view changes so the
  layout doesn't jump (mental-map preservation).
- Respect `prefers-reduced-motion` (disable/shorten transitions) for accessibility.

### Tests
- Keep the full suite green (178). Add tests where feasible: a token-presence/usage check (key tokens exist
  in theme.css and are referenced), and a motion test asserting the simulation is not recreated on a view
  change (e.g. simulation identity stable / no full alpha(1) restart on filter). String/structure tests for
  any new markup. Register new test files in package.json scripts.test.
</decisions>

<code_context>
## Existing Code Insights
- styles/{base,layout,components,theme}.css (Phase 1 extraction). Only ~7 custom props today.
- js/viz/index.js render() stops + recreates the simulation each call (L174, L589) — the restart to fix.
- Trust classes from Phases 2–3 (.prov-badge/.confidence-*/.source-link, #methodologyModal) must stay styled + correct.
- Gate: `npm test` (178) runs only files in package.json scripts.test — register new ones.
- Buildless; data contract frozen; the served data now paints (Phase 3 fix) so motion is visible in smoke.
</code_context>

<specifics>
## Specific Ideas
- Keep the dark, dense "Bloomberg-terminal-for-supply-chains" feel; elevate with consistent type rhythm,
  subtle depth, refined accent, and smooth motion. No light theme this phase.
- Motion: ~200–400ms transitions with an emphasized easing for view changes; reduced-motion honored.
</specifics>

<deferred>
## Deferred Ideas
- First-30s guided hero + narrative flow → Phase 5.
- Memoized filter internals / no-restart-for-simple-filters perf → Phase 8 (Phase 4 covers motion polish).
- Mobile/responsive excellence → Phase 9.
</deferred>
