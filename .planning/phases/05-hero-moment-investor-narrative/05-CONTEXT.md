# Phase 5: Hero Moment & Investor Narrative - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous) — UI design contract for the guided experience

<domain>
## Phase Boundary

Make a first-time investor reach a clear "aha" within ~30 seconds and guide them through a coherent story:
**market → concentration → risk → opportunity**. Deliverables: (1) a "first 30 seconds" guided hero
moment that auto-reveals the global map with narration on first visit (skippable, replayable); (2) an
explicit investor narrative flow of ordered steps that drive the existing view controls + show captions;
(3) non-regression tests for the hero/narrative behavior. Builds on Phase 4 motion (smooth updateGraph/zoom)
and the existing onboarding scaffold. Out of scope: new analytics math (Phase 6+ provides deeper
concentration/risk; Phase 5 uses EXISTING signals like bottleneck flag `d.bn`, layers, overlap), mobile
polish (Phase 9), data changes.
</domain>

<decisions>
## Implementation Decisions

### Hero moment (STORY-02)
- On first visit (new storage key, e.g. `heroSeen`; do NOT hijack the existing `onboardingSeen` Quick-Start),
  auto-play a short guided sequence (~30s, ~4–6 steps) that reveals the global map with narration captions.
  Must be: SKIPPABLE (clear "Skip" + ESC), REPLAYABLE (a "Take the tour" / "Replay" control near the toolbar),
  and reduced-motion aware (no auto-pan/instant steps when prefers-reduced-motion).
- Drives existing hooks: `openGlobal()`, `highlightBy(fn)`, `openProfile(symbol)`, zoom — no new viz internals.

### Investor narrative flow (STORY-04)
- Define an ordered, data-driven step list `NARRATIVE = [market, concentration, risk, opportunity]`, each step =
  `{ id, title, caption, apply() }` where apply() sets a real view state using existing controls + REAL data:
  - **market**: `openGlobal()` — the full top-100-by-market-cap universe (caption frames the market size from real meta/$cap).
  - **concentration**: highlight shared-supplier overlap / a dominant layer (existing overlap/`highlightBy(byLayer)`), caption explains concentration.
  - **risk**: `highlightBy(d => d.bn)` — bottlenecks / single points of failure (existing flag), caption explains supply-chain risk.
  - **opportunity**: focus a concrete real company profile (`openProfile(symbol)`) or a highlighted opportunity set, caption frames the investable angle.
- Captions are honest and reference REAL figures (carry the Phase 2–3 provenance/confidence where a number is shown). No fabricated claims.
- The same NARRATIVE powers both the auto hero (autoplay) and a manual stepper (next/prev/skip).

### Markup / module
- Add a narration overlay + controls in index.html (new IDs; keep all existing asserted IDs + inline bootstrap so
  index-ui-integrity stays green). Implement the controller in js/ui (or a new js/ui/narrative.js imported by main),
  reusing modal/focus/ESC + reduced-motion patterns.

### Tests (STORY-05)
- New `.mjs` tests (REGISTERED in package.json scripts.test): assert NARRATIVE has the four ordered steps
  (market→concentration→risk→opportunity), each step has a title/caption + an apply hook wired to a real control,
  the hero auto-shows on first visit and is skippable/replayable, reduced-motion is honored, and captions
  reference real data (no fabricated literals). Keep the full suite (191) green.
</decisions>

<code_context>
## Existing Code Insights
- Hooks: js/viz highlightBy/resetHighlight/render; js/ui openGlobal/openProfile; bottleneck flag `d.bn`; layers; overlap index.
- Existing onboarding (#onboardingPanel, `onboardingSeen`) is the Quick-Start — keep separate from the hero tour.
- Phase 4 motion: updateGraph + zoom transitions are smooth and reduced-motion-gated — reuse for tour steps.
- Gate: `npm test` (191) runs only files in package.json scripts.test — register new ones. Buildless; data frozen.
- FUTURE_ENHANCEMENTS_PLAN already sketched a "Presentation Mode" with presentationSteps — align with that idea.
</code_context>

<specifics>
## Specific Ideas
- Narration overlay: a bottom/side caption card with step title, text, progress (Step n/N), and Next/Skip; autoplay
  advances on a timer (~5–6s/step) with a pause control; ESC/Skip exits to free exploration.
- "Replay tour" entry point near Help/Methodology buttons.
</specifics>

<deferred>
## Deferred Ideas
- Deeper concentration/risk analytics + scenario stress tests → Phases 6–7 (Phase 5 uses existing signals).
- Mobile-specific tour layout → Phase 9.
</deferred>
