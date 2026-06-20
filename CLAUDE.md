<!-- GSD:project-start source:PROJECT.md -->
## Project

**Monarch Castle Technologies — Market Intelligence**

A public, investor-facing market-intelligence website: a single-page, D3-powered interactive
visualization of the top 100 companies by market cap and their global supply chains, layered with
country macro data, credit ratings, and trade flows (IMF DOTS, World Bank GDP, UN Comtrade). It is a
buildless static site deployed to GitHub Pages, with data auto-updated weekly via GitHub Actions. No
login — anyone can explore. This milestone elevates it to a world-class, best-in-the-world experience
for a sophisticated investor audience.

**Core Value:** Investors trust every number and instantly grasp supply-chain structure, concentration, and risk —
credibility first, then beauty, then unique depth. If everything else fails, the data must be
trustworthy and traceable to a source.

### Constraints

- **Tech stack**: Buildless static site (HTML/CSS/vanilla JS + D3). No framework/build tool — preserve GitHub-Pages direct serve.
- **Compatibility**: The `data/` JSON contract and the auto-update Actions pipeline must keep working.
- **Quality**: The existing 103-test suite must stay green throughout; new behavior gets new tests.
- **Data integrity**: Real, sourced data only — nothing fabricated; every major figure tagged observed/estimated with a reachable source.
- **Audience**: Sophisticated investors; public; no login.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
