# Data provenance and verification status

This document describes what the public supply-chain map establishes and what it does not. Earlier versions of this file asserted that 90% of sampled profiles were verified. That aggregate assertion lacked a reproducible, claim-level evidence ledger and is withdrawn. The old text remains available in Git history for audit.

## Published data layers

1. **Company ranking and market capitalisation:** the dated public CSV from companiesmarketcap.com is parsed by `scripts/generate-top100-data.mjs` into the browser-served `data/top100-map.json` and `data/top100-map.js`. The timestamp in `meta.generatedAt` is the actual successful rebuild. These are third-party snapshot values, not live market prices.
2. **Global overview:** 100 company nodes are laid out by sector layer and country. The overview publishes **zero company-to-company edges**, because proximity in a force layout or neighbouring sectors does not prove a commercial relationship.
3. **Company profiles:** reviewed profiles contain labelled inputs, services, channels, demand context, links and source references. Source-backed sector context is an analyst inference unless a cited filing or announcement explicitly names the counterparties. An unresearched entrant receives an empty profile headed “Relationship research pending.”
4. **Ratings:** a separate ratings dataset provides contextual information; it does not establish supply-chain links.

## Claim-level verification required for a direct relationship

Before marking a supplier, customer, distributor, ownership or joint-venture edge as directly verified, retain a ledger row with:

| Field | Required evidence |
|---|---|
| Anchor and counterparty | Legal entity names, not only sector labels |
| Relationship type | Supplier, customer, channel, ownership, service or joint venture |
| Primary source | Direct document URL and exact section, page or quotation pointer |
| Source date and checked date | Dates displayed with the claim |
| Scope | Geographic, product and temporal limits of the disclosure |
| Verdict | Directly disclosed, source-backed context, inferred or unsupported |

A source URL by itself is not proof that the document supports the precise edge. Generic industry templates, layout adjacency and market-cap rank must never be promoted to direct supplier relationships. Unsupported links remain absent or labelled as unverified context; they are not counted as observed relationships.

## Current limitation

The repository does not yet contain a complete claim-level ledger for every profile link. Do not describe the profile set as independently verified or report an aggregate accuracy percentage. The visible source and confidence labels support inspection, not a blanket verification claim. Rebuilds may introduce companies with no researched profile; those companies remain visible with zero relationship edges until documented.
