const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";

async function measureScroll(page, name, theme, isPrototype, viewport = { width: 1440, height: 900, deviceScaleFactor: 1 }) {
  await page.setViewport(viewport);
  await page.goto(`http://localhost:4173/?theme=${theme}`, { waitUntil: "networkidle0" });
  await page.bringToFront();
  await page.mouse.move(10, 10);

  await page.evaluate(({ t, proto }) => {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
    if (!proto) {
      const card = document.querySelector(".project-glass-prototype");
      if (card) {
        card.classList.remove("project-glass-prototype");
        const spec = card.querySelector(".lg-spec");
        if (spec) spec.remove();
      }
    }
  }, { t: theme, proto: isPrototype });

  await new Promise(r => setTimeout(r, 400));

  // Warm up
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 200));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 200));
  await page.mouse.move(10, 10);

  const result = await page.evaluate(async () => {
    const work = document.querySelector("#work");
    if (!work) return { error: "No #work" };
    const rect = work.getBoundingClientRect();
    const startY = window.scrollY + rect.top - 60;
    const endY = window.scrollY + rect.bottom - window.innerHeight + 60;

    window.scrollTo(0, Math.max(0, startY));
    await new Promise(r => setTimeout(r, 150));

    let isSampling = true;
    let animId = 0;
    const frameTimes = [];
    let last = performance.now();

    const tick = (now) => {
      if (!isSampling) return;
      frameTimes.push(now - last);
      last = now;
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    const start = performance.now();
    const dur = 3500;
    await new Promise(resolve => {
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        window.scrollTo(0, startY + (endY - startY) * ease);
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

    isSampling = false;
    if (animId) cancelAnimationFrame(animId);

    const deltas = frameTimes.slice(2);
    const totalDuration = deltas.reduce((a, b) => a + b, 0);
    const avgFps = deltas.length / (totalDuration / 1000);
    const sorted = [...deltas].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.50)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const max = Math.max(...deltas, 0);

    return {
      totalFrames: deltas.length,
      avgFps: Math.round(avgFps * 10) / 10,
      p50Ms: Math.round(p50 * 10) / 10,
      p95Ms: Math.round(p95 * 10) / 10,
      maxMs: Math.round(max * 10) / 10
    };
  });

  return {
    scenario: name,
    theme,
    isPrototype,
    device: viewport.width >= 768 ? "Desktop" : "Mobile (DevTools Emulation)",
    ...result
  };
}

async function measureHover(page, name, theme) {
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(`http://localhost:4173/?theme=${theme}`, { waitUntil: "networkidle0" });
  await page.bringToFront();

  await page.evaluate((t) => {
    document.documentElement.setAttribute("data-theme", t);
  }, theme);
  await new Promise(r => setTimeout(r, 400));

  const card = await page.$(".ws-card .project-glass-prototype");
  if (!card) return { error: "No card" };
  await page.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }), card);
  await new Promise(r => setTimeout(r, 200));

  const box = await card.boundingBox();
  const result = await page.evaluate(async (b) => {
    let active = true;
    let animId = 0;
    const frameTimes = [];
    let last = performance.now();

    const tick = (now) => {
      if (!active) return;
      frameTimes.push(now - last);
      last = now;
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    const cardEl = document.querySelector(".ws-card .project-glass-prototype");
    const start = performance.now();
    const dur = 2000;

    await new Promise(res => {
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const t = Math.sin(p * Math.PI);
        const clientX = b.x + 20 + t * (b.width - 40);
        const clientY = b.y + 20 + t * (b.height - 40);

        cardEl.dispatchEvent(new PointerEvent("pointermove", {
          bubbles: true, clientX, clientY, pointerType: "mouse"
        }));

        if (p < 1) requestAnimationFrame(step);
        else res();
      };
      requestAnimationFrame(step);
    });

    active = false;
    if (animId) cancelAnimationFrame(animId);

    const deltas = frameTimes.slice(2);
    const totalDuration = deltas.reduce((a, b) => a + b, 0);
    const avgFps = deltas.length / (totalDuration / 1000);
    const sorted = [...deltas].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.50)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const max = Math.max(...deltas, 0);

    return {
      totalFrames: deltas.length,
      avgFps: Math.round(avgFps * 10) / 10,
      p50Ms: Math.round(p50 * 10) / 10,
      p95Ms: Math.round(p95 * 10) / 10,
      maxMs: Math.round(max * 10) / 10
    };
  }, box);

  return {
    scenario: name,
    theme,
    device: "Desktop",
    type: "Hover",
    ...result
  };
}

async function run() {
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

  const page = (await browser.pages())[0] || await browser.newPage();
  const results = [];

  console.log("1. Measuring Unchanged Main vs Revised Prototype (Desktop Dark)...");
  results.push(await measureScroll(page, "Desktop Dark: Unchanged Main", "dark", false));
  results.push(await measureScroll(page, "Desktop Dark: Revised Prototype", "dark", true));

  console.log("2. Measuring Unchanged Main vs Revised Prototype (Desktop Light)...");
  results.push(await measureScroll(page, "Desktop Light: Unchanged Main", "light", false));
  results.push(await measureScroll(page, "Desktop Light: Revised Prototype", "light", true));

  console.log("3. Measuring Dedicated Hover (Desktop Dark & Light)...");
  results.push(await measureHover(page, "Desktop Dark: Hover on Prototype", "dark"));
  results.push(await measureHover(page, "Desktop Light: Hover on Prototype", "light"));

  console.log("4. Measuring Mobile Carousel (Chrome DevTools Emulation)...");
  const mobileVp = { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
  results.push(await measureScroll(page, "Mobile Dark (Emulated): Unchanged Main", "dark", false, mobileVp));
  results.push(await measureScroll(page, "Mobile Dark (Emulated): Revised Prototype", "dark", true, mobileVp));
  results.push(await measureScroll(page, "Mobile Light (Emulated): Unchanged Main", "light", false, mobileVp));
  results.push(await measureScroll(page, "Mobile Light (Emulated): Revised Prototype", "light", true, mobileVp));

  // 5. Visual Verification Screenshots: Stacking & Focus Outlines
  console.log("5. Capturing Stacking & Focus Outline Screenshots...");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  
  // Stacking Dark
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
  await page.evaluate(() => window.scrollTo(0, 1680));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: `${artifactDir}/stacking-desktop-dark.png` });

  // Stacking Light
  await page.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });
  await page.evaluate(() => window.scrollTo(0, 1680));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: `${artifactDir}/stacking-desktop-light.png` });

  // Focus Outline on Action Button
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
  const firstBtn = await page.$(".ws-card .project-glass-prototype a, .ws-card .project-glass-prototype button");
  if (firstBtn) {
    await page.evaluate(el => {
      el.scrollIntoView({ block: "center" });
      el.focus();
    }, firstBtn);
    await new Promise(r => setTimeout(r, 300));
    await page.screenshot({ path: `${artifactDir}/focus-outline-action-dark.png` });
  }

  await browser.close();

  fs.writeFileSync(path.join(artifactDir, "scratch/final-verified-comparison.json"), JSON.stringify(results, null, 2));

  console.log("\n===============================================================================");
  console.log("FINAL VERIFIED COMPARISON TABLE");
  console.log("===============================================================================");
  console.table(results.map(r => ({
    Scenario: r.scenario,
    AvgFPS: r.avgFps,
    "P50 (ms)": r.p50Ms,
    "P95 (ms)": r.p95Ms,
    "Max (ms)": r.maxMs,
    Device: r.device
  })));
}

run().catch(console.error);
