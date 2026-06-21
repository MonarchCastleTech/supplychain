---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-06-21T13:22:36.812Z"
progress:
  total_phases: 10
  completed_phases: 7
  total_plans: 28
  completed_plans: 25
  percent: 70
---

# Project State: Monarch Castle Technologies — Market Intelligence

## Project Reference

**Core Value:** Investors trust every number and instantly grasp supply-chain structure, concentration, and risk — credibility first, then beauty, then unique depth.

**Current Focus:** Phase 08 — Interaction Performance

**Mode:** mvp | **Granularity:** fine

## Current Position

Phase: 08 (Interaction Performance) — EXECUTING
Plan: 2 of 4 (08-01 complete)
**Phase:** 08 — Interaction Performance — IN PROGRESS (1 of 4 plans done)
**Plan:** 08-01 complete — analytics memoization (PERF-01) shipped; anchors unchanged; 263/263 green
**Status:** Executing Phase 08
**Progress:** [█████████░] 89%

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
| Phase 04 P03 | ~15min | 2 tasks | 1 files |
| Phase 04 P04 | ~12min | 1 task + 1 checkpoint | 1 file |
| Phase-4 gate (04-04) | npm test = 191 pass / 0 fail; design/motion smoke PASS — 100 nodes painted over http-server, :root tokens resolve at runtime (--color-bg #0a0a0a, --color-observed #66bb6a, --fs-base 10px, --dur-base 200ms), .prov-badge color matches confidence class (NVDA confidence-low = rgb(158,158,158)), global→profile switch keeps exactly ONE g.nodes layer (build-once, no teardown; 100→17), reduced-motion run paints + switches, ZERO console errors. Human-verify auto-approved under AUTO_MODE (visual gate). STORY-01 + STORY-03 verified; Phase 4 complete (4/4) |
| Phase 05 P01 | 3 min | 2 tasks | 4 files |
| Phase 05 P02 | 4 min | 2 tasks | 2 files |
| Hero-controller gate (05-02) | npm test = 214 tests / 210 pass / 4 fail — narrative suite 18/18 (+11 controller); 191 prior green; 1 prior Wave-0 RED (controller-presence+reduced-motion) flipped GREEN; 4 remaining RED are Plan-03 hero-wiring (index.html #heroOverlay markup + main.js heroSeen/#bTour) |
| Phase 05 P03 | 9 | 3 tasks | 4 files |
| Phase 06 P01 | ~20min | 3 tasks | 4 files |
| Concentration-analytics gate (06-01) | npm test = 231 pass / 0 fail (214 prior + 10 concentration + 7 criticality-wiring); anchors GILD=36, NVDA=12, Healthcare reuse 12%, top chokepoint fan-in 4 |
| Phase 06 P02 | ~15min | 2 tasks (1 TDD) | 4 files |
| Concentration-display gate (06-02) | npm test = 242 pass / 0 fail (231 prior + 11 new: 6 derived-provenance + 5 ui/viz/html string-wiring); derived badge never renders Observed |
| Phase 07 P01 | ~8min | 3 tasks (TDD) | 3 files |
| Scenario-engine gate (07-01) | npm test = 251 pass / 0 fail (242 prior + 9 new scenario unit); TAIWAN_SEMI → 7 firms / $11,360,589,871,184 exposed / HHI 0.20→0.25; single 'tsmc'→KLAC; excludeSuppliers proven additive |
| Phase 07 P02 | 12min | 3 tasks | 4 files |
| Phase 07 P03 | ~6min | 2 tasks + 1 checkpoint | 1 file |
| Scenario integration gate (07-03) | npm test = 257 pass / 0 fail; scenario smoke PASS over http-server — Taiwan preset → live "7 companies impacted · $11.36T market cap exposed" headline + 7 impact rows + Derived badge (Observed absent) + 7-node highlight (93 dimmed) + reset restores graph, 0 console errors (d3 CDN reachable, real paint, synthetic fallback not needed). Human-verify auto-approved under AUTO_MODE. Phase 7 complete (3/3) |
| Phase 08 P01 | 4min | 3 tasks | 3 files |

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
- 05-01: buildNarrative(data) is PURE/DOM-free — each step apply(controls) injects openGlobal/highlightBy/openProfile; no DOM/d3 access and NO js/ui/index.js import (RESEARCH Pitfall 5) so it unit-tests in plain Node. Side effects flow only through the injected controls argument.
- 05-01: captions are data-derived at runtime (combined cap Σmarketcap/1e12, bn count, dominant layer idx+name+count, top-cap bottleneck). Two-fixture diff test proves non-fabrication (market+risk captions differ across fixtures; market caption embeds fixture combined-cap + meta.count). topSymbol = highest-marketcap node that is ALSO bn, falling back to overall highest — never hardcoded (robust to weekly refresh; makes opportunity the payoff of risk).
- 05-01: Wave 0 gate — tests/narrative.test.mjs (7 assertions GREEN) + tests/hero-wiring.test.mjs (5 assertions INTENDED RED, closed by Plans 02 controller + 03 markup/main-wiring) registered in scripts.test (18 files). npm test = 203 / 198 pass / 5 RED (mirrors 04-01 Wave-0 pattern). Deviation: topSymbol prefers bn over the RESEARCH reference's global-max (Task-1 behavior), pinned by a fallback test.
- 05-02: createHeroController({steps,controls,storage,reducedMotion,timers,render}) is PURE/DOM-free (RESEARCH Pattern 2) — single timerId state machine, STEP_MS=5500 (~5.5s/step, 4 steps ~22s within ~30s STORY-02). scheduleNext() returns BEFORE timers.setTimeout when reducedMotion() truthy (zero timers under reduced motion; show()/apply()/render still run so captions display; manual next() unaffected). play() always restarts at index 0 ignoring stored heroSeen (replay always allowed). stop()/skip() (skip is an alias of stop) = pause + storage.write('heroSeen','1') + resetHighlight + render(null,...) so the map is never left dimmed (Pitfall 4); end-of-autoplay and next()-past-last both route through stop(). pause/next/prev clear the single timerId via timers.clearTimeout (bounded autoplay, T-05-04 mitigated). Returns {play,pause,next,prev,skip,getIndex}.
- 05-02: narrative suite 18/18 (+11 controller assertions: play schedules one timer, fire advances+re-arms, full autoplay stops+writes heroSeen, pause clears, next/prev bounds, next-past-last stop, skip teardown, reduced-motion zero-timer + manual next, replay). npm test = 214 / 210 pass / 4 fail — the controller-presence+reduced-motion hero-wiring assertion flipped GREEN; 4 remaining RED are Plan-03's #heroOverlay markup + main.js heroSeen/#bTour wiring. No deviations.
- 06-02: js/trust provenanceFor gained a branch-0 `derived` tag (input.derived===true → {tag:'derived', note:'computed from N relationship(s)', source: ctx.methodologyUrl?{label:'Methodology',url}:undefined}); n defaults to 0 for missing/non-finite. badgeHtml maps derived→'Derived' (confidence-medium class), NEVER 'Observed' (test-enforced doesNotMatch); reuses the existing url.startsWith('http') guard + rel=noopener noreferrer so a non-http '#methodology' anchor degrades to label-only. js/ui: renderCardInsights renders 'Supplier concentration: NN/100 (HHI-based)' + the Derived badge into new #cardConcentration via companyConcentration(symbol,{profiles}); renderChokepoints() lists supplierCriticality({limit:8}) (escaped labels, integer fan-in) into #chokepointsList; #bChokepoints → highlightBy(d=>d.kind==='supplier' && chokepointSet.has(normalizeEntityLabel(d.l.split('\\n')[0]))), #bChokepointsReset → resetHighlight. js/viz unchanged (existing highlightBy already accepts arbitrary predicates). index.html: NEW IDs only (#cardConcentration, #chokepointsPanel/#chokepointsList, #bChokepoints/#bChokepointsReset); Methodology modal gained 'Supplier concentration (derived)' [C=round(100·(0.6·HHI+0.4·sharedFrac)), equal-weight HHI=1/k limit stated] + 'Critical chokepoints (derived)' [fan-in, top=4] sections. npm test = 242 pass / 0 fail (231 prior + 11 new). No deviations.
- 07-03: Phase-7 integration gate GREEN. docs/perf/_scenario-smoke-0703.cjs boots http-server (free port, real repo root, http:// not file://), clicks #bScenarioTaiwan, and asserts at runtime: the live-derived headline "7 companies impacted · $11.36T market cap exposed" (/7 companies/ + /11.36/ + /exposed/ — not baked), exactly 7 #scenarioImpactList .cItem rows, a "Derived" #scenarioProv .prov-badge ("Observed" absent), exactly 7 circle.mc at fill-opacity ~1 + 93 dimmed to ~0.03 (highlightBy), and reset clearing summary/list/prov + restoring the graph (0 nodes at the dim floor), with 0 console errors. d3 CDN reachable this run → real paint (100 nodes); synthetic fallback not needed. npm test = 257 pass / 0 fail (no source edits; pure verification gate). Human-verify checkpoint (gate="blocking") auto-approved under AUTO_MODE — visual/functional gate, not a package-legitimacy blocking-human gate. T-07-06 + T-07-07 mitigations verified at runtime. DEPTH-03 + DEPTH-04 proven end-to-end; Phase 7 complete (3/3). No deviations.
- 07-02: scenario UI slice shipped. index.html: #scenarioPanel (sibling of #chokepointsPanel, NEW IDs only — scenarioPanel/scenarioSummary/scenarioImpactList/scenarioProv/bScenarioTaiwan/scenarioChokepointSelect/bScenarioReset) with Taiwan preset button + generalized chokepoint <select> + reset; Methodology modal gained a 'Scenario stress-tests (derived)' block (single-hop/direct-dependents, HHI=1/k monotonic [composite excluded — non-monotonic], 'market cap exposed'=exposure NOT a loss estimate, Taiwan preset disables real TSMC label variants). js/ui: import runScenario+SCENARIO_PRESETS; renderScenario writes a LIVE headline (`${result.impactedCompanies.length} companies impacted · $${(totalMarketCapExposed/1e12).toFixed(2)}T market cap exposed` — no 7/11.36 literal anywhere, T-07-05 test-enforced) + escaped impact list (lost / before→after suppliers / before→after HHI) + #scenarioProv badge via badgeHtml(provenanceFor({derived:true,n})) (Derived, never Observed); highlightImpacted→highlightBy(n=>impacted.has(n.symbol)); runTaiwanScenario uses the bundled preset, runChokepointScenario(label) uses disableSupplier for the <select>; resetScenario clears summary/list/prov+select+resetHighlight. <select> options use textContent (safe), innerHTML path escaped via escapeHtml (T-07-03). tests/scenario-wiring.test.mjs registered (6 assertions). DEPTH-03+DEPTH-04 complete. npm test = 257 pass / 0 fail (251 prior + 6). index-ui-integrity 5/5. No deviations.
- 07-01: js/analytics gained the pure DOM-free scenario engine. runScenario(disruption,ctx) is single-hop (a firm is "impacted" iff it loses ≥1 distinct supplier; cascade deferred); concentrationBefore/After report HHI=1/k (the MONOTONIC metric) NOT the composite score (composite is non-monotonic under removal — removing a shared single-point drops sharedFrac; 07-RESEARCH Pitfall 1). marketcap read from top-level ctx.nodes keyed by symbol (profiles do NOT carry marketcap; Pitfall 3). companyConcentration gained an ADDITIVE excludeSuppliers opt (Set|string[]|undefined→null): one filter line over uniq before k/HHI/sharedFrac; undefined leaves output byte-identical (242 prior green). SCENARIO_PRESETS.TAIWAN_SEMI bundles the 5 REAL normalized TSMC label variants (TSMC fragmented across distinct labels) — a single 'tsmc' hits only KLAC (Pitfall 2). Severity = share-of-suppliers-lost (≥0.5 high/≥0.25 medium/else low); Taiwan preset is "low" (1 of 5). "market cap exposed" = combined cap of impacted firms (exposure, NOT loss). tests/scenario.test.mjs (9 assertions, registered in scripts.test) pins real fixtures: 7 firms {NVDA,AAPL,AVGO,000660.KS,AMD,AMAT,KLAC}, totalMarketCapExposed===11360589871184 (derived live from fixture nodes then asserted equal to literal — proves not engine-baked), k 5→4 / HHI 0.20→0.25 after≥before, no-op safe, back-compat deep-equal. TDD: RED 925ee1b → GREEN c9d85ce. npm test = 251 pass / 0 fail. No deviations.
- 08-01: js/analytics gained a per-session Map memo layer (_caches/_bucket/_memo + parallel _stats build/hit counters) — caching changes COST not VALUE (DATA frozen, no in-session writer → no invalidation). buildSupplierFanIn memoized FIRST (key "default" for DATA.profiles) so the eager default-arg fan-in rebuild at companyConcentration/supplierCriticality/runScenario is now O(1) after first build. companyConcentration key = `symbol|wHHI|wShared|sharedThreshold|profilesTag|sortedExcludeSet` (excludeSuppliers in the key is the #1 correctness risk — runScenario reads excluded scores). supplierCriticality key = `profilesTag|limit`. runScenario key = normalized SORTED disabled-label set + profilesTag, computed AFTER normalization so disableSuppliers:["tsmc"] and disableSupplier:"tsmc" collide on one entry. Test seams __resetAnalyticsCache() (clears caches + zeroes stats) + __memoStats() (shallow-copy of counters). DEVIATION (Rule 1): the plan's static profilesTag "X" for all non-default profiles caused a cache-key collision (concentration.test.mjs:73 synthetic fixture got score 12 not 36); fixed with a WeakMap per-object identity tag (X1,X2,...). Anchors unchanged: GILD=36, NVDA=12, top fan-in "credit and risk data inputs"=4, Taiwan 7 firms/$11,360,589,871,184. Both phase test files registered in scripts.test (24 total; no-restart-invariant.test.mjs authored in Plan 02 — registered-but-absent is skipped, exit 0). TDD: RED 1150a59 → GREEN e28e3d4 (+ chore 703f692). npm test = 263 pass / 0 fail (257 prior + 6 new memo). No new deps.
- 06-01: js/analytics/index.js is a pure DOM-free engine (mirrors js/trust). companyConcentration = round(100*(0.6*(1/k)+0.4*sharedFrac)), clamped [0,100], with the equal-weight HHI=1/k assumption stated in a module comment (dataset has no per-supplier volume; all l.v=2); wHHI/wShared/sharedThreshold are opts params for tunability. sectorConcentration groups by layers[node.y] (NOT profile.category) and reports reuse%=(slots-distinct)/slots + effectiveSuppliers=1/HHI — NOT raw HHI*100 (which is an uninterpretable 1-7). supplierCriticality ranks suppliers by real fan-in via buildSupplierFanIn (Map<label,Set<symbol>> mirroring the overlap index); top chokepoint='credit and risk data inputs'=4; deterministic localeCompare tie-break; never references the editorial d.bn flag (asserted at source level). Anchors test-locked: GILD=36, NVDA=12, Healthcare reuse 12%, Finance 9%, fan-in histogram {1:439,2:13,3:5,4:1}. Both test files registered in scripts.test (18→20). npm test = 231 pass / 0 fail (214 prior + 10 concentration + 7 criticality-wiring). No deviations.

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

**Last action:** Completed 08-01-PLAN.md — analytics memoization (PERF-01, Wave 0/1). Registered both phase test files in package.json scripts.test (chore 703f692; no-restart-invariant.test.mjs authored later in Plan 02 — Wave-0 gate). Authored tests/analytics-memo.test.mjs RED (test 1150a59) then added a per-session Map memo layer + __resetAnalyticsCache/__memoStats seams to js/analytics, memoizing buildSupplierFanIn FIRST then companyConcentration (key includes sorted excludeSuppliers), supplierCriticality, runScenario (key = normalized sorted disabled set) GREEN (feat e28e3d4). Caching changes COST not VALUE — anchors unchanged (GILD=36, NVDA=12, fan-in top=4, Taiwan 7/$11.36T). Auto-fixed one Rule-1 cache-key collision (static "X" profilesTag → WeakMap per-object identity tag) before the GREEN commit. npm test = 263 pass / 0 fail (257 prior + 6 new). No new deps. Next: Plan 02 authors tests/no-restart-invariant.test.mjs (already registered) + the source-guard.

**Prior action:** Completed 07-03-PLAN.md — the Phase-7 scenario stress-test integration gate (DEPTH-03 + DEPTH-04, 3 of 3). Confirmed the full suite green at 257 (242 prior + 9 scenario unit + 6 scenario-wiring; both new files in the run command) with no source edits. Created docs/perf/_scenario-smoke-0703.cjs (test 747b41e) — a Playwright smoke that boots http-server (real repo root, http:// not file://), clicks #bScenarioTaiwan, and asserts at runtime the live-derived "7 companies impacted · $11.36T market cap exposed" headline + 7 #scenarioImpactList rows + a "Derived" #scenarioProv badge ("Observed" absent) + exactly 7 lit / 93 dimmed circle.mc + reset clears panel & restores graph, with 0 console errors. d3 CDN reachable → real paint (100 nodes), synthetic fallback not needed. Smoke PASS. Human-verify checkpoint auto-approved under AUTO_MODE (visual gate). Phase 7 complete (3/3).

**Prior action:** Completed 07-01-PLAN.md — the pure scenario engine (DEPTH-03, Wave 0/1). Added the additive `excludeSuppliers` opt to companyConcentration (undefined → byte-identical legacy output) plus the DOM-free `runScenario(disruption,ctx)` single-hop impact engine reporting HHI (the monotonic delta) and `SCENARIO_PRESETS.TAIWAN_SEMI` bundling the 5 real normalized TSMC labels. TDD: registered tests/scenario.test.mjs in package.json + wrote 9 fixture-pinned assertions RED (test 925ee1b) → implemented engine GREEN (feat c9d85ce). TAIWAN_SEMI derives exactly 7 firms / $11,360,589,871,184 exposed / HHI 0.20→0.25; single 'tsmc' → KLAC only; no-op safe. npm test = 251 pass / 0 fail (242 prior + 9 new). No deviations.

**Earlier action:** Completed 06-02-PLAN.md — the concentration display + chokepoints wiring plan. Added a branch-0 `derived` provenance tag to js/trust (provenanceFor + badgeHtml 'Derived', never 'Observed') under TDD (test aee630b → feat a0b60a7). Wired companyConcentration into the profile panel as 'Supplier concentration: NN/100' with a Derived badge (#cardConcentration), added a #chokepointsPanel listing supplierCriticality top-8 by real fan-in with a #bChokepoints highlightBy graph highlight + #bChokepointsReset, and documented both formulas (incl. the equal-weight HHI=1/k limit) in the Methodology modal (feat 0c3870c). NEW index.html IDs only; inline-bootstrap + all prior IDs intact (index-ui-integrity green). npm test = 242 pass / 0 fail (231 prior + 11 new). DEPTH-01 + DEPTH-02 display complete. No deviations.

**Next step:** Phase 8 in progress (1/4). Execute Plan 08-02 (no-restart-invariant source guard — the registered test file).

---
*State initialized: 2026-06-20*
