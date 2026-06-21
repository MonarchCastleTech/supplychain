// tests/seo-social.test.mjs  — pattern mirrors tests/index-ui-integrity.test.mjs (string/regex on raw file)
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const CANON = "https://akgularda.github.io/supplychain/";
const IMG = "https://akgularda.github.io/supplychain/assets/og-card.png";

test("meta description present and non-trivial", () => {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]{40,})"\s*\/?>/i);
  assert.ok(m, "meta description with substantive content required");
});

test("canonical points at the Pages URL", () => {
  assert.match(html, new RegExp(`<link\\s+rel="canonical"\\s+href="${CANON.replace(/[/.]/g,"\\$&")}"`, "i"));
});

test("required Open Graph tags present", () => {
  for (const p of ["og:type","og:site_name","og:title","og:description","og:url","og:image"]) {
    assert.match(html, new RegExp(`property="${p}"`, "i"), `missing ${p}`);
  }
  assert.ok(html.includes(`content="${IMG}"`), "og:image must be the absolute Pages URL");
});

test("Twitter summary_large_image card present", () => {
  assert.match(html, /name="twitter:card"\s+content="summary_large_image"/i);
  for (const n of ["twitter:title","twitter:description","twitter:image"]) {
    assert.match(html, new RegExp(`name="${n}"`, "i"), `missing ${n}`);
  }
});

test("JSON-LD block is well-formed and typed", () => {
  const m = html.match(/<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/i);
  assert.ok(m, "application/ld+json block required");
  const data = JSON.parse(m[1]);          // must parse
  assert.equal(data["@context"], "https://schema.org");
  assert.ok(data.url === CANON);
});

test("og:image file exists in assets/ at 1200x630", () => {
  const p = "assets/og-card.png";
  assert.ok(fs.existsSync(p), `${p} must exist`);
  const b = fs.readFileSync(p);
  assert.equal(b.readUInt32BE(16), 1200, "og-card width must be 1200");
  assert.equal(b.readUInt32BE(20), 630, "og-card height must be 630");
});

test("deploy workflow ships the assets/ dir (carries og-card)", () => {
  const wf = fs.readFileSync(".github/workflows/deploy-pages.yml", "utf8");
  assert.match(wf, /cp -R assets _site\//, "deploy must copy assets/ into _site");
});
