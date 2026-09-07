const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");

async function recordScrollTrace(page, selector = "#work", options = {}) {
  const { speed = "normal", direction = "down" } = options;

  return await page.evaluate(async (sel, dir, spd) => {
    const el = document.querySelector(sel);
    if (!el) return { error: "Selector not found" };

    const rect = el.getBoundingClientRect();
    const startY = dir === "down" ? (window.scrollY + rect.top - 100) : (window.scrollY + rect.bottom - window.innerHeight);
    const endY = dir === "down" ? (window.scrollY + rect.bottom - window.innerHeight + 100) : (window.scrollY + rect.top - 100);

    window.scrollTo(0, Math.max(0, startY));
    await new Promise(r => setTimeout(r, 150));

    const frameTimes = [];
    let lastTime = performance.now();
    let animId;

    const measureFrames = (now) => {
      frameTimes.push(now - lastTime);
      lastTime = now;
      animId = requestAnimationFrame(measureFrames);
    };

    animId = requestAnimationFrame(measureFrames);

    // Scroll simulation
    const totalDist = endY - startY;
    const duration = spd === "fast" ? 600 : (spd === "slow" ? 2800 : 1400); // ms
    const startTime = performance.now();

    await new Promise(resolve => {
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // easeInOutQuad
        const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        const currentY = startY + totalDist * ease;
        window.scrollTo(0, currentY);

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

    // Calculate metrics
    // Exclude the first frame
    const deltas = frameTimes.slice(1);
    const totalFrames = deltas.length;
    const totalDuration = deltas.reduce((a, b) => a + b, 0);
    const avgFps = totalFrames / (totalDuration / 1000);
    const slowFrames = deltas.filter(d => d > 20).length; // > 20ms (> 50fps drop)
    const jankyFrames = deltas.filter(d => d > 50).length; // > 50ms (< 20fps freeze)
    const maxFrameTime = Math.max(...deltas, 0);

    return {
      totalFrames,
      totalDuration: Math.round(totalDuration),
      avgFps: Math.round(avgFps * 10) / 10,
      slowFrames,
      slowFramePercent: Math.round((slowFrames / Math.max(1, totalFrames)) * 100),
      jankyFrames,
      maxFrameTime: Math.round(maxFrameTime * 10) / 10
    };
  }, selector, direction, speed);
}

async function inspectWorkCards(page) {
  return await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".ws-card"));
    const workRevealCards = Array.from(document.querySelectorAll(".work-reveal-card"));
    const projectCards = Array.from(document.querySelectorAll(".project-card"));

    return {
      totalWsCards: cards.length,
      wsCardTransitions: cards.map(c => window.getComputedStyle(c).transition),
      revealDelays: workRevealCards.map(r => r.style.transitionDelay || window.getComputedStyle(r).transitionDelay),
      revealFilters: workRevealCards.map(r => window.getComputedStyle(r).filter),
      projectCardBgs: projectCards.map(p => window.getComputedStyle(p).backgroundColor),
      projectCardBackdrops: projectCards.map(p => window.getComputedStyle(p).backdropFilter || window.getComputedStyle(p).webkitBackdropFilter)
    };
  });
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  console.log("Loading http://localhost:4173/ ...");
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });

  const initialInspection = await inspectWorkCards(page);
  console.log("\n--- CURRENT WORK SECTION INSPECTION ---");
  console.log("Total desktop cards:", initialInspection.totalWsCards);
  console.log("WS Card transition property:", initialInspection.wsCardTransitions[0]);
  console.log("Work Reveal transition delays:", initialInspection.revealDelays);
  console.log("Work Reveal initial filters:", initialInspection.revealFilters);
  console.log("Project Card background-color:", initialInspection.projectCardBgs[0]);
  console.log("Project Card backdrop-filter:", initialInspection.projectCardBackdrops[0]);

  // Test 1: Cold scroll pass (Pass 1)
  console.log("\n--- TEST 1: PASS 1 (Cold scroll through My Work, Normal Speed) ---");
  const pass1 = await recordScrollTrace(page, "#work", { speed: "normal", direction: "down" });
  console.log("Pass 1 Results:", pass1);

  // Test 2: Warm scroll pass (Pass 2, images already loaded and cached)
  console.log("\n--- TEST 2: PASS 2 (Warm scroll through My Work, Normal Speed) ---");
  const pass2 = await recordScrollTrace(page, "#work", { speed: "normal", direction: "down" });
  console.log("Pass 2 Results:", pass2);

  // Test 3: Upward scroll pass
  console.log("\n--- TEST 3: UPWARD SCROLL (Scrolling back up through My Work) ---");
  const upwardPass = await recordScrollTrace(page, "#work", { speed: "normal", direction: "up" });
  console.log("Upward Pass Results:", upwardPass);

  // Test 4: Fast scroll pass
  console.log("\n--- TEST 4: FAST SCROLL ---");
  const fastPass = await recordScrollTrace(page, "#work", { speed: "fast", direction: "down" });
  console.log("Fast Pass Results:", fastPass);

  // Test 5: Mobile viewport scroll pass
  console.log("\n--- TEST 5: MOBILE (390x844) SCROLL ---");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.reload({ waitUntil: "networkidle0" });
  const mobilePass = await recordScrollTrace(page, "#work", { speed: "normal", direction: "down" });
  console.log("Mobile Pass Results:", mobilePass);

  await browser.close();
}

main().catch(err => {
  console.error("Error running scroll trace:", err);
  process.exit(1);
});
