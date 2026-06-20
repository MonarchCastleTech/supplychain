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
