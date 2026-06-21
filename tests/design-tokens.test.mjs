// Phase 04-01 (STORY-01): assert the design-token single source of truth lives in
// styles/base.css :root, that the 7 legacy vars are retained as aliases, that the
// semantic trust tokens match the .confidence-* hues, and that the trust markup/badge
// hooks are unchanged. Migration-evidence assertions are intentionally RED in Wave 0
// (satisfied by Plan 02 when literals migrate to var(--...) tokens).
// String-presence style (repo convention — no DOM, no browser in the Node gate).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (...p) => readFileSync(join(__dirname, "..", ...p), "utf8");

const BASE = read("styles", "base.css");
const COMPONENTS = read("styles", "components.css");
const LAYOUT = read("styles", "layout.css");
const THEME = read("styles", "theme.css");
const HTML = read("index.html");
const TRUST = read("js", "trust", "index.js");

test("base.css :root defines one token per family (color/type/space/radii/elevation/motion)", () => {
  assert.match(BASE, /--color-bg\b/, "color surface token --color-bg required");
  assert.match(BASE, /--fs-base\b/, "type-scale token --fs-base required");
  assert.match(BASE, /--space-4\b/, "spacing token --space-4 required");
  assert.match(BASE, /--radius-md\b/, "radii token --radius-md required");
  assert.match(BASE, /--shadow-md\b/, "elevation token --shadow-md required");
  assert.match(BASE, /--dur-base\b/, "motion duration token --dur-base required");
  assert.match(BASE, /--ease-standard\b/, "motion easing token --ease-standard required");
});

test("base.css :root defines the semantic trust tokens", () => {
  assert.match(BASE, /--color-observed/, "--color-observed (green) required");
  assert.match(BASE, /--color-estimated/, "--color-estimated (amber) required");
  assert.match(BASE, /--color-unknown/, "--color-unknown (neutral) required");
});

test("the 7 legacy vars are retained as aliases so existing rules keep resolving", () => {
  assert.match(BASE, /--bg\b/, "legacy --bg alias required");
  assert.match(BASE, /--text\b/, "legacy --text alias required");
  assert.match(BASE, /--dim\b/, "legacy --dim alias required");
  assert.match(BASE, /--acc\b/, "legacy --acc alias required");
  assert.match(BASE, /--blue\b/, "legacy --blue alias required");
  assert.match(BASE, /--green\b/, "legacy --green alias required");
  assert.match(BASE, /--purple\b/, "legacy --purple alias required");
});

test("the trust color contract (.confidence-*) keeps its green/amber/neutral hues", () => {
  assert.match(COMPONENTS, /\.confidence-high\b/, ".confidence-high rule must remain");
  assert.match(COMPONENTS, /\.confidence-medium\b/, ".confidence-medium rule must remain");
  assert.match(COMPONENTS, /\.confidence-low\b/, ".confidence-low rule must remain");
  assert.match(COMPONENTS, /rgba\(76,175,80/, "observed green hue must remain");
  assert.match(COMPONENTS, /rgba\(255,193,7/, "estimated amber hue must remain");
  assert.match(COMPONENTS, /rgba\(158,158,158/, "unknown neutral hue must remain");
});

test("trust hooks are unchanged in markup and badge HTML", () => {
  assert.match(HTML, /id="methodologyModal"/, "#methodologyModal hook must remain");
  assert.match(HTML, /id="provenanceDrawer"/, "#provenanceDrawer hook must remain");
  assert.match(HTML, /id="companyCard"/, "#companyCard hook must remain");
  assert.match(TRUST, /prov-badge confidence-badge/, "badge HTML class string must remain");
});

test("migration evidence: layout/components/theme each consume tokens (var(--) >= 10) [Wave 0 RED until Plan 02]", () => {
  const count = (css) => (css.match(/var\(--/g) || []).length;
  assert.ok(count(LAYOUT) >= 10, `layout.css should consume >=10 tokens (got ${count(LAYOUT)})`);
  assert.ok(count(COMPONENTS) >= 10, `components.css should consume >=10 tokens (got ${count(COMPONENTS)})`);
  assert.ok(count(THEME) >= 10, `theme.css should consume >=10 tokens (got ${count(THEME)})`);
});
