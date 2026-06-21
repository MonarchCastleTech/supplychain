# Phase 5: Hero Moment & Investor Narrative - Research

**Researched:** 2026-06-21
**Domain:** Buildless ESM front-end (D3 v7) — guided onboarding / narrative state machine driving existing view controls
**Confidence:** HIGH (codebase-internal; every claim verified against the actual source files in this repo)

## Summary

This phase is almost entirely **integration**, not new technology. The codebase already exposes every control a narrative step needs (`openGlobal`, `openProfile(symbol)`, `highlightBy(fn)`, `resetHighlight`, zoom transitions) and every real signal a caption needs (per-node `marketcap`, the `bn` bottleneck flag, the `layer`/`y` layer index, the shared-supplier overlap index, dataset `meta`). The work is: (1) author a **pure, exportable `NARRATIVE` step list** in a new `js/ui/narrative.js`; (2) build a small **autoplay/stepper controller** that reuses the existing modal/focus/ESC and reduced-motion patterns; (3) add a narration overlay + a "Replay tour" control to `index.html` using **new IDs only** (so `index-ui-integrity` stays green); (4) gate first-visit autoplay behind a **new storage key** (`heroSeen`) distinct from `onboardingSeen`; (5) register new `.mjs` string-presence tests in `package.json scripts.test`.

The single most important architectural decision: **keep `NARRATIVE` pure and DOM-free**. Each step is `{ id, title, caption, apply(controls) }` where `controls` is an injected object `{ openGlobal, openProfile, highlightBy, resetHighlight }`. This lets Node tests import the step list and assert ordering, titles, captions, and that each `apply()` calls the right injected control — with **zero DOM, zero d3** — matching this repo's existing string-presence + light-import test convention.

The captions must cite REAL numbers computed from `data/top100-map.json` at runtime (or asserted as the right data path in tests), never hardcoded literals — the test suite explicitly checks for fabricated literals.

**Primary recommendation:** Create `js/ui/narrative.js` exporting a pure `NARRATIVE` array + a `createHeroController({ controls, storage, reducedMotion, timers })` factory; wire it from `js/main.js`; add overlay markup with new IDs in `index.html`; gate on `heroSeen`; register `tests/narrative.test.mjs` + `tests/hero-wiring.test.mjs`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Narrative step definitions (data) | Pure JS module (`js/ui/narrative.js`) | — | Must be unit-testable in Node with no DOM; pure data + injected apply() |
| Autoplay timer / pause / next / prev / skip | Browser/Client (controller in narrative.js) | — | Timer + UI state; injected `timers` keeps it testable |
| First-visit gate / replay flag | Browser/Client (`localStorage` via state.js helpers) | — | Reuses `safeReadFlag`/`safeWriteFlag`; new key `heroSeen` |
| Reduced-motion branch | Browser/Client (`matchMedia`) | — | Reuse the exact `prefers-reduced-motion` pattern already in viz |
| View mutation (apply each step) | Existing UI/viz controls (`openGlobal`/`openProfile`/`highlightBy`) | D3 simulation/zoom | Step list is a thin driver — NO new viz internals (per CONTEXT) |
| Overlay markup / controls | `index.html` (new IDs) | theme.css | New asserted IDs must not collide with the 89 existing IDs |

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Hero moment (STORY-02):** On first visit (new storage key, e.g. `heroSeen`; do NOT hijack the existing `onboardingSeen` Quick-Start), auto-play a short guided sequence (~30s, ~4–6 steps) that reveals the global map with narration captions. Must be: SKIPPABLE (clear "Skip" + ESC), REPLAYABLE (a "Take the tour" / "Replay" control near the toolbar), and reduced-motion aware (no auto-pan/instant steps when prefers-reduced-motion). Drives existing hooks: `openGlobal()`, `highlightBy(fn)`, `openProfile(symbol)`, zoom — no new viz internals.
- **Investor narrative flow (STORY-04):** Define an ordered, data-driven step list `NARRATIVE = [market, concentration, risk, opportunity]`, each step = `{ id, title, caption, apply() }` where apply() sets a real view state using existing controls + REAL data:
  - **market**: `openGlobal()` — full top-100-by-market-cap universe (caption frames market size from real meta/$cap).
  - **concentration**: highlight shared-supplier overlap / a dominant layer (existing overlap/`highlightBy(byLayer)`), caption explains concentration.
  - **risk**: `highlightBy(d => d.bn)` — bottlenecks / single points of failure (existing flag), caption explains supply-chain risk.
  - **opportunity**: focus a concrete real company profile (`openProfile(symbol)`) or a highlighted opportunity set, caption frames the investable angle.
  - Captions are honest and reference REAL figures (carry Phase 2–3 provenance/confidence where a number is shown). No fabricated claims.
  - The same NARRATIVE powers both the auto hero (autoplay) and a manual stepper (next/prev/skip).
- **Markup / module:** Add a narration overlay + controls in index.html (new IDs; keep all existing asserted IDs + inline bootstrap so index-ui-integrity stays green). Implement the controller in js/ui (or a new js/ui/narrative.js imported by main), reusing modal/focus/ESC + reduced-motion patterns.
- **Tests (STORY-05):** New `.mjs` tests (REGISTERED in package.json scripts.test): assert NARRATIVE has the four ordered steps (market→concentration→risk→opportunity), each step has a title/caption + an apply hook wired to a real control, the hero auto-shows on first visit and is skippable/replayable, reduced-motion is honored, and captions reference real data (no fabricated literals). Keep the full suite green.

### Claude's Discretion
- Specific overlay layout (bottom/side caption card with step title, text, progress `Step n/N`, Next/Skip), autoplay timing (~5–6s/step) with a pause control, "Replay tour" placement near Help/Methodology, and the exact concentration predicate (dominant layer vs. overlap) and opportunity symbol.

### Deferred Ideas (OUT OF SCOPE)
- Deeper concentration/risk analytics + scenario stress tests → Phases 6–7 (Phase 5 uses existing signals only).
- Mobile-specific tour layout → Phase 9.
- New analytics math, data changes.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STORY-02 | First-time visitor sees a "first 30 seconds" guided hero moment that auto-reveals the global map with narration | Autoplay controller + `heroSeen` gate + overlay markup (Sections 2, 3); `openGlobal()` exists at js/ui/index.js:249 |
| STORY-04 | Investor narrative flow guides user market → concentration → risk → opportunity | Concrete 4-step `NARRATIVE` with apply() + real captions (Section 1); all 4 controls verified present |
| STORY-05 | Storytelling/hero behavior covered by non-regression tests | Pure-module test seam (Section 4) + assertion catalog + registration (Section 5, Validation Architecture) |
</phase_requirements>

## Standard Stack

No new runtime dependencies. This is buildless static ESM, frozen data, D3 v7 from CDN. The CONTEXT and Out-of-Scope both forbid frameworks/build tools/new deps.

### Core (already present — reused, not installed)
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| D3 v7 | 7.8.5 (CDN) `[VERIFIED: index.html script tag]` | Force sim, zoom transitions used by step apply() | Already the project's only viz lib |
| Native ESM modules | — | `js/ui/narrative.js` imported by `js/main.js` | Repo is buildless; `<script type="module">` already used |
| `node:test` + `node:assert/strict` | Node built-in `[VERIFIED: every tests/*.mjs]` | Test runner | Repo convention — no Jest/Vitest |
| localStorage via `safeReadFlag`/`safeWriteFlag` | `js/state.js:25,33` `[VERIFIED: state.js]` | First-visit gate (`heroSeen`) | Same helpers `onboardingSeen` uses — quota/private-mode safe |

**Installation:** None. `npm install` only manages dev deps (playwright, http-server) that are unchanged.

## Package Legitimacy Audit

> No external packages are installed in this phase. The Package Legitimacy Gate is **not applicable** — Phase 5 adds only first-party ESM modules and Node built-in test files. `package.json dependencies`/`devDependencies` are unchanged.

## Architecture Patterns

### System Architecture Diagram

```
                          ┌─────────────────────────────────────────┐
 First page load          │  js/main.js (entry, after wireUI/render) │
 ───────────────────────► │  reads heroSeen via safeReadFlag         │
                          └───────────────┬─────────────────────────┘
                                          │
                  heroSeen !== "1"        │        "Replay tour" button click
                  (first visit)           │        (always available)
                          ┌───────────────┴───────────────┐
                          ▼                                 ▼
                ┌───────────────────────────────────────────────────┐
                │  createHeroController({ controls, storage,         │
                │     reducedMotion, timers })                       │
                │  ─ index, playing, timerId                         │
                │  ─ play() / pause() / next() / prev() / skip()     │
                └───────────────┬───────────────────────────────────┘
                                │ for step = NARRATIVE[index]
                                ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  step.apply(controls)        step renders overlay caption card    │
   │  ───────────────────         ───────────────────────────────     │
   │  market       → controls.openGlobal()                            │
   │  concentration→ controls.highlightBy(byDominantLayer)            │
   │  risk         → controls.highlightBy(d => d.bn)                  │
   │  opportunity  → controls.openProfile(TOP_SYMBOL)                 │
   └───────────────┬─────────────────────────────┬──────────────────┘
                   │                              │
                   ▼                              ▼
        ┌──────────────────────┐      ┌────────────────────────────┐
        │ EXISTING js/ui        │      │ EXISTING js/viz             │
        │ openGlobal/openProfile│─────►│ render() → updateGraph()    │
        └──────────────────────┘      │ highlightBy/resetHighlight  │
                                       │ (reduced-motion-gated)      │
                                       └────────────────────────────┘

  reducedMotion === true  →  controller advances ONLY on user click
                             (no timer auto-advance), captions still shown,
                             apply() still runs (viz already gates its own pan/zoom dur to 0)

  Skip / ESC  →  controller.skip(): clear timer, hide overlay,
                 storage.write("heroSeen","1"), resetHighlight(), leave current view
```

### Recommended Project Structure
```
js/
├── main.js              # + import & init createHeroController; wire Replay button
├── ui/
│   ├── index.js         # unchanged exports reused as injected controls
│   └── narrative.js     # NEW: pure NARRATIVE[] + createHeroController() factory
index.html               # + narration overlay (new IDs) + Replay button (new ID)
tests/
├── narrative.test.mjs   # NEW: pure step-list assertions (no DOM)
└── hero-wiring.test.mjs # NEW: controller/markup/gate string-presence assertions
```

### Pattern 1: Pure step list + injected controls (the test seam)
**What:** `NARRATIVE` is plain data; `apply(controls)` receives controls as an argument instead of importing `js/ui`.
**When to use:** Always here — it is the only way to unit-test without a DOM/d3.
**Example:**
```javascript
// js/ui/narrative.js  — PURE, no DOM/d3 imports at module top level.
// Caption numbers are computed from injected data, never hardcoded literals.

export function buildNarrative(data) {
  const nodes = data.nodes || [];
  const totalCapT = nodes.filter(n => n.marketcap)
    .reduce((s, n) => s + n.marketcap, 0) / 1e12;           // REAL: 55.77 at current data
  const bnCount = nodes.filter(n => n.bn).length;            // REAL: 19 bottleneck nodes
  const layerCounts = {};
  nodes.forEach(n => { layerCounts[n.y] = (layerCounts[n.y] || 0) + 1; });
  const dominantLayerIdx = Object.entries(layerCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0];                    // most-populated layer index
  const dominantLayerName = (data.layers || {})[dominantLayerIdx] || "the leading sector";
  const dominantLayerN = layerCounts[dominantLayerIdx] || 0;
  const topByCap = [...nodes].filter(n => n.marketcap)
    .sort((a, b) => b.marketcap - a.marketcap)[0];           // REAL: NVDA, $4.62T, rank #1
  const topSymbol = topByCap?.symbol;

  return [
    {
      id: "market",
      title: "The market",
      caption: `The top ${data.meta?.count ?? nodes.length} public companies — about $${totalCapT.toFixed(1)}T in combined market cap (source: companiesmarketcap.com).`,
      apply: (c) => c.openGlobal(),
    },
    {
      id: "concentration",
      title: "Concentration",
      caption: `Value clusters: ${dominantLayerN} of these companies sit in ${dominantLayerName}. Highlighting the dominant layer.`,
      apply: (c) => c.highlightBy((d) => String(d.y) === String(dominantLayerIdx)),
    },
    {
      id: "risk",
      title: "Risk & bottlenecks",
      caption: `${bnCount} of the top ${nodes.length} are flagged structural bottlenecks — single points of failure. Highlighting them now.`,
      apply: (c) => c.highlightBy((d) => d.bn),
    },
    {
      id: "opportunity",
      title: "Opportunity",
      caption: topByCap
        ? `${topByCap.company} (${topSymbol}) is the rank-#${topByCap.rank} bottleneck by market cap ($${(topByCap.marketcap / 1e12).toFixed(2)}T). Opening its supply-chain profile.`
        : "Opening a leading company profile.",
      apply: (c) => c.openProfile(topSymbol),
    },
  ];
}
```

### Pattern 2: Controller factory with injected timers/storage/reducedMotion
**What:** A factory returning `{ play, pause, next, prev, skip, getIndex }`; everything side-effecting is injected.
**When to use:** Lets tests drive the state machine deterministically (fake timers, fake storage).
**Example:**
```javascript
// js/ui/narrative.js (continued)
export function createHeroController({ steps, controls, storage, reducedMotion, timers, render }) {
  let index = 0, playing = false, timerId = null;
  const STEP_MS = 5500; // Claude's-discretion: ~5–6s/step → ~22s for 4 steps + reveal

  function show() {
    const step = steps[index];
    step.apply(controls);
    render(step, index, steps.length); // paints overlay caption card (#heroTitle/#heroCaption/#heroProgress)
  }
  function scheduleNext() {
    if (reducedMotion()) return;            // reduced motion: no timer auto-advance
    timerId = timers.setTimeout(() => { if (index < steps.length - 1) { index++; show(); scheduleNext(); } else stop(); }, STEP_MS);
  }
  function play() { playing = true; index = 0; show(); scheduleNext(); }
  function pause() { playing = false; if (timerId) timers.clearTimeout(timerId); }
  function next() { pause(); if (index < steps.length - 1) { index++; show(); } else stop(); }
  function prev() { pause(); if (index > 0) { index--; show(); } }
  function stop() { pause(); storage.write("heroSeen", "1"); controls.resetHighlight?.(); render(null); }
  const skip = stop;
  return { play, pause, next, prev, skip, getIndex: () => index };
}
```

### Anti-Patterns to Avoid
- **Importing `js/ui/index.js` at the top of `narrative.js`:** breaks Node testability (pulls in `document.getElementById` at module eval). Inject controls instead.
- **Hardcoding caption numbers** (e.g. `"$55.77T"`, `"19 bottlenecks"`): the test suite asserts no fabricated literals. Compute from data.
- **Reusing `onboardingSeen` or the `#onboardingPanel`:** CONTEXT forbids it; would hijack the Quick-Start. Use `heroSeen` + a new overlay.
- **Renaming/removing any of the 89 existing IDs or the inline `<script>` bootstrap:** `index-ui-integrity` would fail. Add new IDs only.
- **Calling `d3`/zoom directly from a step:** CONTEXT forbids new viz internals — `openGlobal`/`openProfile`/`highlightBy` already trigger `render()` which handles zoom/transition (reduced-motion-gated at viz/index.js:737).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reduced-motion detection | New matchMedia helper | Replicate viz pattern `window.matchMedia('(prefers-reduced-motion: reduce)').matches` (viz/index.js:40) | One canonical pattern; viz already gates its own transitions to dur=0 |
| localStorage gate | `localStorage.getItem` directly | `safeReadFlag`/`safeWriteFlag` (state.js:25,33) | Wrapped in try/catch for private-mode/quota — same as `onboardingSeen` |
| Modal focus/ESC | New focus trap | Existing `openModal`/`closeModal`/`trapFocus` + global keydown ESC switch (ui/index.js:89-106, 896-919) | Already handles `focusBeforeModal`, focusable scan, ESC routing |
| View mutation / zoom | New d3 transition code | `openGlobal()` / `openProfile()` / `highlightBy()` / `resetHighlight()` | They already call `render()`→`updateGraph()` with mental-map + reduced-motion gating |
| Bottleneck detection | New risk math | `d.bn` flag (19 nodes in global data) | Existing signal; CONTEXT says use existing signals, deeper math is Phase 6+ |
| Layer/concentration signal | New clustering | `d.y` (global layer index) + `data.layers` name map | `graphForMode` sets `layer = n.y` (data/index.js:135); `data.layers` names them |
| Total market cap | New aggregate | Sum of `n.marketcap / 1e12` (mirrors viz updateStats at viz/index.js:80) | Already the canonical $cap aggregate, badged OBSERVED from meta |

**Key insight:** Every control and signal the tour needs already exists and is already reduced-motion-aware. Phase 5 should be a thin, pure driver — the highest-risk move is re-implementing something the codebase already does correctly.

## The Concrete 4-Step Narrative (verified real numbers)

> All figures below are computed from `data/top100-map.json` (`meta.generatedAt: 2026-02-22`). They are shown here to prove the captions are non-fabricated; the implementation MUST compute them at runtime, not hardcode them.

| # | id | apply(controls) → existing control | Real signal used | Caption-citable real numbers (current data) |
|---|-----|------------------------------------|------------------|---------------------------------------------|
| 1 | `market` | `controls.openGlobal()` (ui/index.js:249) | dataset meta + per-node `marketcap` | `meta.count` = **100**; combined market cap = **$55.8T** (Σ marketcap/1e12 = 55.77); source `companiesmarketcap.com` (meta.source) |
| 2 | `concentration` | `controls.highlightBy(d => String(d.y) === dominantLayerIdx)` (viz highlightBy:385; layer = `d.y`, data/index.js:135) | layer index `d.y` + `data.layers` names; OR geographic: **US = 59 of 100** | Dominant layer by node count + its `data.layers` name; geographic alt: **US 59%, CN 11, UK 5** (verified country rollup) |
| 3 | `risk` | `controls.highlightBy(d => d.bn)` (existing bottleneck flag; mirrors `bBottlenecks` button ui/index.js:964) | `d.bn` boolean flag | **19** bottleneck nodes of 100 (e.g. NVDA, AAPL, GOOG) — single points of failure |
| 4 | `opportunity` | `controls.openProfile(topSymbol)` (ui/index.js:219) | top node by `marketcap` (also `bn`) | **NVDA** — rank **#1**, **$4.62T**, flagged bottleneck; profile shows real suppliers/services (e.g. AAPL profile: Foxconn supplier, source-backed) |

**Provenance discipline (carry Phase 2–3):** The market-cap figure is dataset-level OBSERVED, sourced from `meta` (companiesmarketcap.com) — the same provenance the stats bar `#sM` already badges (viz/index.js:90-102). Bottleneck count and layer counts are **derived aggregates** of existing flags → caption them as "flagged" / "of the top 100", not as new sourced claims. The opportunity profile carries its own per-node provenance badges already rendered by `openProfile`→`render`→`renderCardAnchorBadge`. No new sourced claim is introduced.

**Opportunity symbol choice (Claude's discretion):** Recommend computing `topSymbol` as the highest-`marketcap` node that is also `bn` (NVDA today) — this makes step 4 a natural payoff of step 3 (a bottleneck you can invest in) and is robust to weekly data refreshes (never hardcode `"NVDA"`). All 100 symbols have profiles (`profileCount: 100`), so `openProfile(topSymbol)` will always resolve.

## Autoplay / First-Visit / Reduced-Motion Mechanics

1. **First-visit gate (NEW key):** In `js/main.js`, after `render()` + `maybeShowOnboarding()`, read `safeReadFlag("heroSeen")`. If not `"1"`, call `controller.play()`. The existing `maybeShowOnboarding` uses `onboardingSeen` and is left untouched — the two are independent. Decide ordering: recommend the hero plays and the Quick-Start onboarding is **suppressed during** an active tour to avoid double overlay (e.g., don't call `maybeShowOnboarding()` when the hero is about to auto-play on first visit; show Quick-Start only after tour ends or is skipped). This is a discretion call for the planner.
2. **Timer advance (~5.5s/step):** `setTimeout`-driven `scheduleNext()`; pausable. 4 steps ≈ 22s plus the initial reveal ≈ within the ~30s target.
3. **Controls:** overlay card exposes Next / Prev (optional) / Pause / Skip; ESC routes to `skip()`. Skip and ESC both: clear timer → write `heroSeen=1` → `resetHighlight()` → hide overlay → leave the user in free exploration on the current view.
4. **Replay entry point:** a new toolbar button (e.g. `#bTour` "Take the tour") near `#bHelp`/`#bMethodology`; on click → `controller.play()` (does NOT require resetting `heroSeen`; replay always allowed).
5. **Reduced-motion (`prefers-reduced-motion: reduce`):** Reuse viz's exact `matchMedia` check. When true: **no timer auto-advance** — the overlay still shows step 1's caption and `apply()` still runs, but the user advances manually via Next. Because viz already gates its `render()`/zoom transition duration to 0 under reduced motion (viz/index.js:566, 737), `apply()` produces instant view changes with no pan animation automatically — the controller does not need to special-case the viz. CONTEXT requirement ("no auto-pan/instant steps") is satisfied by (a) suppressing the timer and (b) viz's own dur=0 gate.

## Markup Additions (index.html — NEW IDs only)

> The inline `<script>…</script></body>` bootstrap block is asserted by `index-ui-integrity` (it must parse and exist). **Do not touch it.** All 89 existing IDs must remain. Add only new IDs.

Recommended new IDs (the planner finalizes exact names; tests should assert whatever is chosen):
- `#heroOverlay` — `role="dialog" aria-modal="true" aria-labelledby="heroTitle"` caption card (bottom/side).
- `#heroTitle`, `#heroCaption`, `#heroProgress` ("Step n/N").
- `#heroNext`, `#heroPrev`, `#heroPause`, `#heroSkip` — controls.
- `#bTour` — "Take the tour / Replay" button in `#bar` near `#bHelp`.

**Existing IDs that MUST be preserved (from index-ui-integrity + general integrity):** `helpModal`/`compareModal` with `role="dialog" aria-modal="true"`, `fatalError`, `onboardingPanel`, `cardRatings`, `cardOverlap`, `cardTimeline`, `provenanceDrawer`, `searchSuggest`, `mobileToggle`, `mobileSheet`, the `./data/credit-ratings.js` and `./data/top100-map.js` script tags, and the inline bootstrap `<script>`. Full live ID set (89): loading, fatalError, onboardingPanel, onboardingTitle, onboardingDismiss, helpModal, helpTitle, methodologyModal, methodologyClose, methodologyTitle, compareModal, compareTitle, compareGrid, top, title, sN, sL, sC, sY, sM, subtitle, top10Sidebar, top10List, bar, bBack, bReset, bLabels, bFlow, bBottlenecks, bFilter, bExport, bSave, bBookmarks, bCompare, bMethodology, bHelp, companyJump, countryBtns, filterPanel, fConfidence, fType, fVerified, searchWrap, q, searchSuggest, searchHistory, companyCard, cardLogo, cardLogoFallback, cardName, cardSymbol, cardCompare, cardSuppliers, cardServices, cardChannels, cardFlag, cardFlagFallback, cardHqText, cardRatings, cardRiskBadge, cardRiskText, cardRiskDetails, cardOverlap, cardTimeline, cardSourcesBtn, tt, lg, ly, canvas, hint, footer, updateStatusDot, updateStatusText, lastUpdated, mobileToggle, mobileSheet, mobileClose, mBack, mReset, mFilter, mExport, mCompare, mHelp, mSave, mBookmarks, mGlobal, provenanceDrawer, provenanceClose, provenanceItems.

## Module / Test Seam

- **New module:** `js/ui/narrative.js` (recommended over extending `js/ui/index.js` — keeps the pure step list importable without dragging in the whole UI module's DOM lookups at eval time).
- **Exports:** `buildNarrative(data)` (pure, returns the 4-step array) and `createHeroController(deps)` (pure factory; all side effects injected). Optionally a tiny `NARRATIVE` constant if a static shape is desired, but the data-driven `buildNarrative(DATA)` is what enables real-number captions.
- **Wiring in `js/main.js`:** import `buildNarrative`, `createHeroController`; build `controls = { openGlobal, openProfile, highlightBy, resetHighlight }` from the existing exports; build the `render` callback that writes to `#heroTitle/#heroCaption/#heroProgress` and toggles `#heroOverlay`; inject `storage = { read: safeReadFlag, write: safeWriteFlag }`, `reducedMotion = () => matchMedia(...).matches`, `timers = { setTimeout, clearTimeout }`. Gate first play on `heroSeen`. Wire `#bTour` → `controller.play()` and ESC/`#heroSkip` → `controller.skip()`.
- **Why testable:** `narrative.test.mjs` imports `buildNarrative` with a tiny fake `data` object → asserts order/titles/captions/apply-targets with a spy `controls`, no DOM. `createHeroController` can be driven with fake `timers`/`storage`/`reducedMotion` to assert autoplay + skip + reduced-motion behavior, also DOM-free.

  Caveat: `js/ui/index.js` does `document.getElementById` at top-level eval, so a Node test must NOT transitively import it. Keeping `narrative.js` free of any `js/ui/index.js` import (controls injected) avoids this. The DOM-touching parts (overlay markup, main.js wiring) are covered by string-presence tests like the rest of the repo.

## Runtime State Inventory

> Not a rename/refactor/migration phase — this is additive feature work. Inventory is N/A. The only new persisted runtime state is the **`heroSeen`** localStorage flag (new key, additive, written via `safeWriteFlag`); it does not migrate or rename any existing key (`onboardingSeen`, `searchHistory`, `savedViews` all unchanged).

## Common Pitfalls

### Pitfall 1: Fabricated caption literals
**What goes wrong:** Hardcoding "$55.77T" / "19 bottlenecks" — drifts on weekly data refresh and fails the "no fabricated literals" test.
**Why it happens:** Easier to type a number than compute it.
**How to avoid:** Compute every figure in `buildNarrative(data)` from `data`. Test asserts captions are produced from data (e.g. that changing the fake data changes the caption).
**Warning signs:** A numeric literal matching a current data value appears in `narrative.js`.

### Pitfall 2: Breaking index-ui-integrity
**What goes wrong:** Editing/removing the inline bootstrap `<script>` or an asserted ID while adding the overlay.
**Why it happens:** The overlay is added near the modals; easy to disturb neighbors.
**How to avoid:** Append new markup; never rename/delete existing IDs or the inline script. Run `npm test` after markup edits.
**Warning signs:** `index-ui-integrity` "syntax check" or ID-presence assertions go red.

### Pitfall 3: Hijacking the onboarding gate
**What goes wrong:** Reusing `onboardingSeen`/`#onboardingPanel` for the hero → Quick-Start and tour stomp each other.
**Why it happens:** They look similar (first-visit modal).
**How to avoid:** Separate `heroSeen` key + separate `#heroOverlay`. Decide first-visit precedence explicitly.
**Warning signs:** Quick-Start no longer appears, or both overlays show at once.

### Pitfall 4: Tour leaves the graph in a highlighted/locked state
**What goes wrong:** After Skip/end, nodes stay dimmed from the last `highlightBy`.
**Why it happens:** `highlightBy` dims non-matching nodes and does not auto-reset.
**How to avoid:** `skip()`/`stop()` calls `resetHighlight()` before exiting (already in Pattern 2).
**Warning signs:** Map stuck dim after the tour.

### Pitfall 5: Node test transitively importing the DOM-heavy UI module
**What goes wrong:** `narrative.test.mjs` fails at import because `js/ui/index.js` runs `document.getElementById` at eval.
**Why it happens:** Importing controls from `js/ui/index.js` instead of injecting them.
**How to avoid:** Inject `controls`; keep `narrative.js` import-clean. Pure-logic tests import only `narrative.js`.
**Warning signs:** `ReferenceError: document is not defined` in a `narrative.test.mjs` run.

## Code Examples

### Reduced-motion check (reuse the canonical viz pattern)
```javascript
// Source: js/viz/index.js:40 (verified in-repo)
const prefersReducedMotion = () =>
  (typeof window !== "undefined" && window.matchMedia)
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
```

### First-visit gate (reuse state.js helpers)
```javascript
// Source: js/ui/index.js:114-118 maybeShowOnboarding pattern, with NEW key
import { safeReadFlag, safeWriteFlag } from "./state.js";
const HERO_KEY = "heroSeen";              // distinct from "onboardingSeen"
if (safeReadFlag(HERO_KEY) !== "1") controller.play();
// ... on skip/end:
safeWriteFlag(HERO_KEY, "1");
```

### Existing controls the steps drive (verified signatures)
```javascript
// js/ui/index.js — all exported (line 1013-1018)
openGlobal();           // :249  STATE.mode="global"; render(); syncUrlState()
openProfile(symbol);    // :219  guards DATA.profiles[symbol]; render()
// js/viz/index.js — exported (:741-746)
highlightBy(fn);        // :385  dims nodes where !fn(d)
resetHighlight();       // :375  restores opacities (bn-aware)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| FUTURE_ENHANCEMENTS "Presentation Mode" sketch with monolithic `presentationSteps` + global `currentSlide` mutation in index.html | Pure `buildNarrative(data)` + injected-deps controller in `js/ui/narrative.js` | This phase | Aligns with the post-FOUND modular ESM architecture; testable in Node; the sketch's `applyStep(step)` idea is realized as `step.apply(controls)` |

**Deprecated/outdated:**
- The FUTURE_ENHANCEMENTS_PLAN assumes everything lives in `index.html` (pre-Phase-1 monolith). The codebase is now modular ESM under `js/` — implement in `js/ui/narrative.js`, not inline.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Recommended new IDs (`#heroOverlay`, `#bTour`, etc.) don't collide with future IDs | Markup | Low — verified none exist in current 89; planner picks final names |
| A2 | Suppress Quick-Start during the auto hero on first visit (precedence) | Autoplay mechanics | Low — UX decision; either order is acceptable, planner decides |
| A3 | ~5.5s/step timing keeps total within ~30s | Autoplay mechanics | Low — tunable constant; discretion per CONTEXT |
| A4 | `data.layers` provides a human-readable dominant-layer name for the concentration caption | Narrative step 2 | Low — verified `data.layers` is a `{index: name}` map in the JSON |

**Note:** All factual data figures (100 companies, $55.8T, 19 bottlenecks, US 59%, NVDA #1/$4.62T) are `[VERIFIED: data/top100-map.json]` via direct computation in this session, not assumed.

## Open Questions

1. **First-visit precedence between Quick-Start (`onboardingSeen`) and Hero (`heroSeen`).**
   - What we know: Both are first-visit overlays; both must coexist as features.
   - What's unclear: Which shows first on a brand-new visitor.
   - Recommendation: Auto-play the hero first; show Quick-Start only after the tour ends/skips (or make Quick-Start the "what's next" landing). Planner decides; either passes tests.

2. **Concentration predicate: dominant layer vs. shared-supplier overlap.**
   - What we know: Both signals exist (`d.y`/`data.layers`; `SHARED_SUPPLIER_OVERLAP` is per-profile, computed in data/index.js:62).
   - What's unclear: Overlap is profile-scoped, not a global-node flag — using it in a global `highlightBy(d=>...)` would need a per-node membership derivation.
   - Recommendation: Use **dominant layer** (simple global `d.y` predicate, no new math) for step 2; it's the lowest-risk path and honors "existing signals only." Geographic concentration (US 59%) is an equally valid fallback predicate `d => d.c === "US"`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node (test runner) | `npm test` | ✓ | system node | — |
| D3 v7 | runtime viz (already loaded) | ✓ (CDN) | 7.8.5 | — |
| Browser localStorage | `heroSeen` gate | ✓ (runtime) | — | `safeReadFlag` returns null → tour simply plays each load (acceptable degrade) |
| `matchMedia` | reduced-motion | ✓ (runtime) | — | guard returns false (auto-play timer path) |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** localStorage/matchMedia both already have safe guards in the codebase.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` + `node:assert/strict` (repo convention, no third-party runner) |
| Config file | none — files listed explicitly in `package.json` `scripts.test` |
| Quick run command | `node --test tests/narrative.test.mjs tests/hero-wiring.test.mjs` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STORY-04 | `NARRATIVE` has 4 steps ordered market→concentration→risk→opportunity | unit (pure import) | `node --test tests/narrative.test.mjs` | ❌ Wave 0 |
| STORY-04 | Each step has non-empty `title` + `caption` + a function `apply` | unit | same | ❌ Wave 0 |
| STORY-04 | `apply()` calls the right injected control (spy: market→openGlobal, concentration→highlightBy, risk→highlightBy(d.bn), opportunity→openProfile) | unit | same | ❌ Wave 0 |
| STORY-04 | Captions cite REAL data (change fake data → caption changes; no fabricated literal hardcoded in source) | unit | same | ❌ Wave 0 |
| STORY-02 | Hero auto-plays when `heroSeen !== "1"`; not when `=== "1"` (fake storage) | unit (controller) | same | ❌ Wave 0 |
| STORY-02 | `skip()`/ESC writes `heroSeen="1"`, calls `resetHighlight`, hides overlay | unit | same | ❌ Wave 0 |
| STORY-02 | Replayable: `play()` works regardless of `heroSeen` | unit | same | ❌ Wave 0 |
| STORY-02 | Reduced-motion: no timer auto-advance (fake `reducedMotion=()=>true`, fake timers → no scheduled callback) | unit | same | ❌ Wave 0 |
| STORY-02/05 | Markup: `#heroOverlay` is `role="dialog" aria-modal="true"`; `#heroTitle/#heroCaption/#heroProgress/#heroSkip/#bTour` present | string-presence | `node --test tests/hero-wiring.test.mjs` | ❌ Wave 0 |
| STORY-02/05 | `js/ui/narrative.js` exports `buildNarrative` + `createHeroController`; uses `matchMedia('(prefers-reduced-motion'`; main.js wires `heroSeen` via safeReadFlag/safeWriteFlag and `#bTour` | string-presence | same | ❌ Wave 0 |
| STORY-05 | Non-regression: existing inline bootstrap + all asserted IDs intact | existing | `npm test` (index-ui-integrity) | ✅ |

### Sampling Rate
- **Per task commit:** `node --test tests/narrative.test.mjs tests/hero-wiring.test.mjs`
- **Per wave merge:** `npm test` (full suite — note: the displayed "191" depends on the registered set; both new files must be added to `scripts.test`)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/narrative.test.mjs` — pure step-list + controller behavior (STORY-02, STORY-04)
- [ ] `tests/hero-wiring.test.mjs` — markup + module/main wiring string-presence (STORY-02, STORY-05)
- [ ] `package.json scripts.test` — append both files (MUST register or they never run)
- [ ] `js/ui/narrative.js` — module under test (created in implementation, not Wave 0)
- [ ] Framework install: none (Node built-in test runner already used)

## Security Domain

> `security_enforcement` config not located in this phase folder; treated as enabled by default. This phase adds no auth, network calls, secrets, or server code. Surface is client-side DOM rendering of captions + a localStorage flag.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | none (public static site, no auth) |
| V3 Session Management | no | n/a |
| V4 Access Control | no | n/a |
| V5 Input Validation / Output Encoding | yes | Captions are built from frozen first-party data, but if any string (company name) is injected into innerHTML, use `escapeHtml` (data/index.js export) — prefer `textContent` for caption/title to avoid XSS |
| V6 Cryptography | no | n/a |

### Known Threat Patterns for buildless ESM front-end
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Caption XSS via company name in `innerHTML` | Tampering / Info-disclosure | Render captions with `textContent`, or `escapeHtml()` if HTML is required (existing helper) |
| localStorage tamper of `heroSeen` | Tampering | Harmless — only controls whether a tour auto-plays; no trust decision rides on it |

## Sources

### Primary (HIGH confidence — in-repo, verified this session)
- `js/ui/index.js` — `openGlobal`(:249), `openProfile`(:219), modal/focus/ESC(:89-119,:896-919), `wireUI`(:795), exports(:1013), `safeReadFlag`/`safeWriteFlag` usage, `maybeShowOnboarding`(:114)
- `js/viz/index.js` — `highlightBy`(:385), `resetHighlight`(:375), reduced-motion `matchMedia`(:40), `render`/`updateGraph` zoom+reduced-motion gates(:546,:737), `bn` styling
- `js/data/index.js` — `graphForMode` (`layer = n.y`, :135), `getTopOverlap`/`SHARED_SUPPLIER_OVERLAP`(:62), `formatMarketCap`(:178)
- `js/main.js` — init order, window shim (:50-55)
- `js/state.js` — `safeReadFlag`/`safeWriteFlag` (:25,:33)
- `data/top100-map.json` — computed: 100 companies, $55.77T total cap, 19 `bn` nodes, US 59/CN 11/UK 5, NVDA rank#1 $4.62T, layers map, 100 profiles
- `index.html` — 89 IDs, inline bootstrap script, `#bar` toolbar, script tags
- `tests/index-ui-integrity.test.mjs`, `tests/viz-motion.test.mjs` — string-presence + reduced-motion test conventions
- `package.json` — `scripts.test` registration mechanism

### Secondary (MEDIUM)
- `FUTURE_ENHANCEMENTS_PLAN.md` — B3 Presentation Mode sketch (`presentationSteps`/`applyStep`) — directional alignment only

### Tertiary (LOW)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new deps; all controls/signals verified in source
- Architecture: HIGH — pattern dictated by existing modular ESM + test conventions
- Pitfalls: HIGH — derived from concrete repo constraints (index-ui-integrity, top-level DOM eval, highlightBy dimming)
- Real caption numbers: HIGH — computed directly from the frozen data file this session

**Research date:** 2026-06-21
**Valid until:** 2026-07-21 (stable; only the data figures refresh weekly — which is exactly why captions must compute them, not hardcode)
