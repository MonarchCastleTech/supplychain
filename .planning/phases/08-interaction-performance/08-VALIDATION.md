---
phase: 8
slug: interaction-performance
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-21
---

# Phase 8 — Validation Strategy

> Memoization changes COST, never VALUE — real anchors must stay identical. The no-restart invariant is a
> source-level guard test. Latency improvement is a Node micro-benchmark recorded in docs/perf/.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node `node --test` (`.mjs`) |
| **Config file** | `package.json scripts.test` (register new files!) |
| **Command** | `npm test` |
| **Runtime** | ~5–15 s |

## Sampling Rate
- After each task commit: `npm test`
- Node micro-benchmark (cold vs warm cache) recorded before verification
- Before verification: full suite green (257 + memo/invariant tests)

## Per-Task Verification Map

| Task | Wave | Req | Test Type | Assertion | Status |
|------|------|-----|-----------|-----------|--------|
| _memo helper + reset/stats seams | 1 | PERF-01 | unit | __resetAnalyticsCache + __memoStats present; pure Map cache | ⬜ |
| memoize buildSupplierFanIn + companyConcentration + supplierCriticality + runScenario | 1 | PERF-01 | unit | VALUES identical to anchors (GILD=36, NVDA=12, fan-in top=4, Taiwan 7/$11.36T); key includes excludeSuppliers + sorted disabled set | ⬜ |
| cache-hit proof | 1 | PERF-01 | unit | second call is a cache hit (__memoStats hit count increments; build count stays 1); reset seam re-arms | ⬜ |
| no-restart invariant guard | 2 | PERF-01 | unit/source | applyFilters + style toggles (bLabels/bFlow/bBottlenecks/layer/country/keys l,f,b) + highlightChokepoints contain NONE of forceSimulation(/.alpha(/.restart(/updateGraph(/render(; bReset + render/updateGraph allow-listed | ⬜ |
| latency micro-bench | 2 | PERF-01 SC2 | bench | cold vs warm timing recorded in docs/perf/; warm measurably faster | ⬜ |
| suite green | 3 | PERF-01 | regression | `npm test` green (257 + new), values unchanged | ⬜ |

## Wave 0 Requirements
- [ ] Register tests/analytics-memo.test.mjs + tests/no-restart-invariant.test.mjs in package.json scripts.test

## Manual-Only Verifications
| Behavior | Req | Why Manual | Instructions |
|----------|-----|------------|--------------|
| Filtering/profile-open feels immediate | PERF-01 | Perceptual | http-server + interact; filters + repeated profile opens feel instant |

## Validation Sign-Off
- [ ] Memoized values identical to anchors; cache-hit proven; reset seam works
- [ ] No-restart invariant guard passes (simple changes can't restart sim)
- [ ] Latency improvement recorded (Node micro-bench)
- [ ] New test files registered; suite green
- [x] `nyquist_compliant: true`

**Approval:** pending
