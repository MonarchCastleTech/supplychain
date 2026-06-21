# Phase 10: SEO, Social Cards & Launch Gate - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous) — the FINAL phase

<domain>
## Phase Boundary

Make the site discoverable, shareable, and verifiably launch-ready. Deliverables: (1) valid SEO + social
metadata — meta description, canonical, Open Graph (og:title/description/image/url/type/site_name), Twitter
card tags, and JSON-LD structured data — plus a real social share image (og:image, ~1200×630); (2) a final
LAUNCH GATE that confirms: all tests green, a Lighthouse pass (or documented result), and that the buildless
static GitHub-Pages deploy + the weekly auto-update Actions pipeline still work. This is the last phase before
the milestone lifecycle. Out of scope: new product features, data changes.
</domain>

<decisions>
## Implementation Decisions

### SEO + social metadata (PERF-04) — honest + valid
- Add to index.html <head> (preserve all existing IDs + the inline bootstrap so index-ui-integrity stays green):
  - `<meta name="description">` — accurate, honest description of the market-intelligence tool (no hype/false claims).
  - `<link rel="canonical">` to the GitHub-Pages/CNAME URL.
  - Open Graph: og:title, og:description, og:type=website, og:url, og:image (absolute URL), og:site_name.
  - Twitter: twitter:card=summary_large_image, twitter:title/description/image.
  - JSON-LD (`application/ld+json`) describing the site/organization (Monarch Castle Technologies) honestly.
- Provide a real og:image social card (~1200×630) committed to assets/ (can derive from the existing rendered
  screenshot or a purpose-made card). The image must exist at the referenced path.

### Launch gate (PERF-05)
- A final verification step: `npm test` fully green; a Lighthouse run against the served site (record results in
  docs/perf/, honoring the documented local-paint caveat — capture what's measurable); confirm the
  deploy-pages.yml copies everything needed (index.html, styles/, js/, data/, assets/, the new og:image) and the
  auto-update-data.yml weekly pipeline is intact (it was quarantined-safe in Phase 3). Produce a LAUNCH checklist
  doc summarizing credibility (trust layer), quality (tests), and performance.

### Tests
- New `.mjs` tests (REGISTERED in package.json scripts.test): assert the meta description + canonical + required
  og:* + twitter:* tags + JSON-LD are present and well-formed in index.html, the og:image path exists, and the
  deploy workflow ships the og:image. Keep the full suite (294) green.
</decisions>

<code_context>
## Existing Code Insights
- index.html currently has ZERO og/twitter/description/canonical/JSON-LD tags — all net-new in <head>.
- assets/ holds monarch-logo.png; a social card image goes here (or docs). Phase-1 deploy-pages.yml copies index.html/favicon/logo/data/assets/CNAME + (Phase-1 fix) styles/ + js/.
- CNAME / GitHub-Pages URL is the canonical base — confirm the value from the repo (CNAME file / deploy config).
- Gate: `npm test` (294) runs only files in package.json scripts.test — register new ones. Buildless; data frozen.
</code_context>

<specifics>
## Specific Ideas
- og:image: a clean 1200×630 social card (title "Monarch Castle Technologies — Market Intelligence" + the supply-chain graph motif). Reuse docs/perf/site-screenshot.png as a base if a bespoke card is heavy.
- LAUNCH.md checklist: trust ✓ provenance/confidence/methodology/freshness; depth ✓ concentration/criticality/scenario; UX ✓ hero/design/motion/mobile/keyboard; perf ✓ memoization; SEO ✓ tags/cards; gate ✓ tests/deploy/pipeline.
</specifics>

<deferred>
## Deferred Ideas
- Analytics/telemetry integration → future.
- A multi-page sitemap → not needed for a single-page app (a minimal sitemap.xml/robots.txt is fine).
</deferred>
