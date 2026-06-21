// tests/mobile-keyboard.spec.mjs
//
// Phase 09-03 (PERF-02 + PERF-03): real-browser smoke that the Node static
// a11y test cannot cover — touch tap -> profile at 390x844, a keyboard-only
// search journey ('/' -> type -> Enter -> Escape), and the hero overlay focus
// trap. Served over a 127.0.0.1 ephemeral http-server (never file://), closed
// in test.after (T-09-05). All waits gate on selectors, never fixed timeouts,
// because the D3 force layout settles ~15s (T-09-06 / Pitfall 4).
//
// Chromium may be absent in CI (RESEARCH A2). chromium.launch is wrapped so a
// missing binary degrades each test to a logged skip rather than a hard fail —
// tests/mobile-keyboard-a11y.test.mjs remains the structural fallback gate.

import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "http-server";

const NODE_SETTLE_MS = 30000; // generous: D3 settles ~15s and cold-starts slower under full-suite load; we gate on selectors
const CARD_MS = 12000; // profile open after tap/Enter (headroom for chromium cold start)

let server;
let base;

test.before(async () => {
  server = createServer({ root: process.cwd(), cache: -1 });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.server.address().port}/index.html`;
});

test.after(() => {
  if (server && server.server) server.server.close();
});

// Build a context whose pages start as a "returning visitor": the first-visit
// hero auto-tour and onboarding panel are suppressed (heroSeen/onboardingSeen
// pre-set) so no auto-opened overlay covers the canvas before a test acts. The
// Tour is still replayable on demand via #bTour (replay ignores heroSeen).
async function newReturningContext(browser, opts = {}) {
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("heroSeen", "1");
      localStorage.setItem("onboardingSeen", "1");
    } catch (_) {
      /* storage unavailable — tests below still gate on selectors */
    }
  });
  return ctx;
}

// Launch chromium, or return null (with a logged note) if the binary is absent.
async function launchOrSkip(t) {
  try {
    return await chromium.launch({ args: ["--no-sandbox", "--disable-gpu"] });
  } catch (err) {
    const note =
      "chromium binary unavailable (" +
      (err && err.message ? err.message.split("\n")[0] : String(err)) +
      ") — skipping Playwright smoke; tests/mobile-keyboard-a11y.test.mjs is the structural fallback gate (run `npx playwright install chromium`).";
    // eslint-disable-next-line no-console
    console.log("[mobile-keyboard.spec] " + note);
    t.skip(note);
    return null;
  }
}

// PERF-02: a 390x844 hasTouch context taps a node and the profile opens; the
// mobile sheet is reachable.
test("PERF-02 mobile 390x844: mobile sheet reachable + node tap opens profile", async (t) => {
  const browser = await launchOrSkip(t);
  if (!browser) return;
  try {
    const ctx = await newReturningContext(browser, {
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: "load" });

    // Nodes are <g class="node"> inside #canvas; wait for the layout to render.
    await page.waitForSelector("#canvas .node", { state: "attached", timeout: NODE_SETTLE_MS });

    // The toolbar is hidden <=768px; the mobile sheet is the reachable surface.
    await page.tap("#mobileToggle");
    await page.waitForSelector("#mobileSheet", { state: "visible", timeout: 5000 });
    assert.ok(await page.isVisible("#mobileSheet"), "#mobileSheet should be visible after tapping #mobileToggle");

    // The 4 new controls must be present and reachable inside the sheet.
    for (const id of ["mMethodology", "mTour", "mChokepoints", "mScenario"]) {
      assert.ok(
        await page.locator("#mobileSheet #" + id).count() === 1,
        "mobile sheet should expose #" + id,
      );
    }

    // Close the sheet (via its own close control — the sheet overlay covers the
    // toggle) so it does not intercept the node tap.
    await page.tap("#mobileClose");
    await page.waitForSelector("#mobileSheet", { state: "hidden", timeout: 5000 });

    // Touch tap a node -> D3 .on("click") fires on tap -> profile opens.
    // On a 390px viewport the fixed panels (#chokepointsPanel/#scenarioPanel)
    // and the bottom-anchored card occupy real screen space, so the first node
    // in DOM order may sit *under* an overlay. Pick the DOM index of a node
    // whose center is the topmost element at that point (not covered by any
    // overlay), then tap *that* node via a Playwright tap gesture — a real tap
    // (not a synthetic coordinate click) so d3-zoom treats it as a click and
    // the node's .on("click") handler fires.
    const nodeIndex = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll("#canvas .node")];
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const r = n.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) continue;
        const top = document.elementFromPoint(cx, cy);
        if (top && (n === top || n.contains(top))) return i;
      }
      return -1;
    });
    assert.notEqual(nodeIndex, -1, "expected at least one node not covered by a fixed overlay at 390x844");
    await page.locator("#canvas .node").nth(nodeIndex).tap();
    await page.waitForSelector("#companyCard", { state: "visible", timeout: CARD_MS });
    assert.ok(await page.isVisible("#companyCard"), "#companyCard should open after tapping a node");

    await ctx.close();
  } finally {
    await browser.close();
  }
});

// PERF-03: keyboard-only journey '/' -> type -> Enter (select) -> Escape (reset),
// plus an accessible-name gate on every new control.
test("PERF-03 keyboard-only: '/' focuses search, type+Enter selects, Escape resets", async (t) => {
  const browser = await launchOrSkip(t);
  if (!browser) return;
  try {
    const ctx = await newReturningContext(browser, { viewport: { width: 1350, height: 940 } });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: "load" });
    await page.waitForSelector("#canvas .node", { state: "attached", timeout: NODE_SETTLE_MS });

    // '/' focuses the search input (no pointer used).
    await page.keyboard.press("/");
    assert.equal(
      await page.evaluate(() => document.activeElement && document.activeElement.id),
      "q",
      "'/' should move focus to #q",
    );

    // Type a known ticker; the input handler renders the suggestion list.
    await page.keyboard.type("AAPL");

    // Enter selects the suggestion -> openProfile -> #companyCard becomes visible.
    await page.keyboard.press("Enter");
    await page.waitForSelector("#companyCard", { state: "visible", timeout: CARD_MS });
    assert.ok(await page.isVisible("#companyCard"), "Enter should select a company and open #companyCard");

    // Move focus out of the input (Tab, keyboard-only) so the global Escape
    // handler (which ignores keys while focus is in an INPUT) resets to global.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Escape");
    // Reset path must not throw and must leave the page interactive.
    assert.ok(await page.isVisible("#canvas"), "#canvas should remain after Escape resets to global");

    // Every new control must carry a non-empty accessible name (aria-label).
    const noName = await page.$$eval(
      "#bMethodology,#bTour,#bChokepoints,#bScenarioTaiwan,#bScenarioReset,#heroSkip,#scenarioChokepointSelect",
      (els) => els.filter((e) => !(e.getAttribute("aria-label") || "").trim()).map((e) => e.id),
    );
    assert.deepEqual(noName, [], "all new controls must have a non-empty aria-label");

    await ctx.close();
  } finally {
    await browser.close();
  }
});

// PERF-03 focus trap: opening the Tour moves focus into #heroOverlay and Tab
// keeps it inside (it must not leak to background controls like #bReset).
test("PERF-03 hero overlay traps focus on open and Tab stays inside", async (t) => {
  const browser = await launchOrSkip(t);
  if (!browser) return;
  try {
    const ctx = await newReturningContext(browser, { viewport: { width: 1350, height: 940 } });
    const page = await ctx.newPage();
    await page.goto(base, { waitUntil: "load" });
    await page.waitForSelector("#canvas .node", { state: "attached", timeout: NODE_SETTLE_MS });

    // Open the hero (Tour) via keyboard to keep the journey pointer-free.
    await page.locator("#bTour").focus();
    await page.keyboard.press("Enter");
    await page.waitForSelector("#heroOverlay", { state: "visible", timeout: 5000 });

    // Focus moves into the overlay on the next frame after open (RESEARCH
    // Pattern 3 -> #heroSkip); wait for it to land rather than reading once.
    await page.waitForFunction(() => {
      const o = document.getElementById("heroOverlay");
      return !!(o && document.activeElement && o.contains(document.activeElement));
    }, null, { timeout: 5000 });
    const focusInsideOnOpen = await page.evaluate(() => {
      const o = document.getElementById("heroOverlay");
      return !!(o && document.activeElement && o.contains(document.activeElement));
    });
    assert.ok(focusInsideOnOpen, "focus should move inside #heroOverlay when the tour opens");

    // Tab a handful of times; focus must never leak out of the overlay (and in
    // particular must never land on #bReset behind the modal).
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      const state = await page.evaluate(() => {
        const o = document.getElementById("heroOverlay");
        const a = document.activeElement;
        return {
          inside: !!(o && a && o.contains(a)),
          id: a ? a.id : null,
        };
      });
      assert.ok(state.inside, `Tab #${i + 1} leaked focus out of #heroOverlay (landed on '${state.id}')`);
      assert.notEqual(state.id, "bReset", "focus must never reach #bReset behind the modal");
    }

    // Escape closes the overlay (single central binding -> skip).
    await page.keyboard.press("Escape");
    await page.waitForSelector("#heroOverlay", { state: "hidden", timeout: 5000 });

    await ctx.close();
  } finally {
    await browser.close();
  }
});
