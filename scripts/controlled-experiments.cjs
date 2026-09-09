const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

async function recordScrollMeasurement(page, scenarioName, options = {}) {
  const {
    theme = "dark",
    isCold = false,
    direction = "down",
    durationMs = 4000,
    viewport = { width: 1440, height: 900, deviceScaleFactor: 1 },
    setupMode = "default" // "default" | "no-backdrop" | "no-pointer-tilt" | "no-3d-perspective" | "no-lightclouds"
  } = options;

  await page.setViewport(viewport);

  if (isCold) {
    const client = await page.target().createCDPSession();
    await client.send("Network.clearBrowserCache");
  }

  await page.goto(`http://localhost:4173/?theme=${theme}`, { waitUntil: "networkidle0" });
  await page.bringToFront();

  // Position mouse safely outside the card area (top-left corner)
  await page.mouse.move(10, 10);

  // Set theme explicitly
  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  }, theme);

  // Apply isolation variation
  await page.evaluate((mode) => {
    // Remove previous experiment style tag if any
    const oldStyle = document.getElementById("exp-style");
    if (oldStyle) oldStyle.remove();

    const style = document.createElement("style");
    style.id = "exp-style";

    if (mode === "no-backdrop") {
      style.textContent = `
        .project-glass-prototype {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
      `;
    } else if (mode === "no-pointer-tilt") {
      style.textContent = `
        .project-glass-prototype {
          transform: none !important;
          pointer-events: none !important;
        }
        .project-glass-prototype::before {
          opacity: 0 !important;
        }
      `;
    } else if (mode === "no-3d-perspective") {
      style.textContent = `
        .project-glass-prototype {
          transform-style: flat !important;
          perspective: none !important;
        }
        .lg-01 {
          perspective: none !important;
        }
      `;
    } else if (mode === "no-lightclouds") {
      style.textContent = `
        .lc-layer {
          display: none !important;
        }
      `;
    }
    document.head.appendChild(style);
  }, setupMode);

  await new Promise(r => setTimeout(r, 400));

  if (!isCold) {
    // Warm up pass
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 300));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 300));
  }

  // Ensure pointer is definitely at (10, 10)
  await page.mouse.move(10, 10);

  // Execute measurement
  const result = await page.evaluate(async ({ duration, direction }) => {
    if (window.__stopActiveSampler) {
      window.__stopActiveSampler();
      window.__stopActiveSampler = null;
    }

    const work = document.querySelector("#work");
    if (!work) return { error: "No #work element found" };

    const rect = work.getBoundingClientRect();
    const workStart = window.scrollY + rect.top - 60;
    const workEnd = window.scrollY + rect.bottom - window.innerHeight + 60;

    let startY = workStart;
    let targetY = workEnd;
    if (direction === "up") {
      startY = workEnd;
      targetY = workStart;
    }

    window.scrollTo(0, Math.max(0, startY));
    await new Promise(r => setTimeout(r, 200));

    let isSampling = true;
    let animId = 0;
    const frameTimes = [];
    let lastTime = performance.now();

    const measure = (now) => {
      if (!isSampling) return;
      frameTimes.push(now - lastTime);
      lastTime = now;
      animId = requestAnimationFrame(measure);
    };

    window.__stopActiveSampler = () => {
      isSampling = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    animId = requestAnimationFrame(measure);

    const startTime = performance.now();
    let scrollRafId = 0;

    await new Promise(resolve => {
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
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

    if (window.__stopActiveSampler) {
      window.__stopActiveSampler();
      window.__stopActiveSampler = null;
    }

    const deltas = frameTimes.slice(2);
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
    setupMode,
    theme,
    direction,
    isCold,
    device: viewport.width >= 768 ? "Desktop" : "Mobile (Emulated)",
    ...result
  };
}

async function recordHoverMeasurement(page, scenarioName, theme = "dark") {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:4173/?theme=${theme}`, { waitUntil: "networkidle0" });
  await page.bringToFront();

  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
  }, theme);
  await new Promise(r => setTimeout(r, 400));

  // Scroll card into view
  const cardHandle = await page.$(".ws-card .project-glass-prototype");
  if (!cardHandle) return { error: "Card not found" };

  await page.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }), cardHandle);
  await new Promise(r => setTimeout(r, 300));

  const box = await cardHandle.boundingBox();
  if (!box) return { error: "Card bounding box not found" };

  // Hover benchmark: move mouse back and forth across the card over 2500ms while measuring RAF
  const result = await page.evaluate(async (box) => {
    let isSampling = true;
    let animId = 0;
    const frameTimes = [];
    let lastTime = performance.now();

    const measure = (now) => {
      if (!isSampling) return;
      frameTimes.push(now - lastTime);
      lastTime = now;
      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);

    // Simulate smooth pointer movement across card
    const cardEl = document.querySelector(".ws-card .project-glass-prototype");
    const start = performance.now();
    const duration = 2000;

    await new Promise(resolve => {
      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        // Ping-pong motion (0 -> 1 -> 0)
        const t = Math.sin(progress * Math.PI);
        const clientX = box.x + 20 + t * (box.width - 40);
        const clientY = box.y + 20 + t * (box.height - 40);

        // Dispatch pointermove event
        const evt = new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          clientX,
          clientY,
          pointerType: "mouse"
        });
        cardEl.dispatchEvent(evt);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(step);
    });

    isSampling = false;
    if (animId) cancelAnimationFrame(animId);

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
  }, box);

  return {
    scenario: scenarioName,
    setupMode: "hover-active",
    theme,
    device: "Desktop",
    ...result
  };
}

async function main() {
  console.log("=== STARTING CONTROLLED COMPARISON EXPERIMENT ===");
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

  const desktopVp = { width: 1440, height: 900, deviceScaleFactor: 1 };
  const testResults = [];

  // ==========================================
  // PART 1: 4-WAY CONTROLLED SCROLL TEST (Desktop Dark, Warm Downward)
  // ==========================================
  console.log("\n--- Part 1: Controlled Comparison on Representative Card (Desktop Dark) ---");

  // Run 1: Current prototype (all effects active)
  console.log("Test 1a: Current Prototype (all effects)...");
  testResults.push(await recordScrollMeasurement(page, "1. Current Prototype (Run A)", {
    theme: "dark", isCold: false, direction: "down", viewport: desktopVp, setupMode: "default"
  }));
  console.log("Test 1b: Current Prototype (Repeat to verify consistency)...");
  testResults.push(await recordScrollMeasurement(page, "1. Current Prototype (Run B)", {
    theme: "dark", isCold: false, direction: "down", viewport: desktopVp, setupMode: "default"
  }));

  // Run 2: Same prototype with ONLY backdrop-filter disabled
  console.log("Test 2a: Only backdrop-filter disabled...");
  testResults.push(await recordScrollMeasurement(page, "2. No Backdrop-Filter (Run A)", {
    theme: "dark", isCold: false, direction: "down", viewport: desktopVp, setupMode: "no-backdrop"
  }));
  console.log("Test 2b: Only backdrop-filter disabled (Repeat)...");
  testResults.push(await recordScrollMeasurement(page, "2. No Backdrop-Filter (Run B)", {
    theme: "dark", isCold: false, direction: "down", viewport: desktopVp, setupMode: "no-backdrop"
  }));

  // Run 3: Same prototype with ONLY pointer highlight and tilt disabled
  console.log("Test 3a: Only pointer highlight & tilt disabled...");
  testResults.push(await recordScrollMeasurement(page, "3. No Pointer Highlight/Tilt (Run A)", {
    theme: "dark", isCold: false, direction: "down", viewport: desktopVp, setupMode: "no-pointer-tilt"
  }));
  console.log("Test 3b: Only pointer highlight & tilt disabled (Repeat)...");
  testResults.push(await recordScrollMeasurement(page, "3. No Pointer Highlight/Tilt (Run B)", {
    theme: "dark", isCold: false, direction: "down", viewport: desktopVp, setupMode: "no-pointer-tilt"
  }));

  // Run 4: Same prototype with ONLY 3D / perspective setup removed
  console.log("Test 4a: Only 3D / perspective layer setup removed...");
  testResults.push(await recordScrollMeasurement(page, "4. No 3D/Perspective Setup (Run A)", {
    theme: "dark", isCold: false, direction: "down", viewport: desktopVp, setupMode: "no-3d-perspective"
  }));
  console.log("Test 4b: Only 3D / perspective layer setup removed (Repeat)...");
  testResults.push(await recordScrollMeasurement(page, "4. No 3D/Perspective Setup (Run B)", {
    theme: "dark", isCold: false, direction: "down", viewport: desktopVp, setupMode: "no-3d-perspective"
  }));

  // ==========================================
  // PART 2: SEPARATE HOVER BENCHMARK
  // ==========================================
  console.log("\n--- Part 2: Dedicated Hover Interaction Benchmark ---");
  console.log("Hover Test: Pointer active over Card 1 in Dark Theme...");
  testResults.push(await recordHoverMeasurement(page, "Hover Active: Desktop Dark", "dark"));
  console.log("Hover Test: Pointer active over Card 1 in Light Theme...");
  testResults.push(await recordHoverMeasurement(page, "Hover Active: Desktop Light", "light"));

  // ==========================================
  // PART 3: INVESTIGATING UNCHANGED DESKTOP LIGHT BASELINE (LightClouds diagnosis)
  // ==========================================
  console.log("\n--- Part 3: Light Theme Baseline Investigation (LightClouds vs. Base) ---");
  console.log("Light Mode with LightClouds active (Standard)...");
  testResults.push(await recordScrollMeasurement(page, "Light Mode: Standard (with LightClouds)", {
    theme: "light", isCold: false, direction: "down", viewport: desktopVp, setupMode: "default"
  }));
  console.log("Light Mode with LightClouds disabled (Diagnosis)...");
  testResults.push(await recordScrollMeasurement(page, "Light Mode: LightClouds Disabled (Diagnosis)", {
    theme: "light", isCold: false, direction: "down", viewport: desktopVp, setupMode: "no-lightclouds"
  }));

  await browser.close();

  const outDir = "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/scratch";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "controlled-comparison-results.json"), JSON.stringify(testResults, null, 2));

  console.log("\n===============================================================================");
  console.log("CONTROLLED COMPARISON RESULTS TABLE");
  console.log("===============================================================================");
  console.table(testResults.map(r => ({
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
  console.error("Experiment failed:", err);
  process.exit(1);
});
