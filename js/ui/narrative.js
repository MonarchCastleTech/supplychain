// Phase 05 (STORY-04): the pure, DOM-free investor narrative engine.
//
// buildNarrative(data) returns an ordered 4-step array
//   [market, concentration, risk, opportunity]
// where each step is { id, title, caption, apply(controls) }.
//
// CONTRACT (RESEARCH Pitfall 1 + Pitfall 5):
//   - EVERY caption number is computed at runtime from the passed `data` object.
//     No numeric literal that matches live data (55.x / 19 / 100 / 4.62) appears
//     as a caption constant — change the data, the captions change.
//   - This module imports NO DOM, NO d3, and NOT js/ui/index.js. It is pure so it
//     unit-tests in Node. Side effects are injected via the `controls` argument:
//       controls = { openGlobal(), openProfile(symbol), highlightBy(fn), resetHighlight() }
//
// Captions stay honest (STORY-04): the combined market cap is framed as observed
// from the dataset source (companiesmarketcap.com); bottleneck/layer figures are
// framed as derived aggregates ("flagged" / "of the top N"), introducing no new
// sourced claim — the rendering plan (03) MUST write them via textContent (T-05-01).

export function buildNarrative(data) {
  const safe = data || {};
  const nodes = Array.isArray(safe.nodes) ? safe.nodes : [];
  const meta = safe.meta || {};
  const layers = safe.layers || {};

  // Combined market cap (trillions), summed from real per-node marketcap.
  const totalCapT =
    nodes.filter((n) => n && n.marketcap).reduce((sum, n) => sum + n.marketcap, 0) / 1e12;

  // Bottleneck aggregate — count of nodes flagged with the existing `bn` signal.
  const bnCount = nodes.filter((n) => n && n.bn).length;
  const nodeCount = nodes.length;
  const totalCount = meta.count != null ? meta.count : nodeCount;

  // Concentration signal — most-populated layer by node count (layer index = n.y).
  const layerCounts = {};
  nodes.forEach((n) => {
    if (!n) return;
    const key = String(n.y);
    layerCounts[key] = (layerCounts[key] || 0) + 1;
  });
  const dominantEntry = Object.entries(layerCounts).sort((a, b) => b[1] - a[1])[0];
  const dominantLayerIdx = dominantEntry ? dominantEntry[0] : undefined;
  const dominantLayerN = dominantEntry ? dominantEntry[1] : 0;
  const dominantLayerName = layers[dominantLayerIdx] || "the leading sector";

  // Opportunity payoff — highest-marketcap node that is ALSO a flagged bottleneck
  // (makes step 4 the natural payoff of step 3). Fall back to the highest-marketcap
  // node overall when nothing is flagged. Never a hardcoded symbol (robust to refresh).
  const byCapDesc = nodes
    .filter((n) => n && n.marketcap)
    .slice()
    .sort((a, b) => b.marketcap - a.marketcap);
  const topByCap = byCapDesc.find((n) => n.bn) || byCapDesc[0];
  const topSymbol = topByCap ? topByCap.symbol : undefined;

  return [
    {
      id: "market",
      title: "The market",
      caption: `The top ${totalCount} public companies — about $${totalCapT.toFixed(
        1,
      )}T in combined market cap (source: companiesmarketcap.com).`,
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
      caption: `${bnCount} of the top ${nodeCount} are flagged structural bottlenecks — single points of failure. Highlighting them now.`,
      apply: (c) => c.highlightBy((d) => d.bn),
    },
    {
      id: "opportunity",
      title: "Opportunity",
      caption: topByCap
        ? `${topByCap.company} (${topSymbol}) is the rank-#${topByCap.rank} bottleneck by market cap ($${(
            topByCap.marketcap / 1e12
          ).toFixed(2)}T). Opening its supply-chain profile.`
        : "Opening a leading company profile.",
      apply: (c) => c.openProfile(topSymbol),
    },
  ];
}
