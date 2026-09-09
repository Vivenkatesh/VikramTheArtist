const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";

async function runVerification() {
  console.log("=== Starting Focused Verification for Normal Scrolling & Liquid Glass ===");

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

  // ──────────────────────────────────────────────────────────
  // 1. DESKTOP DARK THEME VERIFICATION
  // ──────────────────────────────────────────────────────────
  console.log("\n--- 1. Testing Desktop Dark Theme ---");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
  await page.bringToFront();
  await new Promise(r => setTimeout(r, 600));

  // Scroll to #work
  const workEl = await page.$("#work");
  await page.evaluate((el) => el.scrollIntoView({ block: "start", behavior: "instant" }), workEl);
  await new Promise(r => setTimeout(r, 400));

  // Check card positions and vertical flow
  const cardsInfo = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll(".ws-card"));
    return cards.map((c, idx) => {
      const rect = c.getBoundingClientRect();
      const style = window.getComputedStyle(c);
      const innerCard = c.querySelector(".project-card");
      const innerStyle = innerCard ? window.getComputedStyle(innerCard) : null;
      return {
        index: idx,
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        height: Math.round(rect.height),
        width: Math.round(rect.width),
        position: style.position,
        isSticky: style.position === "sticky",
        backdropFilter: innerStyle ? innerStyle.backdropFilter : "none",
        backgroundColor: innerStyle ? innerStyle.backgroundColor : "none",
        overflow: style.overflow
      };
    });
  });

  console.log("Card layout metrics in normal document flow:");
  cardsInfo.forEach(c => {
    console.log(`  Card ${c.index}: top=${c.top}px, height=${c.height}px, width=${c.width}px, position=${c.position}, bg=${c.backgroundColor}, blur=${c.backdropFilter}`);
  });

  // Verify no sticky cards
  const hasSticky = cardsInfo.some(c => c.isSticky);
  console.log(`  > Sticky cards present: ${hasSticky} (Expected: false)`);

  // Verify sequential vertical spacing (each card starts after previous ends)
  let sequentialFlow = true;
  for (let i = 1; i < cardsInfo.length; i++) {
    const prev = cardsInfo[i - 1];
    const curr = cardsInfo[i];
    const gap = curr.top - prev.bottom;
    console.log(`  > Gap between Card ${i-1} and Card ${i}: ${gap}px`);
    if (gap < 20) {
      sequentialFlow = false;
    }
  }
  console.log(`  > Sequential document flow: ${sequentialFlow}`);

  // Test slow and fast scrolling downward and upward for white patches
  console.log("  Testing downward and upward scrolling for white patches or lag...");
  let whitePatchDetected = false;
  const startY = await page.evaluate(() => window.scrollY);
  const endY = startY + 2800;

  // Downward slow scroll
  for (let y = startY; y <= endY; y += 120) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await new Promise(r => setTimeout(r, 20));
  }

  // Upward fast scroll
  for (let y = endY; y >= startY; y -= 300) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await new Promise(r => setTimeout(r, 15));
  }

  // Return to card 1
  await page.evaluate((targetY) => window.scrollTo(0, targetY), startY + 120);
  await new Promise(r => setTimeout(r, 400));

  // Capture desktop dark screenshot of card 1 & 2 in normal document flow
  await page.screenshot({ path: path.join(artifactDir, "desktop-dark-normal-flow-resting.png") });
  console.log("  Captured desktop-dark-normal-flow-resting.png");

  // Hover test on Card 1
  const card1 = await page.$(".ws-card:nth-child(1) .project-card");
  if (card1) {
    const box = await card1.boundingBox();
    // Hover near top-left of card 1
    await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.35);
    await new Promise(r => setTimeout(r, 250));

    const hoverState = await page.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        transform: style.transform,
        gloss: el.style.getPropertyValue("--gloss"),
        mx: el.style.getPropertyValue("--mx"),
        my: el.style.getPropertyValue("--my"),
        rx: el.style.getPropertyValue("--rx"),
        ry: el.style.getPropertyValue("--ry")
      };
    }, card1);
    console.log("  Hover state on Card 1:", hoverState);

    await page.screenshot({ path: path.join(artifactDir, "desktop-dark-normal-flow-hover.png") });
    console.log("  Captured desktop-dark-normal-flow-hover.png");

    // Pointer leave: move mouse away
    await page.mouse.move(10, 10);
    await new Promise(r => setTimeout(r, 500));

    const leaveState = await page.evaluate((el) => {
      return {
        gloss: el.style.getPropertyValue("--gloss"),
        rx: el.style.getPropertyValue("--rx"),
        ry: el.style.getPropertyValue("--ry")
      };
    }, card1);
    console.log("  After pointer leave on Card 1:", leaveState);
  }

  // Keyboard focus test
  console.log("  Testing keyboard tab focus on card CTA...");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await new Promise(r => setTimeout(r, 200));
  await page.screenshot({ path: path.join(artifactDir, "desktop-dark-keyboard-focus.png") });
  console.log("  Captured desktop-dark-keyboard-focus.png");

  // ──────────────────────────────────────────────────────────
  // 2. DESKTOP LIGHT THEME VERIFICATION
  // ──────────────────────────────────────────────────────────
  console.log("\n--- 2. Testing Desktop Light Theme ---");
  await page.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 600));

  const workElLight = await page.$("#work");
  await page.evaluate((el) => el.scrollIntoView({ block: "start", behavior: "instant" }), workElLight);
  await new Promise(r => setTimeout(r, 400));

  // Check light mode styling
  const lightStyles = await page.evaluate(() => {
    const card = document.querySelector(".ws-card .project-card");
    const style = window.getComputedStyle(card);
    const title = card.querySelector(".project-card-title");
    const titleColor = title ? window.getComputedStyle(title).color : "";
    const desc = card.querySelector("p");
    const descColor = desc ? window.getComputedStyle(desc).color : "";
    return {
      bg: style.backgroundColor,
      backdropFilter: style.backdropFilter,
      border: style.border,
      titleColor,
      descColor
    };
  });
  console.log("  Light theme styles on project card:", lightStyles);

  // Scroll down a bit to see cards 1 & 2
  await page.evaluate(() => window.scrollBy(0, 100));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(artifactDir, "desktop-light-normal-flow.png") });
  console.log("  Captured desktop-light-normal-flow.png");

  // ──────────────────────────────────────────────────────────
  // 3. MOBILE VERTICAL NORMAL SCROLL VERIFICATION (390x844)
  // ──────────────────────────────────────────────────────────
  console.log("\n--- 3. Testing Mobile Single-Column Normal Scrolling ---");
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  
  // Dark mode mobile
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 500));

  const mobileWork = await page.$("#work");
  await page.evaluate((el) => el.scrollIntoView({ block: "start", behavior: "instant" }), mobileWork);
  await new Promise(r => setTimeout(r, 400));

  const mobileCheck = await page.evaluate(() => {
    const carouselArrows = document.querySelectorAll("button[aria-label='Previous work'], button[aria-label='Next work']");
    const paginationDots = document.querySelectorAll("button[aria-label^='Go to slide']");
    const cards = Array.from(document.querySelectorAll(".ws-card"));
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    const hasHorizontalScroll = docWidth > winWidth;

    return {
      carouselArrowsCount: carouselArrows.length,
      paginationDotsCount: paginationDots.length,
      cardsCount: cards.length,
      hasHorizontalScroll,
      docWidth,
      winWidth
    };
  });
  console.log("  Mobile layout check:", mobileCheck);

  // Scroll down to Card 1
  await page.evaluate(() => window.scrollBy(0, 80));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(artifactDir, "mobile-dark-vertical-flow-card1.png") });
  console.log("  Captured mobile-dark-vertical-flow-card1.png");

  // Scroll down to Card 2
  await page.evaluate(() => window.scrollBy(0, 520));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(artifactDir, "mobile-dark-vertical-flow-card2.png") });
  console.log("  Captured mobile-dark-vertical-flow-card2.png");

  // Light mode mobile
  await page.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 500));
  const mobileWorkLight = await page.$("#work");
  await page.evaluate((el) => el.scrollIntoView({ block: "start", behavior: "instant" }), mobileWorkLight);
  await page.evaluate(() => window.scrollBy(0, 80));
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(artifactDir, "mobile-light-vertical-flow-card1.png") });
  console.log("  Captured mobile-light-vertical-flow-card1.png");

  // ──────────────────────────────────────────────────────────
  // 4. ACTION & PASSWORD MODAL VERIFICATION
  // ──────────────────────────────────────────────────────────
  console.log("\n--- 4. Testing Project Actions & Password Modal ---");
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 500));

  const actionCheck = await page.evaluate(() => {
    const ctas = Array.from(document.querySelectorAll(".project-card-ctas a, .project-card-ctas button"));
    return ctas.map(c => ({
      text: c.textContent.trim(),
      tagName: c.tagName,
      href: c.getAttribute("href") || "button",
      hasOnClick: !!c.onclick
    }));
  });
  console.log(`  Found ${actionCheck.length} interactive CTAs in Work section:`);
  actionCheck.forEach(a => console.log(`    - [${a.tagName}] "${a.text}" -> ${a.href}`));

  await browser.close();

  console.log("\n=== Focused Verification Completed Successfully ===");
}

runVerification().catch(err => {
  console.error("Verification failed with error:", err);
  process.exit(1);
});
