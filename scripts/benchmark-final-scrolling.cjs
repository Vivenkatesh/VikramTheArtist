const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

async function recordScrollMeasurement(page, scenarioName, options = {}) {
  const {
    theme = "dark",
    isCold = false,
    direction = "down", // "down" | "up"
    durationMs = 4000,
    viewport = { width: 1440, height: 900, deviceScaleFactor: 1 }
  } = options;

  await page.setViewport(viewport);

  if (isCold) {
    const client = await page.target().createCDPSession();
    await client.send("Network.clearBrowserCache");
  }

  await page.goto(`http://localhost:4173/?theme=${theme}`, { waitUntil: "networkidle0" });
  await page.bringToFront();

  // Give layout and fonts a moment to settle
  await new Promise(r => setTimeout(r, 400));

  if (!isCold) {
    // Warm up pass
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 400));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 300));
  }

  // Execute measurement inside page context with strict sampler cancellation hygiene
  const result = await page.evaluate(async ({ duration, direction }) => {
    // Ensure any previously lingering sampler is completely stopped
    if (window.__stopActiveSampler) {
      window.__stopActiveSampler();
      window.__stopActiveSampler = null;
    }

    const work = document.querySelector("#work");
    if (!work) return { error: "No #work element found" };

    const rect = work.getBoundingClientRect();
    const workStart = window.scrollY + rect.top - 60;
    const workEnd = window.scrollY + rect.bottom - window.innerHeight + 60;
    const totalDist = Math.max(100, workEnd - workStart);

    let startY = workStart;
    let targetY = workEnd;
    if (direction === "up") {
      startY = workEnd;
      targetY = workStart;
    }

    window.scrollTo(0, Math.max(0, startY));
    await new Promise(r => setTimeout(r, 200));

    // Initialize sampler state
    let isSampling = true;
    let animId = 0;
    const frameTimes = [];
    let lastTime = performance.now();

    const measure = (now) => {
      if (!isSampling) return; // Strict guard: do not process or reschedule if stopped
      frameTimes.push(now - lastTime);
      lastTime = now;
      animId = requestAnimationFrame(measure);
    };

    // Register active sampler stopper for guaranteed hygiene
    window.__stopActiveSampler = () => {
      isSampling = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    // Start frame timing
    animId = requestAnimationFrame(measure);

    // Perform smooth scrolling over specified duration
    const startTime = performance.now();
    let scrollRafId = 0;

    await new Promise(resolve => {
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Smooth cubic ease-in-out
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const currentY = startY + (targetY - startY) * ease;
        window.scrollTo(0, currentY);

        if (progress < 1) {
          scrollRafId = requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      scrollRafId = requestAnimationFrame(step);
    });

    if (scrollRafId) cancelAnimationFrame(scrollRafId);
    await new Promise(r => setTimeout(r, 100));

    // Stop and cancel the frame sampler
    if (window.__stopActiveSampler) {
      window.__stopActiveSampler();
      window.__stopActiveSampler = null;
    }

    // Process statistics
    const deltas = frameTimes.slice(2); // Skip initial warm-up frames
    if (deltas.length === 0) return { error: "No frames captured" };

    const totalFrames = deltas.length;
    const totalDuration = deltas.reduce((a, b) => a + b, 0);
    const avgFps = totalFrames / (totalDuration / 1000);
    const slowFrames = deltas.filter(d => d > 16.7).length;
    const jankyFrames = deltas.filter(d => d > 33.3).length;
    const severeJank = deltas.filter(d => d > 50).length;

    const sorted = [...deltas].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.50)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const maxFrame = Math.max(...deltas, 0);

    return {
      totalFrames,
      avgFps: Math.round(avgFps * 10) / 10,
      slowFrames,
      slowPercent: Math.round((slowFrames / totalFrames) * 1000) / 10,
      jankyFrames,
      jankyPercent: Math.round((jankyFrames / totalFrames) * 1000) / 10,
      severeJank,
      p50FrameMs: Math.round(p50 * 10) / 10,
      p95FrameMs: Math.round(p95 * 10) / 10,
      maxFrameTimeMs: Math.round(maxFrame * 10) / 10
    };
  }, { duration: durationMs, direction });

  return {
    scenario: scenarioName,
    theme,
    direction,
    isCold,
    device: viewport.width >= 768 ? "Desktop" : "Mobile",
    ...result
  };
}

async function main() {
  console.log("===============================================================================");
  console.log("FINAL-BUILD SCROLL BENCHMARK IN VISIBLE CHROME (IDENTICAL CONDITIONS)");
  console.log("===============================================================================");
  console.log("Environment: macOS Chrome GUI (headless: false, Metal GPU rasterization)");
  console.log("Duration per run: 4000ms | Downward & Upward test across #work section");
  console.log("Cancellation hygiene: Clean RAF cancellation + boolean guard on all samplers");
  console.log("===============================================================================\n");

  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1440,950",
      "--enable-gpu-rasterization",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding"
    ]
  });

  const pages = await browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();
  await page.bringToFront();
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 600));

  const results = [];

  const desktopVp = { width: 1440, height: 900, deviceScaleFactor: 1 };
  const mobileVp = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

  // ── DESKTOP DARK ──
  console.log("1/10: Desktop Dark - Cold Downward...");
  results.push(await recordScrollMeasurement(page, "Desktop Dark: Cold Downward", {
    theme: "dark", isCold: true, direction: "down", durationMs: 4000, viewport: desktopVp
  }));

  console.log("2/10: Desktop Dark - Warm Downward...");
  results.push(await recordScrollMeasurement(page, "Desktop Dark: Warm Downward", {
    theme: "dark", isCold: false, direction: "down", durationMs: 4000, viewport: desktopVp
  }));

  console.log("3/10: Desktop Dark - Upward...");
  results.push(await recordScrollMeasurement(page, "Desktop Dark: Upward", {
    theme: "dark", isCold: false, direction: "up", durationMs: 4000, viewport: desktopVp
  }));

  // ── DESKTOP LIGHT ──
  console.log("4/10: Desktop Light - Cold Downward...");
  results.push(await recordScrollMeasurement(page, "Desktop Light: Cold Downward", {
    theme: "light", isCold: true, direction: "down", durationMs: 4000, viewport: desktopVp
  }));

  console.log("5/10: Desktop Light - Warm Downward...");
  results.push(await recordScrollMeasurement(page, "Desktop Light: Warm Downward", {
    theme: "light", isCold: false, direction: "down", durationMs: 4000, viewport: desktopVp
  }));

  console.log("6/10: Desktop Light - Upward...");
  results.push(await recordScrollMeasurement(page, "Desktop Light: Upward", {
    theme: "light", isCold: false, direction: "up", durationMs: 4000, viewport: desktopVp
  }));

  // ── MOBILE DARK ──
  console.log("7/10: Mobile Dark - Cold Downward...");
  results.push(await recordScrollMeasurement(page, "Mobile Dark: Cold Downward", {
    theme: "dark", isCold: true, direction: "down", durationMs: 4000, viewport: mobileVp
  }));

  console.log("8/10: Mobile Dark - Warm Downward...");
  results.push(await recordScrollMeasurement(page, "Mobile Dark: Warm Downward", {
    theme: "dark", isCold: false, direction: "down", durationMs: 4000, viewport: mobileVp
  }));

  // ── MOBILE LIGHT ──
  console.log("9/10: Mobile Light - Cold Downward...");
  results.push(await recordScrollMeasurement(page, "Mobile Light: Cold Downward", {
    theme: "light", isCold: true, direction: "down", durationMs: 4000, viewport: mobileVp
  }));

  console.log("10/10: Mobile Light - Warm Downward...");
  results.push(await recordScrollMeasurement(page, "Mobile Light: Warm Downward", {
    theme: "light", isCold: false, direction: "down", durationMs: 4000, viewport: mobileVp
  }));

  await browser.close();

  const outDir = "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/scratch";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "final-scroll-benchmark.json"), JSON.stringify(results, null, 2));

  console.log("\n===============================================================================");
  console.log("FINAL COMPARISON MATRIX: SCROLL PERFORMANCE");
  console.log("===============================================================================");
  console.table(results.map(r => ({
    Scenario: r.scenario,
    AvgFPS: r.avgFps,
    "Slow (>16.7ms)": `${r.slowFrames} (${r.slowPercent}%)`,
    "Jank (>33.3ms)": `${r.jankyFrames} (${r.jankyPercent}%)`,
    "Severe (>50ms)": r.severeJank,
    "P50 (ms)": r.p50FrameMs,
    "P95 (ms)": r.p95FrameMs,
    "Max (ms)": r.maxFrameTimeMs
  })));
}

main().catch(err => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});
