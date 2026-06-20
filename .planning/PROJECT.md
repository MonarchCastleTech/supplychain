# Monarch Castle Technologies — Market Intelligence

## What This Is

A public, investor-facing market-intelligence website: a single-page, D3-powered interactive
visualization of the top 100 companies by market cap and their global supply chains, layered with
country macro data, credit ratings, and trade flows (IMF DOTS, World Bank GDP, UN Comtrade). It is a
buildless static site deployed to GitHub Pages, with data auto-updated weekly via GitHub Actions. No
login — anyone can explore. This milestone elevates it to a world-class, best-in-the-world experience
for a sophisticated investor audience.

## Core Value

Investors trust every number and instantly grasp supply-chain structure, concentration, and risk —
credibility first, then beauty, then unique depth. If everything else fails, the data must be
trustworthy and traceable to a source.

## Requirements

### Validated

<!-- Inferred from existing code — already shipped and relied upon. -->

- ✓ Interactive D3 force-directed visualization of top-100 companies + supply-chain links — existing
- ✓ Company profile drill-down with relationship confidence and source references — existing
- ✓ Filters, search (with history), comparison mode, export, bookmarks/save views — existing
- ✓ Keyboard shortcuts, help/onboarding modals, accessibility (ARIA) baseline — existing
- ✓ Country macro data, credit ratings, and trade-flow layers — existing
- ✓ Weekly automated data refresh via GitHub Actions; static GitHub-Pages deploy — existing
- ✓ Node test suite (103 tests passing) covering UI integrity, data schema, ingestion — existing

### Active

<!-- This milestone: elevate to "best in the world" for investors. From the approved spec. -->

- [ ] Foundation: safe modularization of monolithic index.html (CSS/JS modules), tests stay green, perf baseline
- [ ] Trust layer: provenance badge (observed/estimated) on every figure, inline source links, confidence scoring, methodology view, freshness guarantee
- [ ] Visual wow + storytelling: refined design system, first-30s guided hero moment, smooth D3 motion, investor narrative flow
- [ ] Depth of intelligence: risk/bottleneck analytics, concentration scoring, scenario stress-tests, investor signals
- [ ] Performance, accessibility & launch: memoized filters (no full-sim restart), mobile excellence, full keyboard journey, SEO/social cards, verification gate

### Out of Scope

- Login / user accounts / collaborative saved workspaces — audience is public investors; no auth needed
- Backend / API migration — keep buildless static GitHub-Pages deploy
- Real-time streaming macro updates — weekly auto-update is sufficient
- Any fabricated or unsourced data — credibility is the core value; every figure must trace to a source
- Heavy framework / build tool (React, Vite, etc.) — preserve the simple static deploy

## Context

- Codebase is a large monolithic `index.html` with inline CSS/JS, plus `data/` JSON, `scripts/`
  (data fetchers in `.mjs`), `tests/` (Node `.mjs`), and GitHub Actions workflows.
- Approved design spec is the source of truth:
  `docs/superpowers/specs/2026-06-20-monarch-best-in-world-design.md`.
- Existing internal planning docs (`plan.md`, `FUTURE_ENHANCEMENTS_PLAN.md`,
  `WEBSITE_IMPROVEMENTS_PLAN.md`) already concluded data-trust must precede visual polish.
- Data sources: IMF DOTS, World Bank GDP/trade totals, UN Comtrade, credit ratings, top-100 market cap.

## Constraints

- **Tech stack**: Buildless static site (HTML/CSS/vanilla JS + D3). No framework/build tool — preserve GitHub-Pages direct serve.
- **Compatibility**: The `data/` JSON contract and the auto-update Actions pipeline must keep working.
- **Quality**: The existing 103-test suite must stay green throughout; new behavior gets new tests.
- **Data integrity**: Real, sourced data only — nothing fabricated; every major figure tagged observed/estimated with a reachable source.
- **Audience**: Sophisticated investors; public; no login.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hybrid: thin modularization then phased value | Maintainable foundation + fast visible wins without risking the working static deploy/tests | — Pending |
| Trust before visual wow | Investors bounce on unsourced numbers; matches existing risk register | — Pending |
| Real-data-only (no fabrication) | Credibility is the core value | — Pending |
| Keep buildless static GitHub-Pages deploy | Preserve simple, working deploy + auto-update pipeline | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-20 after initialization*
