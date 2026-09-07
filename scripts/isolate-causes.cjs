const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");

async function recordScrollTrace(page, selector = "#work") {
  return await page.evaluate(async (sel) => {
    const el = document.querySelector(sel);
    if (!el) return { error: "Selector not found" };

    const rect = el.getBoundingClientRect();
    const startY = window.scrollY + rect.top - 50;
    const endY = window.scrollY + rect.bottom - window.innerHeight + 50;

    window.scrollTo(0, Math.max(0, startY));
    await new Promise(r => setTimeout(r, 100));

    const frameTimes = [];
    let lastTime = performance.now();
    let animId;

    const measureFrames = (now) => {
      frameTimes.push(now - lastTime);
      lastTime = now;
      animId = requestAnimationFrame(measureFrames);
    };

    animId = requestAnimationFrame(measureFrames);

    const totalDist = endY - startY;
    const duration = 1400; // ms
    const startTime = performance.now();

    await new Promise(resolve => {
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
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

    await new Promise(r => setTimeout(r, 100));
    cancelAnimationFrame(animId);

    const deltas = frameTimes.slice(1);
    const totalFrames = deltas.length;
    const totalDuration = deltas.reduce((a, b) => a + b, 0);
    const avgFps = totalFrames / (totalDuration / 1000);
    const slowFrames = deltas.filter(d => d > 20).length;
    const jankyFrames = deltas.filter(d => d > 50).length;
    const maxFrameTime = Math.max(...deltas, 0);

    return {
      avgFps: Math.round(avgFps * 10) / 10,
      slowFrames,
      slowPercent: Math.round((slowFrames / Math.max(1, totalFrames)) * 100),
      jankyFrames,
      maxFrameTime: Math.round(maxFrameTime * 10) / 10
    };
  }, selector);
}

async function testCondition(name, cssOverrides, theme = "dark") {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });

  if (theme === "dark") {
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    });
  } else {
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    });
  }

  // First scroll to warm caches
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 200));

  if (cssOverrides) {
    await page.addStyleTag({ content: cssOverrides });
  }

  const result = await recordScrollTrace(page, "#work");
  await browser.close();
  return result;
}

async function main() {
  console.log("===============================================================================");
  console.log("ISOLATION TESTING: MY WORK SCROLL DELAY & DROP FRAME CAUSES");
  console.log("===============================================================================");

  // Condition 0: Baseline (current)
  console.log("\n1. Running Baseline (Current preview)...");
  const baseline = await testCondition("Baseline", null, "dark");
  console.log("   Baseline Dark:", baseline);

  // Condition 1: Disable CSS transition on scroll transforms
  console.log("\n2. Isolating Trailing CSS Transition (.ws-card { transition: none !important })...");
  const noTransition = await testCondition(
    "No Transform Transition",
    ".ws-card { transition: none !important; }",
    "dark"
  );
  console.log("   No Transition Dark:", noTransition);

  // Condition 2: Disable blur & stagger
  console.log("\n3. Isolating Reveal Blur & Stagger (.work-reveal-card { filter: none !important; opacity: 1 !important; transform: none !important; transition: none !important })...");
  const noBlur = await testCondition(
    "No Blur / Stagger",
    ".work-reveal-card { filter: none !important; opacity: 1 !important; transform: none !important; transition: none !important; will-change: auto !important; }",
    "dark"
  );
  console.log("   No Blur Dark:", noBlur);

  // Condition 3: Disable backdrop-filter
  console.log("\n4. Isolating Backdrop Filter (.project-card { backdrop-filter: none !important; -webkit-backdrop-filter: none !important })...");
  const noBackdrop = await testCondition(
    "No Backdrop Filter",
    ".project-card { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }",
    "dark"
  );
  console.log("   No Backdrop Dark:", noBackdrop);

  // Condition 4: Opaque card surface (prevent bleed-through)
  console.log("\n5. Testing Opaque Surface (.project-card { background: #0c101c !important })...");
  const opaqueSurface = await testCondition(
    "Opaque Surface",
    ".project-card { background: #0c101c !important; }",
    "dark"
  );
  console.log("   Opaque Surface Dark:", opaqueSurface);

  // Condition 5: Combined Fix
  console.log("\n6. Testing All Fixes Combined...");
  const combinedDark = await testCondition(
    "Combined Fixes (Dark)",
    `
    .ws-card {
      transition: none !important;
    }
    .work-reveal-card {
      filter: none !important;
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
      will-change: auto !important;
    }
    .project-card {
      background: #0d121f !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      box-shadow: 0 16px 40px -10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.08) !important;
    }
    `,
    "dark"
  );
  console.log("   Combined Dark:", combinedDark);

  const combinedLight = await testCondition(
    "Combined Fixes (Light)",
    `
    .ws-card {
      transition: none !important;
    }
    .work-reveal-card {
      filter: none !important;
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
      will-change: auto !important;
    }
    [data-theme="light"] .project-card {
      background: #ffffff !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      box-shadow: 0 16px 40px -10px rgba(99, 102, 241, 0.12), 0 4px 18px rgba(15, 23, 42, 0.05), inset 0 0 0 1px rgba(0,0,0,0.08) !important;
    }
    `,
    "light"
  );
  console.log("   Combined Light:", combinedLight);
}

main().catch(err => {
  console.error("Error in isolation test:", err);
  process.exit(1);
});
