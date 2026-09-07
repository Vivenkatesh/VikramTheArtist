const puppeteer = require("/Users/vikram/.npm/_npx/0f94ee7615faf582/node_modules/puppeteer-core");

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  // 1. Desktop Dark - Card Stack overlapping (scrollY = 1650)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
    await page.evaluate(() => window.scrollTo(0, 1650));
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({
      path: "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/work-stack-desktop-dark.png"
    });
    console.log("Captured work-stack-desktop-dark.png");
    await page.close();
  }

  // 2. Desktop Light - Card Stack overlapping (scrollY = 1650)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });
    await page.evaluate(() => window.scrollTo(0, 1650));
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({
      path: "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/work-stack-desktop-light.png"
    });
    console.log("Captured work-stack-desktop-light.png");
    await page.close();
  }

  // 3. Mobile Dark (scrollY = 850)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true });
    await page.goto("http://localhost:4173/?theme=dark", { waitUntil: "networkidle0" });
    await page.evaluate(() => window.scrollTo(0, 850));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({
      path: "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/work-mobile-dark.png"
    });
    console.log("Captured work-mobile-dark.png");
    await page.close();
  }

  // 4. Mobile Light (scrollY = 850)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true });
    await page.goto("http://localhost:4173/?theme=light", { waitUntil: "networkidle0" });
    await page.evaluate(() => window.scrollTo(0, 850));
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({
      path: "/Users/vikram/.gemini/antigravity-ide/brain/fe76bce5-4ba6-46bc-b94b-c24bbc037e8a/work-mobile-light.png"
    });
    console.log("Captured work-mobile-light.png");
    await page.close();
  }

  await browser.close();
  console.log("All 4 work stack screenshots captured successfully.");
}

captureScreenshots().catch(err => {
  console.error("Screenshot capture error:", err);
  process.exit(1);
});
