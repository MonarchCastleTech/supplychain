# Phase 8: Interaction Performance (PERF-01) - Research

**Researched:** 2026-06-21
**Domain:** Client-side interaction latency — value-preserving memoization of pure analytics + a provable "no simulation restart on simple filter/style change" invariant, for a buildless static D3 site.
**Confidence:** HIGH (all findings verified by direct source read + a green `npm test` = 257/257 in this session)

## Summary

This phase is almost entirely an *in-repo* investigation, not an ecosystem one. The code already
has the right architecture: Phase 4 made the D3 force simulation build-once-and-rebind
(`buildSimulation` is idempotent at `js/viz/index.js:436`), and `applyFilters` (`js/ui/index.js:523`)
plus every style toggle already route through the opacity-only `highlightBy` path
(`js/viz/index.js:385`). The two jobs of PERF-01 are therefore (a) add small, pure, per-session
memo caches around the deterministic analytics that are recomputed on interaction, *without changing
any computed value*, and (b) lock the existing no-restart behavior behind a source-level guard test
so it cannot silently regress.

The hotspots are: `companyConcentration` (called on every profile open at `js/ui/index.js:472`,
and internally rebuilds the entire fan-in map each call), `supplierCriticality` / `buildSupplierFanIn`
(called on every `render()` via `renderChokepoints`, again when building the scenario `<select>`, and
on every chokepoint highlight at `js/ui/index.js:638/660/957`), and `runScenario` (per scenario run).
`getTopOverlap` is already built once at module load (`js/data/index.js:62`) — the only action there
is to confirm no per-interaction rebuild, which is already true.

Memoization is correctness-safe because `DATA` is frozen at load (`js/data/index.js:8` reads
`window.SUPPLY_MAP_DATA` once and the contract forbids mutation). A `Map` keyed on a stable string
derived from the inputs is therefore a pure function of frozen data, so cache hits return byte-identical
values. The anchors `GILD=36`, `NVDA=12`, top chokepoint `"credit and risk data inputs"` fan-in `4`,
Taiwan scenario `7` firms / `$11.36T` (`11360589871184`) are all asserted by existing tests and MUST
stay identical — memoization changes call *cost*, never *value*.

Latency measurement extends the existing Playwright harness (`docs/perf/_perf-capture.cjs`); but note
the harness currently captures **navigation/paint timing only** and the page **does not paint locally**
(stale data snapshot → `NO_FCP`, documented in the baseline). The honest, environment-robust measurement
is a *micro-benchmark of the pure functions* (cold vs warm cache, `performance.now()` over N profile
opens) recorded in `docs/perf/`, optionally supplemented by an in-page interaction-timing capture if the
synthetic-data injection path from plan 01-03 is reused.

**Primary recommendation:** Add a tiny `memoize`/cache helper inside `js/analytics/index.js`, wrap
`buildSupplierFanIn` (the shared hot dependency), `companyConcentration`, `supplierCriticality`, and
`runScenario` with per-session caches keyed on stable string signatures of their inputs, expose
`__resetAnalyticsCache()` as a test seam, and add two new test files — one proving cache hits return
identical values + the reset seam works (via a call-counter spy on the underlying compute), one
source-level guard proving the filter/style path contains no restart call. Register both in
`package.json` `scripts.test`. Keep 257 green (target after additions: ~270+).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Analytics memoization (concentration, criticality, fan-in, scenario) | Pure compute layer (`js/analytics`) | — | DOM-free, importable under `node:test`; caching belongs with the pure functions, not the UI |
| Overlap index (already built once) | Pure compute layer (`js/data`) | — | Module-eval singleton (`SHARED_SUPPLIER_OVERLAP`); already memoized by construction |
| No-restart-on-filter invariant | Render/interaction layer (`js/viz` highlight) + UI handlers (`js/ui`) | — | `highlightBy` is opacity-only; UI handlers must route through it, never `render()`/`updateGraph()` |
| Latency measurement | Test/tooling tier (`docs/perf`, Playwright) | Browser timing APIs | Out-of-band measurement; never ships to the page |
| Test seam (`__resetAnalyticsCache`) | Pure compute layer (`js/analytics`) | Test tier | Cache lifetime is per-session; tests need a deterministic reset |

## Standard Stack

This phase adds **no new runtime dependencies**. The "stack" is the existing buildless toolchain.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `node:test` + `node:assert/strict` | Node built-in | Unit + source-guard tests | Already the entire suite's runner (`package.json` `scripts.test`); zero install |
| `playwright` | ^1.58.2 (installed) | Interaction/timing capture harness | Already the authoritative perf-capture tool (`docs/perf/_perf-capture.cjs`) |
| `http-server` | ^14.1.1 (installed, dev) | Local ES-module-correct serving for any in-page capture | Confirmed module-MIME-correct in baseline doc |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `performance.now()` / `performance.getEntriesByType` | Browser/Node built-in | High-res timing of warm vs cold calls | Both the Node micro-bench and the optional in-page capture |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled `Map` cache | A memoize lib (lodash.memoize, memoizee, micro-memoize) | Rejected — violates buildless/no-framework constraint and the "no new deps" intent; a 10-line `Map` keyed on a string is sufficient and reviewable. **Do NOT add a dependency for this.** |
| Per-session unbounded cache | LRU/TTL cache | Rejected — data is frozen per session and the key space is tiny (~100 symbols, ~458 suppliers, a handful of scenarios); unbounded `Map` is correct and bounded-in-practice |
| WeakMap keyed on object identity | Map keyed on string signature | String key is more robust here because callers pass `opts` objects with varying shapes; a stable signature avoids identity-mismatch cache misses |

**Installation:** None. (`npm test` already runs; `playwright` + `http-server` already in `package.json`.)

## Package Legitimacy Audit

> Not applicable — this phase installs **no external packages**. All work uses Node built-ins
> (`node:test`, `node:assert`, `performance`) and already-installed dev tooling (`playwright`,
> `http-server`). No registry lookups, no `npm install`, no slopcheck surface.

## Architecture Patterns

### System Architecture Diagram

```
USER INTERACTION
      │
      ├── "simple" change ───────────────────────────────────────────┐
      │   (filter apply, label toggle, flow toggle, bottleneck,       │
      │    layer/country highlight, chokepoint highlight, search)      │
      │                                                                ▼
      │                                                      highlightBy(fn) / resetHighlight()
      │                                                      [js/viz:385 / :375]
      │                                                      → .transition().attr("fill-opacity"/"stroke-opacity")
      │                                                      → NO updateGraph, NO new forceSimulation,
      │                                                        NO alpha(1).restart()   ← INVARIANT
      │
      └── "view/data" change ─────────────────────────────► render() [js/viz:637]
          (openProfile, openGlobal, loadView, bReset)        → updateGraph() [js/viz:546]
                                                              → re-bind same sim + GENTLE reheat
                                                                (alphaTarget(0.3)→0)   ← legitimate

ANALYTICS RECOMPUTE PATH (the memoization target)
      │
   profile open ──► companyConcentration(symbol,opts) [js/ui:472]
                         │  (currently) calls buildSupplierFanIn() → rebuilds whole map EACH call
                         ▼
   render()/chokepoints ─► supplierCriticality() [js/ui:638,957] ──► buildSupplierFanIn()
   chokepoint highlight ─► getChokepoints() [js/ui:660]          ──► buildSupplierFanIn()
   scenario run ────────► runScenario() [js/ui:713,722]          ──► buildSupplierFanIn()
                                                                       └──► companyConcentration() × candidates

   AFTER MEMO:  buildSupplierFanIn() ─► [Map cache, key="default"]  → built ONCE per session
                companyConcentration ─► [Map cache, key=sig(symbol,opts)]
                supplierCriticality ──► [Map cache, key=sig(opts)]
                runScenario ─────────► [Map cache, key=sig(disruption)]

   getTopOverlap [js/data:64] ──► reads SHARED_SUPPLIER_OVERLAP (built ONCE at module eval :62)
                                  ← already memoized-by-construction; confirm no rebuild
```

### Recommended Project Structure (delta only)
```
js/analytics/index.js     # + memoize helper, + cache wrapping, + __resetAnalyticsCache()
tests/
├── analytics-memo.test.mjs        # NEW: value-equality + cache-hit (spy/counter) + reset seam
└── no-restart-invariant.test.mjs  # NEW: source-level guard on filter/style handlers
docs/perf/
└── interaction-2026-06-2X.md      # NEW: before/after latency record (PERF-01 SC2)
docs/perf/_interaction-bench.cjs   # NEW (optional): the bench script (kept out of scripts.test)
package.json                       # scripts.test += the two new test files
```

### Pattern 1: Value-preserving per-session memoize (frozen-data cache)
**What:** A `Map` keyed on a stable string signature of the inputs; first call computes, stores, returns;
subsequent calls return the stored value. Because `DATA` never mutates after load, the cached value is
provably equal to a fresh compute.
**When to use:** Deterministic, DOM-free functions over frozen data that are called repeatedly on interaction.
**Example:**
```javascript
// Source: pattern derived from existing js/data SHARED_SUPPLIER_OVERLAP singleton (build-once)
//         + js/analytics pure-function contract. [VERIFIED: repo source]
const _caches = new Map(); // bucket name -> Map<key,value>
function _bucket(name) {
  let b = _caches.get(name);
  if (!b) { b = new Map(); _caches.set(name, b); }
  return b;
}
function _memo(name, key, compute) {
  const b = _bucket(name);
  if (b.has(key)) return b.get(key);   // CACHE HIT — identical value, no recompute
  const v = compute();
  b.set(key, v);
  return v;
}
export function __resetAnalyticsCache() { _caches.clear(); } // test seam
```

### Pattern 2: Default-args evaluation hazard (the real correctness trap)
**What:** `companyConcentration`, `supplierCriticality`, and `runScenario` default `fanIn` to
`buildSupplierFanIn(profiles)` **in the parameter default** (`js/analytics:52,137,159`). Defaults are
evaluated *on every call where the arg is omitted*, so today every profile open rebuilds the full fan-in
map. Memoizing `buildSupplierFanIn` itself is the single highest-leverage change — it is the shared hot
dependency of all four hotspots.
**When to use:** Always wrap the shared dependency first; then the per-function caches are cheap icing.
**Example:**
```javascript
// Wrap the shared dependency so the default-arg path becomes O(1) after first build.
// Key on a stable identity of the profiles object (default => "default" since DATA is frozen).
export function buildSupplierFanIn(profiles = DATA.profiles) {
  const key = profiles === DATA.profiles ? "default" : _sig(profiles);
  return _memo("fanIn", key, () => _buildSupplierFanInUncached(profiles));
}
```

### Anti-Patterns to Avoid
- **Caching across the `opts` object identity:** callers pass fresh `{ profiles: DATA.profiles }`
  objects each call (`js/ui:472,638,957`). A WeakMap on `opts` identity would *never* hit. Key on a
  derived string signature of the *meaningful* fields instead.
- **Mutating the cached value:** `companyConcentration` returns a fresh object; callers must treat
  cached returns as read-only (they already do — values are read, not mutated). Do not hand back a
  reference a caller might mutate, or document that it is shared/frozen.
- **Forgetting `excludeSuppliers` in the key:** `runScenario` calls `companyConcentration` with
  `excludeSuppliers` (`js/analytics:184`). The concentration cache key MUST include the exclude set,
  or scenarios would read the wrong (un-excluded) cached score. This is the #1 correctness risk.
- **Caching `runScenario` without normalizing the disruption shape:** it accepts both
  `disableSuppliers[]` and `disableSupplier` (`js/analytics:162-168`). Key on the *normalized, sorted*
  disabled-label set, not the raw argument, so the two shapes that produce the same set hit the same entry.
- **Widening the no-restart invariant to ALL handlers:** `bReset` (`js/ui:1108`) legitimately calls
  `STATE.simulation.alpha(0.22).restart()`, and `render()`/`updateGraph()` legitimately reheat. The
  guard must target the *simple filter/style* handlers specifically, not blanket-ban restart in the file.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Memoization | A memoize npm dependency | A ~12-line `Map`-based `_memo` in `js/analytics` | Buildless/no-dep constraint; trivial surface; fully testable |
| High-res timing | A custom stopwatch | `performance.now()` / `performance.getEntriesByType` | Built into Node + browser; already used by the harness |
| Browser timing capture | A new capture tool | Extend `docs/perf/_perf-capture.cjs` (Playwright) | Already the authoritative, environment-proven harness |
| Force-sim build-once | Re-architecting the sim | It already exists (Phase 4 `buildSimulation` idempotent) | Don't touch; just assert it stays that way |
| Overlap index caching | A new cache | `SHARED_SUPPLIER_OVERLAP` is already a module singleton | Confirm-only; no code change needed |

**Key insight:** Every hard part of this phase is already solved in-repo (build-once sim, opacity-only
highlight, module-singleton overlap index). The work is *small additive caching* + *locking existing
good behavior with tests* — not new machinery.

## Runtime State Inventory

> Not a rename/refactor/migration phase. This section is included for completeness; the relevant
> "runtime state" here is the *cache lifetime*, which is intentionally in-memory and per-session.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — caches are in-memory `Map`s, never persisted; `DATA` is read-only from `window.SUPPLY_MAP_DATA` | None |
| Live service config | None — buildless static site, no external services | None |
| OS-registered state | None | None |
| Secrets/env vars | None | None |
| Build artifacts | None — buildless; no compiled output, no egg-info/dist | None |

**Cache invalidation note:** Because `DATA` is frozen for the lifetime of the page (no in-session data
mutation path exists — verified: no writer to `window.SUPPLY_MAP_DATA` or `DATA.profiles`), a per-session
cache requires **no runtime invalidation**. The only reset is the test seam.

## Common Pitfalls

### Pitfall 1: Cache key omits a value-affecting input → wrong (but consistent) numbers
**What goes wrong:** A scenario reads a stale un-excluded concentration; an `opts`-tuned call (e.g.
`{wHHI:1,wShared:0}` at `js/ui`/tests) returns the default-weighted score.
**Why it happens:** `companyConcentration` has six value-affecting opts (`wHHI`, `wShared`,
`sharedThreshold`, `profiles`, `fanIn`, `excludeSuppliers`); keying on `symbol` alone is wrong.
**How to avoid:** Build the key from every field that changes the output: `symbol` + the numeric
weights/threshold + a profiles identity tag + a sorted `excludeSuppliers` signature. The existing test
`companyConcentration honors opts weights and sharedFrac threshold` (concentration.test.mjs:102) will
catch a too-coarse key — keep it passing.
**Warning signs:** `concentration.test.mjs` or `scenario.test.mjs` go red while the function "looks right".

### Pitfall 2: Default-arg `fanIn` defeats the cache
**What goes wrong:** You memoize `companyConcentration` but it still rebuilds the fan-in map because the
default arg `fanIn = buildSupplierFanIn(profiles)` is evaluated before the cache check, OR you key on a
fresh `fanIn` object identity.
**Why it happens:** Param defaults evaluate eagerly; fan-in is a per-call object.
**How to avoid:** Memoize `buildSupplierFanIn` first (Pattern 2) so the default path is O(1); never key
on the `fanIn` *object* — derive the key from `symbol`+opts and let the wrapped fan-in serve the map.
**Warning signs:** Bench shows no improvement on warm calls.

### Pitfall 3: Guard test too broad → fails on legitimate reset/render
**What goes wrong:** A guard that greps the whole `js/ui/index.js` for `restart(`/`alpha(` fails because
`bReset` and `render()`/`updateGraph()` legitimately reheat.
**Why it happens:** The invariant is "*simple filter/style* changes don't restart", not "nothing restarts".
**How to avoid:** Scope the assertion to the *bodies of the simple-change handlers* — `applyFilters`,
`resetFilters`, the `bLabels`/`bFlow`/`bBottlenecks` onclicks, `highlightChokepoints`, layer/country
button handlers (`js/viz` `buildLayerSidebar`/`buildCountryButtons`), and `highlightBy`/`resetHighlight`
themselves. Assert those bodies contain no `forceSimulation(`, `.alpha(`, `.restart(`, `updateGraph(`,
`render(`. Allow-list `bReset` and `render`/`updateGraph` explicitly.
**Warning signs:** Guard fails on an unrelated handler — your slice boundaries are wrong.

### Pitfall 4: Measuring latency on a page that doesn't paint
**What goes wrong:** Re-running `_perf-capture.cjs` as-is yields `FCP=null` again (documented baseline
condition) and no interaction timing.
**Why it happens:** The committed data snapshot lacks `nodes`/`links`/`profiles`, so the D3 viz never
renders locally (baseline doc, "Known Pre-Existing Render Condition").
**How to avoid:** Prefer a **Node micro-benchmark** of the pure functions (cold vs warm, N iterations,
`performance.now()`) which is environment-independent and directly measures the memoization win. If an
in-page number is wanted, reuse the plan 01-03 synthetic-data injection (intercept the two `data/*.js`
script requests) so the page paints, then time `applyFilters` + N `openProfile` calls.
**Warning signs:** Latency doc has only navigation timings, no interaction/analytics numbers.

## Code Examples

Verified patterns (all from this repo's existing, tested code).

### Confirming the filter path is already opacity-only
```javascript
// Source: js/ui/index.js:523-545 (applyFilters) → js/viz/index.js:385-392 (highlightBy)
function applyFilters() {
  /* ...reads filter <select> values, builds predicate fn... */
  highlightBy(fn);                                  // opacity-only
  document.getElementById('filterPanel').style.display = 'none';
  syncUrlState();                                   // URL only — no render()
}
function highlightBy(fn) {
  STATE.lockId = null; tt.style.display = "none";
  nodeSel.select(".mc").transition().duration(160).attr("fill-opacity", d => fn(d) ? 1 : 0.03);
  labelSel.transition().duration(160).attr("fill-opacity", d => fn(d) ? 1 : 0.03);
  subSel.transition().duration(160).attr("fill-opacity", d => fn(d) ? (STATE.labelsVisible ? 1 : 0) : 0.03);
  linkSel.transition().duration(160).attr("stroke-opacity", 0.015);
  // NO updateGraph(), NO d3.forceSimulation(), NO .alpha().restart()  ← the invariant
}
```

### Source-level guard test skeleton (new file)
```javascript
// tests/no-restart-invariant.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const UI = readFileSync("js/ui/index.js", "utf8");
const VIZ = readFileSync("js/viz/index.js", "utf8");

function bodyOf(src, signature) {           // crude but sufficient brace-matcher
  const start = src.indexOf(signature);
  assert.ok(start >= 0, `not found: ${signature}`);
  let depth = 0, i = src.indexOf("{", start);
  const open = i;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return src.slice(open, i + 1);
  }
  throw new Error("unbalanced braces for " + signature);
}
const BANNED = [/\bd3\.forceSimulation\s*\(/, /\.alpha\s*\(/, /\.restart\s*\(/, /\bupdateGraph\s*\(/, /\brender\s*\(/];

for (const sig of ["function applyFilters(", "function resetFilters(", "function highlightChokepoints("]) {
  test(`${sig} contains no simulation-restart / re-render call`, () => {
    const body = bodyOf(UI, sig);
    for (const re of BANNED) assert.doesNotMatch(body, re, `${sig} must not match ${re}`);
  });
}
for (const sig of ["function highlightBy(", "function resetHighlight("]) {
  test(`${sig} (viz) is opacity-only — no restart`, () => {
    const body = bodyOf(VIZ, sig);
    for (const re of BANNED) assert.doesNotMatch(body, re, `${sig} must not match ${re}`);
  });
}
// Allow-list proof: bReset DOES legitimately reheat (documents the boundary).
test("bReset legitimately reheats (invariant is scoped to simple changes only)", () => {
  assert.match(UI, /alpha\(0\.22\)\.restart\(\)/, "bReset's legitimate reheat must remain");
});
```

### Memoization unit test skeleton (new file)
```javascript
// tests/analytics-memo.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  companyConcentration, supplierCriticality, runScenario,
  buildSupplierFanIn, SCENARIO_PRESETS, __resetAnalyticsCache,
} from "../js/analytics/index.js";

const data = JSON.parse(fs.readFileSync("data/top100-map.json", "utf8"));
const profiles = data.profiles, nodes = data.nodes;

test("memoized values are byte-identical to a fresh compute (anchors hold)", () => {
  __resetAnalyticsCache();
  const a = companyConcentration("GILD", { profiles });
  const b = companyConcentration("GILD", { profiles });   // cache hit
  assert.deepEqual(a, b);
  assert.equal(a.score, 36);                                // anchor preserved
  assert.equal(companyConcentration("NVDA", { profiles }).score, 12);
});

test("second call is a cache hit (underlying compute runs once)", () => {
  // Requires the impl to route through an injectable/spied compute, OR count
  // buildSupplierFanIn rebuilds via a module-exported counter. Pattern: wrap the
  // uncached builder and assert its invocation count via __memoStats() (test-only).
  __resetAnalyticsCache();
  supplierCriticality({ profiles });
  supplierCriticality({ profiles });
  // assert.equal(__memoStats().fanInBuilds, 1);  // exposed as a test seam
});

test("__resetAnalyticsCache forces a recompute and still returns identical values", () => {
  const before = supplierCriticality({ profiles, limit: 3 });
  __resetAnalyticsCache();
  const after = supplierCriticality({ profiles, limit: 3 });
  assert.deepEqual(after, before);
  assert.equal(after[0].supplier, "credit and risk data inputs"); // anchor
});

test("runScenario cache keys on the normalized disabled set (anchors hold)", () => {
  __resetAnalyticsCache();
  const r = runScenario(SCENARIO_PRESETS.TAIWAN_SEMI.disruption, { profiles, nodes });
  assert.equal(r.impactedCompanies.length, 7);
  assert.equal(r.totalMarketCapExposed, 11360589871184);
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Full `clearGraph()` + new `forceSimulation` on every view change | Build-once sim, re-bind + gentle reheat | Phase 4 (STORY-03) | The no-restart foundation this phase locks down |
| Fan-in rebuilt on every analytics call (default-arg eager eval) | Per-session memoized fan-in (this phase) | Phase 8 | O(1) warm analytics; same values |
| (n/a) overlap index | Already a module-eval singleton | Phase pre-6 | No change needed; confirm only |

**Deprecated/outdated:** Nothing to deprecate. `clearGraph()` still exists (`js/viz:181`) but is correctly
NOT called on view changes (`render()` comment at `js/viz:636`); leave it for genuine teardown.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A per-session unbounded `Map` cache needs no invalidation because `DATA` is never mutated in-session | Runtime State Inventory | LOW — verified no writer to `DATA`/`window.SUPPLY_MAP_DATA` exists; if a future phase adds live data edits, caches must be reset on edit |
| A2 | A Node micro-benchmark is an acceptable PERF-01 SC2 measurement given the page does not paint locally | Latency / Validation | LOW — discuss-phase already accepted "honest numbers"; an in-page capture via synthetic-data injection is the optional stronger alternative |
| A3 | The "simple filter/style" handler set to guard is: applyFilters, resetFilters, bLabels, bFlow/toggleParticles, bBottlenecks, highlightChokepoints, layer/country highlight buttons, highlightBy, resetHighlight | No-restart invariant | MEDIUM — if a handler is omitted from the guard, a future regression in it could go uncaught; mitigation: enumerate explicitly and review against `wireUI` |

**Note:** Anchors (`GILD=36`, `NVDA=12`, fan-in top = `credit and risk data inputs`/4, Taiwan `7`/`$11.36T`)
are NOT assumptions — they are VERIFIED by existing passing tests (concentration.test.mjs:35,
criticality-wiring.test.mjs:30, scenario.test.mjs:32/40) and a green 257-test run this session.

## Open Questions

1. **Test seam for the "cache hit = compute runs once" assertion**
   - What we know: the cleanest proof is a call counter on the underlying compute (e.g. `buildSupplierFanIn`).
   - What's unclear: whether to expose `__memoStats()` (build counts) or to spy by temporarily swapping a
     module-internal compute. node:test has no built-in module mock for ESM.
   - Recommendation: expose a tiny test-only `__memoStats()` returning `{ <bucket>: hitCount/buildCount }`
     alongside `__resetAnalyticsCache()`. Simple, deterministic, no mocking library.

2. **In-page interaction timing vs Node micro-bench for the recorded number**
   - What we know: page doesn't paint locally; Node bench is robust.
   - What's unclear: whether the planner wants a user-facing ms figure or a compute-cost figure.
   - Recommendation: record the Node micro-bench as the authoritative SC2 number; add the in-page capture
     as a "best-effort" supplementary section if the synthetic-data injection is cheap to reuse.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (`node --test`) | Unit + guard tests | ✓ | (system) | — |
| `playwright` | In-page interaction capture (optional) | ✓ | ^1.58.2 | Node micro-bench (no browser) |
| `http-server` | Local serving for in-page capture | ✓ | ^14.1.1 | Node micro-bench (no serving) |
| Chromium (Playwright bundled) | In-page capture | ✓ (bundled) | — | Node micro-bench |
| Live FCP/paint locally | A *painted-page* in-page number | ✗ | — | Node micro-bench (authoritative) + synthetic-data injection (plan 01-03 pattern) |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** Local page paint — fall back to the Node micro-benchmark, which is
the recommended authoritative measurement anyway.

## Validation Architecture

> nyquist_validation treated as enabled (no `.planning/config.json` override read disabling it).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` + `node:assert/strict` (Node built-in) |
| Config file | none — explicit file list in `package.json` `scripts.test` |
| Quick run command | `node --test tests/analytics-memo.test.mjs tests/no-restart-invariant.test.mjs` |
| Full suite command | `npm test` (currently 257 tests; target after this phase ~270+) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERF-01 | Memoized analytics return identical values (anchors hold) | unit | `node --test tests/analytics-memo.test.mjs` | ❌ Wave 0 |
| PERF-01 | Second call is a cache hit (underlying compute runs once) | unit | `node --test tests/analytics-memo.test.mjs` | ❌ Wave 0 |
| PERF-01 | `__resetAnalyticsCache()` forces recompute, same values | unit | `node --test tests/analytics-memo.test.mjs` | ❌ Wave 0 |
| PERF-01 | Simple filter/style handlers contain no restart/re-render call | source-guard | `node --test tests/no-restart-invariant.test.mjs` | ❌ Wave 0 |
| PERF-01 | `highlightBy`/`resetHighlight` are opacity-only | source-guard | `node --test tests/no-restart-invariant.test.mjs` | ❌ Wave 0 |
| PERF-01 | Existing anchors unchanged (GILD/NVDA/chokepoint/Taiwan) | regression | `npm test` (concentration/criticality/scenario tests) | ✅ exists |
| PERF-01 SC2 | Latency improvement recorded vs Phase-1 baseline | manual/bench | `node docs/perf/_interaction-bench.cjs` → record in `docs/perf/` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `node --test tests/analytics-memo.test.mjs tests/no-restart-invariant.test.mjs`
- **Per wave merge:** `npm test` (full 257+ suite green)
- **Phase gate:** Full suite green + latency doc committed under `docs/perf/` before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/analytics-memo.test.mjs` — covers PERF-01 (value-equality, cache-hit, reset seam)
- [ ] `tests/no-restart-invariant.test.mjs` — covers PERF-01 (no-restart guard)
- [ ] `docs/perf/_interaction-bench.cjs` — micro-bench (NOT registered in scripts.test)
- [ ] `docs/perf/interaction-2026-06-2X.md` — recorded before/after latency (PERF-01 SC2)
- [ ] `package.json` `scripts.test` — append the two new `tests/*.mjs` files
- [ ] `js/analytics/index.js` — add `__resetAnalyticsCache()` (+ optional `__memoStats()`) export

## Security Domain

> `security_enforcement` not explicitly disabled; assessing applicability.

This phase changes pure-compute caching and adds tests only. It introduces **no new input surface, no new
DOM sinks, no network calls, no auth/session/crypto**. Existing XSS discipline (all UI labels pass through
`escapeHtml` before `innerHTML`, e.g. `js/ui` chokepoints/scenario rendering) is untouched by memoization.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth in product (public site) |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | Static public data |
| V5 Input Validation | no (no new input) | Existing `escapeHtml` before `innerHTML` remains the control; memoization adds no input path |
| V6 Cryptography | no | None |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Cache poisoning via mutated cached object | Tampering | Treat cached returns as read-only (callers already only read); optionally `Object.freeze` returned objects |
| Cache key collision returning wrong value | Tampering/Info | Key on ALL value-affecting inputs (see Pitfall 1); regression anchors catch it |
| (No new XSS/injection surface introduced) | — | Existing `escapeHtml` discipline unchanged |

## Sources

### Primary (HIGH confidence)
- Repo source (read in full this session): `js/analytics/index.js`, `js/data/index.js`,
  `js/ui/index.js`, `js/viz/index.js` — hotspots, highlight/restart paths, frozen-data contract
- `tests/concentration.test.mjs`, `tests/criticality-wiring.test.mjs`, `tests/scenario.test.mjs` —
  anchor values + existing source-guard test pattern (`readFileSync` + regex on function body)
- `npm test` executed this session → `tests 257 / pass 257 / fail 0` (regression baseline)
- `docs/perf/baseline-2026-06-20.md`, `docs/perf/_perf-capture.cjs` — harness shape + `NO_FCP`/no-paint
  local condition + synthetic-data injection precedent (plan 01-03)
- `.planning/phases/08-interaction-performance/08-CONTEXT.md` — locked decisions
- `package.json` — explicit `scripts.test` file list (registration requirement)

### Secondary (MEDIUM confidence)
- None required — phase is fully resolvable from repo evidence.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new deps; built-ins + already-installed tooling, all verified present
- Architecture (hotspots + no-restart paths): HIGH — every path traced to exact line numbers in source
- Pitfalls: HIGH — derived from the actual default-arg/opts/exclude shapes in `js/analytics`
- Latency method: MEDIUM — Node micro-bench is robust; in-page capture is environment-constrained (documented)

**Research date:** 2026-06-21
**Valid until:** 2026-07-21 (stable; repo is buildless and data is frozen — low churn)
