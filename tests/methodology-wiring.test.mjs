// Phase 03-03: assert the accessible Methodology modal (TRUST-04) is present in
// index.html with dialog a11y semantics + honest real-fact copy, that a reachable
// #bMethodology entry point exists, and that js/ui wires open/close + ESC handling.
// String-presence style (repo convention — no DOM in the Node gate).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML = readFileSync(join(__dirname, "..", "index.html"), "utf8");
const UI = readFileSync(join(__dirname, "..", "js", "ui", "index.js"), "utf8");

test("index.html declares an accessible #methodologyModal dialog", () => {
  assert.match(
    HTML,
    /<div id="methodologyModal"[^>]*role="dialog"[^>]*aria-modal="true"/i,
    "methodologyModal must declare role=dialog + aria-modal",
  );
  assert.match(HTML, /aria-labelledby="methodologyTitle"/i, "modal must be labelled by its title");
  assert.match(HTML, /id="methodologyTitle"/i, "modal title element required");
});

test("index.html has a reachable #bMethodology entry button near the controls", () => {
  assert.match(
    HTML,
    /<button id="bMethodology"[^>]*aria-label=/i,
    "bMethodology entry button with an accessible label required",
  );
});

test("the modal has a labelled close control", () => {
  assert.match(
    HTML,
    /id="methodologyClose"[^>]*aria-label="Close methodology dialog"/i,
    "methodology close button with aria-label required",
  );
});

test("methodology copy discloses current evidence limits", () => {
  assert.match(HTML, /overview layout has no company-to-company edges/i);
  assert.match(HTML, /source coverage differs by company/i);
  assert.match(HTML, /research-pending profile/i);
  assert.doesNotMatch(HTML, /all 100 companies have source-verified/i);
});

test("methodology copy explains weighting + decay + observed/estimated/unknown semantics", () => {
  assert.match(HTML, /observed/i, "explains Observed");
  assert.match(HTML, /estimated/i, "explains Estimated");
  assert.match(HTML, /unknown/i, "explains Unknown");
  assert.match(HTML, /weight/i, "explains confidence weighting");
  assert.match(HTML, /decay/i, "explains age decay");
});

test("js/ui defines openMethodology + closeMethodology and wires the entry button", () => {
  assert.match(UI, /function openMethodology\s*\(/, "openMethodology must be defined");
  assert.match(UI, /function closeMethodology\s*\(/, "closeMethodology must be defined");
  assert.match(
    UI,
    /getElementById\(["']bMethodology["']\)\?\.addEventListener\(["']click["'],\s*openMethodology\)/,
    "bMethodology click must be wired to openMethodology",
  );
});

test("ESC closes the methodology modal via the global keydown handler", () => {
  assert.match(
    UI,
    /activeModal === methodologyModalEl\)\s*closeMethodology\(\)/,
    "ESC branch must handle methodologyModalEl",
  );
});
