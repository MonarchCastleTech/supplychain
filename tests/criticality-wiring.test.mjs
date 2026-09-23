import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { readFileSync } from "node:fs";
import {
  supplierCriticality,
  buildSupplierFanIn,
} from "../js/analytics/index.js";
import { provenanceFor, badgeHtml } from "../js/trust/index.js";

// Rich dataset (test suite reads the JSON; the browser loads the thin .js).
// Mirror tests/provenance.test.mjs:9 — pass profiles in explicitly so the pure
// function never depends on `window`.
const data = JSON.parse(fs.readFileSync("tests/fixtures/top100-map-2026-02.json", "utf8"));
const profiles = data.profiles || {};

// --- DEPTH-02: criticality ranking by real fan-in ------------------------

test("supplierCriticality returns {supplier, fanIn} sorted descending", () => {
  const ranked = supplierCriticality({ profiles });
  assert.ok(Array.isArray(ranked) && ranked.length > 0);
  for (let i = 0; i + 1 < ranked.length; i++) {
    assert.ok(
      ranked[i].fanIn >= ranked[i + 1].fanIn,
      `not sorted at index ${i}: ${ranked[i].fanIn} < ${ranked[i + 1].fanIn}`
    );
  }
});

test("supplierCriticality top chokepoint = 'credit and risk data inputs' with fanIn 4", () => {
  const ranked = supplierCriticality({ profiles });
  assert.equal(ranked[0].supplier, "credit and risk data inputs");
  assert.equal(ranked[0].fanIn, 4);
});

test("supplierCriticality has at least one supplier with fanIn >= 3", () => {
  const ranked = supplierCriticality({ profiles });
  assert.ok(ranked.some((r) => r.fanIn >= 3), "expected a fan-in >= 3 supplier");
});

test("supplierCriticality counts match buildSupplierFanIn sizes exactly", () => {
  const fan = buildSupplierFanIn(profiles);
  const ranked = supplierCriticality({ profiles });
  assert.equal(ranked.length, fan.size, "entry count must match fan-in map size");
  for (const { supplier, fanIn } of ranked) {
    assert.equal(fanIn, fan.get(supplier).size, `fan-in mismatch for ${supplier}`);
  }
});

test("supplierCriticality fan-in histogram matches real distribution {1:439,2:13,3:5,4:1}", () => {
  const ranked = supplierCriticality({ profiles });
  const hist = {};
  for (const { fanIn } of ranked) hist[fanIn] = (hist[fanIn] || 0) + 1;
  assert.deepEqual(hist, { 1: 439, 2: 13, 3: 5, 4: 1 });
});

test("supplierCriticality honors opts.limit", () => {
  const top3 = supplierCriticality({ profiles, limit: 3 });
  assert.equal(top3.length, 3);
  assert.equal(top3[0].supplier, "credit and risk data inputs");
});

// --- DEPTH-02: criticality is fan-in only, NOT the editorial d.bn flag ----

test("supplierCriticality source contains no reference to the editorial d.bn flag", () => {
  // RESEARCH Anti-Pattern: d.bn is a curated company-prominence flag with
  // non-contiguous ranks, NOT derivable from fan-in. The criticality math must
  // not conflate the two.
  const src = readFileSync("js/analytics/index.js", "utf8");
  // Isolate the supplierCriticality function body and assert it never reads .bn
  const start = src.indexOf("export function supplierCriticality");
  assert.ok(start >= 0, "supplierCriticality export not found");
  const body = src.slice(start);
  assert.ok(!/\.bn\b/.test(body), "supplierCriticality must not reference d.bn");
});

// --- DEPTH-02/04: derived provenance (never observed) ---------------------

test("provenanceFor({derived:true,n}) returns tag 'derived' + Methodology source", () => {
  const prov = provenanceFor({ derived: true, n: 5 }, { methodologyUrl: "#methodology" });
  assert.equal(prov.tag, "derived");
  assert.equal(prov.note, "computed from 5 relationships");
  assert.deepEqual(prov.source, { label: "Methodology", url: "#methodology" });
  assert.notEqual(prov.tag, "observed");
});

test("provenanceFor derived note is singular for n===1", () => {
  const prov = provenanceFor({ derived: true, n: 1 }, { methodologyUrl: "#methodology" });
  assert.equal(prov.note, "computed from 1 relationship");
});

test("provenanceFor derived note is 'computed from 0 relationships' for missing/non-finite n", () => {
  assert.equal(provenanceFor({ derived: true }).note, "computed from 0 relationships");
  assert.equal(provenanceFor({ derived: true, n: NaN }).note, "computed from 0 relationships");
  assert.equal(provenanceFor({ derived: true, n: Infinity }).note, "computed from 0 relationships");
});

test("provenanceFor derived with no methodologyUrl has tag+note and NO source key", () => {
  const prov = provenanceFor({ derived: true, n: 3 });
  assert.equal(prov.tag, "derived");
  assert.equal(prov.note, "computed from 3 relationships");
  assert.ok(!("source" in prov) || prov.source === undefined, "no source key without methodologyUrl");
});

test("badgeHtml(derived) emits 'Derived' (confidence-medium) and NEVER 'Observed'", () => {
  const html = badgeHtml(provenanceFor({ derived: true, n: 5 }, { methodologyUrl: "#methodology" }));
  assert.match(html, /Derived/);
  assert.match(html, /confidence-medium/);
  assert.doesNotMatch(html, /Observed/);
});

test("badgeHtml derived gates the source link on http(s) (non-http degrades to label-only)", () => {
  const nonHttp = badgeHtml(provenanceFor({ derived: true, n: 2 }, { methodologyUrl: "#methodology" }));
  assert.doesNotMatch(nonHttp, /<a /, "non-http methodology anchor must NOT emit an <a>");

  const httpUrl = badgeHtml(provenanceFor({ derived: true, n: 2 }, { methodologyUrl: "https://example.com/methodology" }));
  assert.match(httpUrl, /<a /, "http(s) methodology url must emit an <a>");
  assert.match(httpUrl, /rel="noopener noreferrer"/, "source link must carry rel=noopener noreferrer");
});

// --- DEPTH-01/02: js/ui + js/viz + index.html string wiring ---------------

const UI = readFileSync("js/ui/index.js", "utf8");
const HTML = readFileSync("index.html", "utf8");

test("js/ui imports companyConcentration + supplierCriticality from ../analytics", () => {
  assert.match(UI, /companyConcentration/, "ui must reference companyConcentration");
  assert.match(UI, /supplierCriticality/, "ui must reference supplierCriticality");
  assert.match(UI, /from\s+["']\.\.\/analytics\/index\.js["']/, "ui must import from ../analytics/index.js");
});

test("js/ui renders a derived-badged concentration line via provenanceFor + badgeHtml", () => {
  assert.match(UI, /derived\s*:\s*true/, "ui must build derived provenance for the concentration line");
  assert.match(UI, /badgeHtml/, "ui must render the derived badge via badgeHtml");
  assert.match(UI, /Supplier concentration/i, "ui must render the 'Supplier concentration' line");
});

test("js/ui wires the chokepoints panel + highlightBy graph highlight", () => {
  assert.match(UI, /supplierCriticality\(/, "ui must call supplierCriticality for the chokepoints panel");
  assert.match(UI, /highlightBy/, "ui must wire highlightBy for the chokepoint graph highlight");
  assert.match(UI, /bChokepoints/, "ui must wire the #bChokepoints button");
});

test("index.html declares the chokepoints panel + concentration hosts (new IDs only)", () => {
  assert.match(HTML, /id="cardConcentration"/, "company card must host #cardConcentration");
  assert.match(HTML, /id="chokepointsPanel"/, "a #chokepointsPanel host is required");
  assert.match(HTML, /id="bChokepoints"/, "a #bChokepoints highlight button is required");
});

test("index.html Methodology modal documents the concentration + criticality formulas", () => {
  // concentration formula + equal-weight (l.v constant) limit
  assert.match(HTML, /concentration/i, "methodology must explain concentration");
  assert.match(HTML, /0\.6/, "methodology must show the 0.6 HHI weight");
  assert.match(HTML, /0\.4/, "methodology must show the 0.4 sharedFrac weight");
  assert.match(HTML, /equal-weight/i, "methodology must state the equal-weight HHI limit");
  assert.match(HTML, /1\s*\/\s*k|1\/k/i, "methodology must show HHI = 1/k");
  // criticality fan-in ranking
  assert.match(HTML, /fan-in|fan in/i, "methodology must explain fan-in criticality");
  assert.match(HTML, /derived/i, "methodology must note these are derived aggregates");
});
