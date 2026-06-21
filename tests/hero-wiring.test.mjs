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

test("main.js gates first-visit hero on heroSeen via safe storage flags (Plan 03)", () => {
  assert.match(MAIN, /heroSeen/, "main.js must reference the heroSeen storage key");
  assert.match(MAIN, /safeReadFlag/, "main.js must read heroSeen via safeReadFlag");
  assert.match(MAIN, /safeWriteFlag/, "main.js must persist heroSeen via safeWriteFlag");
  assert.match(MAIN, /bTour/, "main.js must wire the #bTour replay control");
});
