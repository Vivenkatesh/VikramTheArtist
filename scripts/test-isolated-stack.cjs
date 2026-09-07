const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");

async function testScroll(label, setupFn) {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-background-timer-throttling",
      "--enable-gpu-rasterization"
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });

  // Warm scroll
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 300));

  if (setupFn) {
    await page.evaluate(setupFn);
  }

  // Measure 3.5s smooth scroll through #work
  const res = await page.evaluate(async () => {
    const work = document.querySelector("#work");
    const rect = work.getBoundingClientRect();
    const startY = window.scrollY + rect.top - 80;
    const endY = window.scrollY + rect.bottom - window.innerHeight + 80;
    const totalDist = endY - startY;

    window.scrollTo(0, startY);
    await new Promise(r => setTimeout(r, 200));

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
    const duration = 3500;

    await new Promise(resolve => {
      const step = (now) => {
        const elapsed = now - startTime;
        const p = Math.min(1, elapsed / duration);
        const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        window.scrollTo(0, startY + totalDist * ease);
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

    await new Promise(r => setTimeout(r, 150));
    cancelAnimationFrame(animId);

    const deltas = frameTimes.slice(2);
    const totalFrames = deltas.length;
    const totalDuration = deltas.reduce((a, b) => a + b, 0);
    const avgFps = totalFrames / (totalDuration / 1000);
    const slowFrames = deltas.filter(d => d > 16.7).length;
    const severeJank = deltas.filter(d => d > 50).length;
    const maxFrame = Math.max(...deltas, 0);

    return {
      avgFps: Math.round(avgFps * 10) / 10,
      totalFrames,
      slowFrames,
      severeJank,
      maxFrameTimeMs: Math.round(maxFrame * 10) / 10
    };
  });

  await browser.close();
  console.log(`${label}:`, res);
  return res;
}

async function main() {
  console.log("=== TESTING ISOLATED FACTORS ===");
  await testScroll("1. Current Build", null);

  await testScroll("2. With contain: paint on .ws-card", () => {
    const style = document.createElement("style");
    style.textContent = ".ws-card { contain: paint !important; }";
    document.head.appendChild(style);
  });

  await testScroll("3. With Simplified Shadow (no heavy multi-stop blur)", () => {
    const style = document.createElement("style");
    style.textContent = `
      .project-card {
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.6) !important;
      }
    `;
    document.head.appendChild(style);
  });

  await testScroll("4. With transform: translateZ(0) / layer promotion", () => {
    const style = document.createElement("style");
    style.textContent = `
      .ws-card {
        transform: translateZ(0) !important;
        contain: paint !important;
      }
    `;
    document.head.appendChild(style);
  });

  await testScroll("5. Stacking with simple sticky peek without overlap (1 card sticky at a time)", () => {
    const style = document.createElement("style");
    style.textContent = `
      .ws-card {
        top: 96px !important;
        position: sticky !important;
      }
    `;
    document.head.appendChild(style);
  });
}

main().catch(console.error);
