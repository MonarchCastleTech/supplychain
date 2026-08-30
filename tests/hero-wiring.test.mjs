// Phase 05-01 (STORY-02/STORY-05): string-presence contract for the hero overlay,
// the narrative stepper controller, and the first-visit (heroSeen) main.js wiring.
//
// THESE ASSERTIONS ARE INTENDED RED IN WAVE 0. They are closed by:
//   - Plan 05-02: createHeroController + reduced-motion guard in js/ui/narrative.js
//   - Plan 05-03: #heroOverlay markup in index.html + heroSeen wiring in js/main.js
// This mirrors the repo's established Wave 0 pattern (STATE 04-01 / viz-motion.test.mjs).
// Do NOT treat the RED here as a defect — they pin the contract the later plans satisfy.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (...p) => readFileSync(join(__dirname, "..", ...p), "utf8");

const HTML = read("index.html");
const NARRATIVE = read("js", "ui", "narrative.js");
const MAIN = read("js", "main.js");

test("hero overlay declares accessible dialog semantics (Plan 03 markup)", () => {
  assert.match(
    HTML,
    /id="heroOverlay"[^>]*role="dialog"[^>]*aria-modal="true"/i,
    "#heroOverlay must declare role=dialog + aria-modal=true",
  );
});

test("hero overlay exposes all narration + control IDs (Plan 03 markup)", () => {
  for (const id of [
    "heroTitle",
    "heroCaption",
    "heroProgress",
    "heroNext",
    "heroPrev",
    "heroPause",
    "heroSkip",
    "bTour",
  ]) {
    assert.match(HTML, new RegExp(`id="${id}"`), `index.html must contain #${id}`);
  }
});

test("narrative module exposes the stepper controller factory (Plan 02)", () => {
  assert.match(NARRATIVE, /createHeroController/, "createHeroController must be defined/exported");
});

test("narrative controller honors reduced motion (Plan 02)", () => {
  assert.match(
    NARRATIVE,
    /matchMedia\(['"]\(prefers-reduced-motion:\s*reduce/,
    "controller must gate autoplay on prefers-reduced-motion: reduce",
  );
});

test("main.js keeps the map clear until the operator requests the tour", () => {
  assert.match(MAIN, /heroSeen/, "main.js must reference the heroSeen storage key");
  assert.match(MAIN, /safeReadFlag/, "main.js must read heroSeen via safeReadFlag");
  assert.match(MAIN, /safeWriteFlag/, "main.js must persist heroSeen via safeWriteFlag");
  assert.match(MAIN, /bTour/, "main.js must wire the #bTour replay control");
  assert.doesNotMatch(MAIN, /heroFirstVisit/, "the tour must not cover the map automatically");
  assert.doesNotMatch(MAIN, /maybeShowOnboarding\(\)/, "onboarding must not cover the map automatically");
});

// --- Plan 09-02 (PERF-03): hero overlay routed through the modal machinery ----
const UI = read("js", "ui", "index.js");

test("hero overlay is routed through the central modal machinery (Plan 09-02)", () => {
  // main.js must reach the shared open/close-hero helpers exported from ui/index.js
  // rather than only toggling o.hidden — so focus moves in, traps, and restores.
  assert.match(
    MAIN,
    /openHeroOverlay|closeHeroOverlay|registerHeroOverlay/,
    "main.js heroRender must route the hero overlay through ui/index.js modal helpers",
  );
});

test("ui/index.js exports hero-overlay modal helpers (Plan 09-02)", () => {
  assert.match(UI, /openHeroOverlay/, "ui/index.js must define openHeroOverlay");
  assert.match(UI, /closeHeroOverlay/, "ui/index.js must define closeHeroOverlay");
  assert.match(UI, /registerHeroOverlay/, "ui/index.js must define registerHeroOverlay");
  // exported for main.js consumption
  assert.match(
    UI,
    /export\s*\{[\s\S]*openHeroOverlay[\s\S]*\}/,
    "openHeroOverlay must be exported",
  );
});

test("the hero overlay participates in activeModal/trapFocus + the central ESC switch (Plan 09-02)", () => {
  // openHeroOverlay must set activeModal so the existing Tab branch traps within it
  // and focus the Skip control first (RESEARCH Pattern 3 / OQ2).
  assert.match(UI, /activeModal\s*=\s*heroOverlayEl/, "openHeroOverlay must set activeModal = hero overlay");
  assert.match(UI, /heroSkip/, "openHeroOverlay must move initial focus to #heroSkip");
  // the central keydown ESC switch must route the hero overlay to its skip callback
  assert.match(
    UI,
    /activeModal\s*===\s*heroOverlayEl/,
    "the central ESC switch must handle the hero overlay (single ESC binding)",
  );
});

test("main.js no longer hand-rolls a scoped ESC->skip keydown handler (Plan 09-02)", () => {
  // The old scoped handler matched on `o.hidden`; it must be folded into the central
  // switch so Escape is bound exactly once.
  assert.doesNotMatch(
    MAIN,
    /addEventListener\("keydown"[\s\S]*?o\.hidden[\s\S]*?heroController\.skip\(\)/,
    "main.js must NOT keep a separate scoped ESC->skip keydown handler",
  );
});

test("hero focus wiring never restarts the simulation (PERF-01 invariant)", () => {
  // The hero open/close path must not reach a simulation restart.
  const slice = UI.slice(UI.indexOf("function openHeroOverlay"), UI.indexOf("function openHeroOverlay") + 1200);
  assert.doesNotMatch(slice, /\.restart\s*\(/, "openHeroOverlay must not restart the simulation");
});
