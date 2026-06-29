<div align="center">
  <img src="docs/logo.png" alt="Supply Chain logo" width="140"/>
  <!-- CODEX: generate a clean product logo here — a minimal, corporate emblem suggesting a node-and-link supply-chain network fused with a market-cap/finance motif, in deep navy (#0b1f3a) and Monarch blue (#1f6feb) on transparent background; should read well at 140px and pair with the Monarch Castle house style. -->

  # Supply Chain
  ### Market-cap & supply-chain intelligence, auto-updated

  ![status](https://img.shields.io/badge/status-active-brightgreen)
  ![division](https://img.shields.io/badge/Financial%20Intelligence-0b1f3a)
  ![Monarch Castle](https://img.shields.io/badge/Monarch%20Castle-Holdings-1f6feb)
  ![license](https://img.shields.io/badge/license-see%20LICENSE-lightgrey)
</div>

> **Executive summary** — Supply Chain is an interactive market-intelligence map of the dependency networks behind the world's 100 largest public companies by market capitalization. Analysts, strategists, and risk teams use it to trace upstream inputs, service and channel partners, demand relationships, and credit-rating context — with every relationship carrying a source link and a confidence level. Market-cap rankings refresh automatically each week, so the picture stays current without manual upkeep.

## ✨ Highlights
- **Interactive D3 network graph** of the top-100 public companies, organised by economic layer (semiconductors → materials → industrials → finance → consumer demand) and country.
- **Per-company profile cards** mapping each anchor company's upstream inputs, services & risk, channels, and demand relationships.
- **Source-linked provenance on every edge** — relationships carry an originating source and a stated confidence band (e.g. *high (company disclosure)*, *medium (source-backed)*).
- **Credit-rating overlay** generated from a dedicated ratings dataset for additional risk context.
- **Auto-updating market caps** — a scheduled GitHub Actions workflow refreshes rankings weekly, validates the result, and commits only when the data actually changed.
- **Zero-backend, static delivery** — vanilla JavaScript + D3 served from GitHub Pages; nothing to provision, fast to load.
- **Test-guarded data integrity** — a Node test suite enforces provenance wiring, confidence scoring, country-code hygiene, and UI integrity before anything ships.

## 🖼️ Preview
<!-- CODEX: drop product screenshots into docs/ -->
![Supply Chain — main network view](docs/screenshot-1.png)
<!-- CODEX: full-page capture of the live D3 network graph at https://monarchcastletech.github.io/supplychain/ — show the top-100 companies laid out across economic layers with country colouring and the loaded map state. -->

![Supply Chain — company profile detail](docs/screenshot-2.png)
<!-- CODEX: capture of an open company profile card (e.g. NVIDIA / NVDA) showing upstream inputs, services & risk, channels, and demand nodes, with a visible source link and confidence label on a relationship. -->

## 🧭 What it does
Supply Chain turns a flat market-cap leaderboard into a navigable **dependency graph**. It answers questions a ranked list cannot: *who supplies the suppliers, where the concentration sits, and how confident we are in each link.*

**Global map.** The landing view is a force-directed D3 graph of 100 anchor companies positioned across ten economic layers and coloured by country of domicile. Node size and labels carry rank and market cap; edges encode layer-adjacency and structural relationships.

**Company profiles.** Selecting a company opens a focused sub-graph centred on that firm, decomposed into tiers — **Upstream Inputs**, **Services & Risk**, the **Company** anchor, **Channels**, and **Demand**. Each node states what it represents and why it matters to the anchor.

**Risk context.** A credit-ratings overlay adds rating context on top of the structural map, helping analysts weigh exposure alongside topology.

**Trust signals.** Confidence bands and source references are first-class — surfaced in the UI rather than buried in a data file — so an analyst can see *how much to trust* a given relationship at a glance.

## 🗂️ Data & provenance
Per Monarch Castle doctrine — **evidence before assertion**. Supply Chain is built so that no number stands alone:

- **Market-cap rankings** are sourced from `companiesmarketcap.com` (public CSV export). The dataset's `meta` block records the originating `source` URL and a `lastUpdated` / `generatedAt` timestamp on every regeneration.
- **Credit ratings** are generated from a dedicated ratings pipeline (Fitch public search endpoint) into `data/credit-ratings.*`, with the source endpoint recorded in the data.
- **Relationship-level provenance.** Each profile node and link carries a `sourceId` and a `confidence` label (for example `high (company disclosure)`, `medium (source-backed)`, `medium (structural)`), so collection method and trust level travel with the datum.
- **Auditability.** The auto-update workflow timestamps backups and commits, and validation tests run before any refreshed data is published — keeping the source → extraction → store → dashboard chain intact and reproducible.

> Lawful collection only: data is drawn from open, publicly accessible sources and official-style endpoints; provenance and confidence are preserved end-to-end as the product's core value.

## 🛠️ Tech stack
- **Frontend / visualisation:** Vanilla JavaScript + **D3.js 7** (CDN-loaded), modular `js/` packages — `viz`, `ui`, `data`, `trust`, `analytics`.
- **Styling:** Hand-authored CSS (`styles/base`, `layout`, `components`, `theme`).
- **Data tooling:** **Node.js 20+** ES-module scripts (`scripts/`) for generation, market-cap updates, ratings fetch, macro data, and verification.
- **Testing:** Node's built-in test runner (`node --test`) plus **Playwright** for mobile/keyboard and UI integrity checks.
- **Automation:** **GitHub Actions** — `auto-update-data.yml` (weekly market-cap refresh) and `deploy-pages.yml` (static build & deploy).
- **Hosting:** **GitHub Pages** (static `_site` artifact).

## 🚀 Getting started

**Live site:** https://monarchcastletech.github.io/supplychain/

**Run locally**
```bash
npm install
npx http-server . -p 8080
# open http://localhost:8080
```

**Regenerate / refresh data**
```bash
node scripts/generate-top100-data.mjs     # build the top-100 company map
node scripts/update-marketcap-data.mjs     # refresh market caps and merge profiles
node scripts/fetch-fitch-ratings.mjs       # build the credit-ratings dataset
node scripts/verify-data.mjs               # run data verification checks
```

**Test**
```bash
npm test                                    # full data + UI integrity suite
node --test tests/profile-link-metadata.test.mjs   # focused run
```

**Deploy.** Pushing to `master` triggers `deploy-pages.yml`, which assembles the static site (`index.html`, `data/`, `js/`, `styles/`, `assets/`) and publishes it to GitHub Pages. Market-cap data refreshes automatically every Monday via `auto-update-data.yml`, committing only when values change.

## 🧱 Part of Monarch Castle
> A product of **Financial Intelligence** · **Monarch Castle Technologies** — an operating company of **[Monarch Castle Holdings](https://github.com/MonarchCastleHoldings)**.
> Sister companies: [Monarch Castle Technologies](https://github.com/monarchcastletech) · [Strategic Data Company of Ankara](https://github.com/SDCofA)

## 📜 License
See `LICENSE`. © 2026 Monarch Castle Holdings · Ankara, Türkiye.

<div align="center"><sub>🏰 Monarch Castle Holdings — turning open-source noise into lawful, verified, decision-grade intelligence.</sub></div>
