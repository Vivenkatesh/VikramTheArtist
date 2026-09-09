const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";

async function main() {
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
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
  await page.bringToFront();

  // Find the prototype card
  const card = await page.$(".ws-card .project-glass-prototype");
  if (!card) {
    console.error("Prototype card not found!");
    await browser.close();
    return;
  }

  await page.evaluate(el => el.scrollIntoView({ block: "center", behavior: "instant" }), card);
  await new Promise(r => setTimeout(r, 400));

  const box = await card.boundingBox();
  console.log("Card bounding box:", box);

  // Position mouse just outside the card
  await page.mouse.move(box.x - 20, box.y + box.height / 2);
  await new Promise(r => setTimeout(r, 200));

  // Set up in-page rAF monitor
  await page.evaluate(() => {
    window.__hoverFrameDeltas = [];
    let last = performance.now();
    let active = true;
    window.__stopMonitor = () => { active = false; };
    const loop = (now) => {
      if (!active) return;
      window.__hoverFrameDeltas.push(now - last);
      last = now;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });

  // Start CDP Tracing
  const client = await page.target().createCDPSession();
  await client.send("Tracing.start", {
    categories: "-*,devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline",
    options: "sampling-frequency=10000"
  });

  const traceEvents = [];
  client.on("Tracing.dataCollected", (data) => {
    traceEvents.push(...data.value);
  });

  console.log("Starting 2-second real mouse hover interaction across the card...");
  const startTime = Date.now();
  const dur = 2000;
  
  // Real mouse movement via CDP page.mouse.move
  while (Date.now() - startTime < dur) {
    const elapsed = Date.now() - startTime;
    const p = elapsed / dur;
    const t = Math.sin(p * Math.PI * 4); // 2 full left-to-right-to-left sweeps
    const curX = box.x + 40 + ((t + 1) / 2) * (box.width - 80);
    const curY = box.y + 40 + ((t + 1) / 2) * (box.height - 80);
    await page.mouse.move(curX, curY, { steps: 2 });
    await new Promise(r => setTimeout(r, 16)); // ~60hz input rate
  }

  await client.send("Tracing.end");
  await new Promise(r => setTimeout(r, 600));

  const rAfResult = await page.evaluate(() => {
    window.__stopMonitor();
    const deltas = window.__hoverFrameDeltas.slice(2);
    const total = deltas.reduce((a, b) => a + b, 0);
    const avgFps = deltas.length / (total / 1000);
    const sorted = [...deltas].sort((a, b) => a - b);
    return {
      totalFrames: deltas.length,
      avgFps: Math.round(avgFps * 10) / 10,
      p50Ms: Math.round((sorted[Math.floor(sorted.length * 0.5)] || 0) * 10) / 10,
      p95Ms: Math.round((sorted[Math.floor(sorted.length * 0.95)] || 0) * 10) / 10,
      maxMs: Math.round(Math.max(...deltas, 0) * 10) / 10
    };
  });

  await browser.close();

  // Analyze trace breakdown
  const breakdown = {};
  for (const ev of traceEvents) {
    if (ev.dur) {
      breakdown[ev.name] = (breakdown[ev.name] || 0) + ev.dur;
    }
  }

  const sortedTrace = Object.entries(breakdown)
    .map(([name, dur]) => ({ name, durationMs: Math.round(dur / 1000) }))
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, 20);

  const report = {
    rAfResult,
    traceEventsCount: traceEvents.length,
    topTraceOperations: sortedTrace
  };

  console.log("=== REAL POINTER HOVER PERFORMANCE ===");
  console.log("rAF Result:", JSON.stringify(rAfResult, null, 2));
  console.log("Top Trace Operations:");
  console.table(sortedTrace);

  fs.writeFileSync(path.join(artifactDir, "scratch/hover-trace-analysis.json"), JSON.stringify(report, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
