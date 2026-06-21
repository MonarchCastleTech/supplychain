# Launch-Gate Performance Capture — 2026-06-21 (PERF-05)

> **Launch gate (PERF-05), Phase 10 plan 10-02.** Captured against the served site at the
> final launch gate. Unlike the Phase-1 baseline (which aborted `NO_FCP` because the committed
> data snapshot did not paint), **Phase 3 now serves real data that paints**, so this run
> produced a full scored Lighthouse report. Both a Lighthouse run **and** the established
> Playwright Navigation/Paint capture were taken; both are recorded below.
>
> **Gate policy:** the launch gate does **not** block on the numeric Lighthouse score — it
> requires only that a run was attempted and the result recorded. Recorded either way.

- **Date captured:** 2026-06-21
- **State of repo:** modularized buildless static site (`index.html` shell + `styles/*.css` + `js/*` ES modules + frozen `data/` snapshot), with the Phase-10 SEO/OG/Twitter/JSON-LD `<head>` block and `assets/og-card.png`.
- **Served via:** `npx http-server . -p 8080 -c-1`
- **Target URL:** `http://localhost:8080/index.html`
- **HTTP status:** 200

---

## Method Summary

| Method | Tool | Outcome |
|--------|------|---------|
| Primary | `npx lighthouse@13.4.0 --preset=desktop` (headless Chrome) | **Scored** — full report produced (no `NO_FCP` this time; the page paints post-Phase-3) |
| Complementary / fallback | Playwright (`chromium`, bundled, headless) reading W3C Navigation + Paint Timing (`docs/perf/_perf-capture.cjs`) | **Captured** — FCP now non-null |

The improvement vs. the Phase-1 baseline is the headline finding: the page now produces a
contentful paint, so Lighthouse completed a scored run instead of aborting `NO_FCP`.

---

## Lighthouse Result (scored — desktop preset)

Command:

```
npx lighthouse@13.4.0 http://localhost:8080/index.html \
  --preset=desktop \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --chrome-flags="--headless=new --no-sandbox"
```

Lighthouse version: **13.4.0**. Raw report retained at
`docs/perf/launch-lighthouse-2026-06-21.report.json`.

### Category scores

| Category | Score |
|----------|-------|
| Performance | **58 / 100** |
| Accessibility | **93 / 100** |
| Best Practices | **100 / 100** |
| SEO | **100 / 100** |

### Key performance audits

| Metric | Value |
|--------|-------|
| First Contentful Paint (FCP) | 4.3 s |
| Largest Contentful Paint (LCP) | 4.8 s |
| Speed Index (SI) | 4.3 s |
| Total Blocking Time (TBT) | 10 ms |
| Cumulative Layout Shift (CLS) | 0 |
| Time to Interactive (TTI) | 4.8 s |

**Reading the numbers honestly:**
- **SEO 100 / Best-Practices 100** directly validate the Phase-10 work: the SEO/OG/Twitter/JSON-LD
  `<head>` block and the canonical/meta tags are well-formed and complete.
- **Accessibility 93** reflects the Phase-4/5/9 design-token + keyboard + mobile a11y work.
- **Performance 58** is dominated by FCP/LCP/SI in the ~4–5 s range. This is a **cold local
  `http-server` measurement** of a D3 force-simulation SPA that loads the D3 CDN bundle plus the
  full top-100 dataset before its first contentful paint — TBT is only 10 ms and CLS is 0, so the
  page is not janky or shifting; the score is paint-latency-bound on a cold loopback fetch, not a
  blocking/interactivity problem. Per gate policy this number does **not** block launch; it is
  recorded honestly as the local figure. On the live GitHub-Pages deploy (CDN-cached D3, HTTP/2,
  cacheable externalized CSS/JS) FCP/LCP are expected to improve.

---

## Playwright Navigation/Paint Capture (complementary, `_perf-capture.cjs`)

Measured via `performance.getEntriesByType("navigation")` + `("paint")`, headless Chromium,
viewport 1350×940, 5 s settle after `load`:

| Metric | Value | Notes |
|--------|-------|-------|
| TTFB (responseStart) | 316 ms | local http-server |
| Response end | 317 ms | document download complete |
| DOM Interactive | 754 ms | |
| DOMContentLoaded | 830 ms | |
| Load event end | 1093 ms | |
| First Paint (FP) | 772 ms | |
| **First Contentful Paint (FCP)** | **1200 ms** | **NON-NULL — the page now paints (Phase-1 baseline was `null`/`NO_FCP`)** |
| Document transfer (`index.html`) | 24,962 B (~24 KB) | shell |
| Total transfer | 2,507,649 B (~2.4 MB) | 28 resources (D3 + dataset + CSS/JS + assets) |
| Resource count | 28 | |
| SVG nodes rendered | 1 | the D3 visualization SVG is present |
| Body text length | 7,488 chars | real content rendered |
| Page title | Monarch Castle Technologies \| Market Intelligence | correct |
| Page errors | none | clean console |
| Failed/blocked requests | none | all resources 200 |

---

## Paint Caveat (resolved at this gate)

The Phase-1 baseline (`docs/perf/baseline-2026-06-20.md`) recorded `NO_FCP` because the committed
`data/top100-map.js` snapshot did not contain the `nodes`/`links`/`profiles` arrays the bootstrap
guard requires, so the page threw and never painted. **As of this launch gate the page paints**
(FCP 1.2 s via Playwright, a scored Lighthouse run with FCP 4.3 s desktop), confirming the
Phase-3 data work fixed the render condition. The earlier caveat is therefore now historical;
this gate records a real, scored result.

---

## Gate Verdict

- `npm test` → **301 tests, 301 pass, 0 fail** (full suite green at the gate).
- Lighthouse run **attempted and scored** — Performance 58, Accessibility 93, Best-Practices 100, SEO 100.
- Playwright paint capture confirms a real contentful render (FCP 1.2 s, SVG present, no console errors).
- Result recorded; launch is **not** blocked on the numeric performance score (gate policy).

**PERF-05 measurement half: satisfied.**
