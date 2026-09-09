const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

async function measureHoverConsistent(theme) {
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

  const page = (await browser.pages())[0] || await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:4173/?theme=${theme}`, { waitUntil: "networkidle0" });
  await page.bringToFront();

  const card = await page.$(".ws-card .project-glass-prototype");
  if (!card) {
    console.error("Card not found");
    await browser.close();
    return null;
  }

  await page.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }), card);
  await new Promise(r => setTimeout(r, 400));
  const b = await card.boundingBox();

  // In-page measurement synchronized strictly to the pointer movement duration
  const result = await page.evaluate(async (b) => {
    const frameIntervals = [];
    let lastTime = 0;
    let animId = 0;
    let sampling = false;

    const onFrame = (now) => {
      if (!sampling) return;
      if (lastTime > 0) {
        frameIntervals.push(now - lastTime);
      }
      lastTime = now;
      animId = requestAnimationFrame(onFrame);
    };

    const cardEl = document.querySelector(".ws-card .project-glass-prototype");
    const dur = 2000;
    const startTime = performance.now();

    // Start sampling synchronized with pointer interaction start
    sampling = true;
    lastTime = performance.now();
    animId = requestAnimationFrame(onFrame);

    await new Promise(resolve => {
      const interval = setInterval(() => {
        const now = performance.now();
        const elapsed = now - startTime;
        if (elapsed >= dur) {
          clearInterval(interval);
          resolve();
          return;
        }
        const p = elapsed / dur;
        const t = Math.sin(p * Math.PI * 4); // 2 full sweeps
        const clientX = b.x + 40 + ((t + 1) / 2) * (b.width - 80);
        const clientY = b.y + 40 + ((t + 1) / 2) * (b.height - 80);

        cardEl.dispatchEvent(new PointerEvent("pointermove", {
          bubbles: true, clientX, clientY, pointerType: "mouse"
        }));
      }, 16);
    });

    // Stop sampling immediately when interaction ends
    sampling = false;
    cancelAnimationFrame(animId);
    const endTime = performance.now();
    const actualDurationMs = endTime - startTime;

    const sorted = [...frameIntervals].sort((a, b) => a - b);
    const sum = frameIntervals.reduce((a, b) => a + b, 0);
    const meanInterval = frameIntervals.length > 0 ? sum / frameIntervals.length : 0;
    const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const min = sorted[0] || 0;
    const max = sorted[sorted.length - 1] || 0;

    return {
      totalFrames: frameIntervals.length,
      measuredDurationMs: Math.round(actualDurationMs * 10) / 10,
      sumFrameIntervalsMs: Math.round(sum * 10) / 10,
      effectiveFps: Math.round((frameIntervals.length / (actualDurationMs / 1000)) * 10) / 10,
      meanIntervalMs: Math.round(meanInterval * 10) / 10,
      p50IntervalMs: Math.round(p50 * 10) / 10,
      p95IntervalMs: Math.round(p95 * 10) / 10,
      minIntervalMs: Math.round(min * 10) / 10,
      maxIntervalMs: Math.round(max * 10) / 10,
      rawIntervals: frameIntervals
    };
  }, b);

  await browser.close();
  return { theme, ...result };
}

async function run() {
  console.log("Measuring hover with strictly synchronized single-source timer (Dark theme)...");
  const dark = await measureHoverConsistent("dark");
  console.log("Measuring hover with strictly synchronized single-source timer (Light theme)...");
  const light = await measureHoverConsistent("light");

  console.log("\n==================================================================");
  console.log("SYNCHRONIZED HOVER MEASUREMENT REPORT");
  console.log("==================================================================");
  console.table([
    {
      Theme: dark.theme,
      "Duration (ms)": dark.measuredDurationMs,
      "Total Frames": dark.totalFrames,
      "Effective FPS": dark.effectiveFps,
      "P50 / Median (ms)": dark.p50IntervalMs,
      "Mean (ms)": dark.meanIntervalMs,
      "P95 (ms)": dark.p95IntervalMs,
      "Max (ms)": dark.maxIntervalMs
    },
    {
      Theme: light.theme,
      "Duration (ms)": light.measuredDurationMs,
      "Total Frames": light.totalFrames,
      "Effective FPS": light.effectiveFps,
      "P50 / Median (ms)": light.p50IntervalMs,
      "Mean (ms)": light.meanIntervalMs,
      "P95 (ms)": light.p95IntervalMs,
      "Max (ms)": light.maxIntervalMs
    }
  ]);

  const outPath = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76/scratch/synchronized-hover-measurement.json";
  fs.writeFileSync(outPath, JSON.stringify({ dark, light }, null, 2));
  console.log(`Saved output to ${outPath}`);
}

run().catch(console.error);
