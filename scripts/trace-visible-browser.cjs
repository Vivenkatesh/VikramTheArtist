const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");

async function recordScrollTraceVisible(page, testName, options = {}) {
  const {
    theme = "dark",
    isCold = false,
    durationMs = 4500,
    setupFn = null
  } = options;

  if (isCold) {
    const client = await page.target().createCDPSession();
    await client.send("Network.clearBrowserCache");
  }

  await page.goto(`http://localhost:4173/?theme=${theme}`, { waitUntil: "networkidle0" });

  if (!isCold) {
    // Warm up: scroll through once and back
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 600));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 400));
  }

  if (setupFn) {
    await page.evaluate(setupFn);
  }

  // Measure scroll over #work
  const result = await page.evaluate(async (duration) => {
    const work = document.querySelector("#work");
    if (!work) return { error: "No #work found" };

    const rect = work.getBoundingClientRect();
    const startY = window.scrollY + rect.top - 80;
    const endY = window.scrollY + rect.bottom - window.innerHeight + 80;
    const totalDist = endY - startY;

    window.scrollTo(0, Math.max(0, startY));
    await new Promise(r => setTimeout(r, 300));

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
        // Smooth ease-in-out for realistic trackpad scroll
        const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        window.scrollTo(0, startY + totalDist * ease);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(step);
    });

    await new Promise(r => setTimeout(r, 200));
    cancelAnimationFrame(animId);

    const deltas = frameTimes.slice(2);
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
      durationMs: Math.round(totalDuration),
      avgFps: Math.round(avgFps * 10) / 10,
      slowFrames,
      slowPercent: Math.round((slowFrames / Math.max(1, totalFrames)) * 100),
      jankyFrames,
      jankyPercent: Math.round((jankyFrames / Math.max(1, totalFrames)) * 100),
      severeJank,
      p50FrameMs: Math.round(p50 * 10) / 10,
      p95FrameMs: Math.round(p95 * 10) / 10,
      maxFrameTimeMs: Math.round(maxFrame * 10) / 10
    };
  }, durationMs);

  return {
    scenario: testName,
    theme,
    isCold,
    ...result
  };
}

async function main() {
  console.log("===============================================================================");
  console.log("LONGER SCROLL TRACE IN VISIBLE BROWSER (4.5s TRACE IN CHROME GUI)");
  console.log("===============================================================================");
  console.log("Environment: macOS Metal GPU, Chrome 133 GUI (headless: false)");
  console.log("Viewport: 1440x900 @ 1x DPR, Display Refresh: 60Hz");
  console.log("Testing Section: #work across all 7 sticky project cards");
  console.log("===============================================================================\n");

  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1440,950",
      "--enable-gpu-rasterization"
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const results = [];

  // 1. Visible Browser: Cold Scroll (Current Stack)
  console.log("1. Measuring Cold Scroll in Visible Browser...");
  const coldRes = await recordScrollTraceVisible(page, "Visible Chrome: Current Stack (Cold)", {
    isCold: true,
    theme: "dark",
    durationMs: 4500
  });
  console.log("   -> Result:", coldRes);
  results.push(coldRes);

  // 2. Visible Browser: Warm Scroll (Current Stack)
  console.log("\n2. Measuring Warm Scroll in Visible Browser...");
  const warmRes = await recordScrollTraceVisible(page, "Visible Chrome: Current Stack (Warm)", {
    isCold: false,
    theme: "dark",
    durationMs: 4500
  });
  console.log("   -> Result:", warmRes);
  results.push(warmRes);

  // 3. Visible Browser: Temporarily Disabled Stacking
  console.log("\n3. Measuring with Temporarily Disabled Stacking (Flat Static Flow)...");
  const disabledStackRes = await recordScrollTraceVisible(page, "Visible Chrome: Disabled Stacking", {
    isCold: false,
    theme: "dark",
    durationMs: 4500,
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
  console.log("   -> Result:", disabledStackRes);
  results.push(disabledStackRes);

  // 4. Visible Browser: Paused Background Motion
  console.log("\n4. Measuring with Paused Background Motion...");
  const pausedBgRes = await recordScrollTraceVisible(page, "Visible Chrome: Paused Background Motion", {
    isCold: false,
    theme: "dark",
    durationMs: 4500,
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
  console.log("   -> Result:", pausedBgRes);
  results.push(pausedBgRes);

  // 5. Visible Browser: Light Theme (Warm)
  console.log("\n5. Measuring Light Theme Warm Scroll in Visible Browser...");
  const lightRes = await recordScrollTraceVisible(page, "Visible Chrome: Light Theme (Warm)", {
    isCold: false,
    theme: "light",
    durationMs: 4500
  });
  console.log("   -> Result:", lightRes);
  results.push(lightRes);

  await browser.close();

  const outPath = "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/scratch/visible-browser-scroll-report.json";
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  console.log("\n===============================================================================");
  console.log("SUMMARY: VISIBLE BROWSER SCROLL PERFORMANCE");
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
  console.error("Error running visible trace:", err);
  process.exit(1);
});
