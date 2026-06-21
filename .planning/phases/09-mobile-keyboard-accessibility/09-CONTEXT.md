# Phase 9: Mobile & Keyboard Accessibility - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous)

<domain>
## Phase Boundary

Every investor can use the FULL experience — on a phone or entirely from the keyboard. Deliverables:
(1) full mobile usability: responsive layout (graph + all panels incl. the new hero/chokepoints/scenario/
methodology UI) and working touch interactions (tap node → profile, mobile sheet for panels, pinch/zoom);
(2) a complete keyboard-only journey covering search → filter → select → reset, with every interactive
control (incl. the Phase 5–7 additions) focusable, operable, in logical focus order, with visible focus and
correct modal focus traps; (3) the full suite stays green and the ARIA baseline is preserved or improved.
Out of scope: new features, launch/SEO (Phase 10), data changes.
</domain>

<decisions>
## Implementation Decisions

### Mobile usability (PERF-02)
- Audit + fix responsive layout at phone widths using the Phase-4 tokens + @media: ensure the top bar,
  toolbar (now including #bMethodology/#bTour/#bChokepoints), the hero overlay, the chokepoints + scenario
  panels, the profile/compare/methodology modals, and the D3 canvas are usable and not clipped/overlapping
  on small screens. Reuse/extend the existing #mobileToggle/#mobileSheet pattern for panel access.
- Touch interactions: tapping a node opens its profile; panels reachable via the mobile sheet; zoom/pan works
  with touch. Verify no hover-only affordance is the SOLE way to reach critical info (tooltips/provenance must
  have a tap/click path too).

### Keyboard-only journey (PERF-03)
- Guarantee a complete keyboard path: focus search → type/select a company (filter/select) → apply a filter →
  select a node → reset — all without a mouse. Ensure every NEW control (bTour, bMethodology, bChokepoints,
  scenario preset button + #scenarioChokepointSelect, hero Next/Prev/Pause/Skip) is keyboard-focusable and
  operable (Enter/Space), in a logical tab order, with visible :focus styling and correct ESC handling.
- Preserve/extend existing keyboard shortcuts and modal focus traps. Don't trap focus where it shouldn't be.

### ARIA baseline (PERF-03 SC3)
- Preserve or improve ARIA: roles/labels on new controls + panels (the methodology/scenario/chokepoints
  panels should have appropriate roles/labels; hero overlay already role=dialog). Keep
  macro-site-accessibility.test.mjs green; extend it for the new surfaces.

### Tests
- New `.mjs` tests (REGISTERED in package.json scripts.test): keyboard-journey coverage (search→filter→
  select→reset controls are focusable/operable; new controls have accessible names; focus order/labels),
  mobile responsiveness (viewport/@media + mobile-sheet wiring for new panels; touch path for node→profile).
  Use Playwright viewport emulation for the mobile/keyboard smoke. Keep the full suite (275) green.
</decisions>

<code_context>
## Existing Code Insights
- Existing: #mobileToggle/#mobileSheet, keyboard shortcuts (keydown l/f/b/g/h, ESC), ARIA modals (role=dialog, focus trap), macro-site-accessibility.test.mjs.
- New surfaces needing coverage: #bMethodology, #bTour, #bChokepoints, #scenarioPanel (+ button/select), hero overlay controls.
- Phase 4 tokens + @media (incl. prefers-reduced-motion) — extend responsive rules with tokens.
- Gate: `npm test` (275) runs only files in package.json scripts.test — register new ones. Buildless; data frozen.
</code_context>

<specifics>
## Specific Ideas
- Playwright: emulate a phone viewport (e.g. 390×844) — assert key panels reachable + node tap opens profile; emulate keyboard-only Tab/Enter journey search→filter→select→reset with no pointer events.
- Visible focus ring via tokens; skip-to-content or logical tab order for the dense toolbar.
</specifics>

<deferred>
## Deferred Ideas
- Native app / gesture richness → future.
- SEO/meta/social cards + final launch gate → Phase 10.
</deferred>
