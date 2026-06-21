// Phase 06-03 render smoke (auto-approved human-verify gate). Serves the REAL site via
// http-server and loads it over http:// (never file://). This harness proves the Phase 6
// concentration/criticality analytics PAINT and WIRE end to end:
//   (1) zero console / pageerror events
//   (2) real data paints (nodes >= 100, svg circle.mc rendered)
//   (3) opening a company profile (GILD) shows #cardConcentration with
//       "Supplier concentration ... NN/100" AND a .prov-badge reading "Derived" (NOT "Observed")
//   (4) #chokepointsList renders >= 1 supplier row with an integer fan-in count
//   (5) clicking #bChokepoints highlights: non-matching circle.mc drop to low fill-opacity (~0.03)
//   (6) #bMethodology opens #methodologyModal whose body contains the concentration +
//       criticality formula copy incl. the equal-weight (HHI = 1/k) limit; ESC closes it
//
// Mirrors docs/perf/_render-smoke-0304.cjs: free port, real repo root, http:// not file://.
// d3 is CDN-loaded (cloudflare). If the sandbox blocks the CDN the real page cannot paint;
// the harness reports the CDN-blocked condition honestly and the auto-approved human-verify
// checkpoint covers the true visual pass (plan-sanctioned fallback, per STATE.md blocker).
// No app source is modified.
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

    const d3Loaded = await page.evaluate(() => typeof window.d3 !== "undefined");

    // (1)+(2) data + paint.
    const paint = await page.evaluate(() => {
      const data = window.SUPPLY_MAP_DATA || {};
      return {
        dataLoaded: !!(data && Array.isArray(data.nodes)),
        nodeCount: (data.nodes || []).length,
        profileCount: data.profiles ? Object.keys(data.profiles).length : 0,
        svgNodeEls: document.querySelectorAll("svg g circle.mc, svg circle.mc").length,
      };
    });

    // (3) open a real company profile and read the concentration line + Derived badge.
    let concentration = { opened: false, text: "", hasScore: false, badgeText: "", isDerived: false, notObserved: false };
    try {
      const opened = await page.evaluate(() => {
        const sym = "GILD";
        if (!(window.SUPPLY_MAP_DATA && window.SUPPLY_MAP_DATA.profiles && window.SUPPLY_MAP_DATA.profiles[sym])) return false;
        // openCompanyProfile scrolls then opens via a 500ms setTimeout -> openProfile.
        window.openCompanyProfile(sym);
        return true;
      });
      concentration.opened = opened;
      if (opened) {
        await page.waitForTimeout(1200); // cover the 500ms openProfile delay + render.
        concentration = await page.evaluate((prev) => {
          const host = document.getElementById("cardConcentration");
          const text = host ? (host.textContent || "").trim() : "";
          const badge = host ? host.querySelector(".prov-badge") : null;
          const badgeText = badge ? (badge.textContent || "").trim() : "";
          return {
            opened: prev.opened,
            text: text.slice(0, 200),
            hasScore: /Supplier concentration[\s\S]*\b\d{1,3}\s*\/\s*100\b/.test(text),
            badgeText,
            isDerived: /Derived/.test(badgeText),
            notObserved: !/Observed/.test(text),
          };
        }, concentration);
      }
    } catch (e) { concentration.error = e.message; }

    // (4) chokepoints panel rows with integer counts.
    const chokepoints = await page.evaluate(() => {
      const host = document.getElementById("chokepointsList");
      const text = host ? (host.textContent || "") : "";
      const rows = host ? host.querySelectorAll(".cItem").length : 0;
      // each row renders "<label><N> compan(y|ies)"; textContent fuses label + count with
      // no whitespace (span/b boundary), so match an integer immediately before "compan".
      const hasIntegerCount = /\d+\s*compan(?:y|ies)\b/.test(text);
      // anchor: top chokepoint is "credit and risk data inputs" with a fan-in of 4.
      const hasTopAnchor = /credit and risk data inputs4\s*companies/.test(text);
      return { rows, hasIntegerCount, hasTopAnchor, sample: text.slice(0, 160) };
    });

    // (5) highlight: click #bChokepoints, then non-matching circle.mc -> low fill-opacity.
    let highlight = { clicked: false, dimmedCount: 0, litCount: 0, dimsNonChokepoints: false };
    try {
      const btn = await page.$("#bChokepoints");
      if (btn && paint.svgNodeEls > 0) {
        await btn.click();
        await page.waitForTimeout(500); // highlight transition is 160ms.
        highlight = await page.evaluate(() => {
          const circles = [...document.querySelectorAll("svg circle.mc")];
          let dimmed = 0, lit = 0;
          for (const c of circles) {
            const fo = parseFloat(c.getAttribute("fill-opacity") || "1");
            if (fo <= 0.1) dimmed++; else lit++;
          }
          return {
            clicked: true,
            dimmedCount: dimmed,
            litCount: lit,
            // most nodes (non-chokepoints) dim; at least some stay lit (chokepoint suppliers).
            dimsNonChokepoints: dimmed > 0 && dimmed >= lit,
          };
        });
      }
    } catch (e) { highlight.error = e.message; }
    // Reset highlight so the methodology check runs on a clean slate.
    try { const r = await page.$("#bChokepointsReset"); if (r) { await r.click(); await page.waitForTimeout(300); } } catch (e) {}

    // (6) methodology modal: open, assert both formulas + equal-weight limit, ESC closes.
    let modal = { opened: false, closedOnEsc: false, hasConcentrationFormula: false, hasEqualWeightLimit: false, hasCriticalityFanIn: false };
    try {
      const btn = await page.$("#bMethodology");
      if (btn) {
        await btn.click();
        await page.waitForTimeout(300);
        modal = await page.evaluate(() => {
          const m = document.getElementById("methodologyModal");
          if (!m) return { opened: false };
          const disp = getComputedStyle(m).display;
          const text = (m.textContent || "").replace(/\s+/g, " ");
          return {
            opened: disp !== "none" && disp.length > 0,
            // C = round(100 · (0.6 · HHI + 0.4 · sharedFrac))
            hasConcentrationFormula: /0\.6/.test(text) && /HHI/.test(text) && /0\.4/.test(text) && /sharedFrac/.test(text),
            hasEqualWeightLimit: /equal-weight/i.test(text) && /HHI\s*=\s*1\s*\/\s*k/.test(text),
            hasCriticalityFanIn: /fan-in/i.test(text) && /chokepoint/i.test(text),
            closedOnEsc: false,
          };
        });
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
        modal.closedOnEsc = await page.evaluate(() => {
          const m = document.getElementById("methodologyModal");
          return m ? getComputedStyle(m).display === "none" : false;
        });
      }
    } catch (e) { modal.error = e.message; }

    const summary = {
      http_status: nav ? nav.status() : "no-response",
      d3_loaded: d3Loaded,
      cdn_blocked: !d3Loaded,
      paint,
      concentration,
      chokepoints,
      highlight,
      methodology_modal: modal,
      page_errors: errors.slice(0, 20),
      assertions: {
        zero_errors: errors.length === 0,
        paint_real_data: paint.dataLoaded && paint.nodeCount >= 100 && paint.svgNodeEls > 0,
        concentration_derived_badge: concentration.hasScore && concentration.isDerived && concentration.notObserved,
        chokepoints_rows: chokepoints.rows >= 1 && chokepoints.hasIntegerCount,
        highlight_dims_non_chokepoints: highlight.dimsNonChokepoints,
        methodology_formulas: modal.opened && modal.hasConcentrationFormula && modal.hasEqualWeightLimit && modal.hasCriticalityFanIn && modal.closedOnEsc,
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
