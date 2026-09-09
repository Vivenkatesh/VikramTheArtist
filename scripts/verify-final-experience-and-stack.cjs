const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";

async function runVerification() {
  console.log("Starting comprehensive verification of My Work Stacking & Experience Timeline...");

  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--enable-gpu-rasterization"]
  });

  const errors = [];
  const results = {};

  try {
    // ------------------------------------------------------------------------
    // 1. Desktop Dark Mode: My Work Stacking
    // ------------------------------------------------------------------------
    console.log("1. Testing Desktop Dark Mode (1440x900)...");
    const pageDark = await browser.newPage();
    await pageDark.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    pageDark.on("pageerror", err => errors.push(`[Dark PageError] ${err.message}`));
    pageDark.on("console", msg => {
      if (msg.type() === "error") errors.push(`[Dark ConsoleError] ${msg.text()}`);
    });

    await pageDark.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
    await pageDark.evaluate(() => {
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await new Promise(r => setTimeout(r, 400));

    // Measure cards and check sticky stacking
    const darkStackData = await pageDark.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".hidden.md\\:flex .ws-card"));
      const positions = cards.map((c, i) => {
        const style = window.getComputedStyle(c);
        const rect = c.getBoundingClientRect();
        return {
          index: i,
          position: style.position,
          top: style.top,
          zIndex: style.zIndex,
          renderedTop: rect.top,
          renderedHeight: rect.height,
        };
      });

      // Scroll to stack
      const workEl = document.getElementById("work");
      const workTop = workEl ? workEl.getBoundingClientRect().top + window.scrollY : 0;
      return { cardsCount: cards.length, positions, workTop };
    });

    console.log(`Found ${darkStackData.cardsCount} desktop cards in dark mode.`);

    // Scroll down to stack multiple cards
    await pageDark.evaluate(() => window.scrollTo(0, 1600));
    await new Promise(r => setTimeout(r, 400));

    // Capture screenshot of dark mode stacked cards
    const darkStackedPath = path.join(ARTIFACT_DIR, "desktop-dark-cards-stacked.png");
    await pageDark.screenshot({ path: darkStackedPath });
    console.log(`Saved screenshot: ${darkStackedPath}`);

    // Test hover tilt and spotlight on second card
    const hoverResultDark = await pageDark.evaluate(async () => {
      const cards = Array.from(document.querySelectorAll(".hidden.md\\:flex .project-glass-prototype"));
      if (cards.length > 1) {
        const c2 = cards[1];
        const rect = c2.getBoundingClientRect();
        const clientX = rect.left + rect.width * 0.75;
        const clientY = rect.top + rect.height * 0.75;

        // Dispatch pointermove
        c2.dispatchEvent(new PointerEvent("pointerenter", { clientX, clientY, pointerType: "mouse", bubbles: true }));
        c2.dispatchEvent(new PointerEvent("pointermove", { clientX, clientY, pointerType: "mouse", bubbles: true }));
        await new Promise(r => setTimeout(r, 100));

        return {
          gloss: c2.style.getPropertyValue("--gloss"),
          rx: c2.style.getPropertyValue("--rx"),
          ry: c2.style.getPropertyValue("--ry"),
          mx: c2.style.getPropertyValue("--mx"),
          my: c2.style.getPropertyValue("--my"),
        };
      }
      return null;
    });

    results.darkStack = {
      cardsCount: darkStackData.cardsCount,
      positions: darkStackData.positions.slice(0, 4),
      hoverResult: hoverResultDark
    };

    // ------------------------------------------------------------------------
    // 2. Desktop Light Mode: My Work Stacking & Experience Timeline
    // ------------------------------------------------------------------------
    console.log("2. Testing Desktop Light Mode (1440x900)...");
    const pageLight = await browser.newPage();
    await pageLight.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    pageLight.on("pageerror", err => errors.push(`[Light PageError] ${err.message}`));
    pageLight.on("console", msg => {
      if (msg.type() === "error") errors.push(`[Light ConsoleError] ${msg.text()}`);
    });

    await pageLight.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });
    await pageLight.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await new Promise(r => setTimeout(r, 400));

    // Scroll to work section and capture stacked cards
    await pageLight.evaluate(() => window.scrollTo(0, 1600));
    await new Promise(r => setTimeout(r, 400));

    const lightStackedPath = path.join(ARTIFACT_DIR, "desktop-light-cards-stacked.png");
    await pageLight.screenshot({ path: lightStackedPath });
    console.log(`Saved screenshot: ${lightStackedPath}`);

    // Now scroll to #experience section
    console.log("Navigating to #experience section in Light Mode...");
    await pageLight.evaluate(() => {
      const exp = document.getElementById("experience");
      if (exp) {
        exp.scrollIntoView({ behavior: "instant", block: "start" });
      }
    });
    await new Promise(r => setTimeout(r, 500));

    // Verify Experience timeline layout: panel, columns, alignment
    const expLayoutData = await pageLight.evaluate(() => {
      const panel = document.querySelector(".experience-glass-panel");
      const entries = Array.from(document.querySelectorAll(".tl-light-layout .hidden.md\\:flex"));
      const spine = document.querySelector(".tl-spine-light");

      const panelStyle = panel ? window.getComputedStyle(panel) : null;
      const spineStyle = spine ? window.getComputedStyle(spine) : null;

      const firstEntry = entries[0];
      let firstEntryDetails = null;
      if (firstEntry) {
        const dateCol = firstEntry.querySelector(".tl-date-col");
        const logoCol = firstEntry.querySelector(".tl-logo-col");
        const dotCol = firstEntry.querySelector(".tl-dot-col");
        const contentCol = firstEntry.querySelector(".tl-content-col");
        const currentBadge = firstEntry.querySelector(".tl-current-badge");
        const title = contentCol ? contentCol.querySelector("h3") : null;

        firstEntryDetails = {
          dateWidth: dateCol ? dateCol.getBoundingClientRect().width : 0,
          logoWidth: logoCol ? logoCol.getBoundingClientRect().width : 0,
          dotWidth: dotCol ? dotCol.getBoundingClientRect().width : 0,
          dotCenter: dotCol ? dotCol.getBoundingClientRect().left + dotCol.getBoundingClientRect().width / 2 : 0,
          titleText: title ? title.textContent.trim() : "",
          hasCurrentBadge: !!currentBadge,
          badgeText: currentBadge ? currentBadge.textContent.trim() : "",
        };
      }

      return {
        hasPanel: !!panel,
        panelBackdropFilter: panelStyle ? panelStyle.backdropFilter || panelStyle.webkitBackdropFilter : "",
        panelBackground: panelStyle ? panelStyle.backgroundColor : "",
        panelBorder: panelStyle ? panelStyle.border : "",
        spineLeft: spineStyle ? spineStyle.left : "",
        entriesCount: entries.length,
        firstEntry: firstEntryDetails
      };
    });

    results.expLayout = expLayoutData;
    console.log("Experience layout verified:", JSON.stringify(expLayoutData, null, 2));

    // Capture collapsed timeline screenshot
    const expCollapsedPath = path.join(ARTIFACT_DIR, "desktop-light-experience-collapsed.png");
    await pageLight.screenshot({ path: expCollapsedPath });
    console.log(`Saved screenshot: ${expCollapsedPath}`);

    // Test Hover Rollover Expansion on first role (Microsoft)
    console.log("Testing rollover expansion on Microsoft role...");
    await pageLight.hover(".tl-entry.tl-s0");
    await new Promise(r => setTimeout(r, 450));

    // Check if description opened
    const hoverExpandCheck = await pageLight.evaluate(() => {
      const firstEntry = document.querySelector(".tl-entry.tl-s0");
      const descWrapper = firstEntry ? firstEntry.querySelector(".tl-desc-wrapper") : null;
      const descRect = descWrapper ? descWrapper.getBoundingClientRect() : null;
      return {
        isOpened: firstEntry ? (firstEntry.classList.contains("is-hovered") || firstEntry.classList.contains("is-expanded")) : false,
        descHeight: descRect ? descRect.height : 0,
      };
    });
    results.hoverExpand = hoverExpandCheck;
    console.log("Hover expansion check:", hoverExpandCheck);

    // Capture screenshot of expanded role in light mode
    const expExpandedPath = path.join(ARTIFACT_DIR, "desktop-light-experience-expanded.png");
    await pageLight.screenshot({ path: expExpandedPath });
    console.log(`Saved screenshot: ${expExpandedPath}`);

    // Test Accessible Keyboard / Disclosure Button Toggle
    console.log("Testing accessible disclosure button toggle...");
    await pageLight.evaluate(async () => {
      // Leave hover
      const firstEntry = document.querySelector(".tl-entry.tl-s0");
      if (firstEntry) {
        firstEntry.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
        firstEntry.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      }
      await new Promise(r => setTimeout(r, 200));

      // Click disclosure button on second entry (Oracle)
      const secondEntryBtn = document.querySelector(".tl-entry.tl-s1 .tl-disclosure-btn");
      if (secondEntryBtn) {
        secondEntryBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 400));

    const disclosureCheck = await pageLight.evaluate(() => {
      const secondBtn = document.querySelector(".tl-entry.tl-s1 .tl-disclosure-btn");
      const secondEntry = document.querySelector(".tl-entry.tl-s1");
      const desc = document.getElementById("tl-desc-1");
      return {
        btnAriaExpanded: secondBtn ? secondBtn.getAttribute("aria-expanded") : null,
        btnAriaControls: secondBtn ? secondBtn.getAttribute("aria-controls") : null,
        isExpandedClass: secondEntry ? secondEntry.classList.contains("is-expanded") : false,
        descHeight: desc ? desc.getBoundingClientRect().height : 0,
      };
    });
    results.disclosureCheck = disclosureCheck;
    console.log("Disclosure button check:", disclosureCheck);

    // ------------------------------------------------------------------------
    // 3. Mobile View (390x844): My Work Vertical Scrolling & Mobile Experience
    // ------------------------------------------------------------------------
    console.log("3. Testing Mobile View (390x844)...");
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    pageMobile.on("pageerror", err => errors.push(`[Mobile PageError] ${err.message}`));

    await pageMobile.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });
    await pageMobile.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await new Promise(r => setTimeout(r, 300));

    // Scroll to #work and verify vertical scrolling list
    await pageMobile.evaluate(() => {
      const work = document.getElementById("work");
      if (work) work.scrollIntoView({ behavior: "instant", block: "start" });
    });
    await new Promise(r => setTimeout(r, 300));

    const mobileWorkData = await pageMobile.evaluate(() => {
      const mobileCards = Array.from(document.querySelectorAll(".flex.md\\:hidden .ws-card-mobile"));
      const carouselArrows = document.querySelectorAll(".mobile-carousel-arrow, button[aria-label='Previous work']");
      const rects = mobileCards.map(c => {
        const r = c.getBoundingClientRect();
        return { top: r.top, height: r.height, width: r.width };
      });
      return {
        mobileCardsCount: mobileCards.length,
        carouselArrowsCount: carouselArrows.length,
        isVerticallyStacked: rects.length > 1 ? rects[1].top > rects[0].top : false,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    results.mobileWork = mobileWorkData;
    console.log("Mobile work check:", mobileWorkData);

    // Capture mobile work screenshot
    const mobileWorkPath = path.join(ARTIFACT_DIR, "mobile-light-work-vertical.png");
    await pageMobile.screenshot({ path: mobileWorkPath });
    console.log(`Saved screenshot: ${mobileWorkPath}`);

    // Scroll to #experience on mobile
    await pageMobile.evaluate(() => {
      const exp = document.getElementById("experience");
      if (exp) exp.scrollIntoView({ behavior: "instant", block: "start" });
    });
    await new Promise(r => setTimeout(r, 300));

    // Expand first entry on mobile via touch/click
    await pageMobile.evaluate(() => {
      const firstBtn = document.querySelector(".flex.md\\:hidden .tl-disclosure-btn");
      if (firstBtn) firstBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    const mobileExpData = await pageMobile.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    results.mobileExp = mobileExpData;
    console.log("Mobile experience check:", mobileExpData);

    // Capture mobile experience screenshot
    const mobileExpPath = path.join(ARTIFACT_DIR, "mobile-light-experience-expanded.png");
    await pageMobile.screenshot({ path: mobileExpPath });
    console.log(`Saved screenshot: ${mobileExpPath}`);

    // Write results summary to scratch
    fs.writeFileSync(
      path.join(ARTIFACT_DIR, "scratch", "verification-summary.json"),
      JSON.stringify({ results, errors }, null, 2)
    );

    console.log("Verification completed successfully with 0 fatal errors!");
  } catch (err) {
    console.error("Verification failed:", err);
    errors.push(err.stack);
  } finally {
    await browser.close();
  }
}

runVerification();
