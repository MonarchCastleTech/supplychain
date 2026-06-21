---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-06-21T04:11:17.944Z"
progress:
  total_phases: 10
  completed_phases: 3
  total_plans: 15
  completed_plans: 13
  percent: 30
---

# Project State: Monarch Castle Technologies — Market Intelligence

## Project Reference

**Core Value:** Investors trust every number and instantly grasp supply-chain structure, concentration, and risk — credibility first, then beauty, then unique depth.

**Current Focus:** Phase 04 — Design System & Smooth Motion

**Mode:** mvp | **Granularity:** fine

## Current Position

Phase: 04 (Design System & Smooth Motion) — EXECUTING
Plan: 3 of 4 (Plans 04-01, 04-02 complete)
**Phase:** 04 — Design System & Smooth Motion — EXECUTING
**Plan:** 04-02 complete — 2 of 4 plans done
**Status:** Executing Phase 04
**Progress:** [█████████░] 87%

## Performance Metrics

| Metric | Value |
|--------|-------|
| Phases complete | 1/10 |
| v1 requirements mapped | 25/25 |
| Test suite baseline | 103 passing |
| Pre-extraction regression anchor (01-01) | npm test = 116 pass / 0 fail |
| Plan 01-01 | 2 tasks, 4 files, ~12 min |
| Plan 01-02 | 3 tasks, 11 files, ~125 min |
| Post-extraction regression (01-02) | npm test = 116 pass / 0 fail (unchanged) |
| Plan 01-03 | 2 tasks + 1 checkpoint, 2 files, ~18 min |
| Post-extraction regression (01-03) | npm test = 116 pass / 0 fail (unchanged) |
| Perf: index.html doc transfer | 104 KB → 12 KB (−88%); no regression (FOUND-04 closed) |
| Plan 02-01 | 2 TDD tasks, 4 files, ~14 min |
| Trust-core regression (02-01) | npm test = 131 pass / 0 fail (116 + 15 new provenance) |
| Plan 02-02 | 2 TDD tasks, 3 files, ~15 min |
| Viz-wiring regression (02-02) | npm test = 136 pass / 0 fail (131 + 5 new viz-wiring) |
| Plan 02-03 | 2 tasks (1 TDD), 3 files, ~10 min |
| UI-wiring regression (02-03) | npm test = 141 pass / 0 fail (136 + 5 new ui-wiring) |
| Phase 02 P04 | ~12min | 2 tasks | 3 files |
| Phase 03 P01 | 25m | 3 tasks | 8 files |
| Phase 03 P02 | ~18m | 3 tasks | 5 files |
| Confidence-score regression (03-02) | npm test = 168 pass / 0 fail (151 + 13 confidence-score + 5 viz-confidence-wiring − 2 placeholders) |
| Phase 03 P03 | 12min | 2 tasks | 5 files |
| Phase 03 P04 | ~15min | 1 task + 1 checkpoint | 1 file |
| Phase-3 gate (03-04) | npm test = 178 pass / 0 fail; render smoke PASS (100 nodes painted, Confidence% + methodology modal + live freshness, 0 console errors) |
| Phase 04 P01 | ~10min | 2 tasks | 4 files |
| Token-scaffold gate (04-01) | npm test = 191 tests / 186 pass / 5 fail — 178 prior green, 8 new green, 5 INTENDED Wave 0 RED (migration evidence + buildSimulation/updateGraph + nodes/links re-bind + mental-map carry + reduced-motion; closed by Plans 02/03) |
| Phase 04 P02 | ~12min | 2 tasks | 3 files |
| Token-migration gate (04-02) | npm test = 191 tests / 187 pass / 4 fail — migration-evidence now GREEN (layout=19/components=25/theme=17 var(--)); theme.css prefers-reduced-motion present; trust-hue contract preserved; 4 remaining RED are Plan-03 viz refactor |

## Accumulated Context

### Key Decisions

- Trust before visual wow — investors bounce on unsourced numbers (spec risk register).
- Hybrid approach: thin, safe modularization (Phase 1) before any phased value work.
- Real-data-only — every major figure tagged observed/estimated with a reachable source.
- Keep buildless static GitHub-Pages deploy + weekly auto-update Actions pipeline.
- No login — public investor audience.
- Authoritative gate is `npm test` (116 pass / 0 fail), NOT `node --test tests/` (resolved research OQ1).
- 01-01: Lighthouse CLI hits NO_FCP in-sandbox; Playwright Navigation/Paint Timing is the recorded perf baseline (plan-sanctioned fallback).
- 01-01: http-server serves .js as application/javascript (valid module MIME); no --mimetypes override needed (A1 resolved).
- 01-02: CSS split as contiguous document-order slices (base->layout->components->theme) — concat is byte-identical to the original <style>, so cascade is provably unchanged.
- 01-02: each reassigned `let` kept module-local to its owner (ESM imports are read-only); cross-module mutable reads (labelSel/subSel) use ESM live bindings. main.js concentrates all order-sensitive top-level execution + the window.* shim.
- 01-02: openCompanyProfile explicitly added to window (it was the one inline-handler NOT on window in the monolith).
- 01-02: verified ES-module wiring at runtime with a Playwright smoke test (synthetic dataset) because the npm gate is string + node --check only and cannot prove runtime wiring.
- 01-03: deploy-pages.yml now copies styles/ AND js/ into _site/ (guarded `cp -R`) — FOUND-05 deploy landmine closed; live Pages site will serve the extracted CSS/JS on next push to master.
- 01-03: FOUND-04 closed — post-extraction Playwright timing (Lighthouse still NO_FCP in-sandbox, same condition as 01-01) shows no regression; index.html doc transfer −88% (104KB→12KB), total transfer +0.8% (externalized CSS/JS), timing deltas within local-serve noise.
- 01-03: render parity proven over http-server (Playwright + synthetic valid dataset) — all 4 CSS + 6 JS modules load 200, all 7 window.* handlers wired; the committed snapshot still cannot paint locally (pre-existing data condition, identical pre/post extraction).
- 01-03: honest caveat — with the incomplete committed snapshot, post-extraction the eager `buildSharedSupplierOverlapIndex()` in js/data throws before main.js's friendly guard (raw error vs friendly fatal); only with broken data, no effect with valid production data; candidate cleanup for a later plan (01-03 must not modify source).
- 02-01: trust tag mapping is DERIVED — high*->observed, medium*->estimated, missing/empty/dangling-FK->unknown; market-cap marker->observed via meta.source||top100_source_url (RESEARCH A1/A2). No literal observed/estimated token exists in the data.
- 02-01: provenanceFor + badgeHtml are PURE/DOM-free (Node-unit-testable); only renderProvenanceBadge touches el.innerHTML. Trust keeps a local escapeHtml copy rather than importing the window-coupled js/data module.
- 02-01: badgeHtml gates the source <a> on url.startsWith('http') and escapes title+url; rel="noopener noreferrer" on every link (T-02-01/02/03 mitigated, no-XSS posture on first-party data).
- 02-01: added scoped `js/package.json {type:module}` (Rule 3 blocking fix) — root package.json is type=commonjs so Node read the ESM trust module as CJS and the contracted named import threw; browser is unaffected (loads via <script type=module>).
- 02-01: GATE LANDMINE closed — tests/provenance.test.mjs registered in package.json scripts.test; suite rose 116->131 (15 new), 0 fail. Data sweep over all 100 profiles asserts both source-resolved and unsourced buckets non-empty (proves derivation, not hardcoding).
- 02-02: viz consumes the trust core — showTooltip/showLinkTooltip/updateStats/verified-node all call provenanceFor(d, {sourceIndex: STATE.sourceIndex, meta: DATA.meta}); the duplicated inline confidenceLower derivation is deleted. Both tooltips' "View Source" link now reads prov.source.url (no inline dangling-FK .url access).
- 02-02: $cap (#sM) is Observed-badged from DATA.meta (companiesmarketcap.com) via a runtime-created .cap-prov span (no index.html edit); count aggregates #sN/#sL/#sC/#sY stay UNBADGED (RESEARCH Q1). verified-node class = (prov.tag==='observed' && prov.source), replacing the .includes('source') heuristic. npm test = 136 pass / 0 fail (131 + 5 new viz-wiring).
- 02-03: ui consumes the trust core — updateCompanyCard renders an anchor badge (kind==='company' node) into a runtime-created #cardNameProv span (no index.html edit); showCompare 'Verified Entities' derived via provenanceFor (observed && resolving source), replacing the inline .includes('source'). src.t->title bug FIXED in openProvenance (drawer) + parseYearsFromSources (timeline) — all 407 sources have title, 0 have t; no test pinned the buggy fallback (OQ2 green). applyFilters .includes('source') left as out-of-scope optional centralization. npm test = 141 pass / 0 fail (136 + 5 new ui-wiring).
- 03-02: confidenceScore(input,ctx) in js/trust is PURE — reuses provenanceFor for {tag,source}; SOURCE_WEIGHTS observed90/estimated65/unknown25; unknown tag OR unresolved source returns the floor (25) directly (never decayed/fabricated). Age decay mult=max(0.5, 0.5^(ageYears/4)) applied only when ctx.sourceYear finite AND ctx.now set; ageYears=max(0, now-year) (future-year guard); no year => mult 1 (absence != staleness). sourceYear(src,nowYear) in js/data resolves max plausible year in [1990,nowYear] over id+title+url, else null. FK->year stays in the viz caller to keep the score pure.
- 03-02: viz showTooltip (FK d.sourceId??d.sf) + showLinkTooltip (FK d.sf) render ' · Confidence: ${score}%' on the .tf line after badgeHtml; nowYear derives live from DATA.meta.generatedAt (getUTCFullYear), never hardcoded; score interpolated numeric-only (T-03-03 control).
- 03-02: viz render() #lastUpdated write DELETED — js/ui updateStatusIndicator (js/ui/index.js:735) is now the sole #lastUpdated owner (RESEARCH Pitfall 2 dual-owner hazard, viz-side half; Plan 03 owns the ui-side confirmation + freshness test).
- 03-02: Rule-3 blocking fix — guarded js/data top-level window reads (typeof window!=='undefined' ? ... : empty-shape fallback) so sourceYear imports under node:test; browser unchanged. npm test = 168 pass / 0 fail.
- 03-03: accessible #methodologyModal (role=dialog, aria-modal, focus trap, ESC + close) reuses the existing openModal/closeModal/trapFocus + global keydown infra; reachable via a #bMethodology control-bar button next to Help. Close wired via addEventListener in wireUI (no inline-onclick window shim). Modal CSS reuses #helpModal selectors (appended #methodologyModal to each rule) — hidden by default, minimal accessible styling, no design-system polish (Phase-4 deferral).
- 03-03: methodology copy is REAL/honest — 407 sources, 120 high / 3,447 medium qualifiers, ~131 dated sources, exponential ~4yr half-life decay (no date => no decay), observed/estimated/unknown semantics, 75 dangling source FKs + estimated relationships + weekly market-cap auto-update. No fabricated stats.
- 03-03: js/ui updateStatusIndicator confirmed as the SOLE live #lastUpdated owner (reads window.SUPPLY_MAP_DATA.meta.generatedAt each call; js/viz writes it 0 times) — no code change needed, only the freshness-wiring regression test. npm test = 178 pass / 0 fail.
- 03-04: Phase-3 integration gate GREEN — docs/perf/_render-smoke-0304.cjs boots http-server (free port, real repo root, http:// not file://) and drives a REAL node hover. d3 CDN reachable this run, so the real page painted: 100 nodes / 186 links / 100 profiles, 100 circle.mc elements / 732 SVG els; tooltip shows .prov-badge + literal 'Confidence: NN%'; #bMethodology opens #methodologyModal and ESC closes it; footer #lastUpdated = live 'Feb 22, 2026'; ZERO console/page errors. npm test = 178 pass / 0 fail. The synthetic-dataset fallback was NOT needed (Plan 01's rich served data made the real paint work). Honest note: NVIDIA hovers as Unknown/25% (unknown floor) because its source FK is one of the documented 75 dangling references — working as designed; the smoke asserts the Confidence:NN% literal not a fixed value. Human-verify checkpoint auto-approved under AUTO_MODE (visual gate, not a package-legitimacy blocking-human gate).
- 04-01: design tokens defined in base.css :root (loads first) NOT theme.css — cascade resolves for every consumer incl. theme.css; honors 'single source of truth in CSS' against real <link> order (RESEARCH note). Full set: color surfaces/text/brand/status + semantic trust (--color-observed #66bb6a/estimated #ffb300/unknown #9e9e9e), type (--fs-2xs..2xl,--fw-*,--lh-*,fonts), spacing (--space-1..8), radii (--radius-xs..2xl), elevation (--shadow-sm/md/lg/up), motion (--dur-fastest/fast/base/slow,--ease-standard/emphasized).
- 04-01: the 7 legacy vars kept as ALIASES with byte-identical resolved values (A3 cross-check) — --green→--color-success(#4caf50) NOT --color-observed(#66bb6a); zero rendered-color change this plan, consumers migrate in Plan 02.
- 04-01: GATE LANDMINE closed up front — tests/design-tokens.test.mjs + tests/viz-motion.test.mjs authored AND registered in scripts.test in Task 0 (16 unique .test.mjs). 5 assertions are INTENDED Wave 0 RED: migration evidence (layout=9/theme=2 var(--), need ≥10 → Plan 02), buildSimulation/updateGraph split + nodes/links re-bind + mental-map carry + viz matchMedia (→ Plan 03), theme.css prefers-reduced-motion (→ Plan 02). npm test = 191 / 186 pass / 5 RED.
- 04-02: token migration is EXACT-VALUE-PRESERVING — a literal is swapped to var(--token) only when the token resolves byte-identical (#222→--color-border, #1a1a1a→--color-surface-raised, #0f0f0f→--color-surface, #fff→--color-text-bright, #888→--color-text-muted, #505050→--color-text-dim, fs/space/radius/shadow tokens, 0.2s→--dur-base, 0.15s→--dur-fast, 0.05s→--dur-fastest, cubic-bezier(0.4,0,0.2,1)→--ease-standard). #111 (no exact surface token), 3px #bar gap (no 3px spacing token), #666/#777 (no exact dim token) LEFT as literals. layout=19, components=25, theme=17 var(--); zero rendered change.
- 04-02: .confidence-* color: mapped to SEMANTIC trust tokens --color-observed/estimated/unknown (values #66bb6a/#ffb300/#9e9e9e, identical to prior literals); rgba(76,175,80,...)/rgba(255,193,7,...)/rgba(158,158,158,...) background/border literals kept byte-identical (T-04-03 mitigated, design-tokens rgba assertions still GREEN). No selector/#id renamed (T-04-04). theme.css gained @media (prefers-reduced-motion: reduce) block zeroing transitions/animations + explicit transition:none/animation:none on .node/.link/#companyCard/#tt/.modal (T-04-05; CSS half of STORY-03). npm test = 191 / 187 pass / 4 fail — migration-evidence now GREEN; 4 remaining RED are Plan-03 viz refactor (buildSimulation/updateGraph + nodes/links re-bind + mental-map carry + viz matchMedia).

### Standing Constraints

- 103-test suite must stay green throughout; new behavior gets new tests.
- `data/` JSON contract and auto-update pipeline must keep working.
- No framework/build tool — preserve buildless static deploy.

### Todos

- (none yet)

### Blockers

- (none) — note: local render still does not paint because the committed `data/top100-map.js` snapshot lacks `nodes`/`links`/`profiles` (bootstrap guard throws) and the sandbox blocks the Google Fonts CDN. Pre-existing data condition; affects local visual-render verification only. True visual check requires a valid production snapshot or the live deploy.
- FOUND-05 — RESOLVED in 01-03: `.github/workflows/deploy-pages.yml` now copies `styles/` and `js/` into `_site/` (guarded `cp -R`). The deploy will serve the modular CSS/JS on next push to `master`.

## Session Continuity

**Last action:** Completed 04-02-PLAN.md — token migration + reduced-motion CSS. Migrated styles/layout.css (19 var(--)) + styles/components.css (25 var(--)) to consume base.css tokens with exact-value-preserving swaps, preserving the .confidence-* trust contract (semantic tokens for color:, byte-identical rgba backgrounds/borders) (f98d66e); migrated styles/theme.css (17 var(--)) and appended a @media (prefers-reduced-motion: reduce) block (622a01e). npm test = 191 tests / 187 pass / 4 fail — migration-evidence now GREEN; 4 remaining RED are all Plan-03 viz refactor (buildSimulation/updateGraph + nodes/links re-bind + mental-map carry + viz matchMedia). Zero intended visual change. STORY-01 token application complete site-wide; CSS half of STORY-03 (reduced-motion) in place. **Phase 04 — 2 of 4 plans done.**

**Next step:** Execute 04-03-PLAN.md — refactor js/viz/index.js to build-once / update-on-change (buildSimulation/updateGraph, simulation.nodes(/force("link").links( re-bind, mental-map position carry, gentle alphaTarget reheat) + add the matchMedia('(prefers-reduced-motion: reduce)') guard — closes the remaining 4 viz-motion REDs.

---
*State initialized: 2026-06-20*
