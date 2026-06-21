// Phase 02-01: data-driven provenance core.
// provenanceFor/badgeHtml are PURE (no DOM, no window, no STATE) and unit-testable in Node.
// renderProvenanceBadge is the ONLY DOM touch and delegates markup to badgeHtml.
// Tags are DERIVED from the existing confidence/cf string vocabulary — never fabricated.

// Local copy of escapeHtml (mirrors js/data/index.js:9) so trust stays DOM-free / dependency-light.
function escapeHtml(input) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Derive provenance from an existing data record. NEVER fabricates a tag or a source.
 * @param {object} input  a node ({confidence, sourceId}), link ({cf, sf}), or
 *                        {marketcap:true} marker for dataset-level market-cap figures.
 * @param {object} ctx    { sourceIndex?: {[id]:{title,url,...}}, meta?: {source, top100_source_url} }
 * @returns {{tag:'observed'|'estimated'|'unknown', source?:{label:string,url:string}}}
 */
export function provenanceFor(input, ctx = {}) {
  // 1. Market-cap figures -> dataset-level observed, sourced from meta.
  if (input && input.marketcap === true) {
    const url = ctx.meta?.source || ctx.meta?.top100_source_url;
    return url
      ? { tag: "observed", source: { label: "companiesmarketcap.com", url } }
      : { tag: "unknown" };
  }

  // 2. Derive the tag from the confidence string prefix (node.confidence or link.cf).
  const raw = String(input?.confidence ?? input?.cf ?? "").toLowerCase();
  let tag = "unknown";
  if (raw.startsWith("high")) tag = "observed";
  else if (raw.startsWith("medium")) tag = "estimated";

  // 3. Resolve the source FK (node.sourceId or link.sf). Null-check guards the 33
  //    dangling FKs + empty sf -> degrade to tag-only (NO source key), never throw.
  const fk = input?.sourceId ?? input?.sf;
  const src = fk && ctx.sourceIndex ? ctx.sourceIndex[fk] : null;
  if (src && src.url) {
    return { tag, source: { label: src.title || src.id || "Source", url: src.url } };
  }
  return { tag };
}

// Confidence weighting (Phase 03-02). Base weights by provenance tag; an exponential
// half-life age decay (floored) is applied only when a real source year is resolvable.
// Defensible + bounded: observed > estimated > unknown; unknown is an explicit floor.
const SOURCE_WEIGHTS = { observed: 90, estimated: 65, unknown: 25 };
const HALF_LIFE_YEARS = 4;
const MIN_AGE_MULT = 0.5;

/**
 * Compute a bounded 0–100 confidence score for a figure. PURE — no DOM, no fabrication.
 * Reuses provenanceFor for the tag + resolved source (never re-parses confidence here).
 * unknown tag OR no resolved source -> the unknown floor (no fabricated high score).
 * Age decay applies ONLY when ctx.sourceYear is a finite number AND ctx.now is set;
 * absence of a year is not staleness (mult=1), and future years are clamped (ageYears>=0).
 * @param {object} input  node/link/marketcap record (see provenanceFor)
 * @param {object} ctx    { sourceIndex?, meta?, sourceYear?: number|null, now?: number }
 * @returns {number} integer in [0,100]
 */
export function confidenceScore(input, ctx = {}) {
  const prov = provenanceFor(input, ctx);
  if (prov.tag === "unknown" || !prov.source) {
    return SOURCE_WEIGHTS.unknown; // explicit floor — never decayed up or down
  }
  const base = SOURCE_WEIGHTS[prov.tag] ?? SOURCE_WEIGHTS.unknown;
  const year = ctx.sourceYear;
  let mult = 1; // no parseable year (or no reference "now") => no penalty AND no bonus
  if (typeof year === "number" && Number.isFinite(year) && ctx.now) {
    const ageYears = Math.max(0, ctx.now - year); // future-year guard: never negative age
    mult = Math.max(MIN_AGE_MULT, Math.pow(0.5, ageYears / HALF_LIFE_YEARS));
  }
  return Math.max(0, Math.min(100, Math.round(base * mult)));
}

/**
 * Build the accessible badge HTML for a provenance result. PURE — returns a string.
 * Reuses existing .confidence-* / .source-link CSS. Escapes title; only emits the
 * source <a> when the url is http(s) (RESEARCH V5 control), with rel="noopener noreferrer".
 * @param {{tag:string, source?:{label:string,url:string}}} prov
 * @returns {string}
 */
export function badgeHtml(prov) {
  const tag = prov?.tag;
  const label = tag === "observed" ? "Observed" : tag === "estimated" ? "Estimated" : "Unknown";
  const cls = tag === "observed" ? "confidence-high" : tag === "estimated" ? "confidence-medium" : "confidence-low";

  const url = prov?.source?.url;
  const hasLink = Boolean(prov?.source) && typeof url === "string" && url.startsWith("http");

  const title = tag === "unknown"
    ? "No source recorded for this figure"
    : `${label} — ${prov?.source ? escapeHtml(prov.source.label) : "no source link"}`;

  const link = hasLink
    ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="source-link">source &#8599;</a>`
    : "";

  return (
    `<span class="prov-badge confidence-badge ${cls}" role="img" ` +
    `aria-label="Provenance: ${label}${prov?.source ? ", source available" : ", no source"}" ` +
    `title="${title}">${label}</span>${link}`
  );
}

/**
 * Render a provenance badge into an element. The ONLY DOM touch in this module.
 * @param {{innerHTML:string}|null} el
 * @param {object} prov
 */
export function renderProvenanceBadge(el, prov) {
  if (!el) return;
  el.innerHTML = badgeHtml(prov);
}
