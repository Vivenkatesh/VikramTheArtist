const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";
const scratchDir = path.join(artifactDir, "scratch");
if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

async function runVerification() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const report = {
    testedRevision: "feat/glass-card-prototype @ feac010cd8ccc07fdbfec5f1a08defbb2ab112f3 (+ uncommitted verified working tree)",
    routesTested: [],
    imageIntegrity: [],
    interactionResults: {},
    contrastAndBleedThrough: {},
    keyboardAccessibility: {},
    reducedMotion: {}
  };

  // 1. ROUTE INTEGRITY & RENDERED CONTENT
  console.log("Testing routes...");
  const routesToTest = [
    { path: "/", titleNeedle: "Vikram Venkatesh", mainHeaderNeedle: "I design AI-first products" },
    { path: "/adopt", titleNeedle: "ADOPT", mainHeaderNeedle: "ADOPT" },
    { path: "/scale-copilot-engage", titleNeedle: "Copilot", mainHeaderNeedle: "Copilot" },
    { path: "/vibe-coding", titleNeedle: "Vibe Coding", mainHeaderNeedle: "Vibe Coding" },
    { path: "/feedback-360", titleNeedle: "Feedback", mainHeaderNeedle: "Feedback" }
  ];

  for (const r of routesToTest) {
    const page = await browser.newPage();
    const res = await page.goto(`http://localhost:4173${r.path}`, { waitUntil: "networkidle0" });
    const content = await page.content();
    const title = await page.title();
    const ok = (res?.status() === 200 || res?.status() === 304) &&
               (content.includes(r.mainHeaderNeedle) || title.includes(r.titleNeedle));
    report.routesTested.push({
      route: r.path,
      status: res?.status(),
      title,
      renderedExpectedContent: ok
    });
    await page.close();
  }

  // 2. IMAGE INTEGRITY & DECODING
  console.log("Checking image integrity across full page scroll...");
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });

  // Scroll through entire page to trigger lazy loading
  await page.evaluate(async () => {
    const distance = 400;
    const delay = 100;
    while (document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight) {
      document.scrollingElement.scrollBy(0, distance);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  });
  await new Promise(r => setTimeout(r, 1000));

  const imageStats = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    return imgs.map(img => ({
      src: img.currentSrc || img.src,
      alt: img.alt,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      broken: !img.complete || img.naturalWidth === 0
    }));
  });
  report.imageIntegrity = imageStats;

  // 3. DESKTOP STACK SCROLLING & BLEED-THROUGH TEST
  console.log("Testing Desktop stack scrolling and opacity...");
  await page.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    const el = document.getElementById("work");
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 400));

  // Scroll down so multiple cards stack
  await page.evaluate(() => window.scrollBy(0, 800));
  await new Promise(r => setTimeout(r, 500));

  const stackInfo = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".ws-card"));
    return cards.map((c, i) => {
      const art = c.querySelector("article");
      const computed = art ? window.getComputedStyle(art) : null;
      return {
        cardIndex: i,
        stickyTop: c.style.top,
        position: c.style.position,
        zIndex: c.style.zIndex,
        backgroundColor: computed?.backgroundColor,
        backdropFilter: computed?.backdropFilter,
        opacity: computed?.opacity,
        isOpaque: computed?.backgroundColor === "rgb(255, 255, 255)"
      };
    });
  });
  report.contrastAndBleedThrough.lightStack = stackInfo;

  // Dark mode stack
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    const el = document.getElementById("work");
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => window.scrollBy(0, 800));
  await new Promise(r => setTimeout(r, 500));

  const darkStackInfo = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".ws-card"));
    return cards.map((c, i) => {
      const art = c.querySelector("article");
      const computed = art ? window.getComputedStyle(art) : null;
      return {
        cardIndex: i,
        stickyTop: c.style.top,
        position: c.style.position,
        zIndex: c.style.zIndex,
        backgroundColor: computed?.backgroundColor,
        opacity: computed?.opacity,
        isOpaque: computed?.backgroundColor === "rgb(13, 18, 31)"
      };
    });
  });
  report.contrastAndBleedThrough.darkStack = darkStackInfo;

  // 4. INTERACTIVE TIMELINE EXPANSION & KEYBOARD ACCESSIBILITY
  console.log("Testing Timeline expansion & keyboard accessibility...");
  await page.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    const el = document.getElementById("experience");
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 400));

  const expInitial = await page.evaluate(() => {
    const entries = Array.from(document.querySelectorAll(".tl-entry-interactive"));
    const btn = document.querySelector("button[aria-expanded]");
    return {
      visibleEntriesCount: entries.length,
      hasExpandButton: !!btn,
      isExpanded: btn?.getAttribute("aria-expanded")
    };
  });

  // Click expand
  await page.evaluate(() => {
    const btn = document.querySelector("button[aria-expanded]");
    if (btn) (btn).click();
  });
  await new Promise(r => setTimeout(r, 500));

  const expExpanded = await page.evaluate(() => {
    const entries = Array.from(document.querySelectorAll(".tl-entry-interactive"));
    const btn = document.querySelector("button[aria-expanded]");
    return {
      visibleEntriesCount: entries.length,
      isExpanded: btn?.getAttribute("aria-expanded")
    };
  });

  report.interactionResults.timeline = { expInitial, expExpanded };

  // Theme toggle test
  const initialTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  await page.evaluate(() => {
    const toggle = document.querySelector("button[aria-label*='theme' i], button[aria-label*='switch' i], button[aria-label*='mode' i]") || document.querySelector("header button");
    if (toggle) toggle.click();
  });
  await new Promise(r => setTimeout(r, 300));
  const newTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
  report.interactionResults.themeToggle = { initialTheme, newTheme, toggledSuccessfully: initialTheme !== newTheme };

  // 5. MOBILE EMULATION & HORIZONTAL OVERFLOW CHECK
  console.log("Testing Mobile Emulation (390x844)...");
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await mobilePage.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });

  const mobileOverflow = await mobilePage.evaluate(() => {
    const bodyWidth = document.body.scrollWidth;
    const windowWidth = window.innerWidth;
    const cards = Array.from(document.querySelectorAll(".ws-card-mobile"));
    const horizontalCarousel = document.querySelector(".snap-x");
    return {
      bodyScrollWidth: bodyWidth,
      viewportWidth: windowWidth,
      hasHorizontalOverflow: bodyWidth > windowWidth,
      mobileCardsCount: cards.length,
      hasHorizontalCarouselTrack: !!horizontalCarousel
    };
  });
  report.interactionResults.mobileLayout = mobileOverflow;

  // 6. REDUCED MOTION SUPPORT
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
  const reducedMotionActive = await page.evaluate(() => {
    const card = document.querySelector(".project-glass-prototype");
    const style = card ? window.getComputedStyle(card) : null;
    return {
      transform: style?.transform
    };
  });
  report.reducedMotion = reducedMotionActive;

  await mobilePage.close();
  await page.close();
  await browser.close();

  fs.writeFileSync(path.join(scratchDir, "release-interactions-report.json"), JSON.stringify(report, null, 2));
  console.log("\n=== RELEASE VERIFICATION REPORT ===");
  console.log(JSON.stringify(report, null, 2));
}

runVerification().catch(e => {
  console.error("Verification error:", e);
  process.exit(1);
});
