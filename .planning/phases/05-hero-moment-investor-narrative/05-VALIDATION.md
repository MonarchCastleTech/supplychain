---
phase: 5
slug: hero-moment-investor-narrative
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-21
---

# Phase 5 — Validation Strategy

> The NARRATIVE step list is PURE/exportable (DOM-free) so it unit-tests in Node. The hero controller takes
> all side-effects injected. Captions cite REAL runtime numbers (never hardcoded literals). Suite stays green.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node `node --test` (`.mjs`) |
| **Config file** | `package.json scripts.test` (register new files!) |
| **Command** | `npm test` |
| **Runtime** | ~5–15 s |

## Sampling Rate
- After each task commit: `npm test`
- Playwright hero smoke (autoplay, skip, replay, reduced-motion) before verification
- Before verification: full suite green (191 + narrative/hero tests)

## Per-Task Verification Map

| Task | Wave | Req | Test Type | Assertion | Status |
|------|------|-----|-----------|-----------|--------|
| buildNarrative(data) pure step list | 1 | STORY-04 | unit | 4 ordered steps market→concentration→risk→opportunity; each has id/title/caption + apply(controls); apply calls real control (openGlobal/highlightBy/openProfile) | ⬜ |
| captions cite real data | 1 | STORY-04 | unit | caption numbers derived from data (count=100, cap, 19 bottlenecks, top symbol) — NOT hardcoded literals; recompute from fixture | ⬜ |
| createHeroController factory | 2 | STORY-02 | unit | injected storage/timers/controls; first-visit autoplay; skip()/stop() writes heroSeen + resetHighlight; pause/next/prev; ESC→skip | ⬜ |
| reduced-motion | 2 | STORY-02 | unit | reducedMotion=true → no auto-advance timer (manual Next only) | ⬜ |
| markup + wiring | 2 | STORY-02/04 | string | narration overlay + #bTour replay added (NEW IDs); existing 89 IDs + inline bootstrap preserved (index-ui-integrity green) | ⬜ |
| suite + smoke | 3 | STORY-02/04/05 | regression | `npm test` green; Playwright: hero autoplays first visit, skippable, replayable | ⬜ |

## Wave 0 Requirements
- [ ] Register tests/narrative.test.mjs + tests/hero-wiring.test.mjs in package.json scripts.test

## Manual-Only Verifications
| Behavior | Req | Why Manual | Instructions |
|----------|-----|------------|--------------|
| Hero feels like a 30s "aha"; narration legible; smooth | STORY-02 | Subjective/visual | http-server + Playwright; first load autoplays; Skip/Replay work; reduced-motion shows captions w/o auto-pan |

## Validation Sign-Off
- [ ] NARRATIVE pure + 4 ordered steps tested
- [ ] Captions cite real (non-hardcoded) data
- [ ] Hero controller: autoplay/skip/replay/reduced-motion tested
- [ ] New test files registered; existing IDs preserved
- [x] `nyquist_compliant: true`

**Approval:** pending
