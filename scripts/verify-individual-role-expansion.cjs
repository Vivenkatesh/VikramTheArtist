const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const artifactDir = "/Users/vikram/.gemini/antigravity-ide/brain/9318bf05-fefb-47ba-bdb2-cdeeca9bca76";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const results = {};

  // 1. DESKTOP LIGHT MODE: Hover & Keyboard Verification
  console.log("Testing Desktop Light Role Expansion...");
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });

  // Scroll to Experience section
  await page.evaluate(() => {
    const el = document.getElementById("experience");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await new Promise(r => setTimeout(r, 600));

  // Check initial state of Microsoft entry (index 0)
  const initialEntry0 = await page.evaluate(() => {
    const entry = document.querySelector(".tl-s0");
    const btn = entry?.querySelector(".tl-disclosure-btn");
    const desc = document.getElementById("tl-desc-0");
    return {
      exists: !!entry,
      ariaExpanded: btn?.getAttribute("aria-expanded"),
      descHeight: desc?.offsetHeight,
      descHidden: desc?.getAttribute("aria-hidden")
    };
  });

  // Test 1a: Hover on entry 0
  console.log("1a. Testing Hover expansion on entry 0...");
  await page.hover(".tl-s0");
  await new Promise(r => setTimeout(r, 400));
  const hoverEntry0 = await page.evaluate(() => {
    const btn = document.querySelector(".tl-s0 .tl-disclosure-btn");
    const desc = document.getElementById("tl-desc-0");
    return {
      ariaExpanded: btn?.getAttribute("aria-expanded"),
      descHeight: desc?.offsetHeight,
      descOpacity: window.getComputedStyle(desc).opacity
    };
  });
  await page.screenshot({ path: artifactDir + "/role-expansion-desktop-hover.png" });

  // Move pointer away
  await page.mouse.move(0, 0);
  await new Promise(r => setTimeout(r, 400));

  // Test 1b: Keyboard Focus and Enter key on disclosure button
  console.log("1b. Testing Keyboard expansion via Enter key...");
  await page.evaluate(() => {
    const btn = document.querySelector(".tl-s0 .tl-disclosure-btn");
    if (btn) btn.focus();
  });
  await new Promise(r => setTimeout(r, 200));
  await page.keyboard.press("Enter");
  await new Promise(r => setTimeout(r, 400));

  const keyboardEntry0 = await page.evaluate(() => {
    const btn = document.querySelector(".tl-s0 .tl-disclosure-btn");
    const desc = document.getElementById("tl-desc-0");
    return {
      ariaExpanded: btn?.getAttribute("aria-expanded"),
      descHeight: desc?.offsetHeight,
      isFocused: document.activeElement === btn
    };
  });
  await page.screenshot({ path: artifactDir + "/role-expansion-desktop-keyboard.png" });

  results.desktop = { initialEntry0, hoverEntry0, keyboardEntry0 };

  // 2. MOBILE LIGHT MODE: Touch Tap Expansion Verification
  console.log("Testing Mobile Touch Role Expansion...");
  const mobPage = await browser.newPage();
  await mobPage.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await mobPage.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });

  await mobPage.evaluate(() => {
    const el = document.getElementById("experience");
    if (el) el.scrollIntoView({ behavior: "instant" });
  });
  await new Promise(r => setTimeout(r, 600));

  // Touch tap the visible mobile disclosure button of entry 0
  const mobInitial = await mobPage.evaluate(() => {
    const btn = document.querySelector(".tl-s0 .md\\:hidden .tl-disclosure-btn");
    const desc = document.getElementById("tl-desc-0");
    return {
      ariaExpanded: btn?.getAttribute("aria-expanded"),
      descHeight: desc?.offsetHeight
    };
  });

  await mobPage.tap(".tl-s0 .md\\:hidden .tl-disclosure-btn");
  await new Promise(r => setTimeout(r, 500));

  const mobTapped = await mobPage.evaluate(() => {
    const btn = document.querySelector(".tl-s0 .md\\:hidden .tl-disclosure-btn");
    const desc = document.getElementById("tl-desc-0");
    const items = Array.from(desc.querySelectorAll("li")).map(li => li.innerText.trim());
    return {
      ariaExpanded: btn?.getAttribute("aria-expanded"),
      descHeight: desc?.offsetHeight,
      itemsCount: items.length,
      items
    };
  });
  await mobPage.screenshot({ path: artifactDir + "/role-expansion-mobile-touch.png" });

  results.mobileTouch = { mobInitial, mobTapped };

  await mobPage.close();
  await page.close();
  await browser.close();

  fs.writeFileSync(
    path.join(artifactDir, "scratch/role-expansion-report.json"),
    JSON.stringify(results, null, 2)
  );
  console.log("=== ROLE EXPANSION RESULTS ===");
  console.log(JSON.stringify(results, null, 2));
})();
