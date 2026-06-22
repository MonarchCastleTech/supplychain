// js/analytics/index.js — pure, DOM-free concentration & criticality engine.
//
// Mirrors the shape of js/trust/index.js: no `window`, no DOM, importable under
// node:test. All math is derived from the real frozen dataset (data/top100-map.json
// via DATA) — nothing is fabricated.
//
// ASSUMPTION (equal-weight HHI): the dataset has NO per-supplier volume/share
// field — every `supplier-input` link weight `l.v` is the constant 2. A raw
// Herfindahl index over a company's suppliers therefore degenerates to 1/k
// under the forced equal-weight assumption (all k-supplier firms tie). To stay
// honest *and* interpretable we report a COMPOSITE for companies:
//     score = round(100 · (wHHI · (1/k) + wShared · sharedFrac))   [clamped 0..100]
// where sharedFrac is the fraction of a company's suppliers that are shared
// single-points (fan-in > threshold across the whole graph). Weights (0.6/0.4)
// and the sharedFrac threshold (fan-in > 1) are opts params for tunability and
// testability. See 06-RESEARCH.md (Pitfall 1, Assumptions A1/A2, OQ2).

import { DATA, normalizeEntityLabel } from "../data/index.js";

// --- Per-session memo layer (PERF-01) ---------------------------------------
// Caching changes COST, never VALUE. `DATA` is frozen for the page lifetime
// (no in-session writer to DATA.profiles), so a Map keyed on a stable string
// signature of the value-affecting inputs returns byte-identical values on a
// hit. The only reset is the test seam __resetAnalyticsCache().
const _caches = new Map(); // bucketName -> Map<key, value>
const _stats = {
  fanIn: { builds: 0, hits: 0 },
  selfLabels: { builds: 0, hits: 0 },
  concentration: { builds: 0, hits: 0 },
  criticality: { builds: 0, hits: 0 },
  scenario: { builds: 0, hits: 0 },
};

function _bucket(name) {
  let b = _caches.get(name);
  if (!b) {
    b = new Map();
    _caches.set(name, b);
  }
  return b;
}

// Return cached value on hit (counting a hit); else compute, store, count a build.
function _memo(name, key, compute) {
  const b = _bucket(name);
  if (b.has(key)) {
    if (_stats[name]) _stats[name].hits++;
    return b.get(key); // CACHE HIT — identical value, no recompute
  }
  const v = compute();
  b.set(key, v);
  if (_stats[name]) _stats[name].builds++;
  return v;
}

// Stable identity tag for a profiles object: "D" for the frozen default, else a
// per-object id "X<n>". A WeakMap assigns each DISTINCT non-default profiles
// object its own tag so two unrelated test fixtures (or any future non-default
// caller) never collide on a `symbol|...|X|` key. Identity-based (not structural)
// because callers pass the SAME frozen object repeatedly — frozen data => safe.
let _profilesIdCounter = 0;
const _profilesIds = new WeakMap();
function _profilesTag(profiles) {
  if (profiles === DATA.profiles) return "D";
  if (!profiles || typeof profiles !== "object") return "N"; // null/non-object: single bucket
  let id = _profilesIds.get(profiles);
  if (id === undefined) {
    id = `X${++_profilesIdCounter}`;
    _profilesIds.set(profiles, id);
  }
  return id;
}

// Test-only seams (mirror js/data singleton-reset discipline). NOT used by product code.
export function __resetAnalyticsCache() {
  _caches.clear();
  for (const k of Object.keys(_stats)) {
    _stats[k].builds = 0;
    _stats[k].hits = 0;
  }
}

export function __memoStats() {
  // Return a shallow copy so callers cannot mutate the live counters.
  return {
    fanIn: { ..._stats.fanIn },
    selfLabels: { ..._stats.selfLabels },
    concentration: { ..._stats.concentration },
    criticality: { ..._stats.criticality },
    scenario: { ..._stats.scenario },
  };
}

// Extract the set of distinct, normalized supplier labels for a profile.
// Mirrors buildSharedSupplierOverlapIndex supplier extraction (js/data:30-33).
function supplierSet(profile) {
  return new Set(
    (profile?.nodes || [])
      .filter((n) => n.kind === "supplier")
      .map((n) => normalizeEntityLabel((n.l || "").split("\n")[0]))
      .filter(Boolean)
  );
}

// Build supplier fan-in once: Map<normalizedSupplierLabel, Set<symbol>>.
// Mirror of buildSharedSupplierOverlapIndex internals (js/data:27-38) so keys
// match the existing overlap index exactly.
function _buildSupplierFanInUncached(profiles = DATA.profiles) {
  const fanIn = new Map();
  Object.entries(profiles || {}).forEach(([symbol, profile]) => {
    for (const s of supplierSet(profile)) {
      if (!fanIn.has(s)) fanIn.set(s, new Set());
      fanIn.get(s).add(symbol);
    }
  });
  return fanIn; // Map<supplierLabel, Set<symbol>>
}

// Memoized shared dependency (built ONCE per session). Wrapping this fixes the
// eager default-arg rebuild at companyConcentration/supplierCriticality/runScenario
// — the default `fanIn = buildSupplierFanIn(profiles)` path is now O(1) after the
// first build. Key "default" for the frozen DATA.profiles; else a profiles tag.
export function buildSupplierFanIn(profiles = DATA.profiles) {
  const key = profiles === DATA.profiles ? "default" : _profilesTag(profiles);
  return _memo("fanIn", key, () => _buildSupplierFanInUncached(profiles));
}

// Bridge map for the multi-hop cascade (CASC-01): Map<symbol, label[]> of a
// company's OWN identity labels that ALSO appear as supplier-label keys in fanIn.
// A non-empty entry means "this company is itself an input/supplier another
// company depends on" — the company->company edge that enables hop-2+. Matching
// is EXACT (no alias map, no fabrication): the normalized company name, the
// normalized symbol, and any parenthetical acronym in the company name, each
// kept only if it is a real fanIn key. On the frozen data this yields exactly 6
// bridges (TSM, TCEHY, ASML, AZN, AMAT, LIN — see 11-RESEARCH.md). normalizeEntityLabel
// is the SAME normalization that builds fanIn keys, so labels match byte-for-byte.
function _buildSelfLabelsUncached(profiles, fanIn) {
  const selfLabels = new Map();
  for (const sym of Object.keys(profiles || {})) {
    const labels = new Set();
    const name = profiles[sym]?.company || "";
    const co = normalizeEntityLabel(name);
    if (fanIn.has(co)) labels.add(co);
    const s = normalizeEntityLabel(sym);
    if (fanIn.has(s)) labels.add(s);
    const m = name.match(/\(([^)]+)\)/); // e.g. "...(TSMC)"
    if (m) {
      const pn = normalizeEntityLabel(m[1]);
      if (fanIn.has(pn)) labels.add(pn);
    }
    selfLabels.set(sym, [...labels]);
  }
  return selfLabels;
}

// Memoized like buildSupplierFanIn (same per-session lifetime; DATA.profiles frozen).
export function buildSelfLabels(profiles = DATA.profiles, fanIn = buildSupplierFanIn(profiles)) {
  const key = profiles === DATA.profiles ? "default" : _profilesTag(profiles);
  return _memo("selfLabels", key, () => _buildSelfLabelsUncached(profiles, fanIn));
}

// Bounded [0,100] composite concentration for one company.
export function companyConcentration(symbol, opts = {}) {
  const {
    wHHI = 0.6,
    wShared = 0.4,
    sharedThreshold = 1, // a supplier is a shared single-point when fan-in > this
    profiles = DATA.profiles,
    fanIn = buildSupplierFanIn(profiles),
    excludeSuppliers, // NEW: Set<normalizedLabel> | string[] | undefined (additive)
  } = opts;

  const p = profiles?.[symbol];
  if (!p) return null;

  // Additive filter: undefined => no change (242 legacy tests stay byte-identical).
  const exclude =
    excludeSuppliers instanceof Set
      ? excludeSuppliers
      : Array.isArray(excludeSuppliers)
        ? new Set(excludeSuppliers)
        : null;

  // Cache key MUST include EVERY value-affecting input: symbol + weights +
  // threshold + a profiles identity tag + the SORTED exclude set. Omitting the
  // exclude set is the #1 correctness risk (runScenario reads excluded scores).
  const excludeSig = exclude ? [...exclude].sort().join(",") : "";
  const key = `${symbol}|${wHHI}|${wShared}|${sharedThreshold}|${_profilesTag(profiles)}|${excludeSig}`;

  return _memo("concentration", key, () => {
    const uniq = [...supplierSet(p)].filter((s) => !exclude || !exclude.has(s));
    const k = uniq.length;
    const hhi = k ? 1 / k : 1; // equal-weight Herfindahl (no per-supplier volume in data)
    const sharedCount = uniq.filter((s) => (fanIn.get(s)?.size || 0) > sharedThreshold).length;
    const sharedFrac = k ? sharedCount / k : 0;
    const score = Math.max(
      0,
      Math.min(100, Math.round(100 * (wHHI * hhi + wShared * sharedFrac)))
    );

    return { symbol, suppliers: k, hhi, sharedCount, sharedFrac, score, n: k }; // n = #relationships used
  });
}

// Sector-level concentration grouped by layers[node.y] (NOT profile.category;
// see RESEARCH A3). Reported as within-sector REUSE % (fraction of supplier
// slots that are redundant) plus EFFECTIVE supplier count (1/HHI), rather than
// the raw HHI·100 which is an uninterpretable 1–7 (RESEARCH Pitfall 2).
export function sectorConcentration(sector, opts = {}) {
  const {
    profiles = DATA.profiles,
    nodes = DATA.nodes,
    layers = DATA.layers,
  } = opts;

  // symbol -> sector via the global node layer index.
  const sectorBySymbol = {};
  for (const node of nodes || []) {
    if (node && node.symbol != null) sectorBySymbol[node.symbol] = layers?.[node.y];
  }

  const symbols = Object.keys(sectorBySymbol).filter(
    (s) => sectorBySymbol[s] === sector && profiles?.[s]
  );

  const counts = new Map(); // supplierLabel -> # companies in this sector using it
  let slots = 0; // total supplier slots across the sector's companies
  for (const symbol of symbols) {
    const uniq = supplierSet(profiles[symbol]);
    slots += uniq.size;
    for (const s of uniq) counts.set(s, (counts.get(s) || 0) + 1);
  }

  const distinctSuppliers = counts.size;
  // reuse% = redundant slots / total slots (slots - distinct) / slots.
  const reusePct = slots ? Math.round((100 * (slots - distinctSuppliers)) / slots) : 0;

  // Effective number of suppliers = 1 / HHI over the in-sector slot shares.
  let hhi = 0;
  if (slots) {
    for (const c of counts.values()) {
      const share = c / slots;
      hhi += share * share;
    }
  }
  const effectiveSuppliers = hhi ? 1 / hhi : 0;

  return {
    sector,
    companies: symbols.length,
    distinctSuppliers,
    slots,
    reusePct,
    effectiveSuppliers,
  };
}

// Supplier criticality = fan-in ranking (count of companies depending on each
// supplier), sorted descending. Keyed purely on real fan-in count — independent
// of the editorial d.bn flag (RESEARCH Anti-Pattern: bn is a curated company
// flag with non-contiguous ranks, NOT derivable from fan-in).
export function supplierCriticality(opts = {}) {
  const { profiles = DATA.profiles, fanIn = buildSupplierFanIn(profiles), limit } = opts;
  const key = `${_profilesTag(profiles)}|${typeof limit === "number" ? limit : "all"}`;
  return _memo("criticality", key, () => {
    const ranked = [...fanIn.entries()]
      .map(([supplier, set]) => ({ supplier, fanIn: set.size }))
      .sort((a, b) => b.fanIn - a.fanIn || a.supplier.localeCompare(b.supplier));
    return typeof limit === "number" ? ranked.slice(0, limit) : ranked;
  });
}

// Pure scenario engine (DEPTH-03 / CASC-01). DOM-free, unit-testable. Computes the
// BOUNDED, CYCLE-SAFE multi-hop downstream cascade of disabling one or more suppliers.
//   - MULTI-HOP MODEL: hop 1 = direct dependents of the disabled suppliers. If an
//     impacted company is ITSELF a supplier-label another company depends on (a
//     "bridge" — see buildSelfLabels), those dependents are impacted at hop 2, and
//     so on. Traversal is CYCLE-SAFE (a visited `hopOf` set guarantees termination
//     even on a cyclic graph) and BOUNDED (a `maxHops` counter). The two guarantees
//     are independent. maxHops DEFAULTS TO 1: a default/maxHops:1 call reproduces
//     the v1.0 single-hop result byte-identically. Multi-hop is a TRUE SUPERSET —
//     it traverses ONLY real edges, so for most disruptions it equals single-hop
//     (the real graph has just 6 bridge edges, max depth 3). No edges are fabricated.
//   - HHI (1/k) is the monotonic delta metric reported as concentrationBefore/
//     After — NOT the composite score, which is non-monotonic under removal
//     (removing a shared single-point lowers sharedFrac). See 07-RESEARCH Pitfall 1.
//   - "market cap exposed" is the combined market cap of impacted firms (ALL hops) —
//     an EXPOSURE figure, never a dollar-loss estimate.
//   - lostSuppliers semantics: for a hop-1 company it is the disabled labels that
//     reached it (v1.0); for a hop>=2 company it is the WAVE labels (the bridge
//     selfLabels of the prior-hop firm) that reached it — e.g. TSM lost "applied
//     materials", not TSMC directly (11-RESEARCH A2).
//
// disruption: { disableSuppliers?: string[], disableSupplier?: string, maxHops?: number }
//   labels are normalized (normalizeEntityLabel) to match buildSupplierFanIn keys.
//   maxHops default 1; disruption.maxHops wins over ctx.maxHops.
// ctx: { profiles = DATA.profiles, nodes = DATA.nodes, fanIn, selfLabels, maxHops }
export function runScenario(disruption = {}, ctx = {}) {
  const { profiles = DATA.profiles, nodes = DATA.nodes, fanIn } = ctx;
  const fan = fanIn || buildSupplierFanIn(profiles);
  const selfLabels = ctx.selfLabels || buildSelfLabels(profiles, fan);
  const maxHops = Math.max(1, Number(disruption.maxHops ?? ctx.maxHops ?? 1));

  // 1. Normalize the disabled-supplier set (accept both shapes).
  const disabled = new Set(
    [
      ...(disruption.disableSuppliers || []),
      ...(disruption.disableSupplier ? [disruption.disableSupplier] : []),
    ]
      .map((s) => normalizeEntityLabel(s))
      .filter(Boolean)
  );

  // Cache key is the NORMALIZED, SORTED disabled-label set (+ profiles tag + hop
  // depth), computed AFTER normalization so disableSuppliers:["tsmc"] and
  // disableSupplier:"tsmc" collide on the same entry. The |h${maxHops} suffix keeps
  // a maxHops:1 and a maxHops:3 call as DISTINCT entries. Never key the raw arg.
  const scenarioKey = `${[...disabled].sort().join(",")}|${_profilesTag(profiles)}|h${maxHops}`;
  return _memo("scenario", scenarioKey, () =>
    _runScenarioCompute(disabled, profiles, nodes, fan, selfLabels, maxHops)
  );
}

function _runScenarioCompute(disabled, profiles, nodes, fan, selfLabels, maxHops) {
  // 2. marketcap lookup by symbol (top-level nodes carry marketcap; profiles do not).
  const mcap = {};
  for (const n of nodes || []) if (n && n.symbol != null) mcap[n.symbol] = n.marketcap || 0;

  // 3. Bounded, cycle-safe BFS over hops. `hopOf` is the visited set AND the cycle
  //    guard: a symbol is recorded exactly once, at the hop it is first reached.
  //    `reachedBy` records the WAVE labels that first impacted each symbol (drives
  //    per-hop lostSuppliers). `byHop` is the per-level breakdown.
  const hopOf = new Map(); // symbol -> hop (visited set)
  const reachedBy = new Map(); // symbol -> Set<label> in the wave that reached it
  const byHop = {};
  let frontier = new Set(disabled); // current wave of supplier-labels
  let maxHopReached = 0;

  for (let hop = 1; hop <= maxHops; hop++) {
    const impactedThisHop = [];
    for (const label of frontier) {
      for (const sym of fan.get(label) || []) {
        if (hopOf.has(sym)) continue; // already visited — cycle/dup guard
        hopOf.set(sym, hop);
        reachedBy.set(sym, new Set([label]));
        impactedThisHop.push(sym);
      }
    }
    if (impactedThisHop.length === 0) break; // nothing new -> terminate
    byHop[hop] = impactedThisHop.slice();
    maxHopReached = hop;

    // Company->company bridge step: next wave = the impacted firms' OWN supplier
    // labels (selfLabels), MINUS any already-disabled label (re-disable guard).
    const next = new Set();
    for (const sym of impactedThisHop) {
      for (const l of selfLabels.get(sym) || []) {
        if (!disabled.has(l)) next.add(l);
      }
    }
    if (next.size === 0) break; // no bridge -> stop
    frontier = next;
  }

  // 4. Enrich every visited symbol exactly as v1.0, plus `hop`.
  const impactedCompanies = [];
  let totalMarketCapExposed = 0;
  for (const [symbol, hop] of hopOf) {
    const before = companyConcentration(symbol, { profiles, fanIn: fan });
    if (!before) continue;
    // hop-1 firms lose the original disabled labels; hop>=2 firms lose the wave
    // (bridge) labels that reached them (11-RESEARCH A2). exclude drives `after`.
    const lostSuppliers =
      hop === 1
        ? [...disabled].filter((d) => (fan.get(d) || new Set()).has(symbol))
        : [...(reachedBy.get(symbol) || [])].filter((d) =>
            (fan.get(d) || new Set()).has(symbol)
          );
    if (lostSuppliers.length === 0) continue; // safety: must lose >= 1 supplier
    const exclude = new Set(lostSuppliers);
    const after = companyConcentration(symbol, { profiles, fanIn: fan, excludeSuppliers: exclude });
    const share = before.suppliers ? lostSuppliers.length / before.suppliers : 0;
    const severity = share >= 0.5 ? "high" : share >= 0.25 ? "medium" : "low";
    impactedCompanies.push({
      symbol,
      company: profiles?.[symbol]?.company || symbol,
      marketcap: mcap[symbol] || 0,
      lostSuppliers,
      suppliersBefore: before.suppliers,
      suppliersAfter: after.suppliers,
      concentrationBefore: before.hhi, // HHI (1/k), monotonic
      concentrationAfter: after.hhi,
      severity,
      hop,
    });
    totalMarketCapExposed += mcap[symbol] || 0;
  }
  impactedCompanies.sort((a, b) => b.marketcap - a.marketcap || a.symbol.localeCompare(b.symbol));

  return {
    impactedCompanies,
    byHop,
    maxHopReached,
    totalMarketCapExposed,
    supplierCount: [...disabled].filter((d) => fan.has(d)).length,
    disabled: [...disabled],
  };
}

// Curated scenario presets. The LABELS are the only hand-curated input; all
// headline numbers (7 firms / $11.36T / HHI 0.20->0.25) are derived live by
// runScenario from the frozen data. Re-derive only if data/top100-map.json changes.
export const SCENARIO_PRESETS = {
  TAIWAN_SEMI: {
    id: "taiwan-semi",
    label: "Taiwan semiconductor disruption",
    disruption: {
      disableSuppliers: [
        "taiwan semiconductor manufacturing company (tsmc)",
        "tsmc foundry capacity",
        "tsmc (hbm4 and cowos collaboration)",
        "tsmc n2 process technology",
        "tsmc",
      ],
    },
  },
};
