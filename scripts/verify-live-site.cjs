const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const LIVE_URL = "https://vikramtheartist.com/";
const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const report = {
    url: LIVE_URL,
    timestamp: new Date().toISOString(),
    tests: {}
  };

  try {
    // 1. DESKTOP DARK
    console.log("Checking Desktop Dark...");
    const pageDark = await browser.newPage();
    const failedRequestsDark = [];
    pageDark.on("requestfailed", req => failedRequestsDark.push({ url: req.url(), failure: req.failure() }));
    pageDark.on("response", res => {
      if (res.status() >= 400 && !res.url().includes("analytics") && !res.url().includes("clarity")) {
        failedRequestsDark.push({ url: res.url(), status: res.status() });
      }
    });

    await pageDark.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageDark.goto(`${LIVE_URL}?theme=dark`, { waitUntil: "networkidle2", timeout: 45000 });

    const darkData = await pageDark.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".project-card"));
      const cardStyles = cards.map(c => ({
        bg: window.getComputedStyle(c).backgroundColor,
        hasTiltSurface: !!c.querySelector(".tilt-surface") || c.classList.contains("project-card"),
        title: c.querySelector("h3") ? c.querySelector("h3").textContent : ""
      }));
      const images = Array.from(document.querySelectorAll("img")).map(img => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth
      }));
      const brokenImages = images.filter(i => !i.complete || i.naturalWidth === 0);

      return {
        cardCount: cards.length,
        cardStyles,
        totalImages: images.length,
        brokenImagesCount: brokenImages.length,
        brokenImages: brokenImages.slice(0, 5)
      };
    });

    report.tests.desktopDark = {
      ...darkData,
      failedRequests: failedRequestsDark
    };

    await pageDark.screenshot({ path: path.join(artifactDir, "live-desktop-dark-work.png") });

    // 2. DESKTOP LIGHT & EXPERIENCE EXPANSION
    console.log("Checking Desktop Light & Experience Expansion...");
    const pageLight = await browser.newPage();
    const failedRequestsLight = [];
    pageLight.on("response", res => {
      if (res.status() >= 400 && !res.url().includes("analytics") && !res.url().includes("clarity")) {
        failedRequestsLight.push({ url: res.url(), status: res.status() });
      }
    });

    await pageLight.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await pageLight.goto(`${LIVE_URL}?theme=light`, { waitUntil: "networkidle2", timeout: 45000 });

    // Scroll to experience
    await pageLight.evaluate(() => {
      const el = document.getElementById("experience");
      if (el) el.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 400));

    // Test hover on first experience row
    const expRow = await pageLight.$(".tl-s0");
    let expExpandedOnHover = false;
    let expHeight = 0;
    if (expRow) {
      await expRow.hover();
      await new Promise(r => setTimeout(r, 350));
      const expStatus = await pageLight.evaluate(() => {
        const row = document.querySelector(".tl-s0");
        const btn = row.querySelector(".tl-disclosure-btn");
        const desc = row.querySelector(".tl-role-desc");
        return {
          ariaExpanded: btn ? btn.getAttribute("aria-expanded") : null,
          height: desc ? desc.getBoundingClientRect().height : 0
        };
      });
      expExpandedOnHover = expStatus.ariaExpanded === "true";
      expHeight = expStatus.height;
    }

    const lightData = await pageLight.evaluate(() => {
      const cards = Array.from(document.querySelectorAll(".project-card"));
      const cardStyles = cards.map(c => ({
        bg: window.getComputedStyle(c).backgroundColor,
        title: c.querySelector("h3") ? c.querySelector("h3").textContent : ""
      }));
      // Check Current badge color
      const badges = Array.from(document.querySelectorAll("span")).filter(s => s.textContent.trim() === "Current");
      const badgeStyles = badges.map(b => ({
        color: window.getComputedStyle(b).color,
        bg: window.getComputedStyle(b).backgroundColor
      }));

      return {
        cardCount: cards.length,
        cardStyles,
        badgeStyles
      };
    });

    report.tests.desktopLight = {
      ...lightData,
      expExpandedOnHover,
      expHeight,
      failedRequests: failedRequestsLight
    };

    await pageLight.screenshot({ path: path.join(artifactDir, "live-desktop-light-exp.png") });

    // 3. MOBILE LIGHT (Responsive layout & touch test)
    console.log("Checking Mobile Light...");
    const pageMob = await browser.newPage();
    await pageMob.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await pageMob.goto(`${LIVE_URL}?theme=light`, { waitUntil: "networkidle2", timeout: 45000 });

    const mobData = await pageMob.evaluate(() => {
      const mobCards = Array.from(document.querySelectorAll(".ws-card-mobile"));
      const positions = mobCards.map(c => window.getComputedStyle(c).position);
      const isVertical = mobCards.length > 0 && positions.every(p => p === "relative" || p === "static");

      // Check project links/buttons
      const buttons = Array.from(document.querySelectorAll(".project-card a, .project-card button")).map(el => ({
        text: el.textContent.trim(),
        tag: el.tagName,
        href: el.getAttribute("href")
      }));

      return {
        mobCardCount: mobCards.length,
        isVerticalFlow: isVertical,
        sampleInteractiveLinks: buttons.slice(0, 6)
      };
    });

    report.tests.mobile = mobData;
    await pageMob.screenshot({ path: path.join(artifactDir, "live-mobile-light.png") });

    console.log("Live Verification Complete:", JSON.stringify(report, null, 2));
    fs.writeFileSync(path.join(artifactDir, "scratch", "live-verification-report.json"), JSON.stringify(report, null, 2));

  } catch (err) {
    console.error("Live test failed:", err);
    report.error = err.message;
  } finally {
    await browser.close();
  }
})();
