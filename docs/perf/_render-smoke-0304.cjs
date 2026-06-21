// Phase 03-04 render smoke (auto-approved human-verify gate). Serves the REAL site via
// http-server and loads it over http:// (never file://). After Plan 01 restored the rich
// served data/top100-map.js (window.SUPPLY_MAP_DATA = {meta, layers, countries, nodes,
// links, profiles}), the app should PAINT with real data. This harness asserts the full
// Phase-3 trust surface end to end:
//   (1) zero console / pageerror events
//   (2) D3 SVG node elements rendered (> 0)
//   (3) a node tooltip (#tt) contains a .prov-badge AND the literal "Confidence:" with "%"
//   (4) clicking #bMethodology opens #methodologyModal (display:flex); ESC closes it
//   (5) footer #lastUpdated is non-empty and not "--" (single live owner from js/ui)
//
// d3 is CDN-loaded (cloudflare). If the sandbox blocks the CDN the real page cannot paint;
// in that case the harness reports the CDN-blocked condition honestly and the human-verify
// checkpoint (auto-approved here) covers the true visual pass (plan-sanctioned fallback,
// mirroring the Phase-1/2 condition recorded in STATE.md). No app source is modified.
const { spawn } = require("child_process");
const net = require("net");
const { chromium } = require("playwright");

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on("error", reject);
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function waitForServer(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const sock = net.connect(port, "127.0.0.1");
      sock.on("connect", () => { sock.end(); resolve(); });
      sock.on("error", () => {
        sock.destroy();
        if (Date.now() > deadline) reject(new Error("http-server did not start"));
        else setTimeout(tryConnect, 150);
      });
    };
    tryConnect();
  });
}

(async () => {
  const repoRoot = require("path").resolve(__dirname, "..", "..");
  const port = await freePort();

  // Boot http-server serving the repo root (no cache so the rich data file is always fresh).
  const srv = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["http-server", repoRoot, "-p", String(port), "-c-1", "-a", "127.0.0.1", "--silent"],
    { cwd: repoRoot, shell: process.platform === "win32" }
  );
  srv.on("error", (e) => console.log("HTTP_SERVER_SPAWN_ERROR: " + e.message));

  let browser;
  try {
    await waitForServer(port, 20000);

    browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage({ viewport: { width: 1350, height: 940 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push("console.error: " + m.text()); });

    const url = `http://127.0.0.1:${port}/index.html`;
    let nav;
    try {
      nav = await page.goto(url, { waitUntil: "load", timeout: 60000 });
    } catch (e) { console.log("GOTO_ERROR: " + e.message); }

    // Give d3 force simulation time to lay out and the entry script to wire UI.
    await page.waitForTimeout(4000);

    // Detect whether d3 actually loaded (CDN reachability gate).
    const d3Loaded = await page.evaluate(() => typeof window.d3 !== "undefined");

    // (1)+(2) data + paint.
    const paint = await page.evaluate(() => {
      const data = window.SUPPLY_MAP_DATA || {};
      return {
        dataLoaded: !!(data && Array.isArray(data.nodes)),
        nodeCount: (data.nodes || []).length,
        linkCount: (data.links || []).length,
        profileCount: data.profiles ? Object.keys(data.profiles).length : 0,
        metaLastUpdated: data.meta ? (data.meta.lastUpdated || data.meta.generatedAt || null) : null,
        svgNodeEls: document.querySelectorAll("svg g circle.mc, svg circle.mc").length,
        svgTotalEls: document.querySelectorAll("svg *").length,
      };
    });

    // (3) node tooltip: hover the first rendered node and read #tt.
    let tooltip = { rendered: false, html: "", hasProvBadge: false, hasConfidencePct: false };
    if (paint.svgNodeEls > 0) {
      try {
        const target = await page.$("svg g circle.mc, svg circle.mc");
        if (target) {
          await target.hover({ force: true });
          await page.waitForTimeout(400);
          tooltip = await page.evaluate(() => {
            const tt = document.getElementById("tt");
            const html = tt ? tt.innerHTML : "";
            const text = tt ? (tt.textContent || "") : "";
            return {
              rendered: !!tt && tt.style.display !== "none" && html.trim().length > 0,
              html: html.slice(0, 400),
              hasProvBadge: !!(tt && tt.querySelector(".prov-badge")),
              hasConfidencePct: /Confidence:\s*\d+%/.test(text),
            };
          });
        }
      } catch (e) { tooltip.error = e.message; }
    }

    // (4) methodology modal open/close.
    let modal = { opened: false, closedOnEsc: false };
    try {
      const btn = await page.$("#bMethodology");
      if (btn) {
        await btn.click();
        await page.waitForTimeout(250);
        modal.opened = await page.evaluate(() => {
          const m = document.getElementById("methodologyModal");
          if (!m) return false;
          const disp = getComputedStyle(m).display;
          return disp !== "none" && disp.length > 0;
        });
        await page.keyboard.press("Escape");
        await page.waitForTimeout(250);
        modal.closedOnEsc = await page.evaluate(() => {
          const m = document.getElementById("methodologyModal");
          if (!m) return false;
          return getComputedStyle(m).display === "none";
        });
      }
    } catch (e) { modal.error = e.message; }

    // (5) freshness footer.
    const freshness = await page.evaluate(() => {
      const el = document.getElementById("lastUpdated");
      const text = el ? (el.textContent || "").trim() : "";
      return { text, ok: text.length > 0 && text !== "--" };
    });

    const summary = {
      http_status: nav ? nav.status() : "no-response",
      d3_loaded: d3Loaded,
      cdn_blocked: !d3Loaded,
      paint,
      tooltip,
      methodology_modal: modal,
      freshness,
      page_errors: errors.slice(0, 20),
      assertions: {
        zero_errors: errors.length === 0,
        paint_real_data: paint.dataLoaded && paint.nodeCount >= 100 && paint.svgNodeEls > 0,
        tooltip_confidence: tooltip.hasProvBadge && tooltip.hasConfidencePct,
        modal_open_close: modal.opened && modal.closedOnEsc,
        live_freshness: freshness.ok,
      },
    };
    summary.PASS = Object.values(summary.assertions).every(Boolean);

    console.log(JSON.stringify(summary, null, 2));
    await browser.close();
    srv.kill();
    process.exit(summary.PASS ? 0 : 2);
  } catch (e) {
    console.log("FATAL: " + e.message);
    if (browser) await browser.close().catch(() => {});
    srv.kill();
    process.exit(1);
  }
})();
