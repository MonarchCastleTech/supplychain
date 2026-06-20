const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-gpu"] });
  const page = await browser.newPage({ viewport: { width: 1350, height: 940 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console.error: " + m.text()); });
  const reqs = [];
  page.on("response", (r) => reqs.push({ url: r.url(), status: r.status() }));
  let nav;
  try {
    nav = await page.goto("http://localhost:8080/index.html", { waitUntil: "load", timeout: 60000 });
  } catch (e) {
    console.log("GOTO_ERROR: " + e.message);
  }
  await page.waitForTimeout(5000);
  const status = nav ? nav.status() : "no-response";
  const m = await page.evaluate(() => {
    const n = performance.getEntriesByType("navigation")[0] || {};
    const paints = performance.getEntriesByType("paint") || [];
    const fcp = paints.find((p) => p.name === "first-contentful-paint");
    const fp = paints.find((p) => p.name === "first-paint");
    const res = performance.getEntriesByType("resource") || [];
    let totalBytes = (n.transferSize || 0);
    for (const r of res) totalBytes += (r.transferSize || 0);
    return {
      ttfb_ms: Math.round(n.responseStart || 0),
      responseEnd_ms: Math.round(n.responseEnd || 0),
      domInteractive_ms: Math.round(n.domInteractive || 0),
      domContentLoaded_ms: Math.round(n.domContentLoadedEventEnd || 0),
      loadEvent_ms: Math.round(n.loadEventEnd || 0),
      firstPaint_ms: fp ? Math.round(fp.startTime) : null,
      firstContentfulPaint_ms: fcp ? Math.round(fcp.startTime) : null,
      docTransferBytes: n.transferSize || 0,
      totalTransferBytes: Math.round(totalBytes),
      resourceCount: res.length,
      title: document.title,
      svgNodes: document.querySelectorAll("svg").length,
      bodyTextLen: (document.body && document.body.innerText || "").length,
      loadingDisplay: (() => { const l = document.getElementById("loading"); return l ? getComputedStyle(l).display : "no-loading-el"; })(),
    };
  });
  console.log(JSON.stringify({
    http_status: status,
    metrics: m,
    page_errors: errors.slice(0, 10),
    blocked_or_failed: reqs.filter((r) => r.status >= 400 || r.status === 0).slice(0, 10),
  }, null, 2));
  await browser.close();
})().catch((e) => { console.log("FATAL: " + e.message); process.exit(1); });
