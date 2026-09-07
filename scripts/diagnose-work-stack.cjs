const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");

async function recordDetailedScrollTrace(page, durationMs = 3500, direction = "down") {
  return await page.evaluate(async (duration, dir) => {
    const work = document.querySelector("#work");
    if (!work) return { error: "No #work found" };

    const rect = work.getBoundingClientRect();
    const startY = dir === "down" ? (window.scrollY + rect.top - 80) : (window.scrollY + rect.bottom - window.innerHeight + 80);
    const endY = dir === "down" ? (window.scrollY + rect.bottom - window.innerHeight + 80) : (window.scrollY + rect.top - 80);
    const totalDist = endY - startY;

    // Reset scroll position to top of work
    window.scrollTo(0, Math.max(0, startY));
    await new Promise(r => setTimeout(r, 250));

    const frameTimes = [];
    let lastTime = performance.now();
    let animId;

    const measure = (now) => {
      frameTimes.push(now - lastTime);
      lastTime = now;
      animId = requestAnimationFrame(measure);
    };
    animId = requestAnimationFrame(measure);

    const startTime = performance.now();
    await new Promise(resolve => {
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Linear scroll for consistent frame load comparison
        window.scrollTo(0, startY + totalDist * progress);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(step);
    });

    await new Promise(r => setTimeout(r, 150));
    cancelAnimationFrame(animId);

    const deltas = frameTimes.slice(2);
    const totalFrames = deltas.length;
    const totalDuration = deltas.reduce((a, b) => a + b, 0);
    const avgFps = totalFrames / (totalDuration / 1000);
    const slowFrames = deltas.filter(d => d > 16.7).length; // drops below 60fps
    const jankyFrames = deltas.filter(d => d > 33.3).length; // drops below 30fps
    const severeJank = deltas.filter(d => d > 50).length; // drops below 20fps
    
    // Sort deltas for percentiles
    const sorted = [...deltas].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.50)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
    const maxFrame = Math.max(...deltas, 0);

    return {
      totalFrames,
      durationMs: Math.round(totalDuration),
      avgFps: Math.round(avgFps * 10) / 10,
      slowFrames,
      slowPercent: Math.round((slowFrames / Math.max(1, totalFrames)) * 100),
      jankyFrames,
      jankyPercent: Math.round((jankyFrames / Math.max(1, totalFrames)) * 100),
      severeJank,
      p50FrameMs: Math.round(p50 * 10) / 10,
      p95FrameMs: Math.round(p95 * 10) / 10,
      p99FrameMs: Math.round(p99 * 10) / 10,
      maxFrameTimeMs: Math.round(maxFrame * 10) / 10
    };
  }, durationMs, direction);
}

async function runScenario(scenarioName, options = {}) {
  const {
    setupFn = null,
    isCold = false,
    duration = 3500,
    direction = "down",
    theme = "dark",
    viewport = { width: 1440, height: 900, deviceScaleFactor: 1 }
  } = options;

  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--enable-gpu-rasterization"]
  });

  const page = await browser.newPage();
  await page.setViewport(viewport);

  // Clear cache if cold
  if (isCold) {
    const client = await page.target().createCDPSession();
    await client.send("Network.clearBrowserCache");
  }

  await page.goto(`http://localhost:4173/?theme=${theme}`, { waitUntil: "networkidle0" });

  if (!isCold) {
    // Warm up: Scroll down once to trigger image decoding and caching
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 600));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 300));
  }

  if (setupFn) {
    await page.evaluate(setupFn);
  }

  const result = await recordDetailedScrollTrace(page, duration, direction);
  await browser.close();

  return {
    scenario: scenarioName,
    theme,
    isCold,
    direction,
    durationMs: duration,
    viewport: `${viewport.width}x${viewport.height}`,
    ...result
  };
}

async function main() {
  console.log("===============================================================================");
  console.log("SCROLL PERFORMANCE BOTTLENECK INVESTIGATION (3.5s TRACE IN CHROME)");
  console.log("===============================================================================");
  console.log("Conditions: Chrome 133, 1440x900 Viewport, 60Hz Display, Duration 3500ms");
  console.log("Testing Section: #work (all 7 project cards)");
  console.log("===============================================================================\n");

  const results = [];

  // Scenario 1: Cold scroll with Current Native CSS Sticky Stack
  console.log("1. Running Cold Scroll with Current Native CSS Sticky Stack...");
  const res1 = await runScenario("Current Stack (Cold, Normal)", { isCold: true });
  console.log("   -> FPS:", res1.avgFps, "| Slow frames:", res1.slowFrames, "| Severe jank (>50ms):", res1.severeJank, "| Max frame:", res1.maxFrameTimeMs, "ms");
  results.push(res1);

  // Scenario 2: Warm scroll with Current Native CSS Sticky Stack
  console.log("2. Running Warm Scroll with Current Native CSS Sticky Stack...");
  const res2 = await runScenario("Current Stack (Warm, Normal)", { isCold: false });
  console.log("   -> FPS:", res2.avgFps, "| Slow frames:", res2.slowFrames, "| Severe jank (>50ms):", res2.severeJank, "| Max frame:", res2.maxFrameTimeMs, "ms");
  results.push(res2);

  // Scenario 3: Temporarily Disabled Stacking (cards in standard static vertical layout)
  console.log("3. Running with Temporarily Disabled Stacking (Flat Static Flow, No Sticky Overlap)...");
  const res3 = await runScenario("Disabled Stacking (Flat Flow)", {
    isCold: false,
    setupFn: () => {
      const style = document.createElement("style");
      style.textContent = `
        .ws-card {
          position: relative !important;
          top: auto !important;
          margin-bottom: 32px !important;
          z-index: auto !important;
        }
      `;
      document.head.appendChild(style);
    }
  });
  console.log("   -> FPS:", res3.avgFps, "| Slow frames:", res3.slowFrames, "| Severe jank (>50ms):", res3.severeJank, "| Max frame:", res3.maxFrameTimeMs, "ms");
  results.push(res3);

  // Scenario 4: Paused Background Motion (Parallax & Floating Astronaut Paused)
  console.log("4. Running with Paused Background Motion (Keep Sticky Stack, Hide Parallax & Floating Canvas)...");
  const res4 = await runScenario("Paused Background Motion", {
    isCold: false,
    setupFn: () => {
      const style = document.createElement("style");
      style.textContent = `
        .fixed.top-0.left-0.right-0 { display: none !important; }
        .floating-astronaut-container { display: none !important; }
        canvas { display: none !important; }
      `;
      document.head.appendChild(style);
    }
  });
  console.log("   -> FPS:", res4.avgFps, "| Slow frames:", res4.slowFrames, "| Severe jank (>50ms):", res4.severeJank, "| Max frame:", res4.maxFrameTimeMs, "ms");
  results.push(res4);

  // Scenario 5: Both Disabled (Flat Flow + Paused Background Motion)
  console.log("5. Running with Both Disabled (Flat Flow + Paused Background Motion)...");
  const res5 = await runScenario("Both Disabled", {
    isCold: false,
    setupFn: () => {
      const style = document.createElement("style");
      style.textContent = `
        .ws-card {
          position: relative !important;
          top: auto !important;
          margin-bottom: 32px !important;
          z-index: auto !important;
        }
        .fixed.top-0.left-0.right-0 { display: none !important; }
        .floating-astronaut-container { display: none !important; }
        canvas { display: none !important; }
      `;
      document.head.appendChild(style);
    }
  });
  console.log("   -> FPS:", res5.avgFps, "| Slow frames:", res5.slowFrames, "| Severe jank (>50ms):", res5.severeJank, "| Max frame:", res5.maxFrameTimeMs, "ms");
  results.push(res5);

  // Scenario 6: Upward Scroll (Warm)
  console.log("6. Running Upward Scroll (Warm)...");
  const res6 = await runScenario("Current Stack (Upward Scroll)", { isCold: false, direction: "up" });
  console.log("   -> FPS:", res6.avgFps, "| Slow frames:", res6.slowFrames, "| Severe jank (>50ms):", res6.severeJank, "| Max frame:", res6.maxFrameTimeMs, "ms");
  results.push(res6);

  // Scenario 7: Fast Scroll (1400ms duration)
  console.log("7. Running Fast Velocity Scroll (1400ms)...");
  const res7 = await runScenario("Current Stack (Fast Velocity 1.4s)", { isCold: false, duration: 1400 });
  console.log("   -> FPS:", res7.avgFps, "| Slow frames:", res7.slowFrames, "| Severe jank (>50ms):", res7.severeJank, "| Max frame:", res7.maxFrameTimeMs, "ms");
  results.push(res7);

  // Scenario 8: Light Theme (Warm)
  console.log("8. Running Light Theme Warm Scroll...");
  const res8 = await runScenario("Current Stack (Light Theme)", { isCold: false, theme: "light" });
  console.log("   -> FPS:", res8.avgFps, "| Slow frames:", res8.slowFrames, "| Severe jank (>50ms):", res8.severeJank, "| Max frame:", res8.maxFrameTimeMs, "ms");
  results.push(res8);

  // Scenario 9: Mobile Viewport 390x844 (Warm)
  console.log("9. Running Mobile Viewport Scroll (390x844 @ 2x DPR)...");
  const res9 = await runScenario("Current Stack (Mobile 390x844)", {
    isCold: false,
    viewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }
  });
  console.log("   -> FPS:", res9.avgFps, "| Slow frames:", res9.slowFrames, "| Severe jank (>50ms):", res9.severeJank, "| Max frame:", res9.maxFrameTimeMs, "ms");
  results.push(res9);

  // Save results to file
  const outPath = "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/scratch/scroll-investigation-report.json";
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nAll results saved to ${outPath}`);

  console.log("\n===============================================================================");
  console.log("SUMMARY COMPARISON TABLE");
  console.log("===============================================================================");
  console.table(results.map(r => ({
    Scenario: r.scenario,
    AvgFPS: r.avgFps,
    "Slow (>16ms)": `${r.slowFrames} (${r.slowPercent}%)`,
    "Jank (>33ms)": `${r.jankyFrames} (${r.jankyPercent}%)`,
    "Severe (>50ms)": r.severeJank,
    "P50 (ms)": r.p50FrameMs,
    "P95 (ms)": r.p95FrameMs,
    "Max (ms)": r.maxFrameTimeMs
  })));
}

main().catch(err => {
  console.error("Diagnostic error:", err);
  process.exit(1);
});
